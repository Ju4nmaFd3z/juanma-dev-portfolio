import * as THREE from 'three';
import { C } from '../palette';
import { Kit, damp } from '../kit';
import type { SceneChapter, FrameCtx } from '../types';
import { KIND_COLORS as KIND_COLOR } from '../../content';

// Journey — the route climbs. One pillar per milestone, oldest first, each a
// little higher than the one before. Above every platform floats a pixel icon
// of what it was (a mortarboard for studies, a laptop for work, a diploma for
// certificates) and its year, always turned to the camera. A small
// pixel-art Juanma — curly hair with a skin fade, glasses, white T-shirt — jumps from platform
// to platform as the visitor scrolls, and the camera follows him up.

type Kind = 'edu' | 'work' | 'cert';
export interface Stop { kind: Kind; year: string }

const shade = (hex: number, k: number) => new THREE.Color(hex).multiplyScalar(k).getHex();

/**
 * 15-wide pixel icons: a = the kind's colour, b = its shade, c = cream,
 * g = gold, o = orange. A mortarboard for studies, a laptop for work, a
 * diploma with its seal for certificates.
 */
const ICON: Record<Kind, string[]> = {
  edu: [
    '.......a.......',
    '.....aaaaa.....',
    '...aaaaaaaaa...',
    '.aaaaaaacaaaaa.',
    '...aaaaaaaaa.c.',
    '.....aaaaa...c.',
    '...b..aaa..b.c.',
    '...bbbbbbbbb.ccc',
    '...bbbbbbbbb.ccc',
    '....bbbbbbb.....',
  ],
  work: [
    '..aaaaaaaaaaa..',
    '..a.........a..',
    '..a.cc......a..',
    '..a...cc....a..',
    '..a.cc..ccc.a..',
    '..a.........a..',
    '..aaaaaaaaaaa..',
    '.ccccccccccccc.',
    'ccccccc.ccccccc',
  ],
  cert: [
    'ccccccccccccccc',
    'c.............c',
    'c.aaaaaaaaaaa.c',
    'c.............c',
    'c.aaaaaaa.....c',
    'c.............c',
    'c.aaaaa..ggg..c',
    'c.......ggggg.c',
    'ccccccccggggg.c',
    '........ogo.o..',
    '........o...o..',
  ],
};

/** 3 × 5 digits for the year. */
const DIGIT: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'], '3': ['###', '..#', '###', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'], '7': ['###', '..#', '..#', '..#', '..#'],
  '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '###'],
};

/** Voxel cells for an icon (grouped by colour) over its year, in the XY plane. */
function sign(kind: Kind, year: string) {
  const icon = new Map<string, [number, number, number][]>();
  const digits: [number, number, number][] = [];
  const S = 0.15, D = 0.16;
  const rows = ICON[kind];
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '.') return;
    if (!icon.has(c)) icon.set(c, []);
    icon.get(c)!.push([(x - 7) * S, (rows.length - 1 - y) * S + 1.15, 0]);
  }));
  [...year].forEach((ch, i) => (DIGIT[ch] ?? DIGIT['0']).forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') digits.push([(i * 4 + x - 7) * D, (4 - y) * D, 0]);
  })));
  return { icon, digits };
}

