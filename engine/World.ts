import * as THREE from 'three';
import { bus, type ChapterId } from './bus';
import { DARK, LIGHT, type Palette } from './palette';
import { createGlyphAtlas, createPostMaterial, GLYPHS, MAX_PAL } from './post';
import { clamp01, damp, smooth } from './kit';
import type { Chapter, FrameCtx, Look } from './types';
import { buildHero } from './chapters/hero';
import { buildAbout } from './chapters/about';
import { buildSkills } from './chapters/skills';
import { buildProjects } from './chapters/projects';
import { buildJourney } from './chapters/journey';
import { buildContact } from './chapters/contact';

// ─────────────────────────────────────────────────────────────────────────────
// World — one renderer, one scene, six chapters.
//
// • The page's <section data-chapter="…"> elements drive which chapter is on
//   screen. Between two sections the image *dissolves through the pixel
//   dimension*: cells grow, the picture briefly turns to glyphs, and the next
//   chapter resolves out of it.
// • Each section has a [data-stage] element. The camera lens is shifted and
//   zoomed so the chapter's subject sits exactly inside that box, which keeps
//   3D and layout composed together on every screen size, with one canvas.
// • Rendering is low resolution by design (cheap), paused when the tab is
//   hidden, capped at 30 fps on low tier, and fully static under
//   prefers-reduced-motion (re-rendered only when something changes).
// ─────────────────────────────────────────────────────────────────────────────

export interface WorldOptions {
  reduced: boolean;
  low: boolean;
  onFail?: () => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class World {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.5, 90);
  private rt: THREE.WebGLRenderTarget;
  private post: ReturnType<typeof createPostMaterial>;
  private postScene = new THREE.Scene();
  private postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private glyphTex: THREE.Texture;
  private hemi: THREE.HemisphereLight;
  private key: THREE.DirectionalLight;
  private chapters = new Map<ChapterId, Chapter>();
  private sections: { id: ChapterId; el: HTMLElement; stage: HTMLElement | null }[] = [];

  private raf = 0;
  private last = 0;
  private t = 0;
  private sx = 0;
  private sy = 0;
  private palette: Palette | null = null;
  private renderScale: number;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private frameAvg = 16;
  private frames = 0;
  private lastSig = '';
  private shown: ChapterId | null = null;
  private disposed = false;
  private observer: ResizeObserver;
  private pending = true;

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
    this.renderScale = opts.low ? 0.42 : 0.6;

    canvas.addEventListener('webglcontextlost', this.onLost, false);

    // Lights
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    this.key = new THREE.DirectionalLight(0xffffff, 2);
    this.key.position.set(8, 14, 6);
    this.key.castShadow = !opts.low;
    this.key.shadow.mapSize.set(1024, 1024);
    const sc = this.key.shadow.camera;
    sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 50;
    this.key.shadow.bias = -0.002;
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(-10, 4, -8);
    this.scene.add(this.hemi, this.key, this.key.target, rim);

