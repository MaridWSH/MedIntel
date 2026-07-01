import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0b1d2a', soft: '#1a2c3a' },
        paper: { DEFAULT: '#f6f3ea', warm: '#f1ece0', soft: '#e8e1d1' },
        rule: '#e2dccb',
        teal: {
          DEFAULT: '#0d9488',
          deep: '#0b7d72',
          bright: '#14b8a6',
          mist: '#5eaaa0',
        },
        amber: { ink: '#967338', bg: '#f6ecd6' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Zodiak', 'Times New Roman', 'serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

