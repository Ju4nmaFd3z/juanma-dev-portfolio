import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { translations, type Lang } from '../translations.js';
import { intentOf, localAnswer } from '../assistant/local.js';
import { CONTACT, MILESTONE_META, PROJECTS } from '../content.js';
import type { ProjectId } from '../engine/bus.js';
import { Rich as Title } from './ui';

// The portfolio assistant. Streams answers from /api/chat (free AI providers
// only, see api/chat.ts) and, whenever that is unavailable — no keys, out of
// quota, offline, local dev — answers from the portfolio's own data instead,
// so it always works and never costs anything.
//
// Answers come alive: a project named in a reply brings its card (site, code,
// "see in portfolio"), talk of contact brings the contact buttons, the résumé
// brings a button that opens it, and every reply ends with follow-up questions.

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  via?: 'ai' | 'local';
  streaming?: boolean;
}

const STORE = 'assistant:v2';
const MAX_INPUT = 600;
const HISTORY = 8;

const load = (): Msg[] => {
  try {
    const raw = sessionStorage.getItem(STORE);
    const list = raw ? (JSON.parse(raw) as Msg[]) : [];
    return Array.isArray(list) ? list.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string').map((m) => ({ ...m, streaming: false })) : [];
  } catch { return []; }
};

// ── Links: only to places that are actually on the portfolio ─────────────────
// Whatever a model writes, a link is only clickable when it points to the site,
// Juanma's profiles or a project; anything else stays plain text.
const ALLOWED_HOSTS = new Set(
  [
    'juanma-dev-portfolio.vercel.app', 'wa.me', CONTACT.github, CONTACT.linkedin, CONTACT.school,
    ...PROJECTS.flatMap((p) => [p.live, p.repo, p.other?.url]),
    ...Object.values(MILESTONE_META).flatMap((m) => [m.linkedin, m.slides]),
  ].filter((u): u is string => !!u).map((u) => { try { return new URL(u.includes('://') ? u : `https://${u}`).host.replace(/^www\./, ''); } catch { return ''; } }),
);
const safeHref = (href: string): string | null => {
  if (href.startsWith('/') && !href.startsWith('//')) return /^\/[\w./-]+$/.test(href) ? href : null;
  if (href === `mailto:${CONTACT.email}`) return href;
  try {
    const u = new URL(href);
    return u.protocol === 'https:' && ALLOWED_HOSTS.has(u.host.replace(/^www\./, '')) ? u.href : null;
  } catch { return null; }
};

// ── Safe rich text: **bold**, "- " lists and links, built as React nodes ──────
const TOKEN = /(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\)|https?:\/\/[^\s<>()]+|\/[\w-]+\.pdf|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** A link as people read it: no scheme, no www, accents decoded. */
const pretty = (s: string) => {
  const bare = s.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  try { return decodeURIComponent(bare); } catch { return bare; }
};

function inline(text: string, key: string): React.ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    const k = `${key}-${i}`;
    if (/^\*\*.+\*\*$/.test(part)) return <strong key={k} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    const md = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    let raw: string | null = null, label = part, trail = '';
    if (md) { label = md[1]; raw = md[2]; }
    else if (/^https?:\/\//.test(part) || /^\/[\w-]+\.pdf$/.test(part)) {
      const m = part.match(/^(.*?)([.,;:!?]+)?$/)!; // keep sentence punctuation out of the link
      raw = m[1]; label = m[1]; trail = m[2] ?? '';
    } else if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(part)) { const m = part.match(/^(.*?)(\.)?$/)!; raw = `mailto:${m[1]}`; label = m[1]; trail = m[2] ?? ''; }
    const href = raw ? safeHref(raw) : null;
    if (!href) return <React.Fragment key={k}>{md ? label : part}</React.Fragment>;
    const external = /^https:\/\//.test(href);
    return (
      <React.Fragment key={k}>
        <a href={href} className="text-accentText underline decoration-1 underline-offset-[3px] [overflow-wrap:anywhere]" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {pretty(label)}
        </a>{trail}
      </React.Fragment>
    );
  });
}

