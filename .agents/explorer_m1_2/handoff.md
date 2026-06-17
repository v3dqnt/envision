# Handoff Report: Milestone 1 Exploration & Layout Plan

## 1. Observation

During the exploration of the workspace and configuration files, the following was observed:

1. **Project Root Structure**:
   - Running `list_dir` on `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai` shows only three main elements:
     - `.agents` directory
     - `PROJECT.md`
     - `brand.md`
   - No pre-existing Next.js project scaffold, `package.json`, or Tailwind configuration files exist in the root directory. It is a clean slate.

2. **Brand Guidelines (`brand.md`)**:
   - **Color Tokens** (lines 54-71):
     - `--calm-sage` `#7FA99B` (primary brand trust/growth)
     - `--deep-pine` `#2E4F4A` (headings/primary text on light)
     - `--warm-sand` `#EAE3D6` (surfaces, cards)
     - `--soft-clay` `#D9A283` (accent, highlights)
     - `--sky-mist` `#A9C5CE` (secondary actions, info)
     - `--paper` `#FAF7F2` (app background)
     - `--ink` `#33403D` (body text)
     - `--mist` `#C9D2CE` (borders, dividers)
     - Functional: `--success` `#6FAE7E`, `--attention` `#E0B25C` (time-sensitive), `--info` `#7FA1B8`
   - **Dark Mode ("Night Calm") Mapping** (lines 134-142):
     - `--paper` (bg): `#161E1C`
     - `--surface` (card): `#1E2826`
     - `--ink` (text): `#E4E9E6`
     - `--calm-sage` (accent): `#8FBBAC`
     - `--mist` (border): `#2C3835`
   - **Typography** (lines 77-84):
     - Headings: Approchable authority serif font `Fraunces`
     - Body: Legible sans-serif font `Inter`
     - Scale: Body 17-18px, line-height 1.6+
   - **Noise/Grain Overlay** (line 113):
     - "Light grain / soft noise texture (2-4% opacity) over flat fills to kill the sterile 'default app' feel and add warmth."
   - **Surfaces & Layout** (lines 88-92, 110-115, 121-125):
     - One primary action per screen, lots of whitespace, rounded corners (16-28px radius).
     - Flat, confident colors (no gradients, meshes, or auroras).
     - Spatial depth: layered cards with large blur radii and low-opacity shadows.

3. **E2E Interface Contracts (`sub_orch_e2e/SCOPE.md`)**:
   - Selectors required for E2E tests (lines 28-44):
     - Drag-and-Drop Area: `[data-testid="upload-dropzone"]`
     - File Input: `input[type="file"]`
     - Manual Text Textarea: `[data-testid="manual-text-input"]`
     - Submit Button: `[data-testid="translate-submit-btn"]`
     - Preset Document Buttons: `[data-testid^="preset-doc-"]`
     - Loading State / Breathing Sage Disc: `[data-testid="breathing-sage-loader"]`
     - Scanning Progress Bar/Text: `[data-testid="ocr-scanning-progress"]`
     - Empathic Summary Panel: `[data-testid="empathic-summary-panel"]`
     - Urgency/Timeline: `[data-testid="timeline-container"]`, deadline items with `data-testid="deadline-item"`, urgency tags with `--attention` or `--soft-clay` classes / styles.
     - Jargon Decoder: jargon words highlighted as buttons/spans `[data-testid^="jargon-word-"]`, decoder popover `[data-testid="jargon-popover"]`
     - Checklist: checklist container `[data-testid="action-checklist"]`, checklist items with checkboxes `[data-testid^="checklist-item-checkbox-"]`, circular progress indicator `[data-testid="checklist-progress-indicator"]`
     - Response Draft: assistant container `[data-testid="response-draft-assistant"]`, tone options `[data-testid^="tone-btn-"]`, copy-to-clipboard button `[data-testid="copy-draft-btn"]`
     - Resource Directory: directory container `[data-testid="emergency-resource-directory"]`, resource cards `[data-testid="resource-card"]`
     - Theme Toggle: button `[data-testid="theme-toggle-btn"]`, HTML root changes theme class or `data-theme` attribute (e.g. `dark` or `night-calm`)
     - Focus Ring Indicator: `:focus-visible` outline classes on keyboard navigation.

---

## 2. Logic Chain

Based on these observations, we can establish the following logical plan to scaffold the project and configure colors, typography, and noise:

