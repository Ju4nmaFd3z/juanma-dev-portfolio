import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { T } from '../translations';
import { PROJECTS, CONTACT } from '../content';
import { bus, firePulse, type ProjectId } from '../engine/bus';
import { ChapterTag, Decode, ExternalLink, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

type Filter = 'all' | 'software' | 'systems';

const Projects: React.FC<{ t: T['projects'] }> = ({ t }) => {
  const ref = useReveal<HTMLElement>();
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<ProjectId>('genetix');
  const tabs = useRef<Map<ProjectId, HTMLButtonElement>>(new Map());

  const list = useMemo(
    () => PROJECTS.filter((p) => filter === 'all' || p.category === filter).map((m) => ({ meta: m, text: t.items.find((i) => i.id === m.id)! })),
    [filter, t],
  );

  const select = (id: ProjectId, focus = false) => {
    setActive(id);
    if (focus) tabs.current.get(id)?.focus();
  };

  useEffect(() => {
    if (bus.activeProject !== active) {
      bus.activeProject = active;
      firePulse();
    }
  }, [active]);

  useEffect(() => {
    if (!list.some((p) => p.meta.id === active)) setActive(list[0].meta.id);
  }, [list, active]);

  const idx = Math.max(0, list.findIndex((p) => p.meta.id === active));
  const cur = list[idx] ?? list[0];
  const step = (d: number, focus = false) => select(list[(idx + d + list.length) % list.length].meta.id, focus);

  const onKey = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); step(1, true); }
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); step(-1, true); }
    if (e.key === 'Home') { e.preventDefault(); select(list[0].meta.id, true); }
    if (e.key === 'End') { e.preventDefault(); select(list[list.length - 1].meta.id, true); }
  };

  const accent = `var(--${cur.meta.accent})`;

  return (
    <section ref={ref} id="projects" data-chapter="projects" aria-labelledby="projects-title" className="chapter py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-5 min-w-0">
          <ChapterTag n={4} label={t.chapter} />
          <h2 id="projects-title" className="display mt-6 text-[clamp(2.6rem,6vw,5rem)] text-ink">
            <span className="block reveal">{t.title1}</span>
            <Decode text={t.title2} className="block text-accentText reveal" />
          </h2>
          <p className="mt-6 text-lg text-ink2 leading-relaxed max-w-[48ch] reveal">{t.intro}</p>

          <div className="mt-8 flex gap-2 reveal" role="group" aria-label="Filtro">
            {(['all', 'software', 'systems'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 min-h-[40px] font-mono text-[12px] uppercase tracking-[0.08em] border transition-colors ${filter === f ? 'bg-ink text-bg border-ink' : 'border-lineStrong text-ink2 hover:border-ink'}`}
              >
                {t.filters[f]}
              </button>
            ))}
          </div>

          <div
            role="tablist"
            aria-label={t.listLabel}
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="mt-6 flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:border-t border-lineStrong snap-x"
          >
            {list.map(({ meta, text }) => {
              const n = PROJECTS.findIndex((p) => p.id === meta.id) + 1;
              const on = meta.id === active;
              return (
                <button
                  key={meta.id}
                  ref={(el) => { if (el) tabs.current.set(meta.id, el); else tabs.current.delete(meta.id); }}
                  role="tab"
                  id={`tab-${meta.id}`}
                  aria-selected={on}
                  aria-controls="project-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(meta.id)}
                  className={`group shrink-0 snap-start text-left flex items-center gap-3 px-3 py-3 lg:py-3.5 border lg:border-0 lg:border-b transition-colors ${on ? 'bg-panel border-ink lg:border-lineStrong' : 'border-lineStrong hover:bg-panel'}`}
                >
                  <span className={`font-pixel text-[11px] ${on ? 'text-accentText' : 'text-muted'}`}>{String(n).padStart(2, '0')}</span>
                  <span className={`font-display text-base lg:text-xl font-semibold whitespace-nowrap ${on ? 'text-ink' : 'text-ink2 group-hover:text-ink'}`}>{text.title}</span>
                  <span className="hidden lg:block ml-auto font-mono text-[11px] uppercase tracking-wider text-muted">{t.filters[meta.category]}</span>
                  <span className={`hidden lg:block w-2 h-2 ${on ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <ExternalLink href={CONTACT.github} className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ink2 link-u px-0.5">
            <i className="fa-brands fa-github" aria-hidden="true" /> {t.github}
          </ExternalLink>
        </div>

        <div className="lg:col-span-7 min-w-0">
          <div className="lg:sticky lg:top-[9vh] flex flex-col gap-4 lg:h-[84vh]">
            <div data-stage role="img" aria-label={`${t.visualLabel} ${cur.text.title}.`} className="stage flex-1 min-h-[38svh] lg:min-h-0">
              <StageFallback art={ART.projects} />
            </div>

            <article
              id="project-panel"
              role="tabpanel"
              aria-labelledby={`tab-${cur.meta.id}`}
              aria-live="polite"
              className="panel px-frame p-5 sm:p-7 relative"
              style={{ boxShadow: `inset 4px 0 0 ${accent}` }}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: accent }}>{cur.text.kicker}</span>
                {cur.text.status && <span className="chip !py-0.5 !text-[0.68rem] !text-ink"><span className="live-dot !w-1.5 !h-1.5" aria-hidden="true" />{cur.text.status}</span>}
              </div>
              <h3 className="mt-2 display text-3xl sm:text-4xl text-ink">{cur.text.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink2">{cur.text.desc}</p>

              <dl className="mt-4 grid sm:grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {cur.text.role && (
                  <>
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-muted pt-1">{t.role}</dt>
                    <dd className="text-ink">{cur.text.role}</dd>
                  </>
                )}
                <dt className="font-mono text-[11px] uppercase tracking-wider text-muted pt-1">{t.stack}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {cur.text.tech.map((x) => <span key={x} className="chip !py-0.5 !text-[0.7rem]">{x}</span>)}
                </dd>
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {cur.meta.live && (
                  <ExternalLink href={cur.meta.live} className="btn btn-primary !min-h-[42px] !py-2">
                    {t.visit} <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" aria-hidden="true" />
                    <span className="sr-only">: {cur.text.title}</span>
                  </ExternalLink>
                )}
                {cur.meta.repo && (
                  <ExternalLink href={cur.meta.repo} className="btn !min-h-[42px] !py-2">
                    <i className="fa-brands fa-github" aria-hidden="true" /> {t.repo}
                    <span className="sr-only">: {cur.text.title}</span>
                  </ExternalLink>
                )}
                {cur.meta.other && (
                  <ExternalLink href={cur.meta.other.url} className="btn !min-h-[42px] !py-2">
                    {cur.meta.other.kind === 'course' ? t.course : t.post}
                    <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" aria-hidden="true" />
                  </ExternalLink>
                )}
                <div className="ml-auto flex gap-2">
                  <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label={t.prev}><i className="fa-solid fa-arrow-left" aria-hidden="true" /></button>
                  <button type="button" className="icon-btn" onClick={() => step(1)} aria-label={t.next}><i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
                </div>
              </div>
              <span className="absolute top-4 right-5 font-pixel text-[11px] text-muted" aria-hidden="true">
                {String(idx + 1).padStart(2, '0')}/{String(list.length).padStart(2, '0')}
              </span>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
