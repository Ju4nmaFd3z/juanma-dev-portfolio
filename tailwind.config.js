import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './translations.ts',
    './content.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg-2)',
        ink: 'var(--ink)',
        ink2: 'var(--ink-2)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        lineStrong: 'var(--line-strong)',
        accent: 'var(--accent)',
        accentText: 'var(--accent-text)',
        onAccent: 'var(--on-accent)',
        sea: 'var(--sea)',
        gold: 'var(--gold)',
        rose: 'var(--rose)',
        panel: 'var(--panel)',
      },
    },
  },
  plugins: [animate],
};
