import React, { useEffect, useRef, useState } from 'react';
import type { T } from '../translations';
import type { ViewerDoc } from '../types';
import { MILESTONE_META } from '../content';
import { bus } from '../engine/bus';
import { downloadFile } from '../utils/downloadFile';
import { ChapterTag, Decode, ExternalLink, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

interface Props {
  t: T['journey'];
  onOpenDocument: (d: ViewerDoc) => void;
}

const KIND_ICON = { edu: 'fa-graduation-cap', cert: 'fa-certificate', work: 'fa-briefcase' } as const;
const KIND_COLOR = { edu: 'var(--teal)', cert: 'var(--accent)', work: 'var(--coral)' } as const;

const Journey: React.FC<Props> = ({ t, onOpenDocument }) => {
  const ref = useReveal<HTMLElement>();
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  // The milestone crossing the middle of the viewport is the "current" one.
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
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [t]);

  return (
    <section ref={ref} id="journey" data-chapter="journey" aria-labelledby="journey-title" className="chapter py-20 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-8">
        <div className="lg:col-span-6 lg:order-2 order-1">
          <div data-stage role="img" aria-label={t.visualLabel} className="stage h-[44svh] min-h-[280px] lg:sticky lg:top-[10vh] lg:h-[80vh]">
            <StageFallback art={ART.journey} />
          </div>
        </div>

        <div className="lg:col-span-6 lg:order-1 order-2 lg:pr-8">
          <ChapterTag n={5} label={t.chapter} />
          <h2 id="journey-title" className="display mt-6 text-[clamp(2.6rem,6vw,5rem)] text-ink">
            <span className="block reveal">{t.title1}</span>
            <Decode text={t.title2} className="block text-accentText reveal" />
          </h2>
          <p className="mt-6 text-lg text-ink2 leading-relaxed max-w-[54ch] reveal">{t.intro}</p>

          <ol className="relative mt-12 ml-3">
            {/* Route line */}
            <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[repeating-linear-gradient(180deg,var(--line-strong)_0_6px,transparent_6px_10px)]" aria-hidden="true" />
            {t.items.map((m, i) => {
              const meta = MILESTONE_META[m.id] ?? {};
              const on = i === active;
              const done = i < active;
              return (
                <li
                  key={m.id}
                  ref={(el) => { items.current[i] = el; }}
                  data-index={i}
                  className="relative pl-8 pb-10 last:pb-0"
                  aria-current={on ? 'step' : undefined}
                >
                  <span
                    className="absolute -left-[7px] top-1.5 w-4 h-4 border-2 transition-colors"
                    style={{ borderColor: on || done ? KIND_COLOR[m.kind] : 'var(--line-strong)', background: on ? KIND_COLOR[m.kind] : 'var(--bg)' }}
                    aria-hidden="true"
                  />
                  <div className={`panel px-frame p-5 sm:p-6 transition-[border-color] ${on ? '!border-lineStrong' : ''}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em]">
                      <span style={{ color: KIND_COLOR[m.kind] }} className={m.kind === 'cert' ? '!text-accentText' : ''}>
                        <i className={`fa-solid ${KIND_ICON[m.kind]} mr-1.5`} aria-hidden="true" />{t.kinds[m.kind]}
                      </span>
                      <span className="text-muted">{m.period}</span>
                    </div>
                    <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold leading-snug text-ink">{m.title}</h3>
                    <p className="mt-1 text-sm text-ink2">
                      {m.org}{m.place ? <span className="text-muted"> · {m.place}</span> : null}
                    </p>
                    {m.desc && <p className="mt-3 text-[0.95rem] leading-relaxed text-ink2">{m.desc}</p>}
                    {m.points && (
                      <ul className="mt-3 space-y-1.5 text-[0.95rem] leading-relaxed text-ink2">
                        {m.points.map((p) => (
                          <li key={p} className="flex gap-2"><span className="text-accentText font-mono" aria-hidden="true">›</span><span>{p}</span></li>
                        ))}
                      </ul>
                    )}
                    {m.tags && (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {m.tags.map((x) => <li key={x} className="chip !py-0.5 !text-[0.7rem]">{x}</li>)}
                      </ul>
                    )}
                    {(meta.cert || meta.linkedin || meta.slides || meta.school) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {meta.cert && (
                          <>
                            <button
                              type="button"
                              className="btn !min-h-[40px] !py-1.5 !text-[11px]"
                              onClick={() => onOpenDocument({ title: m.title, sources: [{ id: 'pdf', label: m.title, url: meta.cert!.file, downloadName: meta.cert!.download }] })}
                            >
                              <i className="fa-solid fa-eye" aria-hidden="true" />{t.view}
                            </button>
                            <button type="button" className="btn btn-ghost !min-h-[40px] !py-1.5 !text-[11px]" onClick={() => downloadFile(meta.cert!.file, meta.cert!.download)}>
                              <i className="fa-solid fa-download" aria-hidden="true" />{t.download}
                            </button>
                          </>
                        )}
                        {meta.linkedin && (
                          <ExternalLink href={meta.linkedin} className="btn btn-ghost !min-h-[40px] !py-1.5 !text-[11px]">
                            <i className="fa-brands fa-linkedin" aria-hidden="true" />{t.linkedin}
                          </ExternalLink>
                        )}
                        {meta.slides && (
                          <ExternalLink href={meta.slides} className="btn btn-ghost !min-h-[40px] !py-1.5 !text-[11px]">
                            <i className="fa-solid fa-person-chalkboard" aria-hidden="true" />{t.slides}
                          </ExternalLink>
                        )}
                        {meta.school && (
                          <ExternalLink href={meta.school} className="btn btn-ghost !min-h-[40px] !py-1.5 !text-[11px]">
                            <i className="fa-solid fa-building-columns" aria-hidden="true" />{t.school}
                          </ExternalLink>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-10 eyebrow reveal">{t.footer}</p>
        </div>
      </div>
    </section>
  );
};

export default Journey;
