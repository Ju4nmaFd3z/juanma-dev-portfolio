import React, { useEffect, useRef, useState } from 'react';
import type { T } from '../translations';
import type { ViewerDoc } from '../types';
import { KIND_COLORS, MILESTONE_META, hex } from '../content';
import { bus } from '../engine/bus';
import { downloadFile } from '../utils/downloadFile';
import { ExternalLink, Rise, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

interface Props {
  t: T['journey'];
  onOpenDocument: (d: ViewerDoc) => void;
}

const KIND_ICON = { edu: 'fa-graduation-cap', cert: 'fa-certificate', work: 'fa-briefcase' } as const;
const KIND_COLOR = { edu: hex(KIND_COLORS.edu), work: hex(KIND_COLORS.work), cert: hex(KIND_COLORS.cert) };
const yearOf = (period: string) => period.match(/\d{4}/)?.[0] ?? '';

// Journey — the route climbs. On one side, one large card per milestone
// (oldest first); on the other, a 3D staircase of pillars where a small pixel
// figure hops to the milestone in view. A rail below the scene shows the whole
// route and jumps to any stop.
const Journey: React.FC<Props> = ({ t, onOpenDocument }) => {
  const ref = useReveal<HTMLElement>();
  const route = [...t.items].reverse();
  const [active, setActive] = useState(0);
  const cards = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number((e.target as HTMLElement).dataset.index);
        setActive(i);
        bus.activeMilestone = i;
      }),
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    cards.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [t]);

  const go = (i: number) => cards.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const cur = route[active];

  return (
    <section ref={ref} id="journey" data-chapter="journey" aria-labelledby="journey-title" className="chapter pt-24 lg:pt-32 pb-16">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <h2 id="journey-title" className="display text-[clamp(3.6rem,8.6vw,9rem)] text-ink">
          <Rise text={t.title1} />
          <Rise text={t.title2} delay={100} />
        </h2>
        <p className="mt-8 lede max-w-[52ch] reveal">{t.intro}</p>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-x-10">
        <div className="lg:col-span-7 lg:order-2 lg:sticky lg:top-16 mt-8 lg:mt-0 h-[48svh] min-h-[320px] lg:h-[calc(100svh-4rem)] flex flex-col">
          <div data-stage role="img" aria-label={`${t.visualLabel} ${cur.short}.`} className="stage flex-1 min-h-0">
            <StageFallback art={ART.journey} />
          </div>

          {/* Route rail */}
          <nav data-calm aria-label={t.title2.replace(/[_.]/g, '')} className="hidden lg:block pb-8">
            <div className="flex items-baseline justify-between mb-4">
              <p className="label">
                <span className="label-ink tabular-nums">{String(active + 1).padStart(2, '0')}</span> / {String(route.length).padStart(2, '0')}
              </p>
              <p className="flex gap-4 label">
                {(['edu', 'work', 'cert'] as const).map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR[k] }} aria-hidden="true" />{t.kinds[k]}</span>
                ))}
              </p>
            </div>
            <ol className="relative flex justify-between">
              <span className="absolute left-0 right-0 top-[7px] h-px bg-lineStrong" aria-hidden="true" />
              <span
                className="absolute left-0 top-[7px] h-px bg-accent origin-left transition-transform duration-700"
                style={{ right: 0, transform: `scaleX(${active / Math.max(1, route.length - 1)})` }}
                aria-hidden="true"
              />
              {route.map((m, i) => (
                <li key={m.id} className="relative">
                  <button type="button" onClick={() => go(i)} aria-current={i === active ? 'step' : undefined} className="group flex flex-col items-center gap-2.5" aria-label={`${yearOf(m.period)} · ${m.short}`}>
                    <span
                      className="block w-[15px] h-[15px] rounded-full border-2 transition-all duration-500"
                      style={{ borderColor: i <= active ? KIND_COLOR[m.kind] : 'var(--line-strong)', background: i === active ? KIND_COLOR[m.kind] : 'var(--bg)', transform: i === active ? 'scale(1.35)' : 'none' }}
                    />
                    <span className={`font-mono text-[11px] tabular-nums transition-colors ${i === active ? 'text-ink' : 'text-muted group-hover:text-ink2'}`}>{yearOf(m.period)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <ol className="lg:col-span-5 lg:order-1">
          {route.map((m, i) => {
            const meta = MILESTONE_META[m.id] ?? {};
            const on = i === active;
            const color = KIND_COLOR[m.kind];
            return (
              <li
                key={m.id}
                ref={(el) => { cards.current[i] = el; }}
                data-index={i}
                className="lg:min-h-[86svh] flex items-center py-10"
                aria-current={on ? 'step' : undefined}
              >
                <article data-calm className={`w-full transition-[opacity,transform] duration-700 ${on ? 'opacity-100' : 'opacity-40 lg:opacity-25 lg:translate-y-4'}`}>
                  <p className="year" style={{ ['--c' as string]: color }} aria-hidden="true">{yearOf(m.period)}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 label">
                    <span style={{ color }}><i className={`fa-solid ${KIND_ICON[m.kind]} mr-2`} aria-hidden="true" />{t.kinds[m.kind]}</span>
                    <span className="label-ink">{m.period}</span>
                  </p>
                  <h3 className="mt-4 display text-[2.1rem] sm:text-[2.7rem] leading-[1.02] text-ink">{m.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-ink2">
                    {m.org}{m.place ? <span className="text-muted"> · {m.place}</span> : null}
                  </p>
                  {m.desc && <p className="mt-4 text-[0.97rem] leading-relaxed text-ink2 max-w-[56ch]">{m.desc}</p>}
                  {m.points && (
                    <ul className="mt-4 space-y-2 text-[0.97rem] leading-relaxed text-ink2 max-w-[58ch]">
                      {m.points.map((p) => (
                        <li key={p} className="flex gap-3"><span className="font-mono" style={{ color }} aria-hidden="true">→</span><span>{p}</span></li>
                      ))}
                    </ul>
                  )}
                  {m.tags && (
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {m.tags.map((x) => <li key={x} className="tag">{x}</li>)}
                    </ul>
                  )}
                  {(meta.cert || meta.linkedin || meta.slides || meta.school) && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {meta.cert && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-solid"
                            onClick={() => onOpenDocument({ title: m.title, sources: [{ id: 'pdf', label: m.title, url: meta.cert!.file, downloadName: meta.cert!.download }] })}
                          >
                            <i className="fa-regular fa-eye" aria-hidden="true" />{t.view}
                          </button>
                          <button type="button" className="btn btn-sm" onClick={() => downloadFile(meta.cert!.file, meta.cert!.download)}>
                            <i className="fa-solid fa-download" aria-hidden="true" />{t.download}
                          </button>
                        </>
                      )}
                      {meta.linkedin && (
                        <ExternalLink href={meta.linkedin} className="btn btn-sm">
                          <i className="fa-brands fa-linkedin" aria-hidden="true" />{t.linkedin}
                        </ExternalLink>
                      )}
                      {meta.slides && (
                        <ExternalLink href={meta.slides} className="btn btn-sm">
                          <i className="fa-solid fa-person-chalkboard" aria-hidden="true" />{t.slides}
                        </ExternalLink>
                      )}
                      {meta.school && (
                        <ExternalLink href={meta.school} className="btn btn-sm">
                          <i className="fa-solid fa-building-columns" aria-hidden="true" />{t.school}
                        </ExternalLink>
                      )}
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 mt-6 display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-ink2 reveal"><em>{t.footer}</em></p>
    </section>
  );
};

export default Journey;
