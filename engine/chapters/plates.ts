import type { ChapterId } from '../bus';
import type { CellSource, GridChapter, Look } from '../types';
import { imageSource, pieceSource, type PieceModule } from '../sources';

// The flat "plates": two ASCII Magic pieces and a halftone portrait.
// They load lazily; until they are ready the chapter simply prints nothing.

const PLATE_LOOK: Look = { step: 0, shape: 0, glyphs: 0, curve: 1.1, sat: 0.82, size: 0.393 };

function grid(id: ChapterId, load: () => Promise<CellSource>, look: Partial<Look> = {}): GridChapter {
  const ch: GridChapter = {
    id,
    kind: 'grid',
    source: null,
    look: { ...PLATE_LOOK, ...look },
    ready: Promise.resolve(),
    dispose: () => ch.source?.dispose(),
  };
  ch.ready = load().then((s) => { ch.source = s; });
  return ch;
}

const piece = (mod: Promise<PieceModule>, focus: [number, number]) => () => mod.then((m) => pieceSource(m, { focus }));

/** Home — a five-tier pagoda among red maples. */
export const buildHero = () =>
  grid('hero', piece(import('ascii-magic-art/pieces/autumn-pagoda-maples.js') as Promise<PieceModule>, [0.66, 0.42]), { fade: 0.22 });

/** About — the author himself, in dots. Warm only: no colour lift. */
export const buildAbout = (low: boolean) =>
  grid('about', () => imageSource('/images/me.webp', low ? 78 : 104, { focus: [0.5, 1], fit: 'contain' }), { sat: 0, curve: 0.95 });

/** Contact — a whitewashed village over the Mediterranean. */
export const buildContact = () =>
  grid('contact', piece(import('ascii-magic-art/pieces/cliff-village-sea.js') as Promise<PieceModule>, [0.62, 0.5]), { fade: 0.3 });