const Rich: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (i: number) => {
    if (!bullets.length) return;
    blocks.push(<ul key={`u${i}`} className="space-y-1.5">{bullets.map((b, j) => <li key={j} className="flex gap-2.5"><span className="mt-[0.6em] w-1 h-1 shrink-0 rounded-full bg-accent" aria-hidden="true" /><span className="min-w-0">{inline(b, `b${i}-${j}`)}</span></li>)}</ul>);
    bullets = [];
  };
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) { bullets.push(bullet[1]); return; }
    flush(i);
    if (line) blocks.push(<p key={`p${i}`}>{inline(line.replace(/^#+\s*/, ''), `p${i}`)}</p>);
  });
  flush(-1);
  return <div className="space-y-2.5">{blocks}</div>;
};

/** The assistant's face: a friendly line-drawn robot that blinks now and then. */
const Robot: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <line x1="12" y1="2.6" x2="12" y2="5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="2.4" r="1.35" fill="currentColor" />
    <rect x="4.2" y="5.6" width="15.6" height="13.4" rx="4.4" stroke="currentColor" strokeWidth="1.7" />
    <rect x="1.4" y="10" width="2" height="5" rx="1" fill="currentColor" />
    <rect x="20.6" y="10" width="2" height="5" rx="1" fill="currentColor" />
    <g className="robot-eyes">
      <circle cx="9.1" cy="11.4" r="1.55" fill="currentColor" />
      <circle cx="14.9" cy="11.4" r="1.55" fill="currentColor" />
    </g>
    <path d="M9.4 15.3c.8.7 1.7 1 2.6 1s1.8-.3 2.6-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);


const Avatar: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <span className={`grid place-items-center shrink-0 bg-accent text-onAccent ${size === 'sm' ? 'w-7 h-7 rounded-md' : 'w-12 h-12 rounded-xl shadow-[0_10px_30px_-10px_rgba(255,138,58,0.7)]'}`}>
    <Robot size={size === 'sm' ? 17 : 28} />
  </span>
);

