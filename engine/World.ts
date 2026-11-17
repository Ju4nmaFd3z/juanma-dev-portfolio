import * as THREE from 'three';
import { bus, type ChapterId } from './bus';
import { SCREEN } from './palette';
import { createGlyphAtlas, createHalftone, MAX_CALM, type Halftone } from './halftone';
import { clamp01, damp, smooth } from './kit';
import type { Chapter, FrameCtx, GridChapter, SceneChapter } from './types';
import { buildAbout, buildContact, buildHero } from './chapters/plates';
import { buildSkills } from './chapters/skills';
import { buildProjects } from './chapters/projects';
import { buildJourney, type Stop } from './chapters/journey';

// ─────────────────────────────────────────────────────────────────────────────
// World — one canvas, one halftone screen, six printed chapters.
//
// • Each <section data-chapter> owns a [data-stage] box. Grid chapters (ASCII
//   Magic plates, the portrait) are fitted into that box; 3D chapters get
//   their camera lens shifted and zoomed so the subject sits inside it.
// • Between sections the dots scatter away and the next chapter prints in.
// • [data-calm] elements inside the visible section make the dots recede
//   under them, so text always sits on a quiet patch of the image.
// • Paused with the tab hidden, 30 fps on the low tier when idle (every frame
//   while scrolling), resolution adapts
//   down if frames run long, and fully static under prefers-reduced-motion
//   (re-rendered only when something changes).
// ─────────────────────────────────────────────────────────────────────────────

export interface WorldOptions {
  reduced: boolean;
  low: boolean;
  /** The journey milestones (kind and year), oldest first. */
  journey: Stop[];
  onFail?: () => void;
}

interface Section { id: ChapterId; el: HTMLElement; stage: HTMLElement | null; calm: HTMLElement[] }

const DENSITY = 1.31; // dots per grid cell along each side (ASCII Magic's default)

