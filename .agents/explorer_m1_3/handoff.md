# Handoff Report: Milestone 1 (Project Scaffold & Layout)

## 1. Observation

- **Project Location**: `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai`
- **Initial Workspace State**: Direct listing of the project root shows only three files/directories:
  ```json
  {"name":".agents", "isDir":true}
  {"name":"PROJECT.md", "sizeBytes":"4086"}
  {"name":"brand.md", "sizeBytes":"8236"}
  ```
- **Branding Requirements (`brand.md`)**:
  - **Color Palette (Light)**:
    - `--calm-sage`: `#7FA99B` (primary brand)
    - `--deep-pine`: `#2E4F4A` (headings, primary text)
    - `--warm-sand`: `#EAE3D6` (surfaces, cards)
    - `--soft-clay`: `#D9A283` (gentle accent)
    - `--sky-mist`: `#A9C5CE` (secondary actions, info)
    - `--paper`: `#FAF7F2` (app background)
    - `--ink`: `#33403D` (body text)
    - `--mist`: `#C9D2CE` (borders, dividers)
    - `--success`: `#6FAE7E`, `--attention`: `#E0B25C`, `--info`: `#7FA1B8`
  - **Color Palette (Dark / Night Calm)**:
    - `--paper`: `#161E1C` (dark bg)
    - `--surface`: `#1E2826` (dark card)
    - `--ink`: `#E4E9E6` (dark text)
    - `--calm-sage`: `#8FBBAC` (dark sage)
    - `--mist`: `#2C3835` (dark borders)
  - **Typography**:
    - Headings: `Fraunces` (variable serif)
    - Body: `Inter` (sans-serif)
    - Scale: Body 17-18px, line-height 1.6+
  - **Textures & Details**:
    - Subtle noise/grain overlay (2-4% opacity) over the page layout.
    - Large rounded corners (`16-28px`).
    - Smooth transitions (300-500ms ease-out).
- **Architecture (`PROJECT.md`)**:
  - Next.js (App Router), TypeScript, Tailwind CSS, GSAP.
  - Page layout files target:
    - `src/app/layout.tsx` - App layout with fonts, grain overlay, and theme provider.
    - `src/app/page.tsx` - Main app portal (upload, processing, dashboard container).
    - `src/components/ui/` - Basic layout elements.

---

## 2. Logic Chain

1. **Scaffold Bootstrap Method**: Because the workspace directory is not empty (contains `.agents`, `PROJECT.md`, `brand.md`), running `npx create-next-app` directly inside the folder would fail or complain. Therefore, the safest and cleanest way to initialize the project is to manually write the configuration files (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`) and execute `npm install`.
2. **Branding Colors Integration**: Implementing CSS variables inside `globals.css` that dynamically toggle values under the `.dark` class allows for first-class dark mode ("Night Calm") support. Tailwind colors should be configured to reference these variables.
3. **Fonts Load Optimization**: Using `next/font/google` in `src/app/layout.tsx` ensures optimal font delivery, prevents cumulative layout shift (CLS), and cleanly exposes CSS variables (`--font-fraunces`, `--font-inter`) for Tailwind configuration.
4. **Noise/Grain Overlay**: To avoid static assets or network latency, the noise overlay can be dynamically generated as a CSS background property using a standard SVG fractal noise filter inlined as a Data-URI. A fixed, full-viewport layer with `pointer-events-none` and `opacity-[0.03]` (3%) overlaying the application satisfies the brand texture guidelines.
5. **Responsive Layout Shell**: The landing page (`src/app/page.tsx`) needs to show a complete, responsive shell with a header (logo + title + theme toggle button), a central content page section (placeholder for file upload card), and a footer displaying the brand promise ("Seen. Clear. Capable. In control.") to complete Milestone 1.

---

## 3. Caveats

- **No GSAP Transitions Yet**: Milestone 1 focuses on scaffolding and static layout design. Interactive GSAP animations (e.g. scanning effect, button spring animations) are scheduled for Milestone 2 and 5 respectively and are not implemented here.
- **E2E Infrastructure**: Playwright setup (E2E-M1) is being configured in a parallel track. The implementation track should build its code layout in `src/` to remain fully aligned.

---

## 4. Conclusion & Actionable Implementation Plan

### Step-by-Step Implementation Sequence

The Implementer agent should create the following files with the specified contents:

#### 1. Setup `package.json`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\package.json`:
```json
{
  "name": "envis",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.379.0",
    "gsap": "^3.12.5",
    "tesseract.js": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.3"
  }
}
```

#### 2. Setup `tsconfig.json`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 3. Setup `next.config.mjs`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

#### 4. Setup `postcss.config.js`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### 5. Setup `tailwind.config.ts`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\tailwind.config.ts`:
```typescript
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
        fraunces: ["var(--font-fraunces)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

#### 6. Setup `src/app/globals.css`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\src\app\globals.css`:
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

  .dark {
    --calm-sage: #8FBBAC;
    --deep-pine: #2E4F4A;
    --warm-sand: #EAE3D6;
    --soft-clay: #D9A283;
    --sky-mist: #A9C5CE;
    --paper: #161E1C;
    --surface: #1E2826;
    --ink: #E4E9E6;
    --mist: #2C3835;
    --success: #6FAE7E;
    --attention: #E0B25C;
    --info: #7FA1B8;
  }

  body {
    background-color: var(--paper);
    color: var(--ink);
    font-family: var(--font-inter), sans-serif;
    font-size: 17px;
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-fraunces), serif;
  }
}