1. **Boilerplate Setup**:
   - Since the root is empty of code, a Next.js (App Router) TypeScript boilerplate must be set up.
   - Recommended dependencies should include React 19, Next 15, Tailwind CSS v3 (or v4 depending on configuration, but standard custom CSS variables format is highly compatible), Lucide icons for UI, and GSAP for upcoming milestones.

2. **Tailwind Config & CSS Variables**:
   - The brand guidelines require adaptive colors based on theme selection. Defining these as CSS variables in `src/app/globals.css` allows theming.
   - The `:root` selector holds the Light Theme tokens, and `.dark` / `[data-theme="night-calm"]` holds the Dark Theme tokens.
   - Tailwind config should extend `theme.colors` to bind these CSS variables.

3. **Font Integration**:
   - In Next.js, loading Google fonts via `next/font/google` is the recommended method to prevent layout shift.
   - Set up `Inter` and `Fraunces` as CSS variable fonts, and apply them using `font-sans` and `font-serif` in Tailwind config.

4. **Noise/Grain Overlay**:
   - To achieve the "2026 look" with desaturated colors and organic feel, a full-screen fixed overlay is required.
   - Using a SVG turbulence background filter inside a data-URI on a pseudo-element or container with `pointer-events-none` avoids image loading overhead.
   - The opacity must be restricted to `0.02` to `0.04` (2-4%) to avoid visual noise clutter.

5. **Responsive Shell**:
   - The layout needs a main outer element (`src/app/layout.tsx`) containing the global CSS, font classes, noise overlay, theme provider, header, footer, and basic layout wrapper.
   - The main content page (`src/app/page.tsx`) needs basic structure reflecting the E2E selectors, ready for milestone implementations.

---

## 3. Caveats

1. **Framework Versions**: Since Next.js 15 and React 19 are modern, clean config files (`next.config.mjs`) should be used.
2. **SVG Noise Performance**: Rendering a CSS SVG noise pattern using SVG turbulence filter is lightweight but can sometimes trigger GPU repaint issues if animated. Keeping it static (non-animated) keeps performance optimal.
3. **No Code Modification Constraint**: We are strictly prohibited from implementing files. The actual implementation must be executed by the implementer agent using this blueprint.

---

## 4. Conclusion & Proposed Architecture

A detailed architecture for files is proposed below:

### Proposed `package.json`
```json
{
  "name": "envis-crisis-translator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "gsap": "^3.12.5",
    "lucide-react": "^0.468.0",
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.5.5",
    "tesseract.js": "^5.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.17.9",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.16.0",
    "eslint-config-next": "15.1.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2"
  }
}
```

### Proposed `tailwind.config.ts`
```typescript
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
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
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
```

### Proposed `src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --calm-sage: #7FA99B;
    --deep-pine: #2E4F4A;
    --warm-sand: #EAE3D6;
    --soft-clay: #D9A283;
    --sky-mist: #A9C5CE;
    --paper: #FAF7F2;
    --surface: #FFFFFF;
    --ink: #33403D;
    --mist: #C9D2CE;
    --success: #6FAE7E;
    --attention: #E0B25C;
    --info: #7FA1B8;
  }

  [data-theme="night-calm"] {
    --calm-sage: #8FBBAC;
    --deep-pine: #2E4F4A;
    --warm-sand: #1E2826;
    --paper: #161E1C;
    --surface: #1E2826;
    --ink: #E4E9E6;
    --mist: #2C3835;
  }

  body {
    background-color: var(--paper);
    color: var(--ink);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  /* Custom keyboard focus outline for compliance */
  *:focus-visible {
    outline: 2px solid var(--calm-sage);
    outline-offset: 4px;
  }
}