/** A small pixel-art Juanma, built from boxes; arms and legs pivot for the jump. */
function buildFigure(kit: Kit) {
  const skin = kit.toon(0xf0c09a);
  const hair = kit.toon(0x3a2416);
  const tee = kit.toon(0xf4eee4);
  const jeans = kit.toon(0x34466e);
  const shoes = kit.toon(0xe9e3d8);
  const dark = kit.toon(0x1a1720);
  const fig = new THREE.Group();

  const leg = (sx: number) => {
    const g = new THREE.Group();
    g.position.set(sx, 0.62, 0);
    g.add(kit.mesh(kit.box(0.2, 0.5, 0.22), jeans, 0, -0.25, 0));
    g.add(kit.mesh(kit.box(0.22, 0.12, 0.32), shoes, 0, -0.56, 0.04));
    fig.add(g);
    return g;
  };
  const arm = (sx: number) => {
    const g = new THREE.Group();
    g.position.set(sx, 1.16, 0);
    g.add(kit.mesh(kit.box(0.17, 0.18, 0.22), tee, 0, -0.08, 0)); // sleeve
    g.add(kit.mesh(kit.box(0.13, 0.36, 0.15), skin, 0, -0.34, 0)); // arm
    fig.add(g);
    return g;
  };
  const legs = [leg(-0.12), leg(0.12)];
  fig.add(kit.mesh(kit.box(0.58, 0.58, 0.32), tee, 0, 0.92, 0)); // T-shirt
  const arms = [arm(-0.37), arm(0.37)];
  fig.add(kit.mesh(kit.box(0.16, 0.08, 0.16), skin, 0, 1.24, 0)); // neck

  // head: big, so the face reads at pixel size
  const head = new THREE.Group();
  head.position.set(0, 1.56, 0);
  head.add(kit.mesh(kit.box(0.6, 0.56, 0.52), skin));
  head.add(kit.mesh(kit.box(0.08, 0.16, 0.12), skin, -0.33, -0.02, 0), kit.mesh(kit.box(0.08, 0.16, 0.12), skin, 0.33, -0.02, 0)); // ears
  // hair: a skin fade — dark, curly volume on top; the sides and the back
  // lighten in three steps down to the skin above the ears
  const fade = [kit.toon(0x3a2416), kit.toon(0x6e4c38), kit.toon(0xa9806a)];
  const sides = (y: number, h: number, m: THREE.Material) => {
    head.add(kit.mesh(kit.box(0.05, h, 0.46), m, -0.315, y, -0.03), kit.mesh(kit.box(0.05, h, 0.46), m, 0.315, y, -0.03));
    head.add(kit.mesh(kit.box(0.66, h, 0.05), m, 0, y, -0.275));
  };
  sides(0.2, 0.1, fade[0]);
  sides(0.1, 0.1, fade[1]);
  sides(0.0, 0.1, fade[2]);
  head.add(kit.mesh(kit.box(0.66, 0.16, 0.58), hair, 0, 0.32, -0.01)); // top
  head.add(kit.mesh(kit.box(0.6, 0.1, 0.12), hair, 0, 0.22, 0.24)); // fringe
  // curls: a crown of small blocks, taller in the middle, spilling to the front
  [[-0.21, 0.12], [0, 0.17], [0.21, 0.1], [-0.1, -0.02], [0.12, -0.04], [-0.2, -0.18], [0.02, -0.2], [0.2, -0.17], [-0.06, 0.22], [0.16, 0.22]]
    .forEach(([x, z], i) => head.add(kit.mesh(kit.box(0.17, i % 3 === 1 ? 0.18 : 0.13, 0.17), hair, x, 0.44 + (i % 3 === 1 ? 0.03 : 0), z)));
  head.add(kit.mesh(kit.box(0.14, 0.1, 0.1), hair, -0.14, 0.15, 0.28), kit.mesh(kit.box(0.12, 0.08, 0.1), hair, 0.1, 0.16, 0.28)); // curls over the brow
  // glasses: dark frames with a bridge, light lenses, and the eyes behind them
  [-0.14, 0.14].forEach((x) => {
    head.add(kit.mesh(kit.box(0.24, 0.19, 0.03), dark, x, 0.03, 0.27));
    head.add(kit.mesh(kit.box(0.19, 0.14, 0.03), kit.glow(0xf4f1ea), x, 0.03, 0.285));
    head.add(kit.mesh(kit.box(0.08, 0.09, 0.02), kit.glow(0x15121a), x + (x < 0 ? 0.025 : -0.025), 0.025, 0.302));
  });
  head.add(kit.mesh(kit.box(0.08, 0.04, 0.03), dark, 0, 0.06, 0.275));
  head.add(kit.mesh(kit.box(0.08, 0.03, 0.4), dark, -0.29, 0.06, 0.08), kit.mesh(kit.box(0.08, 0.03, 0.4), dark, 0.29, 0.06, 0.08)); // arms of the glasses
  // the mouth: a smile at rest, a wide open grin while he jumps
  const smile = kit.mesh(kit.box(0.2, 0.05, 0.04), kit.toon(0xa8483a), 0, -0.15, 0.27);
  const grin = new THREE.Group();
  grin.add(kit.mesh(kit.box(0.2, 0.1, 0.04), kit.toon(0x6e211b), 0, -0.155, 0.27));
  grin.add(kit.mesh(kit.box(0.12, 0.04, 0.04), kit.toon(0xc4574a), 0, -0.18, 0.275)); // tongue
  grin.visible = false;
  head.add(smile, grin);
  fig.add(head);

  return { fig, legs, arms, head, smile, grin };
}

