import React from 'react';
import type { T } from '../translations';
import { Rich, Rise, useReveal } from './ui';

interface Props { t: T['about']; flat: boolean }

// About — the author, printed in dots, and three numbers.
const About: React.FC<Props> = ({ t, flat }) => {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="about" data-chapter="about" aria-labelledby="about-title" className="chapter py-24 lg:py-32">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-x-10 gap-y-10 items-center">
        <div className="lg:col-span-5">
          <div data-stage role="img" aria-label={t.visualLabel} className="stage h-[62svh] min-h-[360px] lg:h-[calc(100svh-7rem)]">
            {flat && <img src="/images/me.webp" alt="" className="absolute inset-0 m-auto h-full w-auto object-contain object-bottom opacity-90" />}
          </div>
        </div>

        <div className="lg:col-span-7 lg:pl-6 xl:pl-12">
          <h2 id="about-title" className="display text-[clamp(3.6rem,8.6vw,9rem)] text-ink">
            <Rise text={t.title1} />
            <Rise text={t.title2} delay={100} />
          </h2>

          <Rich text={t.text} className="mt-10 max-w-[30ch] font-display text-[1.8rem] sm:text-[2.3rem] leading-[1.14] text-ink2 reveal" />

          <dl className="mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-[44rem] reveal" style={{ ['--d' as string]: '120ms' }}>
            {t.stats.map((s) => (
              <div key={s.label} className="border-t border-lineStrong pt-4 flex flex-col-reverse justify-end">
                <dt className="mt-3 label">{s.label}</dt>
                <dd className="display text-[clamp(2.1rem,5vw,4.4rem)] leading-none text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default About;
