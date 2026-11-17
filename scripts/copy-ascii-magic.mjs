// Self-hosts the ASCII Magic library (MIT, ascii-magic.com): its runtime and all
// of its pieces are copied into public/ so <ascii-art> loads them from our own
// origin, plus a small index used by the terminal's `ascii` command.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const src = join('node_modules', 'ascii-magic-art');
const out = join('public', 'ascii-magic-art');
if (!existsSync(src)) {
  console.warn('[ascii-magic] package not installed; skipping copy');
  process.exit(0);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const dir of ['runtime', 'lib', 'pieces']) cpSync(join(src, dir), join(out, dir), { recursive: true });
for (const f of ['LICENSE', 'NOTICE', 'categories.json']) cpSync(join(src, f), join(out, f));

const pick = (s, key) => (s.match(new RegExp(`${key}:\\s*"([^"]+)"`)) || [])[1];
const pieces = readdirSync(join(src, 'pieces'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => {
    const s = readFileSync(join(src, 'pieces', f), 'utf8');
    return { slug: f.slice(0, -3), name: pick(s, 'name') || f.slice(0, -3), category: pick(s, 'category') || '' };
  });
writeFileSync(join(out, 'index.json'), JSON.stringify(pieces));
console.log(`[ascii-magic] ${pieces.length} pieces self-hosted in ${out}`);
