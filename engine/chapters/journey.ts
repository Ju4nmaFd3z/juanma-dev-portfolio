import * as THREE from 'three';
import { C } from '../palette';
import { Kit, damp, rng } from '../kit';
import type { Chapter, FrameCtx } from '../types';

// 05 · EVOLUTION — an archipelago route.
// Each milestone is a pillar; pillars grow taller as the story advances.
// Most of the route lives on the Málaga island; one pillar stands on a second
// island across the water — Campobasso, the Erasmus+ stay. A packet travels
// the route to whichever milestone the visitor is reading.

export function buildJourney(low: boolean): Chapter {
  const kit = new Kit();
  const root = new THREE.Group();
  const world = new THREE.Group();
  root.add(world);
  const rand = rng(42);

  // Water — a big flat plane: the dither turns it into a sea of pixels
  const water = kit.mesh(kit.box(30, 0.2, 24), kit.toon(C.slate), 1, -0.6, -1);
  water.castShadow = false;
  world.add(water);

  // Islands built from voxel columns
  const island = (cx: number, cz: number, r: number, seed: number) => {
    const rr = rng(seed);
    const cells: [number, number, number][] = [];
    const top: [number, number, number][] = [];
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      const d = Math.hypot(x, z) / r + (rr() - 0.5) * 0.25;
      if (d > 1) continue;
      const h = Math.max(0, Math.round((1 - d) * 2.2));
      for (let y = 0; y < h; y++) cells.push([cx + x, y - 0.4, cz + z]);
      top.push([cx + x, h - 0.4, cz + z]);
    }
    world.add(kit.voxels(cells, C.slate, 1), kit.voxels(top, C.teal, 1));
  };
  island(-2, 1, low ? 6 : 7, 3);
  island(9, -6, 3, 9);

  // Milestone positions along the route (x, z) and heights
  const spots: [number, number][] = [[-6, 4], [-4, 0], [9, -6], [-1, -2], [1, 2], [-3, 4.5], [2, -1.5]];
  // Order of travel: chronological
  const pillars: THREE.Group[] = [];
  const heights = [1.2, 1.7, 2.2, 2.6, 3.1, 3.4, 3.9];
  const colors = [C.steel, C.mint, C.coral, C.haze, C.amber, C.berry, C.cream];
  spots.forEach(([x, z], i) => {
    const g = new THREE.Group();
    const base = i === 2 ? 1.4 : 1.6;
    const h = heights[i];
    g.add(kit.mesh(kit.box(0.9, h, 0.9), kit.toon(C.navy), 0, h / 2, 0));
    const cap = kit.mesh(kit.box(1.1, 0.35, 1.1), kit.toon(colors[i]), 0, h + 0.18, 0);
    g.add(cap);
    const beacon = kit.mesh(kit.box(0.3, 0.3, 0.3), kit.glow(C.amber), 0, h + 0.9, 0);
    g.add(beacon);
    g.position.set(x, base, z);
    g.userData = { cap, beacon, h, glow: 0 };
    pillars.push(g);
    world.add(g);
  });

  // Route: the path linking pillars in order (the jump to Italy is an arc)
  const routePts: THREE.Vector3[] = [];
  for (let i = 0; i < pillars.length - 1; i++) {
    const a = pillars[i].position.clone().setY(pillars[i].position.y + heights[i] + 0.9);
    const b = pillars[i + 1].position.clone().setY(pillars[i + 1].position.y + heights[i + 1] + 0.9);
    const isFlight = i === 1 || i === 2;
    const mid = a.clone().lerp(b, 0.5).setY(Math.max(a.y, b.y) + (isFlight ? 3 : 0.8));
    const seg = new THREE.QuadraticBezierCurve3(a, mid, b);
    seg.getPoints(16).forEach((p, k) => { if (i === 0 || k > 0) routePts.push(p); });
  }
  const route = new THREE.CatmullRomCurve3(routePts);
  const dashes: [number, number, number][] = [];
  for (let i = 0; i <= 90; i++) {
    if (i % 2) continue;
    const p = route.getPointAt(i / 90);
    dashes.push([p.x, p.y, p.z]);
  }
  world.add(kit.voxels(dashes, C.haze, 0.12));

  // Arc lengths at which each pillar sits on the route
  const stopsU = pillars.map((_, i) => i / (pillars.length - 1));

  const packet = kit.mesh(kit.box(0.7, 0.7, 0.7), kit.glow(C.amber));
  world.add(packet);
  let u = 0;

  // A few clouds drifting over the water
  const clouds: THREE.Mesh[] = [];
  for (let i = 0; i < (low ? 3 : 6); i++) {
    const c = kit.mesh(kit.box(2 + rand() * 2, 0.4, 1 + rand()), kit.toon(C.haze), -12 + rand() * 24, 7 + rand() * 2, -10 + rand() * 16);
    c.castShadow = false;
    clouds.push(c);
    world.add(c);
  }

  const camera = { pos: new THREE.Vector3(15, 19, 23), target: new THREE.Vector3(1.5, 1.2, -1.2), fov: 38 };

  return {
    id: 'journey',
    root,
    look: { pixel: 4, glyphs: 0, glyphCell: 10, dither: 1.4, outline: 0.9 },
    camera,
    update({ t, dt, px, py, bus, reduced }: FrameCtx) {
      const idx = Math.min(pillars.length - 1, Math.max(0, bus.activeMilestone));
      const target = stopsU[idx];
      u = reduced ? target : damp(u, target, 2.2, dt);
      packet.position.copy(route.getPointAt(Math.min(1, Math.max(0, u))));
      packet.position.y += 0.35 + Math.sin(t * 4) * 0.08;
      packet.rotation.set(t, t * 1.3, 0);
      pillars.forEach((g, i) => {
        const d = g.userData as { beacon: THREE.Mesh; cap: THREE.Mesh; h: number; glow: number };
        d.glow = reduced ? (i <= idx ? 1 : 0) : damp(d.glow, i <= idx ? 1 : 0, 4, dt);
        d.beacon.visible = d.glow > 0.5 && (i !== idx || Math.sin(t * 6) > -0.4);
        d.cap.position.y = d.h + 0.18 + (i === idx ? Math.sin(t * 2) * 0.08 + 0.15 : 0);
      });
      clouds.forEach((c, i) => { c.position.x = ((c.position.x + dt * (0.3 + i * 0.05) + 16) % 32) - 16; });
      world.rotation.y = -0.25 + px * 0.18;
      world.rotation.x = py * 0.04;
    },
    dispose: () => kit.dispose(),
  };
}
