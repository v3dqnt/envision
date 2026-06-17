import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "calm-sage": "var(--calm-sage)",
        "deep-pine": "var(--deep-pine)",
        "warm-sand": "var(--warm-sand)",
        "soft-clay": "var(--soft-clay)",
        "sky-mist": "var(--sky-mist)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        mist: "var(--mist)",
        success: "var(--success)",
        attention: "var(--attention)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
      },
      boxShadow: {
        calm: "0 4px 20px -2px rgba(46, 79, 74, 0.03), 0 2px 8px -1px rgba(46, 79, 74, 0.02)",
        "calm-hover": "0 10px 30px -4px rgba(46, 79, 74, 0.06), 0 4px 12px -2px rgba(46, 79, 74, 0.04)",
      },
      borderRadius: {
        "calm-card": "20px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
