// Limited palettes. Every rendered pixel is snapped (with ordered dithering)
// to one of these colours, so the scene colours only ever *suggest* a hue —
// the palette decides the final look. Swapping palettes re-themes the world.
//
// Values are sRGB hex. Colour management is disabled in the engine, so these
// numbers travel unchanged from material to framebuffer.

export interface Palette {
  colors: number[];
  /** Sky gradient: top → bottom. */
  skyTop: number;
  skyBottom: number;
  /** Colour used for depth outlines. */
  outline: number;
  /** Light rig. */
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  keyIntensity: number;
}

export const DARK: Palette = {
  colors: [
    0x07080f, // void
    0x111527, // deep
    0x1c2342, // navy
    0x2e3864, // slate
    0x56659a, // steel
    0x9fb0d8, // haze
    0x1f8a80, // teal
    0x6fe0c4, // mint
    0xf2b134, // amber (accent)
    0xff6b4a, // coral
    0xb2456e, // berry
    0xf3ead7, // cream
  ],
  skyTop: 0x07080f,
  skyBottom: 0x141a33,
  outline: 0x05060b,
  hemiSky: 0x9fb0d8,
  hemiGround: 0x111527,
  hemiIntensity: 1.1,
  keyIntensity: 2.4,
};

export const LIGHT: Palette = {
  colors: [
    0xf2ecdf, // paper
    0xe3d9c4, // sand
    0xc8b997, // dune
    0x8f8573, // stone
    0x4b4659, // dusk
    0x24202e, // ink
    0x23877c, // teal
    0x7cc9b4, // sage
    0xe39b1b, // amber
    0xe5553a, // coral
    0x9c3d62, // berry
    0x3f5aa8, // ultramarine
  ],
  skyTop: 0xf2ecdf,
  skyBottom: 0xe3d9c4,
  outline: 0x24202e,
  hemiSky: 0xffffff,
  hemiGround: 0xc8b997,
  hemiIntensity: 1.6,
  keyIntensity: 2.0,
};

/** Scene "intent" colours shared by every chapter builder. */
export const C = {
  void: 0x07080f,
  deep: 0x111527,
  navy: 0x1c2342,
  slate: 0x2e3864,
  steel: 0x56659a,
  haze: 0x9fb0d8,
  teal: 0x1f8a80,
  mint: 0x6fe0c4,
  amber: 0xf2b134,
  coral: 0xff6b4a,
  berry: 0xb2456e,
  cream: 0xf3ead7,
} as const;
