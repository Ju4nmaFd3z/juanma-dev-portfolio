// The mark, as data: a pixel "J" and a block cursor resting on its baseline,
// on a 5 × 5 grid. Used by the header/footer logo, the loading screen and
// the terminal's neofetch.

export const LOGO_GRID = 5;
/** The "J", row by row ('#' = pixel). */
const LOGO_J = ['..#', '..#', '..#', '#.#', '.##'];
/** The cursor, in grid cells. */
export const LOGO_CURSOR = { x: 4, y: 3, w: 1, h: 2 };

export const LOGO_CELLS: [number, number][] = LOGO_J.flatMap((row, y) => [...row].flatMap((c, x) => (c === '#' ? [[x, y] as [number, number]] : [])));