.noise-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
```

#### 7. Setup `src/app/layout.tsx`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\src\app\layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ENVIS - Crisis-to-Action Translator",
  description: "Turning overwhelming documents into calm, clear, doable steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen relative font-inter antialiased">
        {/* Subtle noise/grain overlay (3% opacity) */}
        <div className="fixed inset-0 pointer-events-none z-50 noise-bg opacity-[0.03]" />
        {children}
      </body>
    </html>
  );
}
```

#### 8. Setup `src/app/page.tsx`
Write the following contents to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\src\app\page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-mist dark:border-[#2C3835] bg-paper dark:bg-[#161E1C] px-6 py-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-calm-sage flex items-center justify-center">
              <span className="text-white font-fraunces font-bold text-lg">E</span>
            </div>
            <span className="font-fraunces font-bold text-2xl text-deep-pine dark:text-[#8FBBAC]">
              ENVIS
            </span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover:bg-warm-sand dark:hover:bg-[#1E2826] transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-deep-pine" />
            ) : (
              <Sun className="w-5 h-5 text-[#8FBBAC]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col justify-center items-center">
        <div className="text-center space-y-6 max-w-xl">
          <h1 className="font-fraunces text-4xl md:text-5xl font-bold tracking-tight text-deep-pine dark:text-[#E4E9E6]">
            Take a breath.
          </h1>
          <p className="font-inter text-lg md:text-xl text-ink dark:text-[#E4E9E6] opacity-80 leading-relaxed">
            Here's what this actually means, and here's your next step. Drop a document below to get started.
          </p>

          {/* Placeholder Upload Card to show responsive shell layout */}
          <div className="mt-12 bg-white dark:bg-[#1E2826] border border-mist dark:border-[#2C3835] rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:translate-y-[-2px] duration-300 group cursor-pointer">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-warm-sand dark:bg-[#2C3835] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg className="w-8 h-8 text-deep-pine dark:text-[#8FBBAC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-fraunces font-medium text-lg text-deep-pine dark:text-[#E4E9E6]">
                  Drop your document here
                </p>
                <p className="font-inter text-sm text-ink dark:text-[#E4E9E6] opacity-65">
                  or click to upload (PDF, PNG, JPG)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-mist dark:border-[#2C3835] bg-paper dark:bg-[#161E1C] px-6 py-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink dark:text-[#E4E9E6] opacity-60">
          <p className="font-inter">
            Seen. Clear. Capable. In control.
          </p>
          <p className="font-inter text-xs">
            © 2026 ENVIS. Muted for your calm.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

#### 9. Execute `npm install`
Run `npm install` to download dependencies.

#### 10. Compile Check
Run `npm run build` to verify the Next.js bundle compiles successfully without errors.

---

## 5. Verification Method

- **Build Compile Verification**:
  Run `npm run build` from the project root. If the build compiles successfully without compilation/TypeScript errors, the setup is correct.
- **Visual & Code Review Verification**:
  - Open `src/app/layout.tsx` to verify `Fraunces` and `Inter` google fonts are loaded and exposed as Tailwind classes, and the grain overlay component exists in the DOM.
  - Open `src/app/globals.css` to verify that all functional brand color values mapped under CSS variables match the hex specifications in `brand.md`.
  - Open `src/app/page.tsx` to verify responsive shell elements (Header, Main, Footer, and theme toggle buttons) are structured.
- **Theme Toggle Verification**:
  Run local dev server (`npm run dev`) and toggle theme button. Ensure the class `dark` is appended to the root `<html>` tag and text/background colors update correctly.
