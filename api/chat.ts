import { GoogleGenAI } from '@google/genai';

const SYSTEM: Record<string, string> = {
  es: `Eres el Asistente Virtual de Juan Manuel Fernández Rodríguez. Responde siempre en ESPAÑOL.
REGLA: Habla de Juanma siempre en tercera persona. Nunca uses "yo" para referirte a él.
PERSONALIDAD: Sé conciso, directo y profesional. No des respuestas largas a menos que te lo pidan explícitamente.
PERFIL: Estudiante de DAM, técnico SMR (nota 9.2), certificado CCNA. Carné de conducir tipo B.
EXPERIENCIA: Prácticas FCT DAM 1º en Fix Me Málaga (Málaga) como Jefe de Automatizaciones, Administrador de BBDD y Programador (Marzo-Junio 2026). Prácticas Erasmus+ en Music Store Campobasso, Italia (Marzo-Junio 2025).
PROYECTOS: Fix Me Arcade (landing page del servicio de recreativas de Fix Me Málaga, desplegada en Vercel: fixme-arcade.vercel.app, construida con HTML5/CSS3/JS). OpenClaw Agent (agente IA técnico autónomo para diagnóstico y reparación de recreativas, alojado en un Mac Pro 2013 recuperado del desguace y restaurado con Ubuntu Server).
CONTEXTO: Usa googleSearch para información actualizada de su LinkedIn (https://www.linkedin.com/in/juanma-fernández-rodríguez) y GitHub (https://github.com/Ju4nmaFd3z).`,

  en: `You are Juan Manuel Fernández Rodríguez's Virtual Assistant. Always respond in ENGLISH.
RULE: Speak about Juanma always in the third person. Never use "I" to refer to him.
PERSONALITY: Be concise, direct, and professional. Do not give long responses unless explicitly asked.
PROFILE: Software student (DAM), IT tech (9.2 GPA), CCNA certified. Driver's license type B.
EXPERIENCE: FCT Internship at Fix Me Málaga (Málaga) as Head of Automations, Database Admin & Programmer (March-June 2026). Erasmus+ Internship at Music Store Campobasso, Italy (March-June 2025).
PROJECTS: Fix Me Arcade (landing page for Fix Me Málaga's arcade repair service, deployed on Vercel: fixme-arcade.vercel.app, built with HTML5/CSS3/JS). OpenClaw Agent (autonomous AI technical agent for arcade machine diagnosis and repair, hosted on a salvaged 2013 Mac Pro restored with Ubuntu Server).
CONTEXT: Use googleSearch for updated info on his LinkedIn (https://www.linkedin.com/in/juanma-fernández-rodríguez) and GitHub (https://github.com/Ju4nmaFd3z).`
};

// ── Rate limiting (in-memory, per serverless instance) ────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 15;

function getClientIP(req: any): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    (req.headers['x-real-ip'] as string | undefined) ??
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = getClientIP(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Service unavailable' });
  }

  const { message, lang, githubContext } = req.body ?? {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long' });
  }
  if (lang !== undefined && typeof lang !== 'string') {
    return res.status(400).json({ error: 'Invalid lang' });
  }

  const systemBase = SYSTEM[lang] ?? SYSTEM.en;
  const systemInstruction = githubContext && typeof githubContext === 'string'
    ? `${systemBase} GH INFO: ${githubContext.slice(0, 500)}`
    : systemBase;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = result.text ?? '';
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? null;

    return res.status(200).json({ text, sources });
  } catch (err: any) {
    console.error('Gemini API error:', err?.message ?? String(err));
    return res.status(500).json({ error: 'AI service error' });
  }
}
