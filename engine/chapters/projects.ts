import * as THREE from 'three';
import { C } from '../palette';
import { Kit, clamp01, smooth } from '../kit';
import type { ProjectId } from '../bus';
import type { SceneChapter, FrameCtx } from '../types';

// Projects — a slim display on an aluminium stand, on a pedestal. Its screen
// is a grid of real glowing pixels playing a small animation of what each
// project does: a DNA helix for the genetic-algorithm simulator, an arcade
// invader for the arcade site, a calendar filling with bookings for the
// booking system… The screen's light pools on the pedestal; switching project
// spins the display and fills the screen with static before the next one.

const W = 32, H = 20;
type Put = (x: number, y: number, c: number) => void;
type Scene = (put: Put, t: number) => void;

const BG = 0x0e1424;
const DIM = 0x26304a;
const ACCENT: Record<ProjectId, number> = {
  genetix: C.mint, arena: C.coral, infra: C.mint, glitch: C.berry, arcade: C.berry,
  openclaw: C.coral, kukelure: C.coral, procesosbi: C.amber, biznaga: C.amber,
};

/** Deterministic noise in [0, 1). */
const hash = (a: number, b = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const line = (put: Put, x0: number, y0: number, x1: number, y1: number, c: number) => {
  const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) put(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
};
const rect = (put: Put, x: number, y: number, w: number, h: number, c: number) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c);
};
const sprite = (put: Put, x: number, y: number, rows: string[], c: number) =>
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') put(x + i, y + j, c); }));

