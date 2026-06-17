import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { DocumentProvider } from "@/context/DocumentContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";

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
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'night-calm');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.removeAttribute('data-theme');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen relative font-inter antialiased flex bg-paper">
        {/* Subtle noise/grain overlay (3% opacity) */}
        <div className="noise-overlay" />
        <AuthProvider>
          <DocumentProvider>
            <AuthGate>
              <Sidebar />
              <div className="flex-1 flex flex-col min-h-screen relative w-full">
                {children}
              </div>
            </AuthGate>
          </DocumentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
