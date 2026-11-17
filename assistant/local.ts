// Local answers: no model, no network, no cost. Matches the question to an
// intent (studies, experience, projects, skills, contact…) and answers from
// the site's own data. Used when no AI provider is configured or available.

import { translations, type Lang } from '../translations.js';
import { CONTACT, PROJECTS } from '../content.js';
import { cvFileName } from '../utils/downloadCV.js';
import { PERSONAL } from './knowledge.js';

type Intent = 'greet' | 'about' | 'personal' | 'study' | 'work' | 'cert' | 'skills' | 'projects' | 'contact' | 'cv' | 'hire' | 'where' | 'thanks' | 'licence';

/** Lower-case, no accents, single spaces. */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+#./ ]/g, ' ').replace(/\s+/g, ' ').trim();

const KEYWORDS: Record<Intent, string[]> = {
  greet: ['hola', 'buenas', 'hello', 'hi', 'hey', 'saludos', 'buenos dias', 'good morning'],
  thanks: ['gracias', 'thanks', 'thank you', 'genial', 'perfecto', 'great'],
  about: ['quien', 'who', 'sobre el', 'about', 'presenta', 'introduce', 'perfil', 'profile', 'cuentame', 'tell me', 'resumen', 'summary'],
  personal: ['persona', 'person', 'personal', 'familia', 'family', 'padres', 'parents', 'hermano', 'brother', 'como es', 'what is he like', 'what\'s he like', 'valores', 'values', 'lema', 'motto', 'hobby', 'aficion', 'gusta', 'like', 'pasion', 'passion', 'agradecid', 'grateful'],
  licence: ['carne', 'conducir', 'driving', 'licence', 'license', 'coche', 'car', 'vehiculo'],
  study: ['estudi', 'formacion', 'education', 'study', 'studies', 'degree', 'grado', 'dam', 'smr', 'nota', 'gpa', 'media', 'instituto', 'school', 'alan turing', 'curso', 'titulacion'],
  work: ['experiencia', 'experience', 'trabaj', 'work', 'job', 'practica', 'intern', 'empresa', 'company', 'erasmus', 'italia', 'italy', 'campobasso', 'fix me', 'fixme', 'freelance', 'autonomo', 'cliente'],
  cert: ['certific', 'ccna', 'cisco', 'lemoncode', 'titulo', 'diploma'],
  skills: ['sabe', 'skills', 'tecnolog', 'stack', 'lenguaj', 'language', 'domina', 'herramient', 'tools', 'conoce', 'know', 'programa', 'framework', 'habilidad'],
  projects: ['proyecto', 'project', 'portfolio', 'ha hecho', 'ha creado', 'built', 'made', 'trabajos', 'apps', 'webs'],
  contact: ['contact', 'email', 'correo', 'mail', 'telefono', 'phone', 'whatsapp', 'linkedin', 'github', 'escribir', 'llamar', 'reach'],
  cv: ['cv', 'curriculum', 'resume', 'resumen laboral'],
  hire: ['disponible', 'available', 'contratar', 'hire', 'oferta', 'offer', 'vacante', 'busca', 'looking for', 'practicas en', 'incorporar'],
  where: ['donde', 'where', 'malaga', 'vive', 'live', 'ciudad', 'city', 'ubicacion', 'location', 'remoto', 'remote'],
};

/** Every skill item, lower-cased, with its layer index. */
function skillIndex(lang: Lang) {
  const out: { key: string; label: string; layer: number }[] = [];
  translations[lang].skills.layers.forEach((l, i) => l.items.forEach((item) => {
    item.split('/').forEach((part) => { const k = norm(part); if (k.length > 1) out.push({ key: k, label: item, layer: i }); });
  }));
  return out;
}

const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

/** The most likely topic of a question, or null when nothing matches. */
export function intentOf(question: string): Intent | null {
  const q = ` ${norm(question)} `;
  const has = (k: string) => q.includes(k.length >= 4 ? ` ${k}` : ` ${k} `);
  const [best] = (Object.keys(KEYWORDS) as Intent[]).map((i) => [i, KEYWORDS[i].filter(has).length] as const).sort((a, b) => b[1] - a[1]);
  return best[1] > 0 ? best[0] : null;
}

