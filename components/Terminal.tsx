import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Lang, T } from '../translations';
import { CONTACT, PROJECTS } from '../content';
import { AsciiArt } from './ui';
import { GitGraph } from './GitGraph';
import Neofetch from './Neofetch';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  t: T;
  setLang: (l: Lang) => void;
  onOpenCv: () => void;
}

interface PieceInfo { slug: string; name: string; category: string }
type Draft =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; node: React.ReactNode }
  | { kind: 'err'; text: string }
  | { kind: 'piece'; slug: string; name: string };
type Entry = Draft & { id: number };

// The ASCII library index is generated at build time (scripts/copy-ascii-magic.mjs).
let indexPromise: Promise<PieceInfo[]> | null = null;
const loadIndex = () => {
  if (!indexPromise) {
    indexPromise = fetch('/ascii-magic-art/index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .catch((e) => { indexPromise = null; throw e; });
  }
  return indexPromise;
};

const SECTIONS = ['home', 'about', 'skills', 'projects', 'journey', 'contact'] as const;

/** Edit distance, for "did you mean". */
const distance = (a: string, b: string) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
};


// A small but real shell over the portfolio. Opens with "/" or the >_ button.
// Tab completes, ↑/↓ walks the history, Ctrl+L clears, Ctrl+C cancels, Esc
// closes. Every command name in the output is clickable, and on touch screens
// a row of chips sits above the keyboard.
const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, lang, t, setLang, onOpenCv }) => {
  const es = lang === 'es';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [pieces, setPieces] = useState<PieceInfo[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const runRef = useRef<(raw: string) => void>(() => {});

  const push = useCallback((...e: Draft[]) => {
    setEntries((p) => [...p, ...e.map((x) => ({ ...x, id: nextId.current++ }) as Entry)]);
  }, []);
  const out = (node: React.ReactNode) => push({ kind: 'out', node });
  const err = (text: string) => push({ kind: 'err', text });

  /** A command you can click to run. */
  const C: React.FC<{ c: string; children?: React.ReactNode }> = ({ c, children }) => (
    <button type="button" className="term-link" onClick={() => runRef.current(c)}>{children ?? c}</button>
  );
  const A: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a className="term-link" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{children}</a>
  );

  const sectionNames: Record<(typeof SECTIONS)[number], string> = {
    home: t.nav.home, about: t.nav.about, skills: t.nav.skills, projects: t.nav.projects, journey: t.nav.journey, contact: t.nav.contact,
  };

  const goto = (id: string) => {
    out(<span className="text-[#958c80]">→ {sectionNames[id as keyof typeof sectionNames] ?? id}</span>);
    window.setTimeout(() => {
      onClose();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 280);
  };

  const help: [string, string][] = es ? [
    ['about', 'Quién soy'],
    ['skills', 'Lo que sé hacer'],
    ['projects', 'Mis proyectos (projects <nombre>)'],
    ['git log', 'Mi trayectoria como un repositorio'],
    ['cv', 'Abrir mi currículum'],
    ['contact', 'Cómo contactarme'],
    ['goto', 'Ir a una sección (goto contact)'],
    ['lang', 'Switch to English'],
    ['ascii', 'Galería de arte ASCII animado'],
    ['neofetch', 'Mi ficha, estilo neofetch'],
    ['clear', 'Limpiar la pantalla'],
    ['exit', 'Cerrar la terminal'],
  ] : [
    ['about', 'Who I am'],
    ['skills', 'What I can do'],
    ['projects', 'My projects (projects <name>)'],
    ['git log', 'My journey as a repository'],
    ['cv', 'Open my résumé'],
    ['contact', 'How to reach me'],
    ['goto', 'Jump to a section (goto contact)'],
    ['lang', 'Cambiar a español'],
    ['ascii', 'Gallery of animated ASCII art'],
    ['neofetch', 'My profile, neofetch style'],
    ['clear', 'Clear the screen'],
    ['exit', 'Close the terminal'],
  ];

  const ascii = async (args: string[]) => {
    let list: PieceInfo[];
    try { list = await loadIndex(); } catch { err(es ? 'No se pudo cargar la galería.' : 'Could not load the gallery.'); return; }
    const [sub, arg] = args;
    const play = (p: PieceInfo) => push({ kind: 'piece', slug: p.slug, name: p.name });
    if (!sub) {
      const cats = new Map<string, number>();
      list.forEach((p) => { if (p.category) cats.set(p.category, (cats.get(p.category) ?? 0) + 1); });
      out(
        <div>
          <p>{es ? `${list.length} piezas animadas. Prueba ` : `${list.length} animated pieces. Try `}<C c="ascii random" />{es ? ' o elige una categoría:' : ' or pick a category:'}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{[...cats.entries()].map(([c, n]) => <C key={c} c={`ascii list ${c}`}>{c}<span className="text-[#958c80]">({n})</span></C>)}</p>
        </div>,
      );
      return;
    }
    if (sub === 'random') { play(list[Math.floor(Math.random() * list.length)]); return; }
    if (sub === 'list') {
      const items = list.filter((p) => !arg || p.category === arg);
      if (!items.length) { err(es ? `Categoría desconocida: ${arg}` : `Unknown category: ${arg}`); return; }
      out(<p className="flex flex-wrap gap-x-3 gap-y-1">{items.map((p) => <C key={p.slug} c={`ascii ${p.slug}`}>{p.slug}</C>)}</p>);
      return;
    }
    if (sub === 'find') {
      const q = (arg ?? '').toLowerCase();
      const items = list.filter((p) => p.slug.includes(q) || p.name.toLowerCase().includes(q)).slice(0, 60);
      out(items.length ? <p className="flex flex-wrap gap-x-3 gap-y-1">{items.map((p) => <C key={p.slug} c={`ascii ${p.slug}`}>{p.slug}</C>)}</p> : (es ? 'Sin resultados.' : 'No results.'));
      return;
    }
    const hit = list.find((p) => p.slug === sub);
    if (hit) play(hit);
    else err(es ? `No existe «${sub}». Prueba: ascii find ${sub}` : `No piece called "${sub}". Try: ascii find ${sub}`);
  };

  const projects = (args: string[]) => {
    const q = args.join(' ');
    if (!q) {
      out(
        <div>
          {t.projects.items.map((p) => (
            <p key={p.id}><C c={`projects ${p.id}`}>{p.id.padEnd(11, ' ')}</C> <span className="text-[#d2c9bb]">{p.title}</span> <span className="text-[#958c80]">— {p.kicker}</span></p>
          ))}
          <p className="mt-1 text-[#958c80]">{es ? 'Toca uno para ver el detalle.' : 'Tap one for details.'}</p>
        </div>,
      );
      return;
    }
    const p = t.projects.items.find((x) => x.id === q || x.title.toLowerCase() === q);
    if (!p) { err(es ? `No conozco el proyecto «${q}». Escribe projects` : `Unknown project "${q}". Type projects`); return; }
    const meta = PROJECTS.find((m) => m.id === p.id)!;
    out(
      <div className="max-w-[70ch]">
        <p className="text-[#ffc078]">{p.title} <span className="text-[#958c80]">· {p.kicker}</span></p>
        <p className="mt-1 text-[#d2c9bb]">{p.desc}</p>
        <p className="mt-1 text-[#958c80]">{p.tech.join(' · ')}</p>
        <p className="mt-1 flex flex-wrap gap-x-4">
          {meta.live && <A href={meta.live}>{t.projects.visit} ↗</A>}
          {meta.repo && <A href={meta.repo}>{t.projects.repo} ↗</A>}
          {meta.other && <A href={meta.other.url}>{meta.other.kind === 'course' ? t.projects.course : t.projects.post} ↗</A>}
        </p>
      </div>,
    );
  };

  const gitLog = () => out(
    <div className="overflow-x-auto no-scrollbar">
      <GitGraph items={t.journey.items} branches={t.journey.branches} />
      <p className="mt-1 text-[#958c80]">{es ? 'Detalle completo en ' : 'Full detail in '}<C c="goto journey" /></p>
    </div>,
  );

  const commands: Record<string, (args: string[]) => void> = {
    help: () => out(
      <div>
        {help.map(([c, d]) => (
          <p key={c} className="flex gap-3"><span className="w-[9ch] shrink-0"><C c={c} /></span><span className="text-[#958c80]">{d}</span></p>
        ))}
        <p className="mt-2 text-[#958c80]">{es ? 'Tab autocompleta · ↑↓ historial · Ctrl+L limpia · Esc cierra' : 'Tab completes · ↑↓ history · Ctrl+L clears · Esc closes'}</p>
      </div>,
    ),
    about: () => out(
      <div className="max-w-[70ch]">
        <p className="text-[#ffc078]">Juan Manuel Fernández Rodríguez · Málaga</p>
        <p className="mt-1 text-[#d2c9bb]">{t.about.text.replace(/\*\*/g, '')}</p>
        <p className="mt-1 text-[#958c80]">{t.about.stats.map((s) => `${s.value} ${s.label}`).join(' · ')}</p>
      </div>,
    ),
    whoami: () => commands.about([]),
    skills: () => out(
      <div>
        {[...t.skills.layers].reverse().map((l) => (
          <p key={l.name}><span className="text-[#ffc078] inline-block w-[13ch]">{l.name}</span><span className="text-[#d2c9bb]">{l.items.join(', ')}</span></p>
        ))}
      </div>,
    ),
    projects,
    open: (args) => {
      const meta = PROJECTS.find((m) => m.id === args[0]);
      const url = meta?.live ?? meta?.repo ?? meta?.other?.url;
      if (!url) { err(es ? 'Uso: open <proyecto>  (lista: projects)' : 'Usage: open <project>  (list: projects)'); return; }
      window.open(url, '_blank', 'noopener');
      out(`↗ ${url}`);
    },
    git: (args) => {
      if (args[0] === 'log') gitLog();
      else if (args[0] === 'status') out(es ? 'En la rama main · DAM en curso · disponible para prácticas' : 'On branch main · DAM in progress · available for internships');
      else out(<span>{es ? 'Prueba ' : 'Try '}<C c="git log" /> {es ? 'o' : 'or'} <C c="git status" /></span>);
    },
    journey: () => gitLog(),
    cv: () => { out(es ? 'Abriendo currículum…' : 'Opening résumé…'); window.setTimeout(() => { onClose(); onOpenCv(); }, 250); },
    contact: () => out(
      <div>
        <p><span className="text-[#958c80] inline-block w-[10ch]">email</span><A href={`mailto:${CONTACT.email}`}>{CONTACT.email}</A> <C c="email">[{es ? 'copiar' : 'copy'}]</C></p>
        <p><span className="text-[#958c80] inline-block w-[10ch]">{es ? 'teléfono' : 'phone'}</span><A href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</A> · <A href={CONTACT.whatsapp}>WhatsApp ↗</A></p>
        <p><span className="text-[#958c80] inline-block w-[10ch]">linkedin</span><A href={CONTACT.linkedin}>Juanma Fernández ↗</A></p>
        <p><span className="text-[#958c80] inline-block w-[10ch]">github</span><A href={CONTACT.github}>Ju4nmaFd3z ↗</A></p>
      </div>,
    ),
    email: () => {
      navigator.clipboard?.writeText(CONTACT.email).then(
        () => out(es ? `✓ ${CONTACT.email} copiado` : `✓ ${CONTACT.email} copied`),
        () => out(CONTACT.email),
      );
    },
    goto: (args) => {
      const id = args[0];
      if (id && (SECTIONS as readonly string[]).includes(id)) { goto(id); return; }
      out(<p className="flex flex-wrap gap-x-3">{SECTIONS.map((s) => <C key={s} c={`goto ${s}`}>{s}</C>)}</p>);
    },
    lang: (args) => {
      const next = args[0] === 'es' || args[0] === 'en' ? args[0] : es ? 'en' : 'es';
      setLang(next);
      out(next === 'es' ? 'Idioma: español' : 'Language: English');
    },
    ascii: (args) => { void ascii(args); },
    neofetch: () => out(<Neofetch t={t} es={es} />),
    history: () => out(past.length ? <div>{[...past].reverse().map((p, i) => <p key={i}><span className="text-[#958c80]">{String(i + 1).padStart(3, ' ')}  </span><C c={p} /></p>)}</div> : '—'),
    date: () => out(new Date().toLocaleString(es ? 'es-ES' : 'en-GB')),
    echo: (args) => out(args.join(' ')),
    sudo: () => err(es ? 'juanma no está en el archivo sudoers. Este incidente será reportado. 😉' : 'juanma is not in the sudoers file. This incident will be reported. 😉'),
    clear: () => setEntries([]),
    exit: () => onClose(),
  };

  const names = Object.keys(commands);

  const run = (raw: string) => {
    const line = raw.trim();
    if (!line) return;
    const [name, ...rest] = line.split(/\s+/);
    const cmd = name.toLowerCase();
    if (cmd !== 'clear') push({ kind: 'cmd', text: line });
    const args = rest.map((a) => a.toLowerCase());
    if (commands[cmd]) commands[cmd](args);
    else {
      const best = names.map((n) => [n, distance(cmd, n)] as const).sort((a, b) => a[1] - b[1])[0];
      push({
        kind: 'out',
        node: (
          <span className="text-[#ff7a6b]">
            {es ? `Comando no encontrado: ${cmd}.` : `Command not found: ${cmd}.`}
            {best && best[1] <= 2 ? <> {es ? '¿Quisiste decir' : 'Did you mean'} <C c={best[0]} />?</> : <> {es ? 'Escribe' : 'Type'} <C c="help" /></>}
          </span>
        ),
      });
    }
    setPast((p) => [line, ...p.filter((x) => x !== line)].slice(0, 40));
    setCursor(-1);
    setInput('');
  };
  runRef.current = run;

  // Completion candidates for the current input.
  const suggestion = useMemo(() => {
    const v = input.replace(/^\s+/, '');
    if (!v) return '';
    const parts = v.split(/\s+/);
    let pool: string[];
    if (parts.length === 1) pool = [...names, 'git log'];
    else {
      const head = parts[0].toLowerCase();
      const argPools: Record<string, string[]> = {
        projects: PROJECTS.map((p) => p.id), open: PROJECTS.map((p) => p.id), goto: [...SECTIONS],
        lang: ['es', 'en'], git: ['log', 'status'],
        ascii: ['random', 'list', 'find', ...pieces.map((p) => p.slug)],
      };
      pool = (argPools[head] ?? []).map((a) => `${parts.slice(0, -1).join(' ')} ${a}`);
    }
    const low = v.toLowerCase();
    const hit = pool.find((p) => p.toLowerCase().startsWith(low) && p.length > v.length);
    return hit ? hit.slice(v.length) : '';
  }, [input, names, pieces]);

  useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
    if (entries.length === 0) {
      out(
        <div>
          <p className="text-[#f4eee4]">{es ? '¡Hola! Esta es una terminal de verdad sobre mi portfolio.' : "Hi! This is a real terminal over my portfolio."}</p>
          <p className="text-[#958c80]">{es ? 'Escribe un comando o toca uno: ' : 'Type a command or tap one: '}<C c="help" /> · <C c="neofetch" /> · <C c="projects" /> · <C c="git log" /> · <C c="ascii random" /></p>
        </div>,
      );
    }
    loadIndex().then(setPieces).catch(() => {});
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', onKey); html.style.overflow = prevOverflow; prevFocus?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // pieces size themselves once their module has loaded
    const id = window.setTimeout(() => { el.scrollTop = el.scrollHeight; }, 450);
    return () => clearTimeout(id);
  }, [entries]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || (e.key === 'ArrowRight' && suggestion && e.currentTarget.selectionStart === input.length)) {
      if (suggestion) { e.preventDefault(); setInput(input + suggestion); }
      else if (e.key === 'Tab') e.preventDefault();
    } else if (e.key === 'ArrowUp' && past.length) {
      e.preventDefault();
      const c = Math.min(past.length - 1, cursor + 1);
      setCursor(c); setInput(past[c]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const c = cursor - 1;
      setCursor(Math.max(-1, c)); setInput(c >= 0 ? past[c] : '');
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault(); setEntries([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      if (window.getSelection()?.toString()) return;
      e.preventDefault(); push({ kind: 'cmd', text: `${input}^C` }); setInput('');
    }
  };

  if (!isOpen) return null;
  const lastPiece = entries.map((l) => l.kind).lastIndexOf('piece');
  const chips = ['help', 'neofetch', 'about', 'projects', 'git log', 'cv', 'contact', 'ascii random', 'lang', 'clear'];

  return (
    <div className="fixed inset-0 z-[19500] bg-black/70 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-8" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Terminal" className="term w-full max-w-4xl h-[100dvh] sm:h-[80vh] flex flex-col sm:rounded-2xl overflow-hidden sm:border border-white/15 bg-[#0b0a0d] text-[#f4eee4] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between pl-4 pr-2 py-2 border-b border-white/10 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff8a3a]" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffc078]" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#7ab2e6]" aria-hidden="true" />
            <span className="ml-3 font-mono text-[11px] tracking-wider text-[#958c80] truncate">juanma@portfolio: ~</span>
          </span>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-[#958c80] hover:text-white hover:bg-white/10" aria-label={es ? 'Cerrar terminal' : 'Close terminal'}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={scrollRef}
          onMouseUp={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true }); }}
          className="flex-1 p-4 sm:p-6 font-mono text-[13px] leading-relaxed overflow-y-auto custom-scrollbar space-y-2"
          aria-live="polite"
        >
          {entries.map((line, i) => {
            if (line.kind === 'piece') {
              return i === lastPiece ? (
                <figure key={line.id} className="py-1">
                  <div className="overflow-x-auto no-scrollbar"><AsciiArt piece={line.slug} size={7} label={line.name} /></div>
                  <figcaption className="mt-1 text-[11px] text-[#958c80] flex flex-wrap gap-x-3">
                    <span>{line.name}</span>
                    <button type="button" className="term-link" onClick={() => runRef.current('ascii random')}>{es ? 'otra ↻' : 'another ↻'}</button>
                  </figcaption>
                </figure>
              ) : <div key={line.id} className="text-[#958c80]">[{line.name}]</div>;
            }
            if (line.kind === 'cmd') return <div key={line.id} className="text-[#ffc078] break-words"><span className="text-[#ff8a3a]">❯</span> {line.text}</div>;
            if (line.kind === 'err') return <div key={line.id} className="text-[#ff7a6b] break-words">{line.text}</div>;
            return <div key={line.id} className="text-[#d2c9bb] break-words">{line.node}</div>;
          })}
        </div>

        <div className="border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 pt-3" aria-label={es ? 'Comandos rápidos' : 'Quick commands'}>
            {chips.map((c) => (
              <button key={c} type="button" onClick={() => { run(c); inputRef.current?.focus({ preventScroll: true }); }} className="shrink-0 font-mono text-[12px] px-3 py-1.5 rounded-full border border-white/15 text-[#d2c9bb] hover:border-[#ff8a3a] hover:text-white">
                {c}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); run(input); }} className="flex items-center gap-3 px-4 sm:px-6 py-3 font-mono">
            <label htmlFor="term-input" className="text-[#ff8a3a] shrink-0">❯</label>
            <div className="relative flex-1 min-w-0">
              <span className="absolute inset-0 pointer-events-none whitespace-pre overflow-hidden text-[16px] sm:text-[13px] leading-[28px]" aria-hidden="true">
                <span className="invisible">{input}</span><span className="text-[#5d564e]">{suggestion}</span>
              </span>
              <input
                id="term-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setCursor(-1); }}
                onKeyDown={onInputKey}
                className="relative block w-full h-7 p-0 bg-transparent border-none outline-none focus-visible:outline-none text-[#f4eee4] text-[16px] sm:text-[13px] leading-[28px] caret-[#ff8a3a]"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                placeholder={entries.length <= 1 ? (es ? 'escribe help…' : 'type help…') : ''}
                aria-label={es ? 'Comando' : 'Command'}
              />
            </div>
            {suggestion && (
              <button type="button" onClick={() => { setInput(input + suggestion); inputRef.current?.focus(); }} className="sm:hidden shrink-0 text-[11px] px-2 py-1 rounded border border-white/15 text-[#958c80]">tab</button>
            )}
            <button type="submit" className="shrink-0 w-9 h-9 rounded-full bg-[#ff8a3a] text-[#120a05] flex items-center justify-center" aria-label={es ? 'Ejecutar' : 'Run'}>
              <i className="fa-solid fa-arrow-turn-down rotate-90 text-[12px]" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
