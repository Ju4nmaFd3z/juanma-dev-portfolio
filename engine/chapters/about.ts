import * as THREE from 'three';
import { C } from '../palette';
import { Kit, rng } from '../kit';
import type { Chapter, FrameCtx } from '../types';

// 02 · ORIGIN — "The open tower".
// A desktop tower with its side panel off, the way tinkering always starts:
// motherboard, RAM with LEDs, a CPU cooler and a graphics card with spinning
// fans, the PSU at the base. The side panel floats beside it with the screws
// still hovering in the air.

function fan(kit: Kit, radius: number, color: number) {
  const g = new THREE.Group();
  const blades = 5;
  for (let i = 0; i < blades; i++) {
    const b = kit.mesh(kit.box(radius * 0.95, 0.06, radius * 0.32), kit.toon(color));
    b.position.x = radius * 0.5;
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / blades) * Math.PI * 2;
    b.rotation.x = 0.35;
    pivot.add(b);
    g.add(pivot);
  }
  g.add(kit.mesh(kit.cyl(radius * 0.22, radius * 0.22, 0.1, 8), kit.toon(C.deep)));
  return g;
}

export function buildAbout(low: boolean): Chapter {
  const kit = new Kit();
  const root = new THREE.Group();
  const tower = new THREE.Group();
  root.add(tower);
  const rand = rng(21);

  const W = 3.6, H = 7.2, D = 7; // case interior size
  const frame = kit.toon(C.slate);
  // Case shell: back, top, bottom, front, far side panel
  tower.add(kit.mesh(kit.box(W, 0.25, D), frame, 0, -H / 2, 0));
  tower.add(kit.mesh(kit.box(W, 0.25, D), frame, 0, H / 2, 0));
  tower.add(kit.mesh(kit.box(W, H, 0.25), frame, 0, 0, -D / 2));
  tower.add(kit.mesh(kit.box(W, H, 0.4), kit.toon(C.navy), 0, 0, D / 2));
  tower.add(kit.mesh(kit.box(0.2, H, D), kit.toon(C.deep), -W / 2, 0, 0));
  // Front panel details: power LED + bay slits
  tower.add(kit.mesh(kit.box(0.5, 0.18, 0.1), kit.glow(C.mint), 0.9, H / 2 - 0.7, D / 2 + 0.22));
  for (let i = 0; i < 3; i++) tower.add(kit.mesh(kit.box(2.6, 0.08, 0.1), kit.toon(C.deep), 0, H / 2 - 1.4 - i * 0.35, D / 2 + 0.22));

  // Motherboard on the far side wall
  const mb = kit.mesh(kit.box(0.12, 5.6, 5.2), kit.toon(C.teal), -W / 2 + 0.2, 0.4, -0.4);
  tower.add(mb);
  const mbx = -W / 2 + 0.32;
  // Traces on the board
  const traces: [number, number, number][] = [];
  for (let i = 0; i < 40; i++) traces.push([mbx, -2 + rand() * 5, -2.8 + rand() * 4.8]);
  tower.add(kit.voxels(traces, C.mint, 0.1));

  // CPU cooler tower with fan
  tower.add(kit.mesh(kit.box(1.4, 1.6, 1.6), kit.toon(C.haze), mbx + 0.75, 1.5, -0.9));
  for (let i = 0; i < 6; i++) tower.add(kit.mesh(kit.box(1.42, 0.06, 1.62), kit.toon(C.steel), mbx + 0.75, 0.82 + i * 0.27, -0.9));
  const cpuFan = fan(kit, 0.8, C.deep);
  cpuFan.rotation.x = Math.PI / 2;
  cpuFan.position.set(mbx + 0.75, 1.5, -0.04);
  tower.add(cpuFan);

  // RAM sticks with LED strips
  const ramLeds: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const z = 0.55 + i * 0.28;
    tower.add(kit.mesh(kit.box(0.6, 2.0, 0.12), kit.toon(C.navy), mbx + 0.32, 1.4, z));
    const led = kit.mesh(kit.box(0.62, 0.12, 0.14), kit.glow([C.coral, C.amber, C.mint, C.berry][i]), mbx + 0.34, 2.45, z);
    ramLeds.push(led);
    tower.add(led);
  }

  // Graphics card with two fans
  const gpu = new THREE.Group();
  gpu.position.set(mbx + 1.0, -0.8, -0.5);
  gpu.add(kit.mesh(kit.box(1.5, 0.55, 4.4), kit.toon(C.deep)));
  gpu.add(kit.mesh(kit.box(0.08, 0.3, 4.2), kit.glow(C.amber), 0.76, 0.05, 0));
  const gpuFans = [fan(kit, 0.65, C.steel), fan(kit, 0.65, C.steel)];
  gpuFans.forEach((f, i) => { f.position.set(0, -0.3, i === 0 ? -1.05 : 1.05); gpu.add(f); });
  tower.add(gpu);

  // PSU + cable bundle
  tower.add(kit.mesh(kit.box(2.6, 1.3, 2.4), kit.toon(C.steel), 0, -H / 2 + 0.8, -2.0));
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.6, -H / 2 + 1.4, -1.2),
    new THREE.Vector3(1.0, -1.5, 0.6),
    new THREE.Vector3(0.2, 0.0, 1.8),
    new THREE.Vector3(mbx + 0.4, 0.3, 2.1),
  ]);
  const tube = kit.own(new THREE.TubeGeometry(cable, 24, 0.13, 5, false));
  tower.add(kit.mesh(tube, kit.toon(C.coral)));
  const sata = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, -H / 2 + 1.4, -1.0),
    new THREE.Vector3(-0.2, -2.0, 1.8),
    new THREE.Vector3(0.5, -2.6, 2.8),
  ]);
  const tube2 = kit.own(new THREE.TubeGeometry(sata, 16, 0.09, 5, false));
  tower.add(kit.mesh(tube2, kit.toon(C.amber)));

  // Drive cage
  for (let i = 0; i < 2; i++) tower.add(kit.mesh(kit.box(1.8, 0.35, 1.4), kit.toon(C.haze), 0.3, -2.4 + i * 0.5, 2.6));

  // Side panel — floating away, with its screws
  const panel = new THREE.Group();
  panel.add(kit.mesh(kit.box(0.18, H * 0.92, D * 0.92), kit.toon(C.navy)));
  const window = kit.mesh(kit.box(0.2, H * 0.6, D * 0.6), kit.toon(C.slate));
  panel.add(window);
  panel.position.set(W / 2 + 1.6, 0.6, -D / 2 - 2.2);
  panel.rotation.set(0.04, 0.95, 0.06);
  root.add(panel);
  const screws: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const s = kit.mesh(kit.cyl(0.12, 0.12, 0.35, 6), kit.toon(C.cream));
    s.userData.base = new THREE.Vector3(W / 2 + 1.4 + (i % 2) * 0.6, 1.8 - i * 1.1, 2.6 - i * 0.6);
    screws.push(s);
    root.add(s);
  }

  // Screwdriver
  const driver = new THREE.Group();
  driver.add(kit.mesh(kit.cyl(0.22, 0.26, 1.4, 6), kit.toon(C.coral), 0, 0.7, 0));
  driver.add(kit.mesh(kit.cyl(0.07, 0.07, 1.8, 6), kit.toon(C.haze), 0, -0.9, 0));
  driver.position.set(W / 2 + 1.2, -2.6, 3.2);
  driver.rotation.set(0.4, 0, 1.1);
  root.add(driver);

  if (low) panel.remove(window);

  const camera = { pos: new THREE.Vector3(15.5, 5.6, 11.5), target: new THREE.Vector3(1.2, -0.3, -0.8), fov: 36 };

  return {
    id: 'about',
    root,
    look: { pixel: 4, glyphs: 0, glyphCell: 10, dither: 1.1, outline: 1 },
    camera,
    update({ t, px, py, local }: FrameCtx) {
      root.rotation.y = -0.15 + px * 0.2 + (local - 0.5) * 0.5;
      root.rotation.x = py * 0.05;
      cpuFan.rotation.y = t * 9;
      gpuFans.forEach((f, i) => (f.rotation.y = t * (7 + i)));
      ramLeds.forEach((l, i) => (l.visible = Math.sin(t * 2 + i * 0.9) > -0.6));
      panel.position.y = 0.6 + Math.sin(t * 0.7) * 0.2;
      screws.forEach((s, i) => {
        const b = s.userData.base as THREE.Vector3;
        s.position.set(b.x, b.y + Math.sin(t * 1.1 + i) * 0.25, b.z);
        s.rotation.set(t * 0.8 + i, 0, Math.PI / 2);
      });
      driver.position.y = -2.6 + Math.sin(t * 0.9 + 1) * 0.2;
    },
    dispose: () => kit.dispose(),
  };
}
