// Language-independent data: links, categories, files. Copy lives in translations.ts.
import type { ProjectId } from './engine/bus';

export const CONTACT = {
  email: 'juanmafr2007@gmail.com',
  phoneDisplay: '(+34) 643 71 80 54',
  phoneHref: 'tel:+34643718054',
  whatsapp: 'https://wa.me/34643718054',
  github: 'https://github.com/Ju4nmaFd3z',
  linkedin: 'https://www.linkedin.com/in/juanma-fern%C3%A1ndez-rodr%C3%ADguez',
  school: 'https://fpalanturing.es/',
};

const FIXME_POST =
  'https://www.linkedin.com/posts/juanma-fern%C3%A1ndez-rodr%C3%ADguez_presentaci%C3%B3n-pr%C3%A1cticas-fix-me-2026-share-7466445967605760000-vEC4/';

export interface ProjectMeta {
  id: ProjectId;
  category: 'software' | 'systems';
  live?: string;
  repo?: string;
  /** A non-website link: course page or post. */
  other?: { kind: 'course' | 'post'; url: string };
  /** Accent used for the project's UI tint (CSS variable name). */
  accent: 'sea' | 'accent-text' | 'gold' | 'rose';
}

export const PROJECTS: ProjectMeta[] = [
  { id: 'genetix', category: 'software', live: 'https://genetix-xi.vercel.app/', repo: 'https://github.com/Ju4nmaFd3z/Genetix', accent: 'sea' },
  { id: 'arena', category: 'software', live: 'https://genetix-arena.vercel.app/', repo: 'https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition', accent: 'accent-text' },
  { id: 'infra', category: 'systems', other: { kind: 'course', url: 'https://www.netacad.com/es/courses/ccna-introduction-networks?courseLang=en-US' }, accent: 'sea' },
  { id: 'glitch', category: 'software', live: 'https://glitchnight.com', accent: 'rose' },
  { id: 'arcade', category: 'software', live: 'https://fixme-arcade.vercel.app', accent: 'rose' },
  { id: 'openclaw', category: 'systems', other: { kind: 'post', url: FIXME_POST }, accent: 'accent-text' },
  { id: 'kukelure', category: 'software', live: 'https://kukelure.com/', accent: 'accent-text' },
  { id: 'procesosbi', category: 'software', live: 'https://procesosbi.com/', accent: 'gold' },
  { id: 'biznaga', category: 'software', live: 'https://biznaga-consulting.vercel.app/', accent: 'gold' },
];

/** One colour per skill layer, bottom (hardware) → top (devops): shared by the list and the 3D stack. */
export const SKILL_COLORS = [0x4a5874, 0x46777e, 0x667f5f, 0xa38d5c, 0xb8724a, 0x965867, 0x6c6188];

/** One colour per kind of milestone (education, work, certification): scene, cards and git log. */
export const KIND_COLORS = { edu: 0x7ab2e6, work: 0xff8a3a, cert: 0xffc078 } as const;
export const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

export interface MilestoneMeta {
  cert?: { file: string; download: string };
  linkedin?: string;
  slides?: string;
  school?: string;
}

export const MILESTONE_META: Record<string, MilestoneMeta> = {
  smr: { school: CONTACT.school },
  dam: { school: CONTACT.school },
  ccna: { cert: { file: '/certs/ccna.pdf', download: 'CCNA-Introduction-to-Networks.pdf' } },
  devops: { cert: { file: '/certs/devops-lemoncode.pdf', download: 'DevOps-LemonCode.pdf' } },
  fixme: { linkedin: FIXME_POST, slides: 'https://canva.link/noamvf0lpjcpmv3' },
};
