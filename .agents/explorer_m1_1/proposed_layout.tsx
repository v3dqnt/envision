import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

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
  title: "ENVIS | Crisis-to-Action Translator",
  description: "Translate overwhelming documents into calm, clear, doable steps.",
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
      <body className="antialiased">
        {/* Subtle noise/grain overlay (2-4% opacity) */}
        <div className="noise-overlay" aria-hidden="true" />
        
        <div className="flex flex-col min-h-screen relative z-10">
          {/* Header/Shell */}
          <header className="border-b border-mist bg-paper/85 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo: Metaphor for stepping stones / path forward */}
                <svg className="w-8 h-8 text-calm-sage" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19H8V15H4V19ZM10 15H14V11H10V15ZM16 11H20V7H16V11Z" fill="currentColor" />
                  <path d="M4 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-serif text-xl font-medium tracking-tight text-deep-pine">
                  ENVIS
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-8 md:py-12 transition-colors duration-300">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-mist bg-paper/50 py-10 text-center text-sm text-ink/75 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-6 flex flex-col gap-3">
              <p className="font-serif italic text-base text-deep-pine/80 max-w-md mx-auto">
                "Take a breath. Here's what this actually means, and here's your next step."
              </p>
              <p className="text-xs text-ink/50 mt-2">
                © {new Date().getFullYear()} ENVIS. A calm space to regain agency over complex situations.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
