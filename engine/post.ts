import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// The "Pixel Dimension" resolve pass.
//
// The 3D scene is rendered into a half-resolution target (colour + depth).
// This full-screen pass turns it into pixel art:
//
//   1. Cell snapping   – the screen is split into uPixel×uPixel cells and each
//                        cell point-samples ONE texel → hard, honest pixels.
//   2. Depth outlines  – a cell that is clearly in front of a neighbour gets
//                        the outline colour: the hand-drawn contour of sprites.
//   3. Ordered dither  – a 4×4 Bayer threshold nudges the colour before…
//   4. Palette snap    – …it is replaced by the perceptually nearest colour of
//                        a limited palette (weights .30/.59/.11).
//   5. Glyph mode      – the same cell can instead be drawn as a block glyph
//                        (▁▂▃▄▅▆▇█ / ASCII ramp). Like ASCII Magic pieces, the
//                        palette picks the colour and the glyph encodes the
//                        luminance the palette could not represent.
//
// Everything is driven by uniforms, so chapters can morph between "dense
// pixel art", "dithered halftone" and "ASCII" continuously.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_PAL = 16;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform sampler2D tGlyph;

  uniform vec2  uRes;        // output size in device px
  uniform float uPixel;      // cell size (device px) for the pixel look
  uniform float uGlyphCell;  // cell size (device px) for the glyph look
  uniform float uGlyphs;     // 0 → pixels, 1 → glyphs
  uniform float uGlyphCount;
  uniform float uDither;     // dither strength
  uniform float uOutline;    // outline strength 0..1
  uniform float uNear;
  uniform float uFar;
  uniform float uTime;
  uniform float uFade;       // 0..1, fades the scene into the sky (used by intro)
  uniform float uLight;      // 1 on the light (paper) palette

  uniform vec3  uPal[${MAX_PAL}];
  uniform int   uPalN;
  uniform vec3  uSkyTop;
  uniform vec3  uSkyBottom;
  uniform vec3  uOutlineColor;

  varying vec2 vUv;

  float linDepth(float d) {
    float z = d * 2.0 - 1.0;
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
  }

  // Recursive Bayer matrix (4×4) – branchless.
  float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

  vec3 nearest(vec3 c, out float palLum) {
    vec3 best = uPal[0];
    float bd = 1e9;
    for (int i = 0; i < ${MAX_PAL}; i++) {
      if (i >= uPalN) break;
      vec3 p = uPal[i];
      vec3 d = p - c;
      float dist = d.r * d.r * 0.30 + d.g * d.g * 0.59 + d.b * d.b * 0.11;
      if (dist < bd) { bd = dist; best = p; }
    }
    palLum = dot(best, vec3(0.2126, 0.7152, 0.0722));
    return best;
  }

  // Sample the scene at a cell: returns colour, sets isSky.
  vec3 sceneAt(vec2 cell, float size, out float isSky, out float depth) {
    vec2 uv = (cell + 0.5) * size / uRes;
    float d = texture2D(tDepth, uv).r;
    isSky = step(0.99999, d);
    depth = linDepth(d);
    vec3 sky = mix(uSkyBottom, uSkyTop, clamp(uv.y * 1.15 - 0.05, 0.0, 1.0));
    vec3 col = texture2D(tColor, uv).rgb;
    return mix(col, sky, max(isSky, uFade));
  }

  float edgeAt(vec2 cell, float size, float depth, float isSky) {
    if (isSky > 0.5 || uOutline <= 0.0) return 0.0;
    float far = 0.0;
    for (int i = 0; i < 4; i++) {
      vec2 o = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
      vec2 uv = (cell + o + 0.5) * size / uRes;
      float dn = linDepth(texture2D(tDepth, uv).r);
      far = max(far, dn - depth);
    }
    // Relative threshold: silhouettes, not shading creases.
    return step(0.6 + depth * 0.06, far) * uOutline;
  }

  vec3 pixelLook() {
    vec2 cell = floor(gl_FragCoord.xy / uPixel);
    float isSky, depth;
    vec3 c = sceneAt(cell, uPixel, isSky, depth);
    float edge = edgeAt(cell, uPixel, depth, isSky) * (1.0 - uFade);
    float b = bayer4(cell) - 0.5;
    // Objects get full dither; the sky only a whisper, so text above it stays calm.
    c += b * uDither * mix(0.16, 0.035, isSky);
    float pl;
    vec3 q = nearest(clamp(c, 0.0, 1.0), pl);
    return mix(q, uOutlineColor, edge);
  }

  vec3 glyphLook() {
    vec2 cell = floor(gl_FragCoord.xy / uGlyphCell);
    vec2 local = fract(gl_FragCoord.xy / uGlyphCell);
    float isSky, depth;
    vec3 c = sceneAt(cell, uGlyphCell, isSky, depth);
    float pl;
    // Glyphs are thin: lift the colour so the ink stays readable against the sky.
    vec3 lifted = uLight > 0.5 ? clamp(c * 0.62, 0.0, 1.0) : clamp(c * 1.45 + 0.06, 0.0, 1.0);
    vec3 q = nearest(lifted, pl);
    vec3 bg = mix(uSkyBottom, uSkyTop, clamp(gl_FragCoord.y / uRes.y * 1.15 - 0.05, 0.0, 1.0));
    float lum = dot(lifted, vec3(0.2126, 0.7152, 0.0722));

    if (isSky > 0.5) {
      // Sparse starfield of dots so empty space still reads as "made of text".
      float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      float tw = step(0.985, h) * (0.5 + 0.5 * sin(uTime * 1.5 + h * 40.0));
      vec2 s = vec2((1.0 + local.x) / uGlyphCount, local.y);
      float g = texture2D(tGlyph, s).r * tw;
      return mix(bg, uPal[uPalN > 4 ? 4 : 0], g * 0.8);
    }
    // Residual luminance → glyph level (the palette already carries the hue).
    float level = clamp(0.62 + (lum - pl) * 3.2 + (bayer4(cell) - 0.5) * 0.18, 0.3, 1.0);
    float idx = floor(level * (uGlyphCount - 1.0) + 0.5);
    vec2 g = vec2((idx + local.x) / uGlyphCount, local.y);
    float ink = texture2D(tGlyph, g).r;
    return mix(bg, q, ink);
  }

  void main() {
    vec3 col;
    if (uGlyphs <= 0.001) col = pixelLook();
    else if (uGlyphs >= 0.999) col = glyphLook();
    else {
      // Cross-over: a per-cell dithered choice, never a blurry blend.
      vec2 cell = floor(gl_FragCoord.xy / max(uPixel, uGlyphCell));
      col = bayer4(cell) < uGlyphs ? glyphLook() : pixelLook();
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface PostUniforms {
  [k: string]: THREE.IUniform;
  tColor: THREE.IUniform<THREE.Texture | null>;
  tDepth: THREE.IUniform<THREE.Texture | null>;
  tGlyph: THREE.IUniform<THREE.Texture | null>;
  uRes: THREE.IUniform<THREE.Vector2>;
  uPixel: THREE.IUniform<number>;
  uGlyphCell: THREE.IUniform<number>;
  uGlyphs: THREE.IUniform<number>;
  uGlyphCount: THREE.IUniform<number>;
  uDither: THREE.IUniform<number>;
  uOutline: THREE.IUniform<number>;
  uNear: THREE.IUniform<number>;
  uFar: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  uFade: THREE.IUniform<number>;
  uLight: THREE.IUniform<number>;
  uPal: THREE.IUniform<THREE.Vector3[]>;
  uPalN: THREE.IUniform<number>;
  uSkyTop: THREE.IUniform<THREE.Vector3>;
  uSkyBottom: THREE.IUniform<THREE.Vector3>;
  uOutlineColor: THREE.IUniform<THREE.Vector3>;
}

export function createPostMaterial(glyphs: THREE.Texture, glyphCount: number) {
  const uniforms: PostUniforms = {
    tColor: { value: null },
    tDepth: { value: null },
    tGlyph: { value: glyphs },
    uRes: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 4 },
    uGlyphCell: { value: 10 },
    uGlyphs: { value: 0 },
    uGlyphCount: { value: glyphCount },
    uDither: { value: 1 },
    uOutline: { value: 1 },
    uNear: { value: 0.1 },
    uFar: { value: 100 },
    uTime: { value: 0 },
    uFade: { value: 0 },
    uLight: { value: 0 },
    uPal: { value: Array.from({ length: MAX_PAL }, () => new THREE.Vector3()) },
    uPalN: { value: 0 },
    uSkyTop: { value: new THREE.Vector3() },
    uSkyBottom: { value: new THREE.Vector3() },
    uOutlineColor: { value: new THREE.Vector3() },
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

/**
 * Glyph atlas: a single row of glyphs, darkest → densest. The ramp mixes the
 * block-level glyphs used by ASCII Magic pieces with classic ASCII so that
 * mid-tones read as "text" and highlights as solid blocks.
 */
export const GLYPHS = [' ', '.', ':', '-', '=', '+', '*', '▃', '▄', '▅', '▆', '█'];

export function createGlyphAtlas(): THREE.Texture {
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size * GLYPHS.length;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(size * 0.92)}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
  GLYPHS.forEach((g, i) => {
    const x = i * size;
    if (g === '█') {
      ctx.fillRect(x + 3, 3, size - 6, size - 6);
    } else if ('▃▄▅▆'.includes(g)) {
      // Draw block levels geometrically: crisp and font-independent.
      const h = { '▃': 0.375, '▄': 0.5, '▅': 0.625, '▆': 0.75 }[g]!;
      ctx.fillRect(x + 3, size - 3 - (size - 6) * h, size - 6, (size - 6) * h);
    } else {
      ctx.fillText(g, x + size / 2, size / 2 + 2);
    }
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}
