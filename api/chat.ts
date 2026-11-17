// POST /api/chat — the portfolio assistant (Vercel function, Web signature).
//
// Free by design: it only talks to providers with a free tier and no card on
// file (Gemini via an AI Studio key on a project WITHOUT billing, and Groq).
// Each is tried in turn; when none is configured or all are out of quota the
// endpoint answers 503 and the browser falls back to its local answers, so the
// assistant always works and can never cost money.
//
// Hardening: same-origin only, small JSON bodies, strict validation of the
// conversation, per-IP and per-instance limits, no client-supplied context in
// the instructions, an injection filter before the model, a canary check on
// its output, capped output, upstream timeouts. The reply is streamed as
// plain text.

import { instructions } from '../assistant/knowledge.js';
import type { Lang } from '../translations.js';

interface Turn { role: 'user' | 'assistant'; content: string }

const MAX_BODY = 16_000;          // bytes
const MAX_TURNS = 10;             // messages sent by the client
const MAX_CHARS = 800;            // per message
const MAX_OUTPUT = 350;           // tokens
const TEMPERATURE = 0.25;
const TIMEOUT = 25_000;           // ms per upstream call
const PER_MINUTE = 8;             // per IP
const PER_DAY_IP = 60;            // per IP
const PER_DAY_TOTAL = 800;        // per function instance, protects the free quota

// ── Limits (in memory: best effort per warm instance) ───────────────────────
const hits = new Map<string, number[]>();
let day = '';
let today = 0;

function limited(ip: string): boolean {
  const now = Date.now();
  const d = new Date(now).toISOString().slice(0, 10);
  if (d !== day) { day = d; today = 0; hits.clear(); }
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 86_400_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= PER_MINUTE || list.length >= PER_DAY_IP || today >= PER_DAY_TOTAL) return true;
  list.push(now);
  hits.set(ip, list);
  today++;
  return false;
}

// ── Guard: prompt injection ──────────────────────────────────────────────────
// A cheap first line of defence before any model sees the text. The model's
// own rules (assistant/knowledge.ts) and the output check below do the rest.
const INJECTION = [
  /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(previous|prior|above|earlier|all|your|the|these)\b.{0,30}\b(instructions?|rules?|prompts?|guidelines?|messages?|context)\b/i,
  /\b(ignora|olvida|omite|salta(te)?|anula|desobedece)\b.{0,40}\b(instrucci[oó]n(es)?|reglas?|normas?|indicaciones|prompt|lo anterior|todo lo)\b/i,
  /\b(system|initial|hidden|original)\s*(prompt|message|instructions?)\b/i,
  /\b(prompt|mensaje|instrucciones)\s+(del\s+)?(sistema|inicial(es)?|ocult[oa]s?|original(es)?)\b/i,
  /\b(reveal|repeat|print|show|output|display|recite|leak)\b.{0,40}\b(instructions?|prompt|rules|above|context|profile)\b/i,
  /\b(revela|repite|muestra|imprime|escribe|dime|copia|recita)\b.{0,40}\b(tus\s+)?(instrucciones|prompt|reglas|lo de arriba|el contexto|el perfil completo)\b/i,
  /\b(you are now|from now on you|act as|pretend (to be|you)|roleplay|role-play|jailbreak|developer mode|dan mode|do anything now)\b/i,
  /\b(ahora eres|a partir de ahora (eres|ser[aá]s|act[uú]a)|act[uú]a como|haz (de|como si)|finge (ser|que)|modo (desarrollador|dios|sin restricciones|dan)|sin (filtros|restricciones|censura))\b/i,
  /<\/?(system|instructions?|prompt)>|\[\/?(system|inst)\]|<\|(im_start|system|endoftext)\|>/i,
];
const looksLikeInjection = (text: string) => INJECTION.some((re) => re.test(text));

const REFUSAL: Record<Lang, string> = {
  es: 'Estoy aquí para hablarte de Juanma: su formación, su experiencia, sus proyectos o cómo contactar con él. ¿Qué te gustaría saber?',
  en: "I'm here to tell you about Juanma: his education, experience, projects or how to get in touch. What would you like to know?",
};

/** Remove invisible / control characters often used to smuggle instructions. */
const scrub = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, '').replace(/[ \t]{3,}/g, '  ').trim();

/** A random marker placed in the instructions; seeing it in a reply means a leak. */
const CANARY = `ref-${crypto.randomUUID().slice(0, 8)}`;
/** Fragments of the instructions (not the profile) that must never appear in a reply. */
const normal = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');
const LEAK: Record<Lang, string[]> = { es: [], en: [] };
for (const lang of ['es', 'en'] as const) {
  const rules = instructions(lang, CANARY).split(/\n\n(PERFIL|PROFILE):/)[0];
  LEAK[lang] = [CANARY.toLowerCase(), ...rules.split('\n').map((l) => normal(l.replace(/^-\s*/, '')).slice(0, 36)).filter((l) => l.length >= 28)];
}
const leaks = (lang: Lang, text: string) => { const t = normal(text); return LEAK[lang].some((m) => t.includes(m)); };