    // Render target (colour + depth)
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
    this.post = createPostMaterial(this.glyphTex, GLYPHS.length);
    this.post.uniforms.tColor.value = this.rt.texture;
    this.post.uniforms.tDepth.value = this.rt.depthTexture;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post.material);
    quad.frustumCulled = false;
    this.postScene.add(quad);

    // Chapters
    const low = opts.low;
    [buildHero(low), buildAbout(low), buildSkills(low), buildProjects(low), buildJourney(low), buildContact(low)].forEach((c) => {
      c.root.visible = false;
      this.scene.add(c.root);
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
    }));
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
    this.dpr = Math.min(window.devicePixelRatio || 1, this.opts.low ? 1.5 : 2);
    this.w = w;
    this.h = h;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.rt.setSize(Math.max(1, Math.floor(w * this.renderScale)), Math.max(1, Math.floor(h * this.renderScale)));
    this.post.uniforms.uRes.value.set(w * this.dpr, h * this.dpr);
    this.camera.aspect = w / h;
    this.lastSig = '';
  }

  private applyPalette(p: Palette) {
    if (this.palette === p) return;
    this.palette = p;
    const u = this.post.uniforms;
    const c = new THREE.Color();
    p.colors.slice(0, MAX_PAL).forEach((hex, i) => {
      c.setHex(hex);
      u.uPal.value[i].set(c.r, c.g, c.b);
    });
    u.uPalN.value = Math.min(MAX_PAL, p.colors.length);
    u.uLight.value = p === LIGHT ? 1 : 0;
    c.setHex(p.skyTop); u.uSkyTop.value.set(c.r, c.g, c.b);
    c.setHex(p.skyBottom); u.uSkyBottom.value.set(c.r, c.g, c.b);
    c.setHex(p.outline); u.uOutlineColor.value.set(c.r, c.g, c.b);
    this.hemi.color.setHex(p.hemiSky);
    this.hemi.groundColor.setHex(p.hemiGround);
    this.hemi.intensity = p.hemiIntensity;
    this.key.intensity = p.keyIntensity;
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
    const T = vh * 0.3;
    let shownIdx = i;
    let dissolve = 0;
    const dNext = r.bottom - center;
    const dPrev = center - r.top;
    if (i < n - 1 && dNext < T) dissolve = 1 - dNext / T;
    else if (i > 0 && dPrev < T) dissolve = 1 - dPrev / T;
    const shown = this.sections[shownIdx];
    const local = clamp01((center - r.top) / Math.max(1, r.height));
    return { shown, rect: r, dissolve: smooth(clamp01(dissolve)), local };
  }

  private frame(dt: number) {
    if (this.pending) this.resize();
    this.applyPalette(bus.theme === 'light' ? LIGHT : DARK);

    const reduced = this.opts.reduced;
    if (!reduced) this.t += dt;
    const t = reduced ? 2.5 : this.t;
    this.sx = reduced ? 0 : damp(this.sx, bus.px, 4, dt);
    this.sy = reduced ? 0 : damp(this.sy, bus.py, 4, dt);

    const state = this.resolveScroll();
    if (!state) return;
    const chapter = this.chapters.get(state.shown.id);
    if (!chapter) return;

    // Under reduced motion, only re-render when something actually changed.
    if (reduced) {
      const sig = [Math.round(window.scrollY), this.w, this.h, bus.theme, bus.activeLayer, bus.activeProject, bus.activeMilestone].join('|');
      if (sig === this.lastSig) return;
      this.lastSig = sig;
    }

    if (this.shown !== chapter.id) {
      this.chapters.forEach((c) => (c.root.visible = c === chapter));
      this.shown = chapter.id;
    }

    const ctx: FrameCtx = { t, dt, px: this.sx, py: this.sy, local: state.local, reduced, low: this.opts.low, bus };
    chapter.update(ctx);

    // Camera + lens shift onto the stage box
    const cam = this.camera;
    cam.fov = chapter.camera.fov;
    cam.position.copy(chapter.camera.pos);
    cam.lookAt(chapter.camera.target);
    cam.updateProjectionMatrix();
    const stage = state.shown.stage?.getBoundingClientRect();
    if (stage && stage.width > 0 && stage.height > 0) {
      const cx = ((stage.left + stage.width / 2) / this.w) * 2 - 1;
      const cy = -(((stage.top + stage.height / 2) / this.h) * 2 - 1);
      // Fit: the subject is framed for a full-height viewport, then scaled to the
      // stage's shorter side (with a little breathing room).
      const fit = Math.min(stage.width * 1.15, stage.height) / this.h;
      const zoom = Math.min(1.1, Math.max(0.28, fit * 0.78));
      const e = cam.projectionMatrix.elements;
      e[0] *= zoom;
      e[5] *= zoom;
      e[8] -= cx;
      e[9] -= cy;
      cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    }
    this.key.target.position.copy(chapter.camera.target);
    this.key.position.copy(chapter.camera.target).add(new THREE.Vector3(8, 14, 6));

    // Look: chapter base + dissolve + signal pulse + intro resolve
    const look: Look = chapter.look;
    const u = this.post.uniforms;
    const d = reduced ? state.dissolve * 0.5 : state.dissolve;
    const sincePulse = (performance.now() - bus.pulse) / 1000;
    const pulse = reduced ? 0 : Math.max(0, 1 - sincePulse / 0.35);
    const introK = bus.introAt ? clamp01((performance.now() - bus.introAt) / 1400) : 0;
    const intro = reduced ? 0 : 1 - smooth(introK);

    const px = look.pixel + d * 14 + pulse * 5 + intro * 26;
    u.uPixel.value = Math.max(1, Math.round(px * this.dpr));
    u.uGlyphCell.value = Math.round(lerp(look.glyphCell, look.glyphCell + 6, d) * this.dpr);
    u.uGlyphs.value = clamp01(Math.max(look.glyphs, d * 0.75, intro * 0.4));
    u.uDither.value = look.dither + d * 0.6;
    u.uOutline.value = look.outline * (1 - d * 0.7);
    u.uNear.value = cam.near;
    u.uFar.value = cam.far;
    u.uTime.value = t;
    u.uFade.value = bus.introAt ? clamp01(intro * 1.3 - 0.15) : 1;

    const r = this.renderer;
    r.setRenderTarget(this.rt);
    r.render(this.scene, cam);
    r.setRenderTarget(null);
    r.render(this.postScene, this.postCam);
  }

  private loop = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.last) this.last = now - 16;
    const elapsed = now - this.last;
    // 30 fps cap on the low tier (small tolerance for rAF jitter)
    if (this.opts.low && elapsed < 30) return;
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

  /** Lower the internal resolution once if the device is struggling. */
  private adapt(elapsed: number) {
    if (this.opts.reduced || elapsed <= 0) return;
    this.frameAvg = this.frameAvg * 0.95 + elapsed * 0.05;
    if (++this.frames < 120) return;
    const budget = this.opts.low ? 40 : 26;
    if (this.frameAvg > budget && this.renderScale > 0.3) {
      this.renderScale = Math.max(0.3, this.renderScale - 0.12);
      this.renderer.shadowMap.enabled = false;
      this.key.castShadow = false;
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
    this.post.material.dispose();
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