const SCENES: Record<ProjectId, Scene> = {
  // Genetic algorithms: a turning double helix; one gene mutates.
  genetix: (put, t) => {
    for (let x = 1; x < W - 1; x++) {
      const ph = x * 0.38 + t * 2.2;
      const a = Math.round(10 + Math.sin(ph) * 6.5), b = Math.round(10 - Math.sin(ph) * 6.5);
      if (x % 3 === 0) line(put, x, a, x, b, DIM);
      const front = Math.cos(ph) > 0;
      put(x, front ? b : a, front ? C.coral : C.mint);
      put(x, front ? a : b, front ? C.mint : C.coral);
    }
    const mx = 17, ph = mx * 0.38 + t * 2.2;
    if (Math.sin(t * 6) > 0) rect(put, mx, Math.round(10 + Math.sin(ph) * 6.5) - 1, 2, 2, C.amber);
  },
  // Tactical simulation: two squads moving on a grid, trading shots.
  arena: (put, t) => {
    for (let y = 1; y < H; y += 3) for (let x = 1; x < W; x += 3) put(x, y, DIM);
    const step = Math.floor(t * 2.5);
    const unit = (i: number, side: number) => {
      const x = Math.round((side ? 22 : 5) + Math.sin(step * 0.7 + i * 2.1) * 3 + (side ? -1 : 1) * (hash(step, i) * 3));
      const y = 3 + i * 6 + Math.round(Math.sin(step * 0.5 + i) * 1.5);
      return [x, y] as const;
    };
    for (let i = 0; i < 3; i++) {
      const [bx, by] = unit(i, 0), [rx, ry] = unit(i, 1);
      rect(put, bx, by, 2, 2, C.mint);
      rect(put, rx, ry, 2, 2, C.coral);
      if (hash(step, i + 9) > 0.55 && (t * 2.5) % 1 < 0.5) line(put, bx + 2, by, rx - 1, ry + 1, C.cream);
    }
  },
  // Networks: a router, four hosts, packets travelling the links.
  infra: (put, t) => {
    const hosts = [[3, 2], [25, 2], [3, 15], [25, 15]];
    hosts.forEach(([x, y]) => line(put, 16, 10, x + 1, y + 1, DIM));
    rect(put, 13, 8, 6, 4, C.mint);
    [14, 16].forEach((x) => put(x + 1, 9, Math.sin(t * 8 + x) > 0 ? C.amber : BG));
    hosts.forEach(([x, y], i) => {
      rect(put, x, y, 4, 3, C.haze);
      put(x + 1, y + 1, C.mint); put(x + 2, y + 1, C.mint);
      const f = (t * 0.7 + i * 0.25) % 1;
      const k = i % 2 === 0 ? f : 1 - f;
      put(Math.round(16 + (x + 1 - 16) * k), Math.round(10 + (y + 1 - 10) * k), C.amber);
    });
  },
  // Nightlife: a skyline at night, neon windows, and the odd glitch.
  glitch: (put, t) => {
    sprite(put, 25, 2, ['.###', '##..', '##..', '.###'], C.cream);
    for (let i = 0; i < 8; i++) {
      const h = 5 + Math.floor(hash(i, 3) * 10), x = i * 4;
      rect(put, x, H - h, 3, h, i % 3 === 0 ? 0x3a2448 : 0x1c2440);
      for (let y = H - h + 1; y < H - 1; y += 2) if (hash(i, y + Math.floor(t * 1.5)) > 0.5) put(x + 1, y, hash(i, y) > 0.5 ? C.amber : C.berry);
    }
    if ((t * 0.8) % 1 < 0.12) {
      // a glitch: a band of neon noise across the screen
      const y0 = Math.floor(hash(Math.floor(t * 0.8)) * 14);
      for (let x = 0; x < W; x++) if (hash(x, y0) > 0.4) put(x, y0 + 2, hash(x) > 0.5 ? C.berry : C.mint);
    }
  },
  // Arcade: a classic invader marching, and the player's ship firing.
  arcade: (put, t) => {
    const frame = Math.floor(t * 3) % 2;
    const ox = 10 + Math.round(Math.sin(t * 0.9) * 8);
    sprite(put, ox, 3, frame ? ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...']
      : ['..#.....#..', '#..#...#..#', '#.#######.#', '###.###.###', '###########', '.#########.', '..#.....#..', '.#.......#.'], C.berry);
    const sx = 15 + Math.round(Math.sin(t * 1.3) * 9);
    sprite(put, sx - 2, 16, ['..#..', '#####', '#####'], C.mint);
    const b = (t * 1.6) % 1;
    put(sx, Math.round(15 - b * 12), C.cream);
    put(sx, Math.round(14 - b * 12), C.cream);
  },
  // AI agent: a robot face scanning the machine it lives on.
  openclaw: (put, t) => {
    put(16, 1, Math.sin(t * 5) > 0 ? C.coral : DIM);
    line(put, 16, 2, 16, 3, C.haze);
    rect(put, 9, 4, 15, 11, C.haze);
    rect(put, 10, 5, 13, 9, 0x1c2440);
    const blink = (t * 0.7) % 1 < 0.07;
    const look = Math.round(Math.sin(t * 1.2) * 1.5);
    rect(put, 12 + look, blink ? 8 : 7, 3, blink ? 1 : 3, C.mint);
    rect(put, 18 + look, blink ? 8 : 7, 3, blink ? 1 : 3, C.mint);
    for (let x = 13; x < 20; x++) put(x, 12, x % 2 ? C.amber : DIM);
    rect(put, 7, 8, 2, 3, C.haze); rect(put, 24, 8, 2, 3, C.haze);
    const sy = Math.round(4 + ((t * 0.8) % 1) * 11);
    for (let x = 6; x < 27; x++) if (x % 2 === 0) put(x, sy, C.coral);
  },
  // Bookings: a month calendar filling itself with appointments.
  kukelure: (put, t) => {
    rect(put, 5, 1, 21, 3, C.coral);
    put(9, 0, C.haze); put(21, 0, C.haze);
    const filled = Math.floor((t * 4) % 34);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const i = r * 7 + c;
      const on = ((i * 11) % 28) < filled;
      rect(put, 5 + c * 3, 5 + r * 4, 2, 3, on ? (i % 3 ? C.berry : C.mint) : DIM);
    }
  },
  // Business intelligence: bars growing, and the trend line over them.
  procesosbi: (put, t) => {
    line(put, 3, 18, 29, 18, C.haze);
    line(put, 3, 2, 3, 18, C.haze);
    const tops: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const h = Math.round(3 + (0.55 + 0.45 * Math.sin(t * 1.1 + i * 0.9)) * (4 + i * 1.6));
      const x = 5 + i * 4;
      rect(put, x, 18 - h, 3, h, [C.steel, C.teal, C.mint, C.teal, C.mint, C.amber][i]);
      tops.push([x + 1, 16 - h]);
    }
    for (let i = 0; i < tops.length - 1; i++) line(put, tops[i][0], tops[i][1], tops[i + 1][0], tops[i + 1][1], C.amber);
  },
  // Biznaga: Málaga's jasmine bouquet, still under construction.
  biznaga: (put, t) => {
    line(put, 16, 12, 16, 16, 0x3f7a4a);
    line(put, 14, 15, 16, 13, 0x3f7a4a);
    for (let k = 0; k < 46; k++) {
      const a = k * 2.39996, r = Math.sqrt(k / 46) * 7.2;
      const x = Math.round(16 + Math.cos(a) * r), y = Math.round(7 + Math.sin(a) * r * 0.75);
      put(x, y, hash(k, Math.floor(t * 2)) > 0.85 ? C.amber : C.cream);
    }
    for (let x = 0; x < W; x++) put(x, 18, Math.floor((x + t * 4) / 2) % 2 ? C.amber : 0x1a1720);
  },
};

