import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { T } from '../translations';
import { PROJECTS, CONTACT } from '../content';
import { bus, type ProjectId } from '../engine/bus';
import { ExternalLink, Rise, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

type Filter = 'all' | 'software' | 'systems';

const Projects: React.FC<{ t: T['projects'] }> = ({ t }) => {
  const ref = useReveal<HTMLElement>();
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<ProjectId>('genetix');
  const tabs = useRef<Map<ProjectId, HTMLButtonElement>>(new Map());

  // the assistant can point at a project: "portfolio:project" selects it
  useEffect(() => {
    const onPick = (e: Event) => {
      const id = (e as CustomEvent<ProjectId>).detail;
      if (!PROJECTS.some((p) => p.id === id)) return;
      setFilter('all');
      setActive(id);
    };
    window.addEventListener('portfolio:project', onPick);
    return () => window.removeEventListener('portfolio:project', onPick);
  }, []);

  const list = useMemo(
    () => PROJECTS.filter((p) => filter === 'all' || p.category === filter).map((m) => ({ meta: m, text: t.items.find((i) => i.id === m.id)! })),
    [filter, t],
  );

  const select = (id: ProjectId, focus = false) => {
    setActive(id);
    if (focus) tabs.current.get(id)?.focus();
  };

  useEffect(() => {
    bus.activeProject = active;
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
    <section ref={ref} id="projects" data-chapter="projects" aria-labelledby="projects-title" className="chapter py-24 lg:py-32">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-x-10 gap-y-10">
        <div className="lg:col-span-5 min-w-0">
          <h2 id="projects-title" className="display text-[clamp(3.6rem,8.6vw,9rem)] text-ink">
            <Rise text={t.title1} />
            <Rise text={t.title2} delay={100} />
          </h2>
          <div className="mt-10 flex gap-2 reveal" role="group" aria-label={t.listLabel}>
            {(['all', 'software', 'systems'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-solid' : ''}`}
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
            className="mt-8 flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0 lg:border-t border-lineStrong snap-x"
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
                  className={`group shrink-0 snap-start text-left flex items-baseline gap-4 px-4 py-2.5 lg:px-0 lg:py-4 rounded-full lg:rounded-none border lg:border-0 lg:border-b border-line transition-colors ${on ? 'bg-ink text-bg lg:bg-transparent lg:text-ink border-ink' : 'hover:border-lineStrong'}`}
                >
                  <span className={`label hidden lg:inline ${on ? '!text-accentText' : ''}`}>{String(n).padStart(2, '0')}</span>
                  <span className={`display text-[1.35rem] lg:text-[2.3rem] leading-none whitespace-nowrap transition-[color,transform] duration-500 ${on ? 'lg:text-accentText lg:italic lg:translate-x-2' : 'lg:text-ink2 group-hover:lg:text-ink'}`}>{text.title}</span>
                  <span className="hidden lg:block ml-auto label">{t.filters[meta.category]}</span>
                </button>
              );
            })}
          </div>

          <ExternalLink href={CONTACT.github} className="mt-8 inline-flex items-center gap-2 label label-ink ulink">
            <i className="fa-brands fa-github" aria-hidden="true" /> {t.github} ↗
          </ExternalLink>
        </div>

        <div className="lg:col-span-7 min-w-0">
          <div className="lg:sticky lg:top-20 flex flex-col gap-4 lg:h-[calc(100svh-6.5rem)]">
            <div data-stage role="img" aria-label={`${t.visualLabel} ${cur.text.title}.`} className="stage flex-1 min-h-[44svh] lg:min-h-0">
              <StageFallback art={ART.projects} />
            </div>

            <article
              id="project-panel"
              role="tabpanel"
              aria-labelledby={`tab-${cur.meta.id}`}
              aria-live="polite"
              className="panel rounded-2xl p-5 sm:p-7 relative"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="label" style={{ color: accent }}>{cur.text.kicker}</span>
                {cur.text.status && <span className="tag !text-ink"><span className="live-dot !w-1.5 !h-1.5" aria-hidden="true" />{cur.text.status}</span>}
                <span className="ml-auto label" aria-hidden="true">{String(idx + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-3 display text-[2.6rem] sm:text-[3.4rem] text-ink">{cur.text.title}</h3>
              {cur.text.role && <p className="mt-1 text-sm text-muted">{cur.text.role}</p>}
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink2 max-w-[68ch]">{cur.text.desc}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
                {cur.text.tech.map((x) => <li key={x} className="tag">{x}</li>)}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {cur.meta.live && (
                  <ExternalLink href={cur.meta.live} className="btn btn-solid btn-sm">
                    {t.visit} <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
                    <span className="sr-only">: {cur.text.title}</span>
                  </ExternalLink>
                )}
                {cur.meta.repo && (
                  <ExternalLink href={cur.meta.repo} className="btn btn-sm">
                    <i className="fa-brands fa-github" aria-hidden="true" /> {t.repo}
                    <span className="sr-only">: {cur.text.title}</span>
                  </ExternalLink>
                )}
                {cur.meta.other && (
                  <ExternalLink href={cur.meta.other.url} className="btn btn-sm">
                    {cur.meta.other.kind === 'course' ? t.course : t.post}
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true" />
                  </ExternalLink>
                )}
                <div className="ml-auto flex gap-2">
                  <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label={t.prev}><i className="fa-solid fa-arrow-left" aria-hidden="true" /></button>
                  <button type="button" className="icon-btn" onClick={() => step(1)} aria-label={t.next}><i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