/** The header's living backdrop: a field of halftone dots rolling in waves. */
const HalftoneBanner: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    const fit = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    };
    const draw = (now: number) => {
      const t = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const P = 8;
      for (let y = P / 2; y < h; y += P) for (let x = P / 2; x < w; x += P) {
        const wave = 0.5 + 0.5 * Math.sin(x * 0.045 - t * 1.1 + Math.sin(y * 0.09 + t * 0.7) * 1.6);
        const fade = (0.5 + 0.5 * (1 - y / h)) * (0.3 + 0.7 * (x / w));
        const r = P * 0.48 * wave * fade;
        if (r < 0.35) continue;
        ctx.fillStyle = `rgba(255,${Math.round(110 + 60 * wave)},58,${0.25 + 0.6 * wave * fade})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    fit();
    const ro = new ResizeObserver(() => { fit(); if (still) draw(0); });
    ro.observe(cv);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
};

const FAQ_ICONS = ['fa-graduation-cap', 'fa-layer-group', 'fa-code', 'fa-briefcase', 'fa-heart'];

type Lbl = (typeof translations)['es']['ai'];

/** What a reply talks about, so the right cards and buttons can follow it. */
function attachmentsFor(text: string, question: string, lang: Lang) {
  const items = translations[lang].projects.items;
  const low = text.toLowerCase();
  const projects = items.filter((p) => low.includes(p.title.toLowerCase())).map((p) => p.id);
  const intent = intentOf(question);
  const contact = intent === 'contact' || intent === 'hire' || low.includes(CONTACT.email);
  const cv = intent === 'cv' || /curr[ií]culum|\bcv\b|r[ée]sum[ée]/i.test(text);
  return { projects, contact, cv };
}

const ProjectCard: React.FC<{ id: ProjectId; lang: Lang; a: Lbl['actions']; onShow: (id: ProjectId) => void; compact?: boolean }> = ({ id, lang, a, onShow, compact }) => {
  const p = translations[lang].projects.items.find((x) => x.id === id)!;
  const m = PROJECTS.find((x) => x.id === id)!;
  return (
    <article className={`flex flex-col rounded-lg border border-line bg-bg2 ${compact ? 'w-[15.5rem] shrink-0 snap-start p-3.5' : 'p-4'}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accentText truncate">{p.kicker}</p>
      <h4 className="mt-1.5 font-display text-[1.45rem] leading-none text-ink">{p.title}</h4>
      {!compact && <p className="mt-2 text-[13px] leading-relaxed text-ink2 line-clamp-3">{p.desc}</p>}
      <p className="mt-2.5 flex flex-wrap gap-1">
        {p.tech.slice(0, compact ? 2 : 4).map((x) => <span key={x} className="px-1.5 py-0.5 rounded-sm border border-line text-[10.5px] font-mono text-muted">{x}</span>)}
      </p>
      <div className="mt-3.5 pt-3 border-t border-line flex flex-wrap gap-1.5">
        {m.live && <a href={m.live} target="_blank" rel="noopener noreferrer" className="assistant-action assistant-action-solid">{a.visit}<i className="fa-solid fa-arrow-up-right-from-square text-[9px]" aria-hidden="true" /></a>}
        {m.repo && <a href={m.repo} target="_blank" rel="noopener noreferrer" className="assistant-action"><i className="fa-brands fa-github" aria-hidden="true" />{a.code}</a>}
        <button type="button" onClick={() => onShow(id)} className="assistant-action">{a.inPortfolio}</button>
      </div>
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Assistant: React.FC<{ lang: Lang; onOpenCv: () => void }> = ({ lang, onOpenCv }) => {
  const t = translations[lang].ai;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(load);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const nextId = useRef(messages.reduce((n, m) => Math.max(n, m.id + 1), 1));
  const abort = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const via = [...messages].reverse().find((m) => m.via)?.via;

  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(messages.filter((m) => !m.streaming).slice(-40))); } catch { /* storage blocked */ }
  }, [messages]);

  // open / close: focus in, Esc out, focus back to the launcher
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => field.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(id); window.removeEventListener('keydown', onKey); launcher.current?.focus({ preventScroll: true }); };
  }, [open]);

  useEffect(() => () => abort.current?.abort(), []);

  // follow the conversation unless the visitor has scrolled up to read
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // the textarea grows with its content, up to five lines
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input, open]);

  const patch = (id: number, fn: (m: Msg) => Msg) => setMessages((list) => list.map((m) => (m.id === id ? fn(m) : m)));

  const ask = useCallback(async (question: string) => {
    const q = question.trim().slice(0, MAX_INPUT);
    if (!q || busy) return;
    const user: Msg = { id: nextId.current++, role: 'user', text: q };
    const reply: Msg = { id: nextId.current++, role: 'assistant', text: '', streaming: true };
    const history = [...messages, user].filter((m) => m.text).slice(-HISTORY).map((m) => ({ role: m.role, content: m.text.slice(0, MAX_INPUT) }));
    setMessages((list) => [...list, user, reply]);
    setInput('');
    setBusy(true);
    stick.current = true;

    const fallback = () => new Promise<void>((done) => window.setTimeout(() => {
      patch(reply.id, (m) => ({ ...m, text: localAnswer(q, lang), via: 'local', streaming: false }));
      done();
    }, 280));

    const controller = new AbortController();
    abort.current = controller;
    let got = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang, messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body || !(res.headers.get('content-type') ?? '').startsWith('text/plain')) await fallback();
      else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          got += decoder.decode(value, { stream: true });
          const text = got;
          patch(reply.id, (m) => ({ ...m, text, via: 'ai' }));
        }
        if (got.trim()) patch(reply.id, (m) => ({ ...m, streaming: false }));
        else await fallback();
      }
    } catch {
      if (controller.signal.aborted) patch(reply.id, (m) => ({ ...m, text: got || '…', streaming: false, via: m.via ?? 'ai' }));
      else if (got.trim()) patch(reply.id, (m) => ({ ...m, streaming: false }));
      else await fallback();
    } finally {
      abort.current = null;
      setBusy(false);
    }
  }, [busy, lang, messages]);

  const submit = (e?: React.FormEvent) => { e?.preventDefault(); void ask(input); };
  const reset = () => { abort.current?.abort(); setMessages([]); setInput(''); field.current?.focus(); };
  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(null), 1500); } catch { /* clipboard blocked */ }
  };
  const showProject = (id: ProjectId) => {
    window.dispatchEvent(new CustomEvent('portfolio:project', { detail: id }));
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
  };
  const openCv = () => { setOpen(false); onOpenCv(); };

  const started = messages.some((m) => m.role === 'user');
  const lastReply = [...messages].reverse().find((m) => m.role === 'assistant');
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.text.toLowerCase()));

  const followUps = (question: string, reply: string) => {
    // what the reply showed beats what the question seemed to ask
    const att = attachmentsFor(reply, question, lang);
    const topic = att.projects.length ? 'projects' : att.contact ? 'contact' : intentOf(question) ?? 'general';
    const pool = t.followUps[topic as keyof typeof t.followUps] ?? t.followUps.general;
    return [...pool, ...t.followUps.general].filter((x, i, all) => all.indexOf(x) === i && !asked.has(x.toLowerCase())).slice(0, 3);
  };

  return (
    <>
      {/* Launcher. The label shows on hover and on keyboard focus only, so it
          never sticks after a click returns focus to the button. */}
      <div className={`fixed z-[9000] bottom-4 right-4 sm:bottom-6 sm:right-6 group transition-[opacity,transform] duration-300 ${open ? 'opacity-0 pointer-events-none translate-y-2' : ''}`}>
        <span className="hidden sm:block absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-lineStrong bg-bg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-has-[:focus-visible]:opacity-100 group-has-[:focus-visible]:translate-x-0 transition-all duration-300 pointer-events-none" aria-hidden="true">
          {t.launcher}
        </span>
        <button
          ref={launcher}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.open}
          aria-expanded={open}
          aria-controls="assistant"
          className="relative grid place-items-center w-14 h-14 rounded-full bg-accent text-onAccent shadow-[0_16px_36px_-12px_rgba(255,138,58,0.6)] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95"
        >
          <Robot size={28} />
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#3fd18a] border-[2.5px] border-bg" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <section
          id="assistant"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          className="assistant-panel fixed z-[10100] inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[min(720px,calc(100dvh-3rem))] flex flex-col bg-bg sm:rounded-xl sm:border border-lineStrong overflow-hidden shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,138,58,0.06)]"
        >
          {/* header: a living halftone banner */}
          <header className="relative shrink-0 h-[112px] border-b border-line overflow-hidden">
            <HalftoneBanner />
            <div className="assistant-banner-fade absolute inset-0" aria-hidden="true" />
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 pt-[env(safe-area-inset-top)]">
              {started && (
                <button type="button" onClick={reset} className="w-9 h-9 rounded-md grid place-items-center assistant-glass text-ink2 hover:text-ink" aria-label={t.reset} title={t.reset}>
                  <i className="fa-solid fa-rotate-left text-[13px]" aria-hidden="true" />
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="w-9 h-9 rounded-md grid place-items-center assistant-glass text-ink2 hover:text-ink" aria-label={t.close} title={t.close}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div className="absolute left-4 right-4 bottom-3.5 flex items-end gap-3.5">
              <Avatar size="lg" />
              <div className="min-w-0 pb-0.5">
                <h2 id="assistant-title" className="font-display text-[1.75rem] leading-none text-ink truncate">{t.title}</h2>
                <p className="mt-1.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  {/* the dot's ping ring reaches 4px past it: keep the clipping on the text only */}
                  <span className={`live-dot !w-1.5 !h-1.5 ${via === 'local' ? '!bg-gold after:!border-gold' : ''}`} aria-hidden="true" />
                  <span className="min-w-0 truncate">{via === 'local' ? t.statusLocal : t.statusAi}</span>
                </p>
              </div>
            </div>
          </header>

          <div
            ref={scroller}
            onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40; }}
            className="assistant-scroll flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-5 py-6 space-y-6 text-[14.5px] leading-[1.65]"
            aria-live="polite"
            aria-busy={busy}
          >
            {!started ? (
              <div className="assistant-rise">
                <Title as="p" text={t.welcomeTitle} className="font-display text-[2.1rem] leading-[1.02] text-ink" />
                <p className="mt-3 text-[14px] leading-relaxed text-ink2">{t.welcomeText}</p>
                <p className="label mt-7 mb-2.5">{t.faqTitle}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {t.suggestions.map((s, i) => (
                    <li key={s} className={i === t.suggestions.length - 1 && t.suggestions.length % 2 ? 'col-span-2' : ''}>
                      <button type="button" onClick={() => ask(s)} className="group/faq w-full h-full flex flex-col items-start gap-2.5 text-left p-3 rounded-md border border-line bg-bg2 hover:border-accent hover:bg-[color-mix(in_srgb,var(--accent)_7%,var(--bg-2))] transition-colors">
                        <i className={`fa-solid ${FAQ_ICONS[i % FAQ_ICONS.length]} text-[13px] text-accentText`} aria-hidden="true" />
                        <span className="text-[13px] leading-snug text-ink2 group-hover/faq:text-ink">{s}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : messages.map((m, idx) => {
              if (m.role === 'user') return (
                <div key={m.id} className="flex justify-end pl-12 assistant-rise">
                  <p className="max-w-full rounded-lg rounded-br-sm bg-accent text-onAccent px-3.5 py-2.5 whitespace-pre-wrap [overflow-wrap:anywhere]">
                    <span className="sr-only">{t.you}: </span>{m.text}
                  </p>
                </div>
              );
              const question = messages.slice(0, idx).reverse().find((x) => x.role === 'user')?.text ?? '';
              const att = !m.streaming && m.text ? attachmentsFor(m.text, question, lang) : null;
              const isLast = m === lastReply;
              return (
                <div key={m.id} className="group flex gap-3 assistant-rise">
                  <Avatar />
                  <div className="min-w-0 flex-1 pt-0.5">
                    {m.text ? (
                      <div className="text-ink2 [overflow-wrap:anywhere]">
                        <Rich text={m.text} />
                        {m.streaming && <span className="caret-blink text-accent" aria-hidden="true">▍</span>}
                      </div>
                    ) : (
                      <p className="flex items-center gap-2.5 h-7 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                        <span className="assistant-dots" aria-hidden="true"><i /><i /><i /></span>{t.thinking}
                      </p>
                    )}

                    {att && att.projects.length === 1 && <div className="mt-3.5"><ProjectCard id={att.projects[0]} lang={lang} a={t.actions} onShow={showProject} /></div>}
                    {att && att.projects.length > 1 && (
                      <div className="mt-3.5 -mr-5 pr-5 flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                        {att.projects.map((id) => <ProjectCard key={id} id={id} lang={lang} a={t.actions} onShow={showProject} compact />)}
                      </div>
                    )}
                    {att && (att.contact || att.cv) && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {att.contact && (
                          <>
                            <a href={`mailto:${CONTACT.email}`} className="assistant-action assistant-action-solid"><i className="fa-regular fa-envelope" aria-hidden="true" />{t.actions.email}</a>
                            <button type="button" onClick={() => copy(`mail-${m.id}`, CONTACT.email)} className="assistant-action">
                              <i className={`fa-${copied === `mail-${m.id}` ? 'solid fa-check' : 'regular fa-copy'}`} aria-hidden="true" />{copied === `mail-${m.id}` ? t.copied : t.actions.copyEmail}
                            </button>
                            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="assistant-action"><i className="fa-brands fa-whatsapp" aria-hidden="true" />{t.actions.whatsapp}</a>
                            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="assistant-action"><i className="fa-brands fa-linkedin-in" aria-hidden="true" />{t.actions.linkedin}</a>
                          </>
                        )}
                        {att.cv && <button type="button" onClick={openCv} className="assistant-action"><i className="fa-regular fa-file-lines" aria-hidden="true" />{t.actions.cv}</button>}
                      </div>
                    )}

                    {!m.streaming && m.text && (
                      <button type="button" onClick={() => copy(`msg-${m.id}`, m.text.replace(/\*\*/g, ''))} className="mt-2 text-[11px] text-muted hover:text-ink opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
                        <i className={`fa-${copied === `msg-${m.id}` ? 'solid fa-check' : 'regular fa-copy'} mr-1`} aria-hidden="true" />{copied === `msg-${m.id}` ? t.copied : t.copy}
                      </button>
                    )}

                    {isLast && !m.streaming && m.text && !busy && (
                      <div className="mt-4">
                        <p className="label mb-2">{t.followUpsTitle}</p>
                        <div className="flex flex-col gap-1.5">
                          {followUps(question, m.text).map((f) => (
                            <button key={f} type="button" onClick={() => ask(f)} className="group/fu flex items-center justify-between gap-3 text-left text-[13px] px-3 py-2 rounded-md border border-line hover:border-accent text-ink2 hover:text-ink transition-colors">
                              <span>{f}</span>
                              <i className="fa-solid fa-arrow-right text-[10px] text-muted group-hover/fu:text-accent" aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={submit} className="shrink-0 border-t border-line px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2 rounded-lg border border-lineStrong bg-bg2 pl-3.5 pr-1.5 py-1.5 focus-within:border-accent focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)] transition-[border-color,box-shadow]">
              <label htmlFor="assistant-input" className="sr-only">{t.placeholder}</label>
              <textarea
                id="assistant-input"
                ref={field}
                rows={1}
                value={input}
                maxLength={MAX_INPUT}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
                }}
                placeholder={t.placeholder}
                className="flex-1 resize-none bg-transparent outline-none focus-visible:outline-none text-[16px] sm:text-[14px] leading-6 py-1.5 text-ink placeholder:text-muted max-h-[128px]"
              />
              {busy ? (
                <button type="button" onClick={() => abort.current?.abort()} className="w-9 h-9 shrink-0 rounded-md grid place-items-center bg-ink text-bg" aria-label={t.stop} title={t.stop}>
                  <i className="fa-solid fa-stop text-[11px]" aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} className="w-9 h-9 shrink-0 rounded-md grid place-items-center bg-accent text-onAccent disabled:opacity-35 transition-opacity" aria-label={t.send} title={t.send}>
                  <i className="fa-solid fa-arrow-up text-[13px]" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="mt-2 px-0.5 flex justify-between gap-3 text-[10.5px] leading-snug text-muted">
              <span>{t.note}</span>
              {input.length > MAX_INPUT - 100
                ? <span className="shrink-0 tabular-nums">{input.length}/{MAX_INPUT}</span>
                : <span className="hidden sm:inline shrink-0 font-mono">↵</span>}
            </p>
          </form>
        </section>
      )}
    </>
  );
};

export default Assistant;
