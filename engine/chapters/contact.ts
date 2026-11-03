import * as THREE from 'three';
import { C } from '../palette';
import { Kit, damp } from '../kit';
import type { Chapter, FrameCtx } from '../types';

// 06 · CONNECTION — a lattice radio mast on a rock, its dish turned toward
// the visitor (it follows the pointer). Rings of signal leave the dish; when
// the visitor sends a message, the mast answers with a burst.

export function buildContact(low: boolean): Chapter {
  const kit = new Kit();
  const root = new THREE.Group();

  // Rock base made of stacked voxels
  const rock: [number, number, number][] = [];
  for (let y = 0; y < 3; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
    const r = 3.2 - y * 0.9;
    if (Math.hypot(x, z) <= r) rock.push([x * 0.8, -y * 0.8 - 0.4, z * 0.8]);
  }
  root.add(kit.voxels(rock, C.slate, 0.8));
  root.add(kit.mesh(kit.cyl(2.7, 2.7, 0.15, 10), kit.toon(C.teal), 0, 0.02, 0));

  // Lattice mast: four legs + cross braces
  const mast = new THREE.Group();
  root.add(mast);
  const H = 7, legs: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  legs.forEach(([x, z]) => {
    const leg = kit.mesh(kit.box(0.14, H, 0.14), kit.toon(C.haze), x * 0.55, H / 2, z * 0.55);
    leg.rotation.set(-z * 0.06, 0, x * 0.06);
    mast.add(leg);
  });
  for (let i = 1; i < 7; i++) {
    const y = i * 1.0;
    const w = 1.15 - i * 0.07;
    [0, 1].forEach((k) => {
      const brace = kit.mesh(kit.box(w, 0.08, 0.08), kit.toon(C.steel), 0, y, k ? w / 2 : -w / 2);
      const brace2 = kit.mesh(kit.box(0.08, 0.08, w), kit.toon(C.steel), k ? w / 2 : -w / 2, y, 0);
      mast.add(brace, brace2);
    });
  }
  // Aviation light
  const beacon = kit.mesh(kit.box(0.28, 0.28, 0.28), kit.glow(C.coral), 0, H + 0.4, 0);
  mast.add(beacon);
  mast.add(kit.mesh(kit.box(0.06, 0.8, 0.06), kit.toon(C.haze), 0, H, 0));

  // Dish on a yoke near the top
  const yoke = new THREE.Group();
  yoke.position.set(0, H - 1.4, 0);
  mast.add(yoke);
  const dish = new THREE.Group();
  yoke.add(dish);
  const bowl = kit.own(new THREE.CylinderGeometry(1.5, 0.5, 0.6, 12, 1, true));
  const bowlMat = kit.own(kit.toon(C.cream).clone());
  bowlMat.side = THREE.DoubleSide;
  const bowlMesh = kit.mesh(bowl, bowlMat);
  bowlMesh.rotation.x = Math.PI / 2;
  bowlMesh.position.z = 0.6;
  dish.add(bowlMesh);
  dish.add(kit.mesh(kit.cyl(0.5, 0.5, 0.12, 12), kit.toon(C.steel), 0, 0, 0.3).rotateX(Math.PI / 2));
  const feed = kit.mesh(kit.box(0.06, 0.06, 1.3), kit.toon(C.haze), 0, 0, 1.2);
  dish.add(feed);
  const emitter = kit.mesh(kit.box(0.22, 0.22, 0.22), kit.glow(C.amber), 0, 0, 1.85);
  dish.add(emitter);

  // Signal rings (flat torii), recycled
  const ringGeo = kit.own(new THREE.TorusGeometry(1, 0.06, 4, 24));
  const rings: THREE.Mesh[] = [];
  const ringCount = low ? 4 : 6;
  for (let i = 0; i < ringCount; i++) {
    const r = new THREE.Mesh(ringGeo, kit.glow(i % 2 ? C.mint : C.amber));
    r.userData.ph = i / ringCount;
    rings.push(r);
    dish.add(r);
  }

  // Envelope voxels leaving after a message is sent
  const envelope = new THREE.Group();
  envelope.add(kit.mesh(kit.box(0.9, 0.6, 0.1), kit.toon(C.cream)));
  const flap = kit.mesh(kit.box(0.64, 0.64, 0.12), kit.toon(C.amber), 0, 0.14, 0.01);
  flap.rotation.z = Math.PI / 4;
  flap.scale.set(1, 1, 1);
  envelope.add(flap);
  envelope.visible = false;
  dish.add(envelope);

  let yaw = 0, pitch = 0;
  const camera = { pos: new THREE.Vector3(8.6, 7.0, 11.2), target: new THREE.Vector3(0.6, 3.9, 0), fov: 40 };

  return {
    id: 'contact',
    root,
    look: { pixel: 5, glyphs: 0, glyphCell: 10, dither: 1.2, outline: 1 },
    camera,
    update({ t, dt, px, py, bus, reduced }: FrameCtx) {
      // Aim the dish at the visitor: default toward the camera, steered by pointer
      const ty = 0.94 + px * 0.4;
      const tp = -0.1 - py * 0.25;
      yaw = reduced ? ty : damp(yaw, ty, 3, dt);
      pitch = reduced ? tp : damp(pitch, tp, 3, dt);
      dish.rotation.set(pitch, yaw, 0);

      const since = (performance.now() - bus.pulse) / 1000;
      const burst = since < 2.5 ? 1 - since / 2.5 : 0;
      const speed = 0.35 + burst * 1.4;
      rings.forEach((r) => {
        const f = ((r.userData.ph as number) + t * speed) % 1;
        const s = 0.3 + f * (1.9 + burst * 1.4);
        r.scale.set(s, s, s);
        r.position.z = 1.9 + f * (3.6 + burst * 3);
        r.visible = f < 0.75;
      });
      beacon.visible = Math.sin(t * 3) > 0;
      emitter.visible = Math.sin(t * 8) > -0.5 || burst > 0;
      envelope.visible = burst > 0;
      if (burst > 0) {
        const f = 1 - burst;
        envelope.position.set(0, Math.sin(f * 6) * 0.3, 2 + f * 12);
        envelope.rotation.set(0, 0, f * 2);
      }
      root.rotation.y = -0.3 + px * 0.08;
    },
    dispose: () => kit.dispose(),
  };
}
