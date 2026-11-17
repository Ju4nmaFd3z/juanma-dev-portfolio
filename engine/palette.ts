// One palette for the whole site, taken from the two ASCII Magic plates:
// the maples and lanterns of the autumn pagoda (warm) and the sea and domes of
// the cliff village (cool). 3D materials use these "intent" colours; the
// halftone pass then lifts them toward full saturation, as the plates do.
// Values are sRGB hex (colour management is off in the engine).

/** The screen: background and the scene lighting. */
export const SCREEN = {
  bg: 0x0b0a0d,
  hemiSky: 0xffe2a8,
  hemiGround: 0x2a2026,
  hemiIntensity: 1.25,
  keyIntensity: 2.6,
} as const;

/** Scene intent colours shared by every 3D chapter. */
export const C = {
  deep: 0x1e1622,
  navy: 0x2a2f4a,
  slate: 0x46344a,
  steel: 0x7a6f86,
  haze: 0xd8d2dc,
  teal: 0x2c6cc0,
  mint: 0x7ab2e6,
  amber: 0xffc078,
  coral: 0xf06a2a,
  berry: 0xd84a8a,
  cream: 0xfff0c8,
} as const;
