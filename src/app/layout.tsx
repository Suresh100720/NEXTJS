// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • next/font        → Automatic font optimization system
// • Font Subsetting  → Loads only required font characters (latin subset only)
// • Metadata API     → Dynamic SEO metadata management (root/base metadata)
// • OpenGraph        → Social media link preview metadata
// • Core Web Vitals  → WebVitals reporter mounted here for LCP/INP/CLS tracking
// ────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";

// ─── next/font — Font Subsetting ────────────────────────────────────────────
// Concept: next/font → Automatic font optimization system
// Next.js downloads Inter at BUILD TIME, self-hosts it, and injects
// a <link rel="preload"> in the <head> — zero layout shift, no FOUT.
//
// Concept: Font Subsetting → Loads only required font files
// subsets: ['latin'] — only downloads ~35kb of glyphs needed for English UI
// instead of the full ~500kb Inter font family.
// display: 'swap' — text renders immediately in fallback font, then swaps (CLS fix)
// variable: '--font-inter' — exposes CSS variable for use throughout the app
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import WebVitals from "@/components/WebVitals";

// Primary UI font — Latin subset only (Font Subsetting)
const inter = Inter({
  subsets: ["latin"],          // Font Subsetting: only latin characters
  display: "swap",             // CLS fix: prevents invisible text during font load
  variable: "--font-inter",    // CSS variable for theming
  preload: true,               // LCP fix: preloads font in <head>
  fallback: ["system-ui", "arial"], // Fallback chain for instant render
});

// Monospace font for code/stats — Latin subset only
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],          // Font Subsetting
  display: "swap",
  variable: "--font-mono",
  preload: false,              // Lower priority than primary font
});

// ─── Metadata API — Root Metadata ───────────────────────────────────────────
// Concept: Metadata API → Dynamic SEO metadata management
// Concept: OpenGraph → Social media link preview metadata
// This is the BASE metadata — child pages can override individual fields
// using their own `export const metadata` or `generateMetadata()`.
export const metadata: Metadata = {
  // metadataBase is required for absolute OG image URLs
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  ),

  title: {
    default: "Recruitment Hub | The Future of Hiring",
    // %s is replaced by child page titles — e.g. "Senior Dev | Recruitment Hub"
    template: "%s | Recruitment Hub",
  },

  description:
    "Recruitment Hub — an AI-powered platform for modern hiring teams. Find, match, and hire top talent faster with intelligent candidate scoring.",

  keywords: [
    "recruitment",
    "hiring",
    "jobs",
    "careers",
    "AI matching",
    "talent acquisition",
    "job board",
  ],

  authors: [{ name: "Recruitment Hub Team" }],

  // robots: controls search engine indexing behaviour
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  // ─── OpenGraph ─────────────────────────────────────────────────────────────
  // Concept: OpenGraph → Social media link preview metadata
  // Controls how links appear when shared on LinkedIn, Twitter, Slack, etc.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
    siteName: "Recruitment Hub",
    title: "Recruitment Hub | The Future of Hiring",
    description:
      "AI-powered recruitment platform — find and hire top talent faster.",
    images: [
      {
        url: "/og-default.png", // static fallback OG image
        width: 1200,
        height: 630,
        alt: "Recruitment Hub — The Future of Hiring",
      },
    ],
  },

  // Twitter/X card metadata
  twitter: {
    card: "summary_large_image",
    title: "Recruitment Hub | The Future of Hiring",
    description:
      "AI-powered recruitment platform — find and hire top talent faster.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply both font CSS variables to <html> so all descendants can use them
    <html
      lang="en"
      className={`h-full bg-white ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className={`${inter.className} h-full text-slate-900 antialiased`}
      >
        <Providers>
          {/* ─── Core Web Vitals Reporter ───────────────────────────────────
              Concept: Core Web Vitals → Google performance/UX metrics
              Concept: LCP, INP, CLS tracking
              WebVitals is a client component that uses useReportWebVitals()
              to log LCP, INP, CLS, TTFB, FCP in the browser console. */}
          <WebVitals />
          {children}
        </Providers>
      </body>
    </html>
  );
}
