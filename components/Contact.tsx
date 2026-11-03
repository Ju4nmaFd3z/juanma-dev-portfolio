import React, { useRef, useState } from 'react';
import type { T } from '../translations';
import { CONTACT } from '../content';
import { firePulse } from '../engine/bus';
import { ChapterTag, Decode, ExternalLink, StageFallback, useReveal } from './ui';
import { ART } from './fallbackArt';

interface Props {
  t: T['contact'];
  onOpenCv: () => void;
  cvLabel: string;
}

type Field = 'name' | 'email' | 'message';
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// Strip control characters (except newlines/tabs) before building the mailto URL.
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

const Contact: React.FC<Props> = ({ t, onOpenCv, cvLabel }) => {
  const ref = useReveal<HTMLElement>();
  const f = t.form;
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<'idle' | 'opening' | 'done'>('idle');
  const [copied, setCopied] = useState<string | null>(null);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const validate = (v: Record<Field, string>) => {
    const e: Partial<Record<Field, string>> = {};
    const name = clean(v.name), email = clean(v.email), msg = clean(v.message);
    if (name.length < 2 || name.length > 80) e.name = f.errors.name;
    if (!EMAIL_RE.test(email) || email.length > 254) e.email = f.errors.email;
    if (msg.length < 10 || msg.length > 2000) e.message = f.errors.message;
    return e;
  };

  const onChange = (k: Field) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [k]: ev.target.value };
    setValues(next);
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
  };
  const onBlur = (k: Field) => () => {
    if (values[k]) setErrors((prev) => ({ ...prev, [k]: validate(values)[k] }));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(values);
    setErrors(e);
    const first = (['name', 'email', 'message'] as Field[]).find((k) => e[k]);
    if (first) { inputs.current[first]?.focus(); return; }

    const name = clean(values.name), email = clean(values.email), msg = clean(values.message);
    const subject = `${f.subject} — ${name}`;
    const body = `${f.greeting}\n\n${msg}\n\n— ${name}\n${f.signature} ${email}`;
    setStatus('opening');
    firePulse();
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.setTimeout(() => setStatus('done'), 700);
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      setCopied(`fail-${id}`);
    }
    window.setTimeout(() => setCopied(null), 1800);
  };

  const copyBtn = (text: string, id: string, label: string) => (
    <button type="button" onClick={() => copy(text, id)} className="icon-btn !w-10 !h-10 shrink-0" aria-label={`${t.copy}: ${label}`}>
      <i className={`fa-solid ${copied === id ? 'fa-check' : copied === `fail-${id}` ? 'fa-xmark' : 'fa-copy'}`} aria-hidden="true" />
    </button>
  );

  const errCount = Object.values(errors).filter(Boolean).length;

  return (
    <section ref={ref} id="contact" data-chapter="contact" aria-labelledby="contact-title" className="chapter pt-20 lg:pt-32 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-10">
        <div className="lg:col-span-5">
          <ChapterTag n={6} label={t.chapter} />
          <h2 id="contact-title" className="display mt-6 text-[clamp(2.6rem,6vw,5rem)] text-ink">
            <span className="block reveal">{t.title1}</span>
            <Decode text={t.title2} className="block text-accentText reveal" />
          </h2>
          <p className="mt-6 text-lg text-ink2 leading-relaxed max-w-[48ch] reveal">{t.subtitle}</p>

          <h3 className="eyebrow mt-10 mb-3 reveal">{t.channels}</h3>
          <ul className="border-t border-lineStrong reveal">
            <li className="flex items-center gap-3 py-3 border-b border-lineStrong">
              <i className="fa-solid fa-envelope w-5 text-accentText" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{t.email}</p>
                <a href={`mailto:${CONTACT.email}`} className="text-ink break-all link-u">{CONTACT.email}</a>
              </div>
              {copyBtn(CONTACT.email, 'email', t.email)}
            </li>
            <li className="flex items-center gap-3 py-3 border-b border-lineStrong">
              <i className="fa-solid fa-phone w-5 text-accentText" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{t.phone}</p>
                <a href={CONTACT.phoneHref} className="text-ink link-u">{CONTACT.phoneDisplay}</a>
              </div>
              <ExternalLink href={CONTACT.whatsapp} className="icon-btn !w-10 !h-10" aria-label={t.whatsapp}>
                <i className="fa-brands fa-whatsapp" aria-hidden="true" />
              </ExternalLink>
              {copyBtn('+34643718054', 'tel', t.phone)}
            </li>
            <li className="flex items-center gap-3 py-3 border-b border-lineStrong">
              <i className="fa-solid fa-location-dot w-5 text-accentText" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{t.location}</p>
                <p className="text-ink">{t.place}</p>
              </div>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2 reveal">
            <ExternalLink href={CONTACT.linkedin} className="btn"><i className="fa-brands fa-linkedin-in" aria-hidden="true" />LinkedIn</ExternalLink>
            <ExternalLink href={CONTACT.github} className="btn"><i className="fa-brands fa-github" aria-hidden="true" />GitHub</ExternalLink>
            <button type="button" onClick={onOpenCv} className="btn btn-ghost"><i className="fa-solid fa-file-lines" aria-hidden="true" />{cvLabel}</button>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div data-stage role="img" aria-label={t.visualLabel} className="stage h-[40svh] min-h-[260px] lg:h-[54vh] order-first lg:order-none">
            <StageFallback art={ART.contact} />
          </div>

          <div className="panel px-frame p-5 sm:p-8 reveal">
            <h3 className="font-display text-2xl font-semibold text-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.note}</p>

            {status === 'done' ? (
              <div className="mt-6" role="status">
                <p className="text-ink2 leading-relaxed">
                  <i className="fa-solid fa-paper-plane text-accentText mr-2" aria-hidden="true" />
                  {f.done} <a href={`mailto:${CONTACT.email}`} className="text-ink link-u">{CONTACT.email}</a>.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" className="btn" onClick={() => copy(CONTACT.email, 'email2')}>
                    <i className={`fa-solid ${copied === 'email2' ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />
                    {copied === 'email2' ? t.copied : t.copy}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setStatus('idle'); setValues({ name: '', email: '', message: '' }); }}>
                    {f.again}
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-6 grid gap-5" onSubmit={submit} noValidate>
                <p className="sr-only" aria-live="assertive">{errCount ? f.errors.summary : ''}</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="cf-name" className="block font-mono text-[11px] uppercase tracking-wider text-ink2 mb-2">{f.name}</label>
                    <input
                      id="cf-name" ref={(el) => { inputs.current.name = el; }} type="text" autoComplete="name" maxLength={80}
                      value={values.name} onChange={onChange('name')} onBlur={onBlur('name')} placeholder={f.placeholderName}
                      aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} className="field" required
                    />
                    {errors.name && <p id="cf-name-err" className="mt-1.5 text-sm text-coral">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="cf-email" className="block font-mono text-[11px] uppercase tracking-wider text-ink2 mb-2">{f.email}</label>
                    <input
                      id="cf-email" ref={(el) => { inputs.current.email = el; }} type="email" autoComplete="email" inputMode="email" maxLength={254}
                      value={values.email} onChange={onChange('email')} onBlur={onBlur('email')} placeholder={f.placeholderEmail}
                      aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} className="field" required
                    />
                    {errors.email && <p id="cf-email-err" className="mt-1.5 text-sm text-coral">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label htmlFor="cf-msg" className="block font-mono text-[11px] uppercase tracking-wider text-ink2">{f.message}</label>
                    <span className="font-mono text-[11px] text-muted tabular-nums" aria-hidden="true">{values.message.length}/2000</span>
                  </div>
                  <textarea
                    id="cf-msg" ref={(el) => { inputs.current.message = el; }} rows={5} maxLength={2000}
                    value={values.message} onChange={onChange('message')} onBlur={onBlur('message')} placeholder={f.placeholderMsg}
                    aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-msg-err' : undefined} className="field resize-y min-h-[140px]" required
                  />
                  {errors.message && <p id="cf-msg-err" className="mt-1.5 text-sm text-coral">{errors.message}</p>}
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={status === 'opening'}>
                    {status === 'opening' ? f.opening : f.submit}
                    <i className={`fa-solid ${status === 'opening' ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
