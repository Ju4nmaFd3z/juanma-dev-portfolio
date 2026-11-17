// The bus is the only bridge between the React UI and the WebGL world.
// React writes plain values; the render loop polls them every frame.
// It deliberately has no Three.js import, so it lives in the main bundle
// while the engine itself is lazy-loaded.

export type ChapterId = 'hero' | 'about' | 'skills' | 'projects' | 'journey' | 'contact';

export const CHAPTERS: ChapterId[] = ['hero', 'about', 'skills', 'projects', 'journey', 'contact'];

export type ProjectId =
  | 'genetix'
  | 'arena'
  | 'infra'
  | 'glitch'
  | 'arcade'
  | 'openclaw'
  | 'kukelure'
  | 'procesosbi'
  | 'biznaga';

export interface Bus {
  /** Skill layer hovered/focused in the Stack chapter (-1 = none). */
  activeLayer: number;
  activeProject: ProjectId;
  /** Journey: index of the milestone in view, oldest first. */
  activeMilestone: number;
  /** Set once the preloader is gone, so the world can "resolve" into view. */
  introAt: number;
  /** Normalised pointer position, -1..1 (0,0 = centre). */
  px: number;
  py: number;
  /** The lens: pointer in CSS px, whether it is shown, and when it last moved. */
  lx: number;
  ly: number;
  lens: 'off' | 'hover' | 'tap';
  lensAt: number;
}

export const bus: Bus = {
  activeLayer: -1,
  activeProject: 'genetix',
  activeMilestone: 0,
  introAt: 0,
  px: 0,
  py: 0,
  lx: -9999,
  ly: -9999,
  lens: 'off',
  lensAt: 0,
};