export function buildJourney(stops: Stop[], low: boolean): SceneChapter {
  const kit = new Kit();
  const root = new THREE.Group();
  const n = stops.length;
  const STEP_X = 4.4, STEP_Y = 1.3, BASE = -3.5;

  // Where the figure stands on each platform, and the signs above them.
  const tops: THREE.Vector3[] = [];
  const rings: THREE.Group[] = [];
  const signs: THREE.Group[] = [];

  stops.forEach(({ kind, year }, i) => {
    const col = KIND_COLOR[kind];
    const x = i * STEP_X - ((n - 1) * STEP_X) / 2;
    const z = i % 2 ? -1.1 : 1.1;
    const y = i * STEP_Y - 1;
    const pillar = new THREE.Group();
    pillar.position.set(x, 0, z);
    // column down into the dark, then the lit platform
    const h = y - BASE;
    pillar.add(kit.mesh(kit.box(1.5, h, 1.5), kit.toon(shade(col, 0.32)), 0, BASE + h / 2, 0));
    pillar.add(kit.mesh(kit.box(2.3, 0.4, 2.3), kit.toon(col), 0, y + 0.2, 0));
    const top = y + 0.4;

    // the sign: icon + year, floating over the back of the platform
    const s = new THREE.Group();
    const { icon, digits } = sign(kind, year);
    const tone: Record<string, number> = { a: col, b: shade(col, 0.55), c: C.cream, g: C.amber, o: C.coral };
    icon.forEach((cells, c) => s.add(kit.voxels(cells, kit.glow(tone[c]), 0.145)));
    s.add(kit.voxels(digits, kit.glow(C.cream), 0.16));
    s.position.set(0, top + 3.5, -0.3);
    s.userData.baseY = s.position.y;
    pillar.add(s);
    signs.push(s);

    // the ring that lights up under the figure
    const ring = new THREE.Group();
    const cells: [number, number, number][] = [];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      cells.push([Math.cos(a) * 1.5, y + 0.42, Math.sin(a) * 1.5]);
    }
    ring.add(kit.voxels(cells, kit.glow(col), 0.16));
    ring.visible = false;
    pillar.add(ring);
    rings.push(ring);
    root.add(pillar);
    tops.push(new THREE.Vector3(x + 0.35, top, z + 0.45));
  });

  // Dotted trail from platform to platform.
  const trail: [number, number, number][] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = tops[i], b = tops[i + 1];
    for (let k = 1; k < 9; k++) {
      const f = k / 9;
      trail.push([a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f + Math.sin(f * Math.PI) * 1.1, a.z + (b.z - a.z) * f]);
    }
  }
  root.add(kit.voxels(trail, kit.glow(shade(C.cream, 0.55)), 0.09));

  // Dust drifting through the scene, for depth.
  if (!low) {
    const dust: [number, number, number][] = [];
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 70; k++) dust.push([(r() - 0.5) * n * STEP_X * 1.3, BASE + r() * (n * STEP_Y + 6), -3 - r() * 5]);
    root.add(kit.voxels(dust, kit.glow(C.navy), 0.12));
  }

  const { fig, legs, arms, head, smile, grin } = buildFigure(kit);
  /** The figure's turn, eased so he never snaps between poses. */
  let yaw = 0.45;
  /** Facing the camera (it sits up and to the right of him). */
  const FACE = 0.45;
  root.add(fig);

  const camera = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 38 };
  const want = new THREE.Vector3();
  const off = new THREE.Vector3();
  const at = new THREE.Vector3();
  let p = 0;
  let first = true;

  /** Position along the route: q = 2.4 is 40 % of the hop from stop 2 to 3. */
  const place = (q: number, out: THREE.Vector3) => {
    const i = Math.min(n - 2, Math.max(0, Math.floor(q)));
    const f = Math.min(1, Math.max(0, q - i));
    out.lerpVectors(tops[i], tops[i + 1], f);
    out.y += Math.sin(f * Math.PI) * 1.1;
    return f;
  };

  return {
    id: 'journey',
    kind: 'scene',
    root,
    look: { step: low ? 5 : 4.5, shape: 1, glyphs: 0, curve: 0.9, sat: 0.4, size: 0.47, gain: 1.6, solid: 1 },
    camera,
    update({ t, dt, px, py, bus, reduced }: FrameCtx) {
      const target = Math.min(n - 1, Math.max(0, bus.activeMilestone));
      p = reduced ? target : damp(p, target, 2.6, dt);
      const f = place(p, at);
      const airborne = !reduced && Math.abs(target - p) > 0.03 && f > 0.02 && f < 0.98;

      fig.position.copy(at);
      if (airborne) {
        // only a quarter-turn toward the jump, so the face (and the grin)
        // stay readable; knees tucked, chin toward the camera
        const dir = Math.sign(target - p);
        yaw = damp(yaw, FACE + dir * 0.35, 10, dt);
        const air = Math.sin(f * Math.PI);
        // arms swung forward and up, opened a touch so the hands pass beside the face
        arms.forEach((a, i) => { a.rotation.x = -2.5 * air; a.rotation.z = (i ? 1 : -1) * 0.3 * air; });
        legs.forEach((l, i) => { l.rotation.x = (i ? 0.7 : -0.5) * air; });
        fig.scale.set(1, 1, 1);
        head.rotation.x = 0.08 * air; // chin slightly down, toward the camera
      } else {
        // standing: facing the camera, breathing, arms swinging a little
        yaw = reduced ? FACE : damp(yaw, FACE + Math.sin(t * 0.6) * 0.15, 6, dt);
        const breathe = reduced ? 0 : Math.sin(t * 2.2);
        arms.forEach((a, i) => { a.rotation.x = 0.08 * breathe; a.rotation.z = (i ? -1 : 1) * 0.06; });
        legs.forEach((l) => { l.rotation.x = 0; });
        // a squash right after landing, then a gentle bob
        const land = Math.max(0, 1 - Math.abs(target - p) * 30);
        fig.scale.set(1, 1 - 0.04 * breathe * 0.5 - (1 - land) * 0.08, 1);
        head.rotation.x = 0;
      }
      fig.rotation.y = yaw;
      // he grins from take-off until just after landing
      const happy = airborne || Math.abs(target - p) > 0.01;
      grin.visible = happy;
      smile.visible = !happy;
      fig.scale.multiplyScalar(1.4);

      rings.forEach((r, i) => { r.visible = i === Math.round(p) && (reduced || Math.sin(t * 4) > -0.6); });
      signs.forEach((s, i) => {
        // the sign of the stop in view is full size; the others step back
        const k = Math.max(0, 1 - Math.abs(p - i));
        s.scale.setScalar(0.6 + 0.4 * k);
        s.position.y = (s.userData.baseY as number) + (reduced ? 0 : Math.sin(t * 1.4 + i) * 0.08);
        s.lookAt(camera.pos.x, s.getWorldPosition(off).y, camera.pos.z);
      });

      want.copy(at).setY(at.y - (airborne ? Math.sin(f * Math.PI) * 1.1 : 0)).add(off.set(0, 0.9, 0));
      const cam = off.copy(want).add(at.set(6.8 + px * 1.0, 4.6 - py * 0.8, 14));
      if (first || reduced) { camera.target.copy(want); camera.pos.copy(cam); first = false; }
      else {
        const k = 1 - Math.exp(-4 * dt);
        camera.target.lerp(want, k);
        camera.pos.lerp(cam, k);
      }
    },
    dispose: () => kit.dispose(),
  };
}
