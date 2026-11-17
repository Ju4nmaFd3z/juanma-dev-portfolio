import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// The halftone screen.
//
// Every chapter — an ASCII Magic piece, a photo, or a real Three.js scene —
// ends up here and is printed the same way, so the whole site reads as one
// surface:
//
//   • A square grid of dots (pitch uStep). Each dot samples its source once at
//     its centre and takes one of four sizes; a 4×4 Bayer matrix decides
//     between neighbouring sizes, exactly like ASCII Magic's true-tone
//     halftone. Big dots may overlap, so every fragment tests the four nearest
//     dot centres.
//   • An LED screen: light makes big dots.
//   • The lens (a void): around the pointer the picture is pulled inward and
//     the dots turn into the ASCII characters underneath. No rim.
//   • Solid mode (3D scenes): every cell is drawn at one size and shaded by
//     its light, so objects read as crisp pixel art instead of a dot cloud.
//   • Calm zones: under blocks of text the dots recede so copy stays legible.
//   • Dissolve / intro: dots shrink away (and grow back) in a seeded scatter,
//     so chapters change like a stadium screen flipping, not like a fade.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_CALM = 6;
/** The "ascii" look of ASCII Magic, light → dark ink. */
const GLYPHS = ' .,-~:;=!*#$@';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec2  uRes;          // device px
  uniform float uMode;         // 0 scene, 1 grid
  uniform sampler2D tScene;
  uniform sampler2D tDepth;
  uniform sampler2D tGrid;
  uniform vec2  uGridSize;     // cols, rows
  uniform vec2  uGridOrigin;   // device px, top-left based
  uniform float uUnit;         // device px per grid cell
  uniform vec4  uClip;         // x0, y0, x1, y1 (top-left based); grid only

  uniform float uStep;         // dot pitch, device px
  uniform float uShape;        // 0 round, 1 square
  uniform float uGlyphs;       // 0..1
  uniform float uCurve;
  uniform float uSat;
  uniform float uSize;
  uniform float uGain;
  uniform float uSolid;        // 1 = pixel-art: every cell one size, shaded by tone
  uniform float uFade;         // grid only: device px over which the plate melts away at the bottom
  uniform vec3  uBg;

  uniform sampler2D tGlyph;
  uniform float uGlyphCount;

  uniform vec3  uLens;         // x, y (top-left device px), radius
  uniform float uLensAmt;
  uniform float uDissolve;
  uniform float uIntro;        // 0 → 1
  uniform vec2  uIntroFrom;    // top-left device px
  uniform vec4  uCalm[${MAX_CALM}];
  uniform int   uCalmN;
  uniform float uFeather;
  uniform float uTime;

  float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec3 brighten(vec3 c, float k) {
    float m = max(max(c.r, c.g), max(c.b, 0.004));
    return min(vec3(1.0), c * ((1.0 / m) * k + (1.0 - k)));
  }

  float lensK(vec2 q) {
    if (uLensAmt <= 0.0) return 0.0;
    float d = distance(q, uLens.xy);
    return uLensAmt * (1.0 - smoothstep(uLens.z * 0.55, uLens.z, d));
  }

  // The void: the picture is pulled toward the lens centre, so the dots around
  // it swirl into a dark hollow before turning into glyphs.
  vec2 warp(vec2 q) {
    float k = lensK(q);
    return uLens.xy + (q - uLens.xy) * (1.0 - 0.32 * k);
  }

  float calmAt(vec2 q) {
    float m = 0.0;
    for (int i = 0; i < ${MAX_CALM}; i++) {
      if (i >= uCalmN) break;
      vec4 r = uCalm[i];
      vec2 d = max(max(r.xy - q, q - r.zw), 0.0);
      m = max(m, 1.0 - smoothstep(0.0, uFeather, length(d)));
    }
    return m;
  }

  // Source at a point (top-left device px): rgb = ink, a = tone.
  // valid < 0 = nothing there; otherwise a 0..1 weight on the dot size.
  vec4 source(vec2 q, out float valid) {
    valid = 1.0;
    if (uMode > 0.5) {
      if (q.x < uClip.x || q.y < uClip.y || q.x > uClip.z || q.y > uClip.w) { valid = -1.0; return vec4(0.0); }
      vec2 g = (q - uGridOrigin) / uUnit;
      if (g.x < 0.0 || g.y < 0.0 || g.x >= uGridSize.x || g.y >= uGridSize.y) { valid = -1.0; return vec4(0.0); }
      vec4 s = texture2D(tGrid, g / uGridSize);
      // alpha 0 is reserved for "no ink here at all" (e.g. a photo's backdrop)
      if (s.a < 0.5 / 255.0) { valid = -1.0; return vec4(0.0); }
      // valid doubles as a 0..1 weight: the plate melts into the page at its foot
      valid = uFade > 0.0 ? smoothstep(0.0, uFade, uClip.w - q.y) : 1.0;
      if (valid <= 0.0) { valid = -1.0; return vec4(0.0); }
      return vec4(brighten(s.rgb, uSat), s.a);
    }
    vec2 uv = vec2(q.x, uRes.y - q.y) / uRes;
    float d = texture2D(tDepth, uv).r;
    if (d > 0.99999) { valid = -1.0; return vec4(0.0); }
    vec3 c = texture2D(tScene, uv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float t = pow(clamp(l * uGain + 0.05, 0.0, 1.0), uCurve);
    return vec4(brighten(c, uSat), t);
  }

  // Per-dot visibility for the dissolve and the intro "printing".
  float presence(vec2 cell, vec2 centre) {
    float h = hash(cell);
    float s = clamp((1.0 - uDissolve) * 1.8 - h * 0.8, 0.0, 1.0);
    if (uIntro < 1.0) {
      float r = distance(centre, uIntroFrom) / max(uRes.x, uRes.y);
      s *= clamp((uIntro * 1.5 - r - h * 0.18) * 5.0, 0.0, 1.0);
    }
    return s;
  }

  vec3 dots(vec2 q, float calm, out float cover) {
    vec2 cell = floor(q / uStep);
    vec2 f = fract(q / uStep);
    vec2 o = vec2(f.x < 0.5 ? -1.0 : 1.0, f.y < 0.5 ? -1.0 : 1.0);
    vec3 col = uBg;
    cover = 0.0;
    for (int k = 0; k < 4; k++) {
      vec2 c = cell + (k == 1 ? vec2(o.x, 0.0) : k == 2 ? vec2(0.0, o.y) : k == 3 ? o : vec2(0.0));
      vec2 centre = (c + 0.5) * uStep;
      float valid;
      vec4 s = source(warp(centre), valid);
      if (valid < 0.0) continue;
      if (uSolid > 0.5) {
        // Pixel art: a full cell, its colour shaded by the light it received.
        float rs = uStep * uSize * valid * presence(c, centre) * (1.0 - 0.85 * calm);
        if (rs < 0.35) continue;
        vec2 dvs = abs(q - centre);
        float ds = mix(length(dvs), max(dvs.x, dvs.y), uShape);
        float as = 1.0 - smoothstep(rs - 0.6, rs + 0.6, ds);
        if (as <= 0.0) continue;
        vec3 inks = s.rgb * mix(0.14, 1.0, s.a);
        col = mix(col, inks, as);
        cover = max(cover, as);
        continue;
      }
      float tone = s.a;
      // four sizes, Bayer-dithered between neighbours (as ASCII Magic does)
      float x = tone * 4.0 - 0.5;
      float lvl = floor(x);
      if (x - lvl > bayer4(c) + 0.03) lvl += 1.0;
      if (lvl < 0.0) continue;
      lvl = min(lvl, 3.0);
      float size = lvl < 0.5 ? 0.2 : lvl < 1.5 ? 0.5 : lvl < 2.5 ? 0.85 : 1.32;
      float r = uStep * uSize * size * valid * presence(c, centre) * (1.0 - 0.8 * calm);
      if (r < 0.35) continue;
      vec2 dv = abs(q - centre);
      float dist = mix(length(dv), max(dv.x, dv.y), uShape);
      float a = 1.0 - smoothstep(r - 0.7, r + 0.7, dist);
      if (a <= 0.0) continue;
      col = mix(col, s.rgb, a);
      cover = max(cover, a);
    }
    return col;
  }

  vec3 glyphs(vec2 q, float scale, float calm) {
    float G = uStep * scale;
    vec2 cell = floor(q / G);
    vec2 local = fract(q / G);
    vec2 centre = (cell + 0.5) * G;
    float valid;
    vec4 s = source(warp(centre), valid);
    if (valid < 0.0) return uBg;
    if (presence(cell, centre) * valid < 0.5) return uBg;
    float tone = s.a * (1.0 - 0.8 * calm);
    float idx = floor(clamp(tone, 0.0, 1.0) * (uGlyphCount - 1.0) + 0.5);
    float ink = texture2D(tGlyph, vec2((idx + local.x) / uGlyphCount, local.y)).r;
    return mix(uBg, s.rgb, ink);
  }

  void main() {
    vec2 q = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    float lk = lensK(q);
    // calm is smooth (a 70 px feather), so one lookup per pixel is enough
    float calm = calmAt(q);
    float g = max(uGlyphs, lk);
    vec3 col;
    if (g <= 0.001) {
      float cv; col = dots(q, calm, cv);
    } else {
      float scale = mix(1.5, 2.3, lk);
      vec2 gc = floor(q / (uStep * scale));
      if (g >= 0.999 || bayer4(gc) < g) col = glyphs(q, scale, calm);
      else { float cv; col = dots(q, calm, cv); }
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createHalftone() {
  const v2 = () => new THREE.Vector2();
  const v3 = () => new THREE.Vector3();
  const uniforms = {
    uRes: { value: v2() },
    uMode: { value: 0 },
    tScene: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    tGrid: { value: null as THREE.Texture | null },
    uGridSize: { value: v2() },
    uGridOrigin: { value: v2() },
    uUnit: { value: 1 },
    uClip: { value: new THREE.Vector4() },
    uStep: { value: 8 },
    uShape: { value: 0 },
    uGlyphs: { value: 0 },
    uCurve: { value: 1.1 },
    uSat: { value: 0.85 },
    uSize: { value: 0.393 },
    uGain: { value: 1.9 },
    uSolid: { value: 0 },
    uFade: { value: 0 },
    uBg: { value: v3() },
    tGlyph: { value: null as THREE.Texture | null },
    uGlyphCount: { value: GLYPHS.length },
    uLens: { value: v3() },
    uLensAmt: { value: 0 },
    uDissolve: { value: 0 },
    uIntro: { value: 1 },
    uIntroFrom: { value: v2() },
    uCalm: { value: Array.from({ length: MAX_CALM }, () => new THREE.Vector4()) },
    uCalmN: { value: 0 },
    uFeather: { value: 60 },
    uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    depthTest: false,
    depthWrite: false,
  });
  return { material, uniforms };
}

export type Halftone = ReturnType<typeof createHalftone>;

/** One row of glyphs (light → dark ink), drawn once into a texture. */
export function createGlyphAtlas(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size * GLYPHS.length;
  canvas.height = size;
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.flipY = false;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.round(size * 0.9)}px "Geist Mono", "JetBrains Mono", ui-monospace, Menlo, monospace`;
    [...GLYPHS].forEach((g, i) => ctx.fillText(g, i * size + size / 2, size / 2 + 3));
    tex.needsUpdate = true;
  };
  draw();
  // Redraw with the real webfont once it has arrived.
  document.fonts?.ready.then(draw).catch(() => {});
  return tex;
}
