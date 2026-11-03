import * as THREE from 'three';
import { C } from '../palette';
import { Kit, damp, rng } from '../kit';
import type { Chapter, FrameCtx } from '../types';

// 03 · THE STACK — rendered as text.
// Seven slabs, bottom to top: hardware, networks, systems, data, programming,
// web, devops. Each one carries a small motif. This chapter is resolved in
// glyph mode — the layer where everything becomes code — and the layer the
// visitor points at in the HTML list lifts out of the stack.

export const LAYER_COUNT = 7;

export function buildSkills(low: boolean): Chapter {
  const kit = new Kit();
  const root = new THREE.Group();
  const stack = new THREE.Group();
  root.add(stack);
  const rand = rng(33);

  const GAP = 1.05;
  const slabs: THREE.Group[] = [];
  const tints = [C.steel, C.teal, C.slate, C.berry, C.amber, C.mint, C.coral];

  for (let i = 0; i < LAYER_COUNT; i++) {
    const g = new THREE.Group();
    const size = 5.6 - i * 0.28;
    g.add(kit.mesh(kit.box(size, 0.42, size), kit.toon(C.steel)));
    // Coloured edge band identifying the layer
    g.add(kit.mesh(kit.box(size + 0.06, 0.12, size + 0.06), kit.toon(tints[i]), 0, -0.16, 0));
    const top = 0.21;
    const s = size / 2 - 0.5;
    switch (i) {
      case 0: { // hardware: chips
        for (let k = 0; k < 6; k++) g.add(kit.mesh(kit.box(0.9, 0.25, 0.9), kit.toon(C.slate), -s + 0.6 + (k % 3) * 1.6, top + 0.12, k < 3 ? -0.9 : 0.9));
        break;
      }
      case 1: { // networks: nodes + links
        const nodes = [[-1.6, -1.4], [1.5, -1.2], [0, 0], [-1.3, 1.5], [1.6, 1.3]];
        nodes.forEach(([x, z]) => g.add(kit.mesh(kit.cyl(0.32, 0.32, 0.3, 8), kit.toon(C.mint), x, top + 0.15, z)));
        [[0, 2], [1, 2], [3, 2], [4, 2], [0, 3], [1, 4]].forEach(([a, b]) => {
          const A = new THREE.Vector3(nodes[a][0], 0, nodes[a][1]), B = new THREE.Vector3(nodes[b][0], 0, nodes[b][1]);
          const len = A.distanceTo(B);
          const link = kit.mesh(kit.box(len, 0.08, 0.08), kit.toon(C.teal), (A.x + B.x) / 2, top + 0.08, (A.z + B.z) / 2);
          link.rotation.y = -Math.atan2(B.z - A.z, B.x - A.x);
          g.add(link);
        });
        break;
      }
      case 2: { // systems: rack units
        for (let k = 0; k < 3; k++) {
          const rack = kit.mesh(kit.box(1.0, 1.0, 1.4), kit.toon(C.deep), -1.4 + k * 1.4, top + 0.5, 0);
          g.add(rack);
          for (let u = 0; u < 3; u++) g.add(kit.mesh(kit.box(0.5, 0.06, 0.06), kit.glow(u === k ? C.amber : C.mint), -1.4 + k * 1.4, top + 0.25 + u * 0.28, 0.72));
        }
        break;
      }
      case 3: { // data: database cylinders
        for (let k = 0; k < 3; k++) for (let h = 0; h < 3; h++) {
          g.add(kit.mesh(kit.cyl(0.55, 0.55, 0.22, 10), kit.toon(h % 2 ? C.cream : C.haze), -1.3 + k * 1.3, top + 0.14 + h * 0.26, k === 1 ? 0.6 : -0.4));
        }
        break;
      }
      case 4: { // programming: </> in voxels
        const cells: [number, number, number][] = [];
        const glyph = ['..#.....#..', '.#...#...#.', '#...#.....#', '.#.#....#..', '..#.......#'];
        glyph.forEach((row, z) => [...row].forEach((c, x) => { if (c === '#') cells.push([(x - 5) * 0.32, top + 0.16, (z - 2) * 0.32]); }));
        g.add(kit.voxels(cells, kit.glow(C.amber), 0.3));
        break;
      }
      case 5: { // web: browser windows
        for (let k = 0; k < 2; k++) {
          const w = kit.mesh(kit.box(2.0, 1.3, 0.12), kit.toon(C.haze), -0.9 + k * 1.6, top + 0.75, -0.4 + k * 0.9);
          g.add(w);
          g.add(kit.mesh(kit.box(2.0, 0.22, 0.14), kit.toon(k ? C.coral : C.teal), -0.9 + k * 1.6, top + 1.32, -0.4 + k * 0.9));
        }
        break;
      }
      case 6: { // devops: containers + loop
        for (let k = 0; k < 4; k++) g.add(kit.mesh(kit.box(0.9, 0.5, 0.5), kit.toon([C.teal, C.mint, C.amber, C.coral][k]), -1.2 + (k % 2) * 1.0, top + 0.25 + Math.floor(k / 2) * 0.52, 0.4));
        const ring = kit.own(new THREE.TorusGeometry(0.7, 0.12, 5, 16));
        const loop = kit.mesh(ring, kit.toon(C.cream), 1.3, top + 0.8, -0.6);
        loop.rotation.y = 0.6;
        g.add(loop);
        g.userData.loop = loop;
        break;
      }
    }
    g.position.y = i * GAP - (LAYER_COUNT - 1) * GAP * 0.5;
    g.userData.baseY = g.position.y;
    g.userData.lift = 0;
    g.userData.spin = (rand() - 0.5) * 0.3;
    slabs.push(g);
    stack.add(g);
  }

  // Bits drifting upward around the stack — information rising through layers
  const bits = new THREE.InstancedMesh(kit.box(0.18, 0.18, 0.18), kit.glow(C.mint), low ? 24 : 48);
  kit.own({ dispose: () => bits.dispose() });
  root.add(bits);
  const seeds = Array.from({ length: bits.count }, () => [rand() * Math.PI * 2, 3.6 + rand() * 1.8, rand(), 0.06 + rand() * 0.08]);
  const m4 = new THREE.Matrix4();

  const camera = { pos: new THREE.Vector3(9.5, 3.2, 11), target: new THREE.Vector3(0, -0.2, 0), fov: 40 };

  return {
    id: 'skills',
    root,
    look: { pixel: 3, glyphs: 1, glyphCell: low ? 8 : 9, dither: 0.6, outline: 0.6 },
    camera,
    update({ t, dt, px, py, bus, reduced }: FrameCtx) {
      stack.rotation.y = t * 0.12 + px * 0.35;
      stack.rotation.x = py * 0.06;
      slabs.forEach((g, i) => {
        const active = bus.activeLayer === i;
        const target = bus.activeLayer < 0 ? 0 : active ? 1 : 0;
        g.userData.lift = reduced ? target : damp(g.userData.lift, target, 6, dt);
        const l = g.userData.lift as number;
        // Lift the active layer and open the gap above it
        const aboveTarget = bus.activeLayer >= 0 && i > bus.activeLayer ? 0.8 : 0;
        g.userData.gap = reduced ? aboveTarget : damp((g.userData.gap as number) || 0, aboveTarget, 6, dt);
        g.position.y = (g.userData.baseY as number) + l * 0.45 + (g.userData.gap as number);
        g.position.x = l * 1.2;
        g.rotation.y = l * 0.4 + Math.sin(t * 0.4 + i) * 0.02;
        const loop = g.userData.loop as THREE.Mesh | undefined;
        if (loop) loop.rotation.x = t * 1.2;
      });
      seeds.forEach(([a, r, ph, sp], i) => {
        const f = (ph + t * sp) % 1;
        m4.makeTranslation(Math.cos(a + t * 0.1) * r, -4 + f * 8.5, Math.sin(a + t * 0.1) * r);
        bits.setMatrixAt(i, m4);
      });
      bits.instanceMatrix.needsUpdate = true;
    },
    dispose: () => kit.dispose(),
  };
}
