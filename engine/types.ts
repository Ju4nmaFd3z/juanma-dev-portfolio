import type * as THREE from 'three';
import type { Bus, ChapterId } from './bus';

/**
 * How a chapter is printed onto the halftone screen.
 * All sizes are CSS px; the engine scales them by the device pixel ratio.
 */
export interface Look {
  /** Dot pitch for 3D scenes (piece/image chapters derive it from their grid). */
  step: number;
  /** 0 = round dots, 1 = square pixels. */
  shape: number;
  /** 0 = dots, 1 = everything drawn as ASCII glyphs. */
  glyphs: number;
  /** Tone curve exponent: higher = darker mid-tones. */
  curve: number;
  /** Colour lift toward full saturation (0..1), as in ASCII Magic's halftone. */
  sat: number;
  /** Largest dot as a share of the pitch (0.5 = dots just touch). */
  size: number;
  /** 3D only: light → tone gain (glyph scenes want less, so shading survives). */
  gain?: number;
  /** 3D only: 1 = pixel-art (constant cell size, colour shaded by light). */
  solid?: number;
  /** Plates only: share of the stage height over which the plate melts into the page at its foot. */
  fade?: number;
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

/** A grid of printed cells: rgb = ink colour, a = tone (0 = empty, 1 = full). */
export interface CellSource {
  cols: number;
  rows: number;
  /** RGBA8, rows top → bottom. Re-uploaded when `version` changes. */
  data: Uint8Array;
  version: number;
  /** Where the subject sits (0..1), kept on screen when the grid is cropped. */
  focus: [number, number];
  /** cover = fill the stage and crop; contain = fit whole inside the stage. */
  fit: 'cover' | 'contain';
  /** Called every frame while the chapter is visible. */
  tick(t: number): void;
  dispose(): void;
}

interface ChapterBase {
  id: ChapterId;
  look: Look;
  dispose(): void;
}

/** A real Three.js scene, rendered to a target and printed as halftone. */
export interface SceneChapter extends ChapterBase {
  kind: 'scene';
  root: THREE.Group;
  camera: { pos: THREE.Vector3; target: THREE.Vector3; fov: number };
  update(ctx: FrameCtx): void;
}

/** A 2D cell grid (an ASCII Magic piece or a photo), printed directly. */
export interface GridChapter extends ChapterBase {
  kind: 'grid';
  source: CellSource | null;
  /** Resolves once the source is ready (pieces are loaded lazily). */
  ready: Promise<void>;
}

export type Chapter = SceneChapter | GridChapter;