export class World {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.5, 90);
  private rt: THREE.WebGLRenderTarget;
  private ht: Halftone;
  private postScene = new THREE.Scene();
  private postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private glyphTex: THREE.Texture;
  private gridTex: THREE.DataTexture | null = null;
  private gridVersion = -1;
  private gridOwner: GridChapter | null = null;
  private hemi: THREE.HemisphereLight;
  private key: THREE.DirectionalLight;
  private chapters = new Map<ChapterId, Chapter>();
  private sections: Section[] = [];
  private globalCalm: HTMLElement[] = [];

  private raf = 0;
  private last = 0;
  private t = 0;
  private sx = 0;
  private sy = 0;
  private lensAmt = 0;
  private renderScale: number;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private dprCap: number;
  private frameAvg = 16;
  private frames = 0;
  private lastSig = '';
  private lastScrollY = -1;
  private shown: ChapterId | null = null;
  private disposed = false;
  private observer: ResizeObserver;
  private pending = true;
  private tmp = new THREE.Vector3();

  constructor(private canvas: HTMLCanvasElement, private opts: WorldOptions) {
    THREE.ColorManagement.enabled = false;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: opts.low ? 'low-power' : 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.shadowMap.enabled = !opts.low;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderScale = opts.low ? 0.4 : 0.55;
    this.dprCap = opts.low ? 1.5 : 2;
    canvas.addEventListener('webglcontextlost', this.onLost, false);

    this.hemi = new THREE.HemisphereLight(SCREEN.hemiSky, SCREEN.hemiGround, SCREEN.hemiIntensity);
    this.key = new THREE.DirectionalLight(0xffffff, SCREEN.keyIntensity);
    this.key.castShadow = !opts.low;
    this.key.shadow.mapSize.set(1024, 1024);
    const sc = this.key.shadow.camera;
    sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 50;
    this.key.shadow.bias = -0.002;
    const rim = new THREE.DirectionalLight(0xffb070, 0.9);
    rim.position.set(-10, 4, -8);
    this.scene.add(this.hemi, this.key, this.key.target, rim);

    const depth = new THREE.DepthTexture(1, 1);
    depth.type = THREE.UnsignedIntType;
    this.rt = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
      depthTexture: depth,
      depthBuffer: true,
    });

    this.glyphTex = createGlyphAtlas();
    this.ht = createHalftone();
    const u = this.ht.uniforms;
    const bg = new THREE.Color(SCREEN.bg);
    u.uBg.value.set(bg.r, bg.g, bg.b);
    this.renderer.setClearColor(SCREEN.bg, 1);
    u.tGlyph.value = this.glyphTex;
    u.tScene.value = this.rt.texture;
    u.tDepth.value = this.rt.depthTexture;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.ht.material);
    quad.frustumCulled = false;
    this.postScene.add(quad);

    const low = opts.low;
    const list: Chapter[] = [buildHero(), buildAbout(low), buildSkills(low), buildProjects(low), buildJourney(opts.journey, low), buildContact()];
    list.forEach((c) => {
      if (c.kind === 'scene') { c.root.visible = false; this.scene.add(c.root); }
      else c.ready.then(() => { this.lastSig = ''; }).catch(() => { /* plate stays empty */ });
      this.chapters.set(c.id, c);
    });

    this.scanSections();
    this.observer = new ResizeObserver(() => { this.pending = true; });
    this.observer.observe(canvas);
    this.resize();
    document.addEventListener('visibilitychange', this.onVisibility);
    this.raf = requestAnimationFrame(this.loop);
  }

  /** Re-read the DOM sections (call after the UI re-renders its structure). */
  scanSections() {
    this.sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]')).map((el) => ({
      id: el.dataset.chapter as ChapterId,
      el,
      stage: el.querySelector<HTMLElement>('[data-stage]'),
      calm: Array.from(el.querySelectorAll<HTMLElement>('[data-calm]')),
    }));
    this.globalCalm = Array.from(document.querySelectorAll<HTMLElement>('[data-calm-global]'));
  }

  private onLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.raf);
    this.opts.onFail?.();
  };

  private onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else if (!this.raf && !this.disposed) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
  };

  private resize() {
    this.pending = false;
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.w = w;
    this.h = h;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.rt.setSize(Math.max(1, Math.floor(w * this.renderScale)), Math.max(1, Math.floor(h * this.renderScale)));
    this.ht.uniforms.uRes.value.set(w * this.dpr, h * this.dpr);
    this.camera.aspect = w / h;
    this.lastSig = '';
  }


  /** Which chapter is on screen, how far into it, and how dissolved. */
  private resolveScroll() {
    const vh = this.h;
    const center = vh * 0.5;
    const n = this.sections.length;
    if (!n) return null;
    const rects = this.sections.map((s) => s.el.getBoundingClientRect());
    let i = rects.findIndex((r) => r.top <= center && r.bottom > center);
    if (i < 0) i = rects[0].top > center ? 0 : n - 1;
    const r = rects[i];
    const T = vh * 0.28;
    let dissolve = 0;
    const dNext = r.bottom - center;
    const dPrev = center - r.top;
    if (i < n - 1 && dNext < T) dissolve = 1 - dNext / T;
    else if (i > 0 && dPrev < T) dissolve = 1 - dPrev / T;
    const local = clamp01((center - r.top) / Math.max(1, r.height));
    return { shown: this.sections[i], dissolve: smooth(clamp01(dissolve)), local };
  }

  private uploadGrid(ch: GridChapter) {
    const s = ch.source!;
    if (this.gridOwner === ch && this.gridVersion === s.version && this.gridTex) return;
    if (!this.gridTex || this.gridOwner !== ch || this.gridTex.image.width !== s.cols || this.gridTex.image.height !== s.rows) {
      this.gridTex?.dispose();
      this.gridTex = new THREE.DataTexture(s.data, s.cols, s.rows, THREE.RGBAFormat);
      this.gridTex.minFilter = THREE.LinearFilter;
      this.gridTex.magFilter = THREE.LinearFilter;
      this.gridTex.generateMipmaps = false;
      this.gridTex.flipY = false;
      this.ht.uniforms.tGrid.value = this.gridTex;
    }
    this.gridTex.needsUpdate = true;
    this.gridOwner = ch;
    this.gridVersion = s.version;
  }

  private frame(dt: number) {
    if (this.pending) this.resize();

    const reduced = this.opts.reduced;
    if (!reduced) this.t += dt;
    const t = reduced ? 2.5 : this.t;
    this.sx = reduced ? 0 : damp(this.sx, bus.px, 4, dt);
    this.sy = reduced ? 0 : damp(this.sy, bus.py, 4, dt);

    const state = this.resolveScroll();
    if (!state) return;
    const chapter = this.chapters.get(state.shown.id);
    if (!chapter) return;
    const u = this.ht.uniforms;

    // The lens: follows a mouse, or blooms where a finger tapped.
    const now = performance.now();
    const stageBox = state.shown.stage?.getBoundingClientRect();
    const m = 40;
    const overStage = !!stageBox && bus.lx > stageBox.left - m && bus.lx < stageBox.right + m && bus.ly > stageBox.top - m && bus.ly < stageBox.bottom + m;
    let lensTarget = 0;
    if (bus.lens === 'hover' && overStage) lensTarget = 1;
    else if (bus.lens === 'tap' && overStage) lensTarget = clamp01(1.6 - (now - bus.lensAt) / 900);
    this.lensAmt = reduced ? lensTarget : damp(this.lensAmt, lensTarget, bus.lens === 'tap' ? 14 : 7, dt);

    if (reduced) {
      const gridReady = chapter.kind === 'grid' ? !!chapter.source : true;
      const sig = [Math.round(window.scrollY), this.w, this.h, bus.activeLayer, bus.activeProject, gridReady, Math.round(bus.lx), Math.round(bus.ly), this.lensAmt.toFixed(2)].join('|');
      if (sig === this.lastSig) return;
      this.lastSig = sig;
    } else this.lastSig = '';

    if (this.shown !== chapter.id) {
      this.chapters.forEach((c) => { if (c.kind === 'scene') c.root.visible = c === chapter; });
      this.shown = chapter.id;
    }

    const dpr = this.dpr;
    const look = chapter.look;
    const stage = stageBox;
    let focusX = this.w / 2, focusY = this.h / 2;

    if (chapter.kind === 'scene') {
      this.renderScene(chapter, { t, dt, px: this.sx, py: this.sy, local: state.local, reduced, low: this.opts.low, bus }, stage);
      u.uMode.value = 0;
      u.uStep.value = Math.max(3, look.step * dpr);
      u.uFade.value = 0;
      if (stage) { focusX = stage.left + stage.width / 2; focusY = stage.top + stage.height / 2; }
    } else {
      u.uMode.value = 1;
      const src = chapter.source;
      if (!src || !stage || stage.width < 2 || stage.height < 2) {
        u.uGridSize.value.set(0, 0);
      } else {
        src.tick(reduced ? 2.5 : t);
        this.uploadGrid(chapter);
        const { cols, rows, focus } = src;
        // A tall, narrow stage (a phone) would crop a landscape plate down to a
        // sliver: show most of its width instead and let the page run below it.
        const tall = src.fit === 'cover' && stage.width / stage.height < 0.8 && cols > rows;
        const unit = tall ? stage.width / (cols * 0.62)
          : src.fit === 'cover' ? Math.max(stage.width / cols, stage.height / rows) : Math.min(stage.width / cols, stage.height / rows);
        const gw = cols * unit, gh = rows * unit;
        let ox: number, oy: number;
        if (tall) {
          ox = Math.min(stage.left, Math.max(stage.right - gw, stage.left + stage.width / 2 - focus[0] * gw));
          oy = stage.top + 56;
        } else if (src.fit === 'cover') {
          ox = Math.min(stage.left, Math.max(stage.right - gw, stage.left + stage.width / 2 - focus[0] * gw));
          oy = Math.min(stage.top, Math.max(stage.bottom - gh, stage.top + stage.height / 2 - focus[1] * gh));
        } else {
          ox = stage.left + (stage.width - gw) * focus[0];
          oy = stage.top + (stage.height - gh) * focus[1];
        }
        u.uGridSize.value.set(cols, rows);
        u.uGridOrigin.value.set(ox * dpr, oy * dpr);
        u.uUnit.value = unit * dpr;
        u.uClip.value.set(stage.left * dpr, stage.top * dpr, stage.right * dpr, stage.bottom * dpr);
        u.uStep.value = Math.max(3, (unit / DENSITY) * dpr * (this.opts.low ? 1.15 : 1));
        u.uFade.value = (look.fade ?? 0) * stage.height * dpr;
        focusX = ox + gw * (src.fit === 'cover' ? focus[0] : 0.5);
        focusY = oy + gh * (src.fit === 'cover' ? focus[1] : 0.4);
      }
    }

    u.uShape.value = look.shape;
    u.uGlyphs.value = look.glyphs;
    u.uCurve.value = look.curve;
    u.uSat.value = look.sat;
    u.uSize.value = look.size;
    u.uGain.value = look.gain ?? 1.9;
    u.uSolid.value = look.solid ?? 0;
    u.uTime.value = t;

    // Dissolve between chapters + the one-off "printing" intro.
    u.uDissolve.value = reduced ? state.dissolve * 0.6 : state.dissolve;
    const introK = bus.introAt ? clamp01((now - bus.introAt) / 1700) : 0;
    u.uIntro.value = reduced ? 1 : introK;
    u.uIntroFrom.value.set(focusX * dpr, focusY * dpr);

    const R = (this.opts.low ? 96 : 132) * dpr;
    u.uLens.value.set(bus.lx * dpr, bus.ly * dpr, R);
    u.uLensAmt.value = this.lensAmt;

    // Calm zones under text.
    let n = 0;
    for (const el of [...this.globalCalm, ...state.shown.calm]) {
      if (n >= MAX_CALM) break;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > this.h || r.width === 0) continue;
      u.uCalm.value[n++].set(r.left * dpr, r.top * dpr, r.right * dpr, r.bottom * dpr);
    }
    u.uCalmN.value = n;
    u.uFeather.value = 70 * dpr;

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCam);
  }

  private renderScene(chapter: SceneChapter, ctx: FrameCtx, stage: DOMRect | undefined) {
    chapter.update(ctx);
    const cam = this.camera;
    cam.fov = chapter.camera.fov;
    cam.position.copy(chapter.camera.pos);
    cam.lookAt(chapter.camera.target);
    cam.updateProjectionMatrix();
    if (stage && stage.width > 0 && stage.height > 0) {
      const cx = ((stage.left + stage.width / 2) / this.w) * 2 - 1;
      const cy = -(((stage.top + stage.height / 2) / this.h) * 2 - 1);
      const fit = Math.min(stage.width * 1.15, stage.height) / this.h;
      const zoom = Math.min(1.1, Math.max(0.28, fit * 0.8));
      const e = cam.projectionMatrix.elements;
      e[0] *= zoom;
      e[5] *= zoom;
      e[8] -= cx;
      e[9] -= cy;
      cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    }
    this.key.target.position.copy(chapter.camera.target);
    this.key.position.copy(chapter.camera.target).add(this.tmp.set(8, 14, 6));
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, cam);
  }

  private loop = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.last) this.last = now - 16;
    const elapsed = now - this.last;
    // The low tier idles at 30 fps, but while the page moves every frame is
    // drawn: the picture is fitted to the DOM, so skipping frames would make it
    // stutter against the scrolling text.
    const sy = window.scrollY;
    const moving = sy !== this.lastScrollY;
    this.lastScrollY = sy;
    if (this.opts.low && elapsed < 30 && !moving) return;
    this.last = now;
    const dt = Math.min(0.1, elapsed / 1000);
    try {
      this.frame(dt);
    } catch (err) {
      console.error('[world] frame failed', err);
      this.dispose();
      this.opts.onFail?.();
      return;
    }
    this.adapt(elapsed);
  };

  /** Lower the internal resolution if the device is struggling. */
  private adapt(elapsed: number) {
    if (this.opts.reduced || elapsed <= 0) return;
    this.frameAvg = this.frameAvg * 0.95 + elapsed * 0.05;
    if (++this.frames < 120) return;
    const budget = this.opts.low ? 40 : 26;
    if (this.frameAvg > budget && (this.dprCap > 1 || this.renderScale > 0.3)) {
      this.renderer.shadowMap.enabled = false;
      this.key.castShadow = false;
      this.renderScale = Math.max(0.3, this.renderScale - 0.1);
      this.dprCap = Math.max(1, this.dprCap - 0.5);
      this.pending = true;
      this.frames = 0;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.chapters.forEach((c) => c.dispose());
    this.rt.depthTexture?.dispose();
    this.rt.dispose();
    this.glyphTex.dispose();
    this.gridTex?.dispose();
    this.ht.material.dispose();
    (this.postScene.children[0] as THREE.Mesh).geometry.dispose();
    this.renderer.dispose();
  }
}

export function canUseWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
