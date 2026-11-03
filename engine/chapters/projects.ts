import * as THREE from 'three';
import { C } from '../palette';
import { Kit, rng, clamp01 } from '../kit';
import type { ProjectId } from '../bus';
import type { Chapter, FrameCtx } from '../types';

// 04 · BUILD — one artifact per project, on a single pedestal.
// Each artifact is a small procedural voxel sculpture that says something
// true about the project. Switching projects "rebuilds" the pedestal: the old
// piece sinks in hard steps, the new one rises layer by layer.

interface Artifact {
  group: THREE.Group;
  update(t: number): void;
}

type Builder = (kit: Kit, low: boolean) => Artifact;

const genetix: Builder = (kit) => {
  // DNA double helix — selection, crossover, mutation
  const group = new THREE.Group();
  const helix = new THREE.Group();
  group.add(helix);
  const n = 22;
  const a: [number, number, number][] = [], b: [number, number, number][] = [], rungs: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const y = i * 0.26, ang = i * 0.5, r = 1.1;
    a.push([Math.cos(ang) * r, y, Math.sin(ang) * r]);
    b.push([Math.cos(ang + Math.PI) * r, y, Math.sin(ang + Math.PI) * r]);
    if (i % 2 === 0) for (let k = 1; k < 4; k++) {
      const f = k / 4;
      rungs.push([Math.cos(ang) * r * (1 - 2 * f), y, Math.sin(ang) * r * (1 - 2 * f)]);
    }
  }
  helix.add(kit.voxels(a, C.mint, 0.34), kit.voxels(b, C.coral, 0.34), kit.voxels(rungs, C.cream, 0.18));
  helix.position.y = 0.4;
  // A "mutated" gene blinking in amber
  const mut = kit.mesh(kit.box(0.36, 0.36, 0.36), kit.glow(C.amber), a[13][0], a[13][1] + 0.4, a[13][2]);
  helix.add(mut);
  return { group, update: (t) => { helix.rotation.y = t * 0.6; mut.visible = Math.sin(t * 3) > -0.3; } };
};

const arena: Builder = (kit, low) => {
  // Tactical grid with autonomous units (75×25 grid, shown at 15×5 scale)
  const group = new THREE.Group();
  const cols = 15, rows = 5, s = 0.36;
  const tiles: [number, number, number][] = [];
  for (let x = 0; x < cols; x++) for (let z = 0; z < rows; z++) if ((x + z) % 2 === 0) tiles.push([(x - cols / 2 + 0.5) * s, 0.05, (z - rows / 2 + 0.5) * s]);
  const base = kit.mesh(kit.box(cols * s + 0.2, 0.12, rows * s + 0.2), kit.toon(C.navy), 0, 0, 0);
  group.add(base, kit.voxels(tiles, C.slate, s * 0.98));
  group.children.forEach((c) => (c.scale.y = 1));
  const units: { m: THREE.Mesh; x: number; z: number; seed: number }[] = [];
  const kinds = [C.mint, C.mint, C.mint, C.coral, C.coral, C.coral, C.cream];
  const rand = rng(5);
  kinds.slice(0, low ? 5 : 7).forEach((col, i) => {
    const m = kit.mesh(kit.box(s * 0.7, s * 1.3, s * 0.7), kit.toon(col));
    units.push({ m, x: Math.floor(rand() * cols), z: Math.floor(rand() * rows), seed: i * 1.7 });
    group.add(m);
  });
  group.scale.setScalar(1.25);
  group.position.y = 0.6;
  group.rotation.x = 0.0;
  let lastStep = -1;
  return {
    group,
    update: (t) => {
      const stepI = Math.floor(t * 2);
      if (stepI !== lastStep) {
        lastStep = stepI;
        units.forEach((u, i) => {
          const r = Math.sin(stepI * 12.9898 + i * 78.233) * 43758.5453;
          const d = Math.floor((r - Math.floor(r)) * 4);
          u.x = Math.min(cols - 1, Math.max(0, u.x + (d === 0 ? 1 : d === 1 ? -1 : 0)));
          u.z = Math.min(rows - 1, Math.max(0, u.z + (d === 2 ? 1 : d === 3 ? -1 : 0)));
        });
      }
      units.forEach((u) => u.m.position.set((u.x - cols / 2 + 0.5) * s, 0.3, (u.z - rows / 2 + 0.5) * s));
      group.rotation.y = Math.sin(t * 0.3) * 0.5 + 0.4;
    },
  };
};

