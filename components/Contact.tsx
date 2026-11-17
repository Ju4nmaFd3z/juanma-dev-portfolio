import React, { useRef, useState } from 'react';
import type { T } from '../translations';
import { CONTACT } from '../content';
import { AsciiArt, ExternalLink, Rise, useReveal } from './ui';

interface Props {
  t: T['contact'];
  /** WebGL is unavailable: play the piece with ASCII Magic's own 2D player. */
  flat: boolean;
}

type Field = 'name' | 'email' | 'message';
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// Strip control characters (except newlines/tabs) before building the mailto URL.
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

const Contact: React.FC<Props> = ({ t, flat }) => {
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
    <button type="button" onClick={() => copy(text, id)} className="icon-btn shrink-0" aria-label={`${t.copy}: ${label}`}>
      <i className={`fa-solid ${copied === id ? 'fa-check' : copied === `fail-${id}` ? 'fa-xmark' : 'fa-copy'}`} aria-hidden="true" />
    </button>
  );

  const errCount = Object.values(errors).filter(Boolean).length;

  const errText = 'mt-1.5 text-sm text-[#e5484d]';

  return (
    <section ref={ref} id="contact" data-chapter="contact" aria-labelledby="contact-title" className="chapter relative pb-24">
      <div data-stage role="img" aria-label={t.visualLabel} className="stage absolute top-0 inset-x-0 h-[100svh] min-h-[640px]">
        {flat && (
          <div className="flat-plate justify-center" aria-hidden="true">
            <AsciiArt piece="cliff-village-sea" size={6} label={t.visualLabel} />
          </div>
        )}
      </div>

      <div className="relative max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 min-h-[100svh] flex flex-col justify-end pt-28 pb-16">
        <h2 id="contact-title" data-calm className="w-fit display text-[clamp(3.8rem,11.5vw,12rem)] text-ink">
          <Rise text={t.title1} />
          <Rise text={t.title2} delay={100} className="sm:pl-[0.8em]" />
        </h2>
        <div data-calm className="mt-8 w-fit max-w-full reveal">
          <p className="lede max-w-[40ch]">{t.subtitle}</p>
          <div className="mt-5 flex items-center gap-3 min-w-0">
            <a href={`mailto:${CONTACT.email}`} className="display text-[clamp(1.8rem,4vw,3.4rem)] leading-none text-ink break-all ulink hover:text-accentText transition-colors">{CONTACT.email}</a>
            {copyBtn(CONTACT.email, 'email', t.email)}
          </div>
        </div>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-x-10 gap-y-10">
        <ul className="lg:col-span-4 border-t border-lineStrong self-start reveal">
          <li className="flex items-center gap-3 py-4 border-b border-line">
            <span className="label w-24 shrink-0">{t.phone}</span>
            <a href={CONTACT.phoneHref} className="flex-1 text-ink ulink whitespace-nowrap">{CONTACT.phoneDisplay}</a>
            <ExternalLink href={CONTACT.whatsapp} className="icon-btn" aria-label={t.whatsapp}>
              <i className="fa-brands fa-whatsapp" aria-hidden="true" />
            </ExternalLink>
            {copyBtn('+34643718054', 'tel', t.phone)}
          </li>
          <li className="flex items-center gap-3 py-4 border-b border-line">
            <span className="label w-24 shrink-0">LinkedIn</span>
            <ExternalLink href={CONTACT.linkedin} className="flex-1 text-ink ulink">Juanma Fernández ↗</ExternalLink>
          </li>
          <li className="flex items-center gap-3 py-4 border-b border-line">
            <span className="label w-24 shrink-0">GitHub</span>
            <ExternalLink href={CONTACT.github} className="flex-1 text-ink ulink">Ju4nmaFd3z ↗</ExternalLink>
          </li>
        </ul>

        <div className="lg:col-span-8 panel rounded-2xl p-5 sm:p-8 reveal">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="display text-[2.4rem] text-ink">{f.title}</h3>
            <p className="caption max-w-[44ch]">{f.note}</p>
          </div>

          {status === 'done' ? (
            <div className="mt-6 grid sm:grid-cols-[auto_1fr] gap-6 items-center" role="status">
              <div className="overflow-hidden rounded-xl border border-line p-2 flex justify-center">
                <AsciiArt piece="paper-plane-loop" size={5} label={f.doneArt} />
              </div>
              <div>
                <p className="text-ink2 leading-relaxed">
                  {f.done} <a href={`mailto:${CONTACT.email}`} className="text-ink ulink">{CONTACT.email}</a>.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-sm" onClick={() => copy(CONTACT.email, 'email2')}>
                    <i className={`fa-solid ${copied === 'email2' ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />
                    {copied === 'email2' ? t.copied : t.copy}
                  </button>
                  <button type="button" className="btn btn-sm" onClick={() => { setStatus('idle'); setValues({ name: '', email: '', message: '' }); }}>
                    {f.again}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-4 grid gap-6" onSubmit={submit} noValidate>
              <p className="sr-only" aria-live="assertive">{errCount ? f.errors.summary : ''}</p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cf-name" className="block label label-ink mb-1">{f.name}</label>
                  <input
                    id="cf-name" ref={(el) => { inputs.current.name = el; }} type="text" autoComplete="name" maxLength={80}
                    value={values.name} onChange={onChange('name')} onBlur={onBlur('name')} placeholder={f.placeholderName}
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} className="field" required
                  />
                  {errors.name && <p id="cf-name-err" className={errText}>{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="cf-email" className="block label label-ink mb-1">{f.email}</label>
                  <input
                    id="cf-email" ref={(el) => { inputs.current.email = el; }} type="email" autoComplete="email" inputMode="email" maxLength={254}
                    value={values.email} onChange={onChange('email')} onBlur={onBlur('email')} placeholder={f.placeholderEmail}
                    aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} className="field" required
                  />
                  {errors.email && <p id="cf-email-err" className={errText}>{errors.email}</p>}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline">
                  <label htmlFor="cf-msg" className="block label label-ink mb-1">{f.message}</label>
                  <span className="label tabular-nums" aria-hidden="true">{values.message.length}/2000</span>
                </div>
                <textarea
                  id="cf-msg" ref={(el) => { inputs.current.message = el; }} rows={4} maxLength={2000}
                  value={values.message} onChange={onChange('message')} onBlur={onBlur('message')} placeholder={f.placeholderMsg}
                  aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-msg-err' : undefined} className="field" required
                />
                {errors.message && <p id="cf-msg-err" className={errText}>{errors.message}</p>}
              </div>
              <div>
                <button type="submit" className="btn btn-accent" disabled={status === 'opening'}>
                  {status === 'opening' ? f.opening : f.submit}
                  <i className={`fa-solid ${status === 'opening' ? 'fa-spinner fa-spin' : 'fa-arrow-right arrow'}`} aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