@layer components {
  /* Dynamic SVG Noise overlay to give warm, tactile look */
  .noise-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0.035; /* 3.5% opacity */
    pointer-events: none;
    z-index: 9999;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    mix-blend-mode: overlay;
  }
}
```

### Proposed `src/app/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ENVIS — Crisis-to-Action Translator",
  description: "Turning overwhelming documents into calm, clear, doable steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} data-theme="light">
      <head>
        {/* Anti-flash inline script for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night-calm' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'night-calm') {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-paper text-ink transition-colors duration-300 font-sans selection:bg-calm-sage/30">
        {/* Noise overlay container */}
        <div className="noise-overlay" />
        
        {/* Layout Shell */}
        <div className="flex flex-col min-h-screen relative z-10">
          <header className="border-b border-mist bg-paper/85 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Brand Logo & Name */}
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-calm-sage flex items-center justify-center text-paper font-serif font-bold text-lg">
                  E
                </span>
                <span className="font-serif text-2xl font-bold tracking-tight text-deep-pine dark:text-calm-sage">
                  ENVIS
                </span>
              </div>
              
              {/* Theme Selector */}
              <div>
                <button
                  data-testid="theme-toggle-btn"
                  aria-label="Toggle Night Calm mode"
                  className="px-4 py-2 text-sm font-medium border border-mist rounded-full bg-surface hover:bg-warm-sand transition-colors text-ink shadow-calm hover:shadow-calm-hover"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>

          <footer className="border-t border-mist bg-paper/50 py-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
              <p className="text-sm font-serif italic text-ink/70">
                Seen. Clear. Capable. In control.
              </p>
              <p className="text-xs text-ink/65 mt-2 sm:mt-0">
                ENVIS © 2026. Built with accessibility and calm in mind.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
```

### Proposed `src/app/page.tsx`
```tsx
import React from "react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Introduction Hero Section */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight text-deep-pine dark:text-calm-sage">
          Let’s read it together.
        </h1>
        <p className="text-lg text-ink/80 leading-relaxed font-sans">
          Upload any overwhelming document — a bill, a notice, or a letter. We will translate it into a simple explanation and a clear, doable checklist.
        </p>
      </section>

      {/* Main Content Area Container */}
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {/* Placeholder for Upload Portal (M2) */}
        <section 
          data-testid="upload-dropzone"
          className="border-2 border-dashed border-mist rounded-3xl bg-surface p-12 text-center shadow-calm hover:shadow-calm-hover transition-all duration-300 relative group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-calm-sage/15 flex items-center justify-center mx-auto text-calm-sage">
              {/* Icon placeholder */}
              <span className="text-xl">↓</span>
            </div>
            <div>
              <p className="text-md font-semibold text-deep-pine dark:text-calm-sage">
                Drop it here — we'll take it from here
              </p>
              <p className="text-xs text-ink/60 mt-1">
                Supports JPEG, PNG, PDF up to 10MB
              </p>
            </div>
            
            {/* Hidden Input field for test accessibility */}
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              aria-label="Upload document file"
            />
          </div>
        </section>

        {/* Placeholder for Manual Input */}
        <section className="bg-surface border border-mist rounded-3xl p-6 shadow-calm">
          <h2 className="font-serif text-xl font-bold mb-4 text-deep-pine dark:text-calm-sage">Or paste text manually</h2>
          <textarea
            data-testid="manual-text-input"
            rows={5}
            className="w-full p-4 border border-mist rounded-2xl bg-paper text-ink focus:border-calm-sage focus:ring-1 focus:ring-calm-sage transition-all outline-none resize-none"
            placeholder="Paste the scary legalese here..."
          />
          <div className="mt-4 flex justify-end">
            <button
              data-testid="translate-submit-btn"
              className="bg-calm-sage hover:bg-calm-sage/90 text-paper px-6 py-2.5 rounded-full font-medium shadow-calm hover:shadow-calm-hover transition-all duration-200"
            >
              Translate Document
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## 5. Verification Method

To independently verify the configuration and layout once the implementer scaffolds the files:

1. **Build Success**:
   - Run `npm run build` or `yarn build` to check for compilation/TS/Linter errors.
2. **Visual & Font Verification**:
   - Start the dev server: `npm run dev` (expected on `http://localhost:3000`).
   - Open developer tools and verify:
     - `<html>` elements receive variables `--font-inter` and `--font-fraunces` correctly.
     - Root font-family for headings resolves to `Fraunces` (serif) and for body text to `Inter` (sans-serif).
     - Noise layer class `.noise-overlay` is present in DOM, covers screen with 3.5% opacity and `pointer-events-none`.
3. **Color Contrast & Theme Toggle**:
   - Check that tailwind colors are correctly mapping to CSS custom variables under computed properties.
   - Click Theme Toggle button and verify `<html>` changes its `data-theme` attribute to `night-calm` or class list to include `dark`.
   - Verify variables change to desaturated green values (`#161E1C` paper, etc.) and text contrast remains WCAG AA compliant.
