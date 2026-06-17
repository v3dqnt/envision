import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="night-calm"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'calm-sage': 'var(--calm-sage)',
        'deep-pine': 'var(--deep-pine)',
        'warm-sand': 'var(--warm-sand)',
        'soft-clay': 'var(--soft-clay)',
        'sky-mist': 'var(--sky-mist)',
        'paper': 'var(--paper)',
        'ink': 'var(--ink)',
        'mist': 'var(--mist)',
        'success': 'var(--success)',
        'attention': 'var(--attention)',
        'info': 'var(--info)',
        'surface': 'var(--surface)',
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        fraunces: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'calm': '0 4px 20px -2px rgba(46, 79, 74, 0.05), 0 2px 8px -1px rgba(46, 79, 74, 0.03)',
        'calm-hover': '0 10px 30px -5px rgba(46, 79, 74, 0.08), 0 4px 12px -2px rgba(46, 79, 74, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
