import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './translations.ts',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        pixel: ['Silkscreen', 'monospace'],
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
        teal: 'var(--teal)',
        mint: 'var(--mint)',
        coral: 'var(--coral)',
        berry: 'var(--berry)',
        panel: 'var(--panel)',
      },
    },
  },
  plugins: [animate],
};
