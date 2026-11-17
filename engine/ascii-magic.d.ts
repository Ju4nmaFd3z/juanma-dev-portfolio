// ASCII Magic pieces are plain ES modules without bundled types.
declare module 'ascii-magic-art/pieces/*.js' {
  import type { PieceModule } from './sources';
  export const meta: PieceModule['meta'];
  const create: PieceModule['default'];
  export default create;
}