const infra: Builder = (kit) => {
  // Router, two switches, hosts — packets moving along the links
  const group = new THREE.Group();
  const router = kit.mesh(kit.cyl(0.8, 0.8, 0.5, 10), kit.toon(C.teal), 0, 2.2, 0);
  group.add(router);
  const switches = [new THREE.Vector3(-1.8, 1.0, 0), new THREE.Vector3(1.8, 1.0, 0)];
  switches.forEach((p) => group.add(kit.mesh(kit.box(1.6, 0.3, 0.8), kit.toon(C.haze), p.x, p.y, p.z)));
  const hosts: THREE.Vector3[] = [];
  [-2.8, -1.8, -0.8, 0.8, 1.8, 2.8].forEach((x, i) => {
    const p = new THREE.Vector3(x, 0, i % 2 ? 0.8 : -0.6);
    hosts.push(p);
    group.add(kit.mesh(kit.box(0.6, 0.45, 0.5), kit.toon(C.slate), p.x, p.y + 0.25, p.z));
    group.add(kit.mesh(kit.box(0.5, 0.3, 0.06), kit.glow(C.mint), p.x, p.y + 0.3, p.z + 0.27));
  });
  const links: [THREE.Vector3, THREE.Vector3][] = [];
  switches.forEach((s) => links.push([new THREE.Vector3(0, 2.2, 0), s]));
  hosts.forEach((h, i) => links.push([switches[i < 3 ? 0 : 1], h.clone().setY(0.45)]));
  links.forEach(([a, b]) => {
    const len = a.distanceTo(b);
    const l = kit.mesh(kit.box(0.07, len, 0.07), kit.toon(C.steel), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    l.lookAt(b);
    l.rotateX(Math.PI / 2);
    group.add(l);
  });
  const packets = links.map(() => kit.mesh(kit.box(0.2, 0.2, 0.2), kit.glow(C.amber)));
  packets.forEach((p) => group.add(p));
  group.position.y = 0.2;
  return {
    group,
    update: (t) => {
      links.forEach(([a, b], i) => {
        const f = (t * 0.5 + i * 0.17) % 1;
        packets[i].position.lerpVectors(i % 2 ? a : b, i % 2 ? b : a, f);
      });
      group.rotation.y = Math.sin(t * 0.25) * 0.6;
    },
  };
};

const glitch: Builder = (kit, low) => {
  // Night skyline with lit windows and a crescent moon
  const group = new THREE.Group();
  const rand = rng(11);
  const windows: THREE.Mesh[] = [];
  for (let i = 0; i < (low ? 7 : 10); i++) {
    const h = 0.8 + rand() * 2.6, w = 0.5 + rand() * 0.4;
    const x = -2.6 + i * 0.58, z = (rand() - 0.5) * 1.2;
    group.add(kit.mesh(kit.box(w, h, 0.7), kit.toon(i % 3 === 0 ? C.berry : C.navy), x, h / 2, z));
    for (let k = 0; k < Math.floor(h / 0.45); k++) {
      const win = kit.mesh(kit.box(0.14, 0.14, 0.05), kit.glow(rand() > 0.5 ? C.amber : C.coral), x + (rand() - 0.5) * w * 0.5, 0.35 + k * 0.42, z + 0.37);
      win.userData.ph = rand() * 10;
      windows.push(win);
      group.add(win);
    }
  }
  const moon = new THREE.Group();
  moon.add(kit.mesh(kit.cyl(0.8, 0.8, 0.3, 14), kit.toon(C.cream)));
  const bite = kit.mesh(kit.cyl(0.7, 0.7, 0.32, 14), kit.toon(C.navy), 0.42, 0, 0.12);
  moon.add(bite);
  moon.rotation.x = Math.PI / 2;
  moon.position.set(1.6, 4.0, -0.6);
  group.add(moon);
  return {
    group,
    update: (t) => {
      windows.forEach((w) => (w.visible = Math.sin(t * 1.3 + (w.userData.ph as number)) > -0.75));
      group.rotation.y = Math.sin(t * 0.2) * 0.35;
      moon.position.y = 4.0 + Math.sin(t * 0.6) * 0.12;
    },
  };
};

const arcade: Builder = (kit) => {
  // An arcade cabinet, screen alive
  const group = new THREE.Group();
  const body = kit.toon(C.berry);
  group.add(kit.mesh(kit.box(1.8, 3.2, 1.4), body, 0, 1.6, 0));
  group.add(kit.mesh(kit.box(1.9, 0.6, 1.7), kit.toon(C.navy), 0, 1.6, 0.25)); // control deck
  group.add(kit.mesh(kit.box(1.85, 0.5, 1.45), kit.toon(C.amber), 0, 3.35, 0)); // marquee
  const screen = new THREE.Group();
  screen.position.set(0, 2.55, 0.71);
  const px: THREE.Mesh[] = [];
  for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
    const p = kit.mesh(kit.box(0.2, 0.2, 0.04), kit.glow(C.mint), (x - 2.5) * 0.22, (y - 2) * 0.2, 0);
    p.userData = { x, y };
    px.push(p);
    screen.add(p);
  }
  group.add(screen);
  // Joystick + buttons
  group.add(kit.mesh(kit.cyl(0.05, 0.05, 0.4, 6), kit.toon(C.cream), -0.45, 2.05, 0.75));
  group.add(kit.mesh(kit.box(0.18, 0.18, 0.18), kit.toon(C.coral), -0.45, 2.27, 0.75));
  [0.15, 0.45].forEach((x, i) => group.add(kit.mesh(kit.cyl(0.1, 0.1, 0.1, 8), kit.glow(i ? C.mint : C.coral), x, 1.95, 0.8)));
  group.rotation.y = -0.5;
  return {
    group,
    update: (t) => {
      const f = Math.floor(t * 4);
      px.forEach((p) => {
        const { x, y } = p.userData as { x: number; y: number };
        // A tiny invader marching across the screen
        const sx = (x + f) % 6;
        const shape = ['.#..#.', '######', '#.##.#', '######', '.#..#.'];
        p.visible = shape[4 - y][sx] === '#';
      });
      group.rotation.y = 0.65 + Math.sin(t * 0.4) * 0.3;
    },
  };
};