export function localAnswer(question: string, lang: Lang): string {
  const t = translations[lang];
  const es = lang === 'es';
  const q = ` ${norm(question)} `;
  // long keywords match as word prefixes (estudi → estudios), short ones as whole words
  const has = (k: string) => q.includes(k.length >= 4 ? ` ${k}` : ` ${k} `);

  // 1. a specific project by name
  const project = t.projects.items.find((p) => q.includes(norm(p.title)) || q.includes(` ${p.id} `));
  if (project) {
    const m = PROJECTS.find((x) => x.id === project.id)!;
    const link = m.live ?? m.repo ?? m.other?.url;
    return `**${project.title}** — ${project.kicker}.\n${project.desc}\n${es ? 'Tecnologías' : 'Stack'}: ${project.tech.join(', ')}.${link ? `\n${link}` : ''}`;
  }

  // 2. a specific technology
  const tech = skillIndex(lang).find((s) => s.key.length > 2 && q.includes(` ${s.key} `));
  const scores = (Object.keys(KEYWORDS) as Intent[]).map((i) => [i, KEYWORDS[i].filter(has).length] as const).sort((a, b) => b[1] - a[1]);
  const [intent, score] = scores[0];
  if (tech && (score === 0 || intent === 'skills')) {
    const layer = t.skills.layers[tech.layer];
    return es
      ? `Sí, **${tech.label}** forma parte de su capa de **${layer.name}**, junto a ${layer.items.filter((x) => x !== tech.label).join(', ')}.`
      : `Yes, **${tech.label}** is part of his **${layer.name}** layer, alongside ${layer.items.filter((x) => x !== tech.label).join(', ')}.`;
  }

  const items = t.journey.items;
  const of = (kind: string) => items.filter((m) => m.kind === kind);
  const contact = es
    ? `Puedes escribirle a **${CONTACT.email}**, llamarle o escribirle por WhatsApp al ${CONTACT.phoneDisplay}, o encontrarle en LinkedIn: ${CONTACT.linkedin}`
    : `You can email him at **${CONTACT.email}**, call or WhatsApp him on ${CONTACT.phoneDisplay}, or find him on LinkedIn: ${CONTACT.linkedin}`;

  if (score === 0) {
    return es
      ? `No tengo ese dato concreto. Puedo contarte su **formación**, su **experiencia**, sus **proyectos**, las **tecnologías** que usa o cómo **contactarle**. Para cualquier otra cosa, escríbele a ${CONTACT.email}.`
      : `I don't have that detail. I can tell you about his **education**, **experience**, **projects**, the **technologies** he uses or how to **contact** him. For anything else, email him at ${CONTACT.email}.`;
  }

  switch (intent) {
    case 'greet':
      return t.ai.greeting;
    case 'thanks':
      return es ? '¡A ti! Si quieres hablar con Juanma directamente, escríbele a ' + CONTACT.email + '.' : 'You\'re welcome! To talk to Juanma directly, email ' + CONTACT.email + '.';
    case 'about':
      return `${t.about.text}\n${t.about.stats.map((s) => `**${s.value}** ${s.label.toLowerCase()}`).join(' · ')}.`;
    case 'personal': {
      const p = PERSONAL[lang];
      return es
        ? `Te cuento un poco de él 🙂\n- ${p[2]}\n- ${p[3]}\n- ${p[4]}\n- ${p[1]}\nSi quieres conocerle mejor, escríbele a ${CONTACT.email}.`
        : `Here's a little about him 🙂\n- ${p[2]}\n- ${p[3]}\n- ${p[4]}\n- ${p[1]}\nIf you'd like to get to know him better, email him at ${CONTACT.email}.`;
    }
    case 'licence':
      return es ? 'Sí, Juanma tiene **carné de conducir tipo B**.' : 'Yes, Juanma holds a **type B driving licence**.';
    case 'study':
      return (es ? 'Su formación:\n' : 'His education:\n') + list(of('edu').map((m) => `**${m.title}** — ${m.org}, ${m.period}${m.tags?.length ? ` (${m.tags.join(', ')})` : ''}`))
        + `\n${PERSONAL[lang][1]}`;
    case 'work':
      return (es ? 'Su experiencia:\n' : 'His experience:\n') + list(of('work').map((m) => `**${m.title}** — ${m.org}, ${m.period}`));
    case 'cert':
      return (es ? 'Sus certificaciones:\n' : 'His certifications:\n') + list(of('cert').map((m) => `**${m.title}** — ${m.org}, ${m.period}`));
    case 'skills':
      return (es ? 'Lo que domina, de la base a la cima:\n' : 'What he works with, from the base up:\n') + list(t.skills.layers.map((l) => `**${l.name}**: ${l.items.join(', ')}`));
    case 'projects':
      return (es ? `Tiene ${t.projects.items.length} proyectos; pregúntame por cualquiera:\n` : `He has ${t.projects.items.length} projects; ask me about any of them:\n`) + list(t.projects.items.map((p) => `**${p.title}** — ${p.kicker}`));
    case 'cv':
      return es
        ? `Puedes ver o descargar su currículum con el botón **CV** de arriba, o directamente aquí: /${cvFileName('es')} (versión en inglés: /${cvFileName('en')}).`
        : `You can view or download his résumé with the **CV** button at the top, or directly here: /${cvFileName('en')} (Spanish version: /${cvFileName('es')}).`;
    case 'hire':
      return `**${t.hero.status}.** ${contact}`;
    case 'where':
      return es ? 'Vive en **Málaga, España**. Hizo sus prácticas Erasmus+ en Campobasso, Italia.' : 'He lives in **Málaga, Spain**. He did his Erasmus+ internship in Campobasso, Italy.';
    case 'contact':
      return contact;
  }
}
