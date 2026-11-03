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
  theme: 'dark' | 'light';
  /** Skill layer hovered/focused in the Stack chapter (-1 = none). */
  activeLayer: number;
  activeProject: ProjectId;
  /** Index of the milestone currently in view in the Journey chapter. */
  activeMilestone: number;
  /** performance.now() of the last "signal" (project switch, message sent…). */
  pulse: number;
  /** Set once the preloader is gone, so the world can "resolve" into view. */
  introAt: number;
  /** Normalised pointer position, -1..1 (0,0 = centre). */
  px: number;
  py: number;
}

export const bus: Bus = {
  theme: 'dark',
  activeLayer: -1,
  activeProject: 'genetix',
  activeMilestone: 0,
  pulse: 0,
  introAt: 0,
  px: 0,
  py: 0,
};

export const firePulse = () => {
  bus.pulse = performance.now();
};