const openclaw: Builder = (kit) => {
  // 2013 Mac Pro (the cylinder) rescued as an AI server, its agent orbiting
  const group = new THREE.Group();
  group.add(kit.mesh(kit.cyl(1.0, 1.0, 3.0, 16), kit.toon(C.deep), 0, 1.5, 0));
  group.add(kit.mesh(kit.cyl(0.75, 0.75, 0.1, 16), kit.toon(C.slate), 0, 3.02, 0));
  const ring = kit.mesh(kit.cyl(1.02, 1.02, 0.12, 16), kit.glow(C.coral), 0, 0.5, 0); // Ubuntu-orange status ring
  group.add(ring);
  const io = kit.mesh(kit.box(0.6, 0.9, 0.1), kit.toon(C.slate), 0, 1.0, 1.0);
  group.add(io);
  // The agent: an eye that scans the machine
  const agent = new THREE.Group();
  agent.add(kit.mesh(kit.box(0.5, 0.5, 0.5), kit.toon(C.cream)));
  agent.add(kit.mesh(kit.box(0.2, 0.2, 0.06), kit.glow(C.amber), 0, 0, 0.27));
  group.add(agent);
  const scan = kit.mesh(kit.box(2.4, 0.06, 2.4), kit.glow(C.mint), 0, 1.5, 0);
  group.add(scan);
  return {
    group,
    update: (t) => {
      agent.position.set(Math.cos(t * 0.8) * 2.0, 2.2 + Math.sin(t * 1.6) * 0.3, Math.sin(t * 0.8) * 2.0);
      agent.lookAt(0, 1.5, 0);
      scan.position.y = 0.2 + ((t * 0.6) % 1) * 2.8;
      scan.visible = Math.sin(t * 0.6 * Math.PI * 2) > -0.2;
      ring.visible = Math.sin(t * 2) > -0.5;
      group.rotation.y = t * 0.15;
    },
  };
};

