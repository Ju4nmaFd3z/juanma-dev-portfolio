import * as THREE from 'three';

// Small shared toolkit for the chapter builders: one toon ramp, cached
// materials and geometries, and helpers to place voxels. Everything created
// here is tracked so a chapter can be disposed in one call.

let ramp: THREE.DataTexture | null = null;

/** Three hard light bands — the pixel-art "cel" look before dithering. */
export function toonRamp(): THREE.DataTexture {
  if (ramp) return ramp;
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  ramp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.generateMipmaps = false;
  ramp.needsUpdate = true;
  return ramp;
}

export class Kit {
  private mats = new Map<string, THREE.Material>();
  private geos = new Map<string, THREE.BufferGeometry>();
  private extra: { dispose(): void }[] = [];

  /** Lit, banded material. */
  toon(color: number): THREE.MeshToonMaterial {
    const key = `t${color}`;
    let m = this.mats.get(key) as THREE.MeshToonMaterial | undefined;
    if (!m) {
      m = new THREE.MeshToonMaterial({ color, gradientMap: toonRamp() });
      this.mats.set(key, m);
    }
    return m;
  }

  /** Self-lit material for LEDs, screens, signals. */
  glow(color: number): THREE.MeshBasicMaterial {
    const key = `g${color}`;
    let m = this.mats.get(key) as THREE.MeshBasicMaterial | undefined;
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color });
      this.mats.set(key, m);
    }
    return m;
  }

  /** A material owned by the caller but disposed with the kit. */
  own<T extends { dispose(): void }>(thing: T): T {
    this.extra.push(thing);
    return thing;
  }

  box(w = 1, h = 1, d = 1): THREE.BoxGeometry {
    const key = `b${w}:${h}:${d}`;
    let g = this.geos.get(key) as THREE.BoxGeometry | undefined;
    if (!g) {
      g = new THREE.BoxGeometry(w, h, d);
      this.geos.set(key, g);
    }
    return g;
  }

  cyl(rt: number, rb: number, h: number, seg = 8): THREE.CylinderGeometry {
    const key = `c${rt}:${rb}:${h}:${seg}`;
    let g = this.geos.get(key) as THREE.CylinderGeometry | undefined;
    if (!g) {
      g = new THREE.CylinderGeometry(rt, rb, h, seg);
      this.geos.set(key, g);
    }
    return g;
  }

  /** Convenience: a mesh with shadows enabled. */
  mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /**
   * Instanced voxels: one draw call for many cubes of the same colour.
   * `cells` are integer-ish positions; `size` is the cube edge.
   */
  voxels(cells: [number, number, number][], color: number | THREE.Material, size = 1): THREE.InstancedMesh {
    const mat = typeof color === 'number' ? this.toon(color) : color;
    const inst = new THREE.InstancedMesh(this.box(size, size, size), mat, Math.max(1, cells.length));
    const m = new THREE.Matrix4();
    cells.forEach(([x, y, z], i) => {
      m.makeTranslation(x, y, z);
      inst.setMatrixAt(i, m);
    });
    inst.count = cells.length;
    inst.castShadow = true;
    inst.receiveShadow = true;
    this.own({ dispose: () => inst.dispose() });
    return inst;
  }

  dispose() {
    this.mats.forEach((m) => m.dispose());
    this.geos.forEach((g) => g.dispose());
    this.extra.forEach((e) => e.dispose());
    this.mats.clear();
    this.geos.clear();
    this.extra = [];
  }
}

/** 5×5 bitmap glyphs used to engrave letters as voxels. */
const FONT: Record<string, string[]> = {
  J: ['..###', '...#.', '...#.', '#..#.', '.##..'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
};

export function bitmapCells(text: string, gap = 1): [number, number][] {
  const out: [number, number][] = [];
  let ox = 0;
  for (const ch of text) {
    const rows = FONT[ch];
    if (!rows) { ox += 3; continue; }
    rows.forEach((row, y) => {
      [...row].forEach((c, x) => { if (c === '#') out.push([ox + x, 4 - y]); });
    });
    ox += 5 + gap;
  }
  return out;
}

/** Deterministic PRNG so every visit builds the same world. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const damp = (a: number, b: number, lambda: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-lambda * dt));

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
