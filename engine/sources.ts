import type { CellSource } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Cell sources: things that are already a grid of cells.
//
// • ASCII Magic pieces (MIT, ascii-magic.com) run untouched: create() returns
//   draw(t) → { text, color }. Each cell is a block-level glyph ▁…█ plus a
//   palette key; we turn that into ink colour + tone with the same true-tone
//   recipe as the library's own halftone painter (glyph ink × colour light,
//   2nd–98th percentile stretch, a gentle curve) and hand it to the GPU.
// • A photo is sampled down to a grid the same way.
// ─────────────────────────────────────────────────────────────────────────────

type Frame = string | { text: string; color?: string; palette?: Record<string, string> };
export interface PieceModule {
  meta: { slug: string; cols: number; rows: number; fps?: number; palette?: Record<string, string>; dots?: { tone?: { sat?: number } } };
  default: () => (t: number) => Frame;
}

/** Block levels used by ASCII Magic picture pieces, and their ink share. */
const LV: Record<string, number> = { '▁': 0.135, '▂': 0.257, '▃': 0.378, '▄': 0.51, '▅': 0.635, '▆': 0.757, '▇': 0.878, '█': 1 };
const SPARSE = ' .,-~:;=!*#$@';

const parseHex = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const lum = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** Histogram percentile stretch + curve, written into the alpha channel. */
function toneInto(vals: Float32Array, data: Uint8Array, curve = 1.1, lo = 0.04, hi = 0.985) {
  let vmax = 0, n = 0;
  for (let i = 0; i < vals.length; i++) if (vals[i] > vmax) vmax = vals[i];
  const HB = 512, hist = new Uint32Array(HB);
  for (let i = 0; i < vals.length; i++) if (vals[i] >= 0) { hist[Math.min(HB - 1, Math.floor((vals[i] / (vmax || 1)) * HB))]++; n++; }
  const P = (q: number) => { let acc = 0; const want = q * n; for (let k = 0; k < HB; k++) { acc += hist[k]; if (acc >= want) return ((k + 0.5) / HB) * vmax; } return vmax; };
  const a = P(lo), b = Math.max(P(hi), a + 1e-4);
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] < 0) { data[i * 4 + 3] = 0; continue; }
    const t = Math.pow(Math.min(1, Math.max(0, (vals[i] - a) / (b - a))), curve);
    data[i * 4 + 3] = Math.max(1, Math.round(t * 255)); // 0 is reserved for "empty"
  }
}

export function pieceSource(mod: PieceModule, opts: { focus: [number, number]; fit?: 'cover' | 'contain'; speed?: number }): CellSource {
  const { cols, rows } = mod.meta;
  const fps = mod.meta.fps ?? 15;
  const draw = mod.default();
  const data = new Uint8Array(cols * rows * 4);
  const vals = new Float32Array(cols * rows);
  const keyRgb = new Map<string, [number, number, number] | null>();
  const speed = opts.speed ?? 1;
  let lastFrame = -1;

  const src: CellSource = {
    cols, rows, data, version: 0, focus: opts.focus, fit: opts.fit ?? 'cover',
    tick(t: number) {
      const f = Math.floor(t * speed * fps);
      if (f === lastFrame) return;
      lastFrame = f;
      const frame = draw(f / fps);
      const text = typeof frame === 'string' ? frame : frame.text;
      const color = typeof frame === 'string' ? '' : frame.color ?? '';
      const pal = (typeof frame !== 'string' && frame.palette) || mod.meta.palette || {};
      let x = 0, y = 0;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') { y++; x = 0; continue; }
        if (x < cols && y < rows) {
          const k = color[i] ?? ' ';
          let rgb = keyRgb.get(k);
          if (rgb === undefined) { rgb = k !== ' ' && pal[k] ? parseHex(pal[k]) : null; keyRgb.set(k, rgb); }
          const c = y * cols + x, o = c * 4;
          if (ch === ' ' || !rgb) { vals[c] = ch === ' ' ? -1 : 0.6; data[o] = data[o + 1] = data[o + 2] = 220; }
          else {
            const ink = LV[ch] ?? Math.max(0.15, SPARSE.indexOf(ch) / (SPARSE.length - 1));
            vals[c] = ink * lum(rgb[0], rgb[1], rgb[2]);
            data[o] = rgb[0]; data[o + 1] = rgb[1]; data[o + 2] = rgb[2];
          }
        }
        x++;
      }
      toneInto(vals, data);
      src.version++;
    },
    dispose() {},
  };
  src.tick(0);
  return src;
}

/** A photo, printed as halftone. Pure black reads as "no ink" (a cut-out portrait). */
export async function imageSource(url: string, cols: number, opts: { focus: [number, number]; fit?: 'cover' | 'contain' }): Promise<CellSource> {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
  const cv = document.createElement('canvas');
  cv.width = cols;
  cv.height = rows;
  const ctx = cv.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, cols, rows);
  const px = ctx.getImageData(0, 0, cols, rows).data;
  const data = new Uint8Array(cols * rows * 4);
  const vals = new Float32Array(cols * rows);
  const fadeFrom = rows * 0.84;
  for (let i = 0; i < cols * rows; i++) {
    let r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    const a = px[i * 4 + 3] / 255;
    const y = Math.floor(i / cols);
    // the photo is cut at the waist: let it dissolve into the page instead
    const fade = y < fadeFrom ? 1 : Math.max(0, 1 - (y - fadeFrom) / (rows - fadeFrom));
    const L = lum(r, g, b) * fade * a;
    // A cut-out's soft edge and cool shadows carry stray blue/cyan: a portrait
    // is warm or neutral, so anything cooler than neutral is printed grey.
    if (b > r || g > r) { const m = Math.round(lum(r, g, b) * 255); r = g = b = m; }
    data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b;
    vals[i] = a < 0.5 || L < 0.045 ? -1 : L;
  }
  toneInto(vals, data, 0.95, 0.02, 0.995);
  return { cols, rows, data, version: 1, focus: opts.focus, fit: opts.fit ?? 'contain', tick() {}, dispose() {} };
}