const kukelure: Builder = (kit) => {
  // A booking calendar filling itself — the end of two saturated WhatsApp phones
  const group = new THREE.Group();
  const cols = 7, rows = 5, s = 0.5;
  group.add(kit.mesh(kit.box(cols * s + 0.3, rows * s + 0.6, 0.2), kit.toon(C.cream), 0, 1.7, -0.15));
  group.add(kit.mesh(kit.box(cols * s + 0.3, 0.4, 0.24), kit.toon(C.coral), 0, 1.7 + (rows * s) / 2 + 0.1, -0.13));
  const cells: THREE.Mesh[] = [];
  for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
    const c = kit.mesh(kit.box(s * 0.82, s * 0.82, 0.2), kit.toon(C.berry), (x - cols / 2 + 0.5) * s, 1.55 + (y - rows / 2 + 0.5) * s, 0.0);
    c.userData.i = x + y * cols;
    cells.push(c);
    group.add(c);
  }
  // Two old phones, finally quiet
  [-2.4, 2.4].forEach((x) => {
    group.add(kit.mesh(kit.box(0.6, 1.1, 0.12), kit.toon(C.navy), x, 0.55, 0.6));
    group.add(kit.mesh(kit.box(0.5, 0.85, 0.04), kit.toon(C.slate), x, 0.58, 0.67));
  });
  return {
    group,
    update: (t) => {
      const filled = Math.floor((t * 3) % 40);
      cells.forEach((c) => {
        const i = c.userData.i as number;
        const on = ((i * 7) % 35) < filled;
        c.position.z = on ? 0.12 : 0;
        c.visible = on || i % 3 !== 0;
      });
      group.rotation.y = Math.sin(t * 0.3) * 0.3;
    },
  };
};

const procesosbi: Builder = (kit) => {
  // Bar chart + the scroll-driven "thread of light"
  const group = new THREE.Group();
  const bars: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const b = kit.mesh(kit.box(0.5, 1, 0.5), kit.toon([C.steel, C.teal, C.mint, C.teal, C.amber, C.mint][i]), -1.5 + i * 0.6, 0, 0);
    bars.push(b);
    group.add(b);
  }
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.2, 0.6, 0.6), new THREE.Vector3(-1.0, 1.6, 0.7), new THREE.Vector3(0, 1.2, 0.8),
    new THREE.Vector3(1.0, 2.6, 0.7), new THREE.Vector3(2.0, 3.0, 0.6),
  ]);
  const tube = kit.own(new THREE.TubeGeometry(curve, 40, 0.05, 4, false));
  group.add(kit.mesh(tube, kit.toon(C.cream)));
  const spark = kit.mesh(kit.box(0.24, 0.24, 0.24), kit.glow(C.amber));
  group.add(spark);
  return {
    group,
    update: (t) => {
      bars.forEach((b, i) => {
        const h = 0.6 + (Math.sin(t * 0.9 + i * 0.8) * 0.5 + 0.5) * (0.6 + i * 0.35);
        b.scale.y = h;
        b.position.y = h / 2;
      });
      spark.position.copy(curve.getPointAt((t * 0.25) % 1));
      group.rotation.y = Math.sin(t * 0.25) * 0.4;
    },
  };
};

