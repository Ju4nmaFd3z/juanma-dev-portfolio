import type * as THREE from 'three';
import type { Bus, ChapterId } from './bus';

/** How a chapter is resolved into pixels (CSS px sizes). */
export interface Look {
  /** Pixel cell edge. Bigger = chunkier pixel art. */
  pixel: number;
  /** 0 = pure pixel art, 1 = glyph / ASCII rendering. */
  glyphs: number;
  /** Glyph cell edge. */
  glyphCell: number;
  /** Ordered dither strength. */
  dither: number;
  /** Depth outline strength. */
  outline: number;
}

export interface FrameCtx {
  t: number;
  dt: number;
  /** Smoothed pointer, -1..1. */
  px: number;
  py: number;
  /** 0..1 progress of the viewport through this chapter's section. */
  local: number;
  reduced: boolean;
  low: boolean;
  bus: Bus;
}

export interface Chapter {
  id: ChapterId;
  root: THREE.Group;
  look: Look;
  camera: { pos: THREE.Vector3; target: THREE.Vector3; fov: number };
  update(ctx: FrameCtx): void;
  dispose(): void;
}
