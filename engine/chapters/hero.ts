import * as THREE from 'three';
import { C } from '../palette';
import { Kit, bitmapCells, rng } from '../kit';
import type { Chapter, FrameCtx } from '../types';

// 01 · IDENTITY — "The Core".
// A floating fragment of circuit board. At its centre, a processor whose die
// carries the JM monogram in voxels. Signals run along Manhattan-routed traces
// toward the edges, and under the board hang the socket pins: the part of the
// system nobody sees, the part everything stands on.

export function buildHero(low: boolean): Chapter {
  const kit = new Kit();
  const root = new THREE.Group();
  const island = new THREE.Group();
  root.add(island);
  const rand = rng(7);

  // Board
  const board = kit.mesh(kit.box(9, 0.5, 9), kit.toon(C.navy), 0, -0.25, 0);
  island.add(board);
  const solder = kit.mesh(kit.box(9.2, 0.12, 9.2), kit.toon(C.deep), 0, -0.56, 0);
  island.add(solder);

  // Socket pins under the board ("from below")
  const pins: [number, number, number][] = [];
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
    if ((x + z) % 2 !== 0) continue;
    const len = 1 + Math.floor(rand() * 3);
    for (let y = 0; y < len; y++) pins.push([x * 0.9, -0.95 - y * 0.42, z * 0.9]);
  }
  island.add(kit.voxels(pins, C.slate, 0.3));

  // CPU package + die
  island.add(kit.mesh(kit.box(3.6, 0.35, 3.6), kit.toon(C.slate), 0, 0.17, 0));
  island.add(kit.mesh(kit.box(3.1, 0.25, 3.1), kit.toon(C.deep), 0, 0.47, 0));
  // Letters laid flat on the die, turned to face the camera's azimuth so
  // "JM" reads left-to-right from the default view.
  const mono = bitmapCells('JM').map(([x, y]) => [(x - 5) * 0.26, 0, (2 - y) * 0.26] as [number, number, number]);
  const monogram = kit.voxels(mono, kit.glow(C.amber), 0.25);
  const monoGroup = new THREE.Group();
  monoGroup.add(monogram);
  monoGroup.position.y = 0.66;
  monoGroup.rotation.y = Math.atan2(9.2, 11.4) + 0.2;
  island.add(monoGroup);

  // Package pins around the CPU
  const edge: [number, number, number][] = [];
  for (let i = -6; i <= 6; i++) {
    edge.push([i * 0.26, 0.08, 1.95], [i * 0.26, 0.08, -1.95], [1.95, 0.08, i * 0.26], [-1.95, 0.08, i * 0.26]);
  }
  island.add(kit.voxels(edge, C.cream, 0.1));

  // Traces: routed from the CPU outward, with one 90° bend each
  type Trace = THREE.Vector3[];
  const traces: Trace[] = [];
  const traceCells: [number, number, number][] = [];
  const step = 0.25;
  for (let k = 0; k < 18; k++) {
    const side = k % 4;
    const off = (Math.floor(k / 4) - 2) * 0.5 + (rand() - 0.5) * 0.2;
    const start = new THREE.Vector3(
      side === 0 ? 1.9 : side === 1 ? -1.9 : off,
      0.02,
      side === 2 ? 1.9 : side === 3 ? -1.9 : off,
    );
    const dir = new THREE.Vector3(side === 0 ? 1 : side === 1 ? -1 : 0, 0, side === 2 ? 1 : side === 3 ? -1 : 0);
    const bend = new THREE.Vector3(dir.z, 0, dir.x).multiplyScalar(rand() > 0.5 ? 1 : -1);
    const len1 = 2 + Math.floor(rand() * 5);
    const len2 = 2 + Math.floor(rand() * 6);
    const pts: Trace = [];
    const p = start.clone();
    for (let i = 0; i < len1; i++) { pts.push(p.clone()); p.addScaledVector(dir, step); }
    for (let i = 0; i < len2; i++) {
      if (Math.abs(p.x) > 4.3 || Math.abs(p.z) > 4.3) break;
      pts.push(p.clone()); p.addScaledVector(bend, step);
    }
    pts.forEach((v) => traceCells.push([v.x, v.y, v.z]));
    traces.push(pts);
    // via at the end of each trace
    const end = pts[pts.length - 1];
    island.add(kit.mesh(kit.cyl(0.12, 0.12, 0.08, 6), kit.toon(C.mint), end.x, 0.04, end.z));
  }
  const traceMesh = kit.voxels(traceCells, C.slate, 0.22);
  traceMesh.scale.y = 0.25;
  island.add(traceMesh);

  // Capacitors & small chips
  for (let i = 0; i < (low ? 6 : 12); i++) {
    const x = (rand() - 0.5) * 7.6, z = (rand() - 0.5) * 7.6;
    if (Math.abs(x) < 2.4 && Math.abs(z) < 2.4) continue;
    if (rand() > 0.5) island.add(kit.mesh(kit.cyl(0.22, 0.22, 0.6, 8), kit.toon(rand() > 0.5 ? C.teal : C.steel), x, 0.3, z));
    else island.add(kit.mesh(kit.box(0.8, 0.2, 0.5), kit.toon(C.deep), x, 0.1, z));
  }

  // Signals travelling the traces
  const pulseCount = traces.length;
  const pulses = new THREE.InstancedMesh(kit.box(0.2, 0.2, 0.2), kit.glow(C.mint), pulseCount);
  kit.own({ dispose: () => pulses.dispose() });
  island.add(pulses);
  const phase = traces.map(() => rand());
  const speed = traces.map(() => 0.25 + rand() * 0.35);

  // Data cubes orbiting
  const orbit = new THREE.Group();
  root.add(orbit);
  const cubes: THREE.Mesh[] = [];
  const cubeColors = [C.mint, C.coral, C.cream, C.teal, C.amber];
  for (let i = 0; i < (low ? 5 : 9); i++) {
    const s = 0.25 + rand() * 0.35;
    const m = kit.mesh(kit.box(s, s, s), kit.toon(cubeColors[i % cubeColors.length]));
    m.userData = { a: (i / 9) * Math.PI * 2, r: 5.2 + rand() * 1.2, y: 0.4 + rand() * 1.8, sp: 0.12 + rand() * 0.1 };
    cubes.push(m);
    orbit.add(m);
  }

  const tmp = new THREE.Matrix4();
  const camera = { pos: new THREE.Vector3(9.2, 10.4, 11.4), target: new THREE.Vector3(0, -0.4, 0), fov: 34 };

  return {
    id: 'hero',
    root,
    look: { pixel: 4, glyphs: 0, glyphCell: 10, dither: 1, outline: 1 },
    camera,
    update({ t, px, py, local }: FrameCtx) {
      island.rotation.y = -0.2 + px * 0.25 + Math.sin(t * 0.25) * 0.12;
      island.rotation.x = py * 0.08;
      island.position.y = Math.sin(t * 0.8) * 0.18 + local * 1.2;
      traces.forEach((pts, i) => {
        const f = (phase[i] + t * speed[i]) % 1;
        const p = pts[Math.min(pts.length - 1, Math.floor(f * pts.length))];
        tmp.makeTranslation(p.x, 0.16, p.z);
        pulses.setMatrixAt(i, tmp);
      });
      pulses.instanceMatrix.needsUpdate = true;
      cubes.forEach((m) => {
        const u = m.userData as { a: number; r: number; y: number; sp: number };
        const a = u.a + t * u.sp;
        m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.a) * 0.3, Math.sin(a) * u.r);
        m.rotation.set(t * 0.5 + u.a, t * 0.3, 0);
      });
    },
    dispose: () => kit.dispose(),
  };
}