const biznaga: Builder = (kit, low) => {
  // A biznaga — Málaga's jasmine bouquet — still inside its scaffolding
  const group = new THREE.Group();
  const rand = rng(17);
  group.add(kit.mesh(kit.cyl(0.08, 0.1, 2.4, 6), kit.toon(C.teal), 0, 1.2, 0));
  const blooms: [number, number, number][] = [];
  const n = low ? 60 : 110;
  for (let i = 0; i < n; i++) {
    const phi = Math.acos(1 - 2 * ((i + 0.5) / n)), th = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 1.05 + (rand() - 0.5) * 0.1;
    blooms.push([Math.cos(th) * Math.sin(phi) * r, 3.1 + Math.cos(phi) * r, Math.sin(th) * Math.sin(phi) * r]);
  }
  const head = kit.voxels(blooms, C.cream, 0.26);
  group.add(head);
  group.add(kit.mesh(kit.box(0.3, 0.3, 0.3), kit.glow(C.amber), 0, 3.1, 0));
  // Scaffolding: "under construction"
  const poles: [number, number][] = [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]];
  poles.forEach(([x, z]) => group.add(kit.mesh(kit.box(0.08, 4.4, 0.08), kit.toon(C.amber), x, 2.2, z)));
  [1.4, 2.8, 4.2].forEach((y) => {
    group.add(kit.mesh(kit.box(3.3, 0.07, 0.07), kit.toon(C.amber), 0, y, -1.6), kit.mesh(kit.box(3.3, 0.07, 0.07), kit.toon(C.amber), 0, y, 1.6));
    group.add(kit.mesh(kit.box(0.07, 0.07, 3.3), kit.toon(C.amber), -1.6, y, 0), kit.mesh(kit.box(0.07, 0.07, 3.3), kit.toon(C.amber), 1.6, y, 0));
  });
  return { group, update: (t) => { head.rotation.y = t * 0.3; group.rotation.y = Math.sin(t * 0.2) * 0.4; } };
};

const BUILDERS: Record<ProjectId, Builder> = { genetix, arena, infra, glitch, arcade, openclaw, kukelure, procesosbi, biznaga };

export function buildProjects(low: boolean): Chapter {
  const kit = new Kit();
  const root = new THREE.Group();

  // Pedestal: stepped octagon with a ring of status LEDs
  const ped = new THREE.Group();
  ped.add(kit.mesh(kit.cyl(3.2, 3.5, 0.5, 8), kit.toon(C.navy), 0, -0.25, 0));
  ped.add(kit.mesh(kit.cyl(2.7, 3.0, 0.3, 8), kit.toon(C.slate), 0, 0.15, 0));
  const leds: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const l = kit.mesh(kit.box(0.18, 0.12, 0.18), kit.glow(C.amber), Math.cos(a) * 3.3, 0.02, Math.sin(a) * 3.3);
    leds.push(l);
    ped.add(l);
  }
  root.add(ped);

  const stage = new THREE.Group();
  stage.position.y = 0.3;
  root.add(stage);

  const artifacts = new Map<ProjectId, Artifact>();
  const get = (id: ProjectId) => {
    let a = artifacts.get(id);
    if (!a) {
      a = BUILDERS[id](kit, low);
      artifacts.set(id, a);
    }
    return a;
  };

  let current: ProjectId | null = null;
  let previous: Artifact | null = null;
  let switchAt = 0;

  const camera = { pos: new THREE.Vector3(6.6, 6.0, 8.6), target: new THREE.Vector3(0, 2.5, 0), fov: 40 };

  return {
    id: 'projects',
    root,
    look: { pixel: 3, glyphs: 0, glyphCell: 10, dither: 0.9, outline: 1 },
    camera,
    update({ t, px, py, bus, reduced }: FrameCtx) {
      if (bus.activeProject !== current) {
        previous = current ? get(current) : null;
        current = bus.activeProject;
        const next = get(current);
        if (!stage.children.includes(next.group)) stage.add(next.group);
        switchAt = t;
      }
      const a = get(current!);
      a.update(t);
      // Stepped build-up: 6 discrete stages over 0.6 s
      const k = reduced ? 1 : clamp01((t - switchAt) / 0.6);
      const stepped = Math.ceil(k * 6) / 6;
      a.group.scale.set(1, Math.max(0.001, stepped), 1);
      a.group.visible = true;
      if (previous && previous !== a) {
        const out = 1 - Math.ceil(clamp01((t - switchAt) / 0.3) * 4) / 4;
        previous.group.scale.set(1, Math.max(0.001, out), 1);
        previous.group.visible = out > 0.01;
        if (out <= 0.01) previous = null;
      }
      artifacts.forEach((art) => { if (art !== a && art !== previous) art.group.visible = false; });

      ped.rotation.y = t * 0.1;
      leds.forEach((l, i) => (l.visible = ((i + Math.floor(t * 6)) % 4) !== 0));
      root.rotation.y = px * 0.3;
      root.rotation.x = py * 0.05;
    },
    dispose: () => kit.dispose(),
  };
}
