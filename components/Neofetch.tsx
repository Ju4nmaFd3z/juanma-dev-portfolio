import React from 'react';
import type { T } from '../translations';
import { LOGO_CELLS, LOGO_CURSOR, LOGO_GRID } from './brand';

// `neofetch` for the portfolio: the mark in pixels over a halftone shadow, a system card whose facts are read from the site's own copy (so it
// never goes stale), and the palette. Lines print in a quick cascade.

const PX = 26; // css px per logo pixel
const SWATCHES = ['#0b0a0d', '#141217', '#7ab2e6', '#ff8a3a', '#ffc078', '#f07ab0', '#3fd18a', '#f4eee4'];

const pixels: { x: number; y: number; cursor?: boolean }[] = [
  ...LOGO_CELLS.map(([x, y]) => ({ x, y })),
  ...Array.from({ length: LOGO_CURSOR.w * LOGO_CURSOR.h }, (_, i) => ({ x: LOGO_CURSOR.x + (i % LOGO_CURSOR.w), y: LOGO_CURSOR.y + Math.floor(i / LOGO_CURSOR.w), cursor: true })),
];

/** The mark, drawn in real pixels over a halftone-dot shadow. */
const Logo: React.FC = () => (
  <div className="relative shrink-0" style={{ width: LOGO_GRID * PX + 8, height: LOGO_GRID * PX + 8 }} aria-hidden="true">
    {pixels.map((p, i) => (
      <span key={`s${i}`} className="nf-shadow absolute" style={{ left: p.x * PX + 8, top: p.y * PX + 8, width: PX, height: PX }} />
    ))}
    {pixels.map((p, i) => (
      <span
        key={i}
        className={`absolute ${p.cursor ? 'brand-cursor bg-[#ff8a3a]' : 'bg-[#f4eee4]'}`}
        style={{ left: p.x * PX, top: p.y * PX, width: PX, height: PX }}
      />
    ))}
  </div>
);

const Neofetch: React.FC<{ t: T; es: boolean }> = ({ t, es }) => {
  const L = t.skills.layers;
  const certs = t.journey.items.filter((m) => m.kind === 'cert').reverse().map((m) => `${m.title} (${m.org.split(' ')[0]})`);
  const work = t.journey.items.filter((m) => m.kind === 'work').reverse().map((m) => m.org.split(' · ')[0]);
  const years = new Date().getFullYear() - 2023;

  const rows: [string, React.ReactNode][] = [
    ['OS', 'macOS · Kali Linux'],
    ['Host', es ? 'Juan Manuel Fernández Rodríguez · Málaga' : 'Juan Manuel Fernández Rodríguez · Málaga, Spain'],
    ['Kernel', es ? 'SMR (nota media 9,2) → DAM, en curso' : 'SMR (GPA 9.2) → DAM, in progress'],
    ['Uptime', es ? `${years} años en IT (desde 2023)` : `${years} years in IT (since 2023)`],
    ['Shell', 'zsh · bash'],
    ['Editor', 'VS Code'],
    [es ? 'Lenguajes' : 'Languages', L[4].items.join(' · ')],
    ['Web', L[5].items.join(' · ')],
    [es ? 'Datos' : 'Data', L[3].items.join(' · ')],
    ['DevOps', L[6].items.join(' · ')],
    [es ? 'Redes' : 'Network', L[1].items.join(' · ')],
    [es ? 'Certificados' : 'Certificates', certs.join(' · ')],
    [es ? 'Experiencia' : 'Experience', work.join(' · ')],
    [es ? 'Proyectos' : 'Projects', `${t.projects.items.length}`],
    [es ? 'Estado' : 'Status', <span key="s" className="text-[#3fd18a]">● {t.hero.status}</span>],
  ];

  return (
    <div className="neofetch flex flex-wrap items-center gap-x-8 gap-y-4 py-2">
      <Logo />
      <div className="min-w-0 flex-1">
        <p style={{ ['--i' as string]: 0 }}>
          <span className="text-[#ff8a3a] font-semibold">juanma</span><span className="text-[#958c80]">@</span><span className="text-[#ff8a3a] font-semibold">portfolio</span>
        </p>
        <p className="text-[#4a4038]" style={{ ['--i' as string]: 1 }} aria-hidden="true">────────────────────</p>
        {rows.map(([k, v], i) => (
          <p key={k} className="flex gap-3" style={{ ['--i' as string]: i + 2 }}>
            <span className="text-[#ffc078] w-[12ch] shrink-0">{k}</span>
            <span className="text-[#d2c9bb] min-w-0">{v}</span>
          </p>
        ))}
        <p className="pt-3 flex" style={{ ['--i' as string]: rows.length + 2 }} aria-hidden="true">
          {SWATCHES.map((c) => <span key={c} className="inline-block w-[3ch] h-[1.1em]" style={{ background: c }} />)}
        </p>
      </div>
    </div>
  );
};

export default Neofetch;