export function buildProjects(low: boolean): SceneChapter {
  const kit = new Kit();
  const root = new THREE.Group();

  // Pedestal: stepped octagon with a ring of status LEDs
  const ped = new THREE.Group();
  ped.add(kit.mesh(kit.cyl(3.0, 3.3, 0.5, 8), kit.toon(C.navy), 0, -0.25, 0));
  ped.add(kit.mesh(kit.cyl(2.5, 2.8, 0.3, 8), kit.toon(C.slate), 0, 0.15, 0));
  const leds: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const l = kit.mesh(kit.box(0.18, 0.12, 0.18), kit.glow(C.amber), Math.cos(a) * 3.1, 0.02, Math.sin(a) * 3.1);
    leds.push(l);
    ped.add(l);
  }
  root.add(ped);

  // The display: a slim dark bezel on an aluminium stand.
  const accentMat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const poolMat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const PX = 0.16;
  const SW = W * PX, SH = H * PX;
  const mon = new THREE.Group();
  mon.position.y = 3.05;
  const bezel = kit.toon(0x12161f);
  const alu = kit.toon(0xb4b8c6);
  mon.add(kit.mesh(kit.box(SW + 0.22, SH + 0.22, 0.12), bezel, 0, 0, -0.03));
  mon.add(kit.mesh(kit.box(SW - 0.2, SH - 0.2, 0.22), kit.toon(0x2a3042), 0, 0, -0.18)); // back
  mon.add(kit.mesh(kit.box(0.1, 0.035, 0.03), accentMat, 0, -SH / 2 - 0.07, 0.04)); // power LED
  // stand: a slanted arm from the back of the display down to a flat foot
  const arm = kit.mesh(kit.box(0.5, 2.0, 0.12), alu, 0, 1.55, -0.55);
  arm.rotation.x = -0.18;
  root.add(arm);
  root.add(kit.mesh(kit.box(1.9, 0.08, 1.1), alu, 0, 0.36, -0.35));
  // the screen's light falling on the pedestal
  root.add(kit.mesh(kit.cyl(1.7, 1.7, 0.02, 20), poolMat, 0, 0.31, 0.5));

  // the screen: one glowing voxel per pixel, coloured every frame
  const pixMat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const screen = new THREE.InstancedMesh(kit.box(PX * 0.92, PX * 0.92, 0.06), pixMat, W * H);
  kit.own({ dispose: () => screen.dispose() });
  const m4 = new THREE.Matrix4();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    m4.makeTranslation((x - (W - 1) / 2) * PX, ((H - 1) / 2 - y) * PX, 0.1);
    screen.setMatrixAt(y * W + x, m4);
  }
  const col = new THREE.Color();
  const white = new THREE.Color(0xffffff);
  const fb = new Uint32Array(W * H);
  const put: Put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) fb[y * W + x] = c; };
  mon.add(screen);
  root.add(mon);

  // Cubes orbiting the monitor in the project's colour.
  const orbitMat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const orbit = new THREE.InstancedMesh(kit.box(0.22, 0.22, 0.22), orbitMat, low ? 8 : 14);
  kit.own({ dispose: () => orbit.dispose() });
  root.add(orbit);

  let current: ProjectId | null = null;
  let switchAt = -10;
  const camera = { pos: new THREE.Vector3(2.0, 3.6, 7.4), target: new THREE.Vector3(0, 2.55, 0), fov: 40 };

  return {
    id: 'projects',
    kind: 'scene',
    root,
    look: { step: low ? 4.5 : 4, shape: 1, glyphs: 0, curve: 0.9, sat: 0.85, size: 0.47, gain: 1.7, solid: 1 },
    camera,
    update({ t, px, py, bus, reduced }: FrameCtx) {
      if (bus.activeProject !== current) {
        current = bus.activeProject;
        switchAt = reduced ? -10 : t;
      }
      const k = clamp01((t - switchAt) / 0.7);
      const accent = ACCENT[current!];

      // the screen: static while switching, then the project's animation
      fb.fill(BG);
      if (k < 1) {
        const n = Math.floor(t * 30);
        for (let i = 0; i < fb.length; i++) {
          const v = hash(i, n);
          fb[i] = v > 0.55 + k * 0.4 ? (v > 0.9 ? accent : 0x8a8ea0) : BG;
        }
        if (k > 0.6) SCENES[current!](put, t);
      } else SCENES[current!](put, t);
      // the glass: a faint scanline and, now and then, a diagonal sheen
      const scan = Math.floor((t * 9) % (H + 10));
      const sheen = ((t * 0.35) % 1.6) * (W + H) - H;
      for (let i = 0; i < fb.length; i++) {
        col.setHex(fb[i]);
        const x = i % W, y = Math.floor(i / W);
        if (y === scan) col.lerp(white, 0.16);
        const d = Math.abs(x - y * 0.7 - sheen);
        if (d < 2.2) col.lerp(white, 0.12 * (1 - d / 2.2));
        screen.setColorAt(i, col);
      }
      screen.instanceColor!.needsUpdate = true;

      // a spin when the project changes, then a slow sway
      const spin = reduced ? 0 : (1 - smooth(k)) * Math.PI * 2;
      mon.rotation.y = Math.sin(t * 0.45) * 0.14 + px * 0.18 + spin;
      mon.rotation.x = -0.05 + py * 0.04;
      mon.position.y = 3.05 + (reduced ? 0 : Math.sin(t * 1.2) * 0.05);

      accentMat.color.setHex(accent);
      poolMat.color.setHex(accent).multiplyScalar(0.18 + (k < 1 ? 0.1 * hash(Math.floor(t * 30)) : 0));

      orbitMat.color.setHex(accent);
      for (let i = 0; i < orbit.count; i++) {
        const a = (i / orbit.count) * Math.PI * 2 + t * 0.35;
        const r = 3.6 + Math.sin(i * 1.7) * 0.4;
        m4.makeTranslation(Math.cos(a) * r, 2.6 + Math.sin(a * 2 + i) * 1.2, Math.sin(a) * r * 0.6);
        orbit.setMatrixAt(i, m4);
      }
      orbit.instanceMatrix.needsUpdate = true;

      ped.rotation.y = t * 0.1;
      leds.forEach((l, i) => (l.visible = ((i + Math.floor(t * 6)) % 4) !== 0));
      root.rotation.y = px * 0.12;
    },
    dispose: () => kit.dispose(),
  };
}
