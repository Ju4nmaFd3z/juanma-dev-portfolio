import * as THREE from 'three';
import { C } from '../palette';
import { Kit, damp } from '../kit';
import type { SceneChapter, FrameCtx } from '../types';
import { SKILL_COLORS as LAYER } from '../../content';

// Skills — seven slabs, bottom to top: hardware, networks, systems, data,
// programming, web, devops. Each slab has a muted colour of its own (shared
// with the list beside it) and a pixel icon standing on it, always turned to
// the camera so it reads from any angle. The layer the visitor points at in
// the list slides out of the stack.

const LAYER_COUNT = 7;
const MOTIF = C.cream;

/** 13 × 9 pixel icons, bottom → top layer ('#' cream, 'o' accent). */
const ICONS = [
  [ // hardware: a chip
    '..#.#.#.#.#..', '.###########.', '##.........##', '.#.#######.#.', '##.#.....#.##', '.#.#######.#.', '##.........##', '.###########.', '..#.#.#.#.#..',
  ],
  [ // networks: a switch and three hosts
    '.....###.....', '.....###.....', '......#......', '..#########..', '..#...#...#..', '..#...#...#..', '.###.###.###.', '.###.###.###.', '.............',
  ],
  [ // systems: a server rack
    '.###########.', '.#.#.......#.', '.###########.', '.#.#.......#.', '.###########.', '.#.#.......#.', '.###########.', '...#.....#...', '..###...###..',
  ],
  [ // data: a database
    '...#######...', '..#.......#..', '..#########..', '..#.......#..', '..#########..', '..#.......#..', '..#########..', '..#.......#..', '...#######...',
  ],
  [ // programming: </>
    '........#....', '..#....#..#..', '.#....#....#.', '#.....#.....#', '.#...#.....#.', '..#..#....#..', '....#........', '.............', '.............',
  ],
  [ // web: a browser window
    '#############', '#.#.#.#######', '#############', '#...........#', '#.#####.###.#', '#...........#', '#.###.#####.#', '#...........#', '#############',
  ],
  [ // devops: a rocket, launching
    '......#......', '.....###.....', '....#####....', '....##.##....', '....#####....', '....#####....', '...##...##...', '..##.###.##..', '.....o.o.....',
  ],
];

const shade = (hex: number, k: number) => new THREE.Color(hex).multiplyScalar(k).getHex();

export function buildSkills(low: boolean): SceneChapter {
  const kit = new Kit();
  const root = new THREE.Group();
  const stack = new THREE.Group();
  root.add(stack);

  const GAP = 2.4;
  const H = 0.46;
  const slabs: THREE.Group[] = [];
  const signs: THREE.Group[] = [];
  const PX = 0.155;
  const eye = new THREE.Vector3();

  for (let i = 0; i < LAYER_COUNT; i++) {
    const g = new THREE.Group();
    const size = 4.6 - i * 0.08;
    g.add(kit.mesh(kit.box(size, H, size), kit.toon(LAYER[i])));
    // a darker lip under each slab separates it from the one below
    g.add(kit.mesh(kit.box(size + 0.08, 0.1, size + 0.08), kit.toon(shade(LAYER[i], 0.45)), 0, -H / 2 - 0.02, 0));
    // the layer's icon, standing on the slab and turned to the camera
    const sign = new THREE.Group();
    const cream: [number, number, number][] = [], flame: [number, number, number][] = [];
    ICONS[i].forEach((row, y) => [...row].forEach((c, x) => {
      const cell: [number, number, number] = [(x - 6) * PX, (ICONS[i].length - 1 - y) * PX, 0];
      if (c === '#') cream.push(cell); else if (c === 'o') flame.push(cell);
    }));
    sign.add(kit.voxels(cream, kit.glow(MOTIF), PX * 0.94));
    if (flame.length) sign.add(kit.voxels(flame, kit.glow(C.coral), PX * 0.94));
    sign.position.set(0, H / 2 + 0.12, 0.6);
    g.add(sign);
    signs.push(sign);
    g.position.y = i * GAP - (LAYER_COUNT - 1) * GAP * 0.5;
    g.scale.setScalar(0.92);
    g.userData.baseY = g.position.y;
    g.userData.lift = 0;
    g.userData.gap = 0;
    slabs.push(g);
    stack.add(g);
  }

  // Seen from above, so the motif on every slab shows between the layers.
  const camera = { pos: new THREE.Vector3(11.4, 10.4, 13.4), target: new THREE.Vector3(0, 0.4, 0), fov: 40 };

  return {
    id: 'skills',
    kind: 'scene',
    root,
    look: { step: low ? 5 : 4.5, shape: 0, glyphs: 0, curve: 0.85, sat: 0.2, size: 0.47, gain: 1.7, solid: 1 },
    camera,
    update({ t, dt, px, py, bus, reduced }: FrameCtx) {
      stack.rotation.y = t * 0.12 + px * 0.35;
      stack.rotation.x = py * 0.05;
      slabs.forEach((g, i) => {
        const target = bus.activeLayer === i ? 1 : 0;
        g.userData.lift = reduced ? target : damp(g.userData.lift as number, target, 6, dt);
        const l = g.userData.lift as number;
        // lift the active layer and open the gap above it
        const aboveTarget = bus.activeLayer >= 0 && i > bus.activeLayer ? 0.9 : 0;
        g.userData.gap = reduced ? aboveTarget : damp(g.userData.gap as number, aboveTarget, 6, dt);
        g.position.y = (g.userData.baseY as number) + l * 0.4 + (g.userData.gap as number);
        g.position.x = l * 1.6;
        g.rotation.y = l * 0.35;
      });
      // every icon faces the camera, whatever the stack is doing
      signs.forEach((sg) => {
        sg.getWorldPosition(eye);
        sg.lookAt(camera.pos.x, eye.y, camera.pos.z);
      });
    },
    dispose: () => kit.dispose(),
  };
}