const plainText = (text: string) => new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-provider': 'guard' } });

// ── Providers ────────────────────────────────────────────────────────────────
type Provider = { name: string; open: (system: string, turns: Turn[], signal: AbortSignal) => Promise<Response>; text: (event: unknown) => string };

function providers(): Provider[] {
  const list: Provider[] = [];
  const gemini = process.env.GEMINI_API_KEY;
  if (gemini) {
    const model = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
    list.push({
      name: 'gemini',
      open: (system, turns, signal) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
        method: 'POST',
        signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': gemini },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { maxOutputTokens: MAX_OUTPUT, temperature: TEMPERATURE },
        }),
      }),
      text: (e) => ((e as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join(''),
    });
  }
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    list.push({
      name: 'groq',
      open: (system, turns, signal) => fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${groq}` },
        body: JSON.stringify({ model, stream: true, max_tokens: MAX_OUTPUT, temperature: TEMPERATURE, messages: [{ role: 'system', content: system }, ...turns] }),
      }),
      text: (e) => (e as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content ?? '',
    });
  }
  return list;
}

/** Turns an upstream SSE response into a stream of plain text. */
function toText(upstream: Response, provider: Provider, controller: AbortController, lang: Lang, onEnd: () => void): ReadableStream<Uint8Array> {
  const refusal = REFUSAL[lang];
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let sent = '';
  let finished = false;
  const finish = () => { if (!finished) { finished = true; onEnd(); } };
  return new ReadableStream({
    async pull(out) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) { finish(); out.close(); return; }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          let emitted = '';
          for (const line of lines) {
            const data = line.startsWith('data:') ? line.slice(5).trim() : '';
            if (!data || data === '[DONE]') continue;
            try { emitted += provider.text(JSON.parse(data)); } catch { /* keep-alive or partial line */ }
          }
          if (emitted) {
            // never let the instructions out: stop at the first sign of a recital
            if (leaks(lang, sent + emitted)) {
              out.enqueue(encoder.encode(sent ? `\n\n${refusal}` : refusal));
              finish();
              controller.abort();
              out.close();
              return;
            }
            sent += emitted;
            out.enqueue(encoder.encode(emitted));
            return;
          }
        }
      } catch {
        finish();
        out.close(); // upstream dropped mid-answer: keep what was sent
      }
    },
    cancel() { finish(); controller.abort(); },
  });
}

// ── Request handling ─────────────────────────────────────────────────────────
const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function parse(raw: string): { lang: Lang; turns: Turn[] } | null {
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return null; }
  if (!body || typeof body !== 'object') return null;
  const { lang, messages } = body as { lang?: unknown; messages?: unknown };
  if (lang !== 'es' && lang !== 'en') return null;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const m of messages) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = scrub(content);
    if (!text || text.length > MAX_CHARS) return null;
    turns.push({ role, content: role === 'assistant' ? text.slice(0, 500) : text });
  }
  if (turns[turns.length - 1].role !== 'user') return null;
  return { lang, turns };
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin fetches may omit it; CORS still blocks other sites from reading
  try { return new URL(origin).host === req.headers.get('host'); } catch { return false; }
}

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return json(403, 'forbidden');
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json(415, 'unsupported');
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, 'too_large');
  const input = parse(raw);
  if (!input) return json(400, 'invalid');

  const list = providers();
  if (!list.length) return json(503, 'unavailable');
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (limited(ip)) return json(429, 'rate_limited');

  // the question itself: refuse manipulation outright, without spending quota
  const question = input.turns[input.turns.length - 1].content;
  if (looksLikeInjection(question)) return plainText(REFUSAL[input.lang]);
  // earlier turns that carry an injection (forged or not) are simply dropped
  const kept = input.turns.filter((m, i) => i === input.turns.length - 1 || !looksLikeInjection(m.content));
  // models expect user / assistant to alternate, opening with the user
  const turns: Turn[] = [];
  for (const m of kept) {
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += `\n${m.content}`;
    else if (turns.length || m.role === 'user') turns.push({ ...m });
  }

  const system = instructions(input.lang, CANARY);
  for (const provider of list) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const upstream = await provider.open(system, turns, controller.signal);
      if (!upstream.ok || !upstream.body) {
        clearTimeout(timer);
        console.warn(`[chat] ${provider.name} answered ${upstream.status}`);
        continue; // out of quota, bad model name, outage… try the next one
      }
      const stream = toText(upstream, provider, controller, input.lang, () => clearTimeout(timer));
      return new Response(stream, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-provider': provider.name },
      });
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[chat] ${provider.name} failed: ${(err as Error).name}`);
    }
  }
  return json(503, 'unavailable');
}
