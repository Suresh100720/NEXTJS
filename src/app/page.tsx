// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • Metadata API    → Static metadata for the homepage
// • OpenGraph       → Social media link preview metadata
// • next/image      → Optimized image loading component (hero section)
// • LCP             → priority prop on hero image preloads it for fastest LCP
// • CLS             → explicit width/height prevents layout shift
// ────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

// ─── Static Metadata ──────────────────────────────────────────────────────
// Concept: Metadata API → Dynamic SEO metadata management
// Concept: OpenGraph → Social media link preview metadata
// This overrides the base metadata from layout.tsx for the homepage only.
// The `title` here replaces the `template` from the root layout.
export const metadata: Metadata = {
  title: 'Recruitment Hub | The Future of Hiring is Here',
  description:
    'Experience AI-powered recruitment — find, match, and hire top talent faster. Built for modern hiring teams who demand speed and intelligence.',
  keywords: [
    'recruitment platform',
    'AI hiring',
    'job board',
    'talent acquisition',
    'candidate matching',
    'next.js recruitment',
  ],
  // ─── OpenGraph ────────────────────────────────────────────────────────────
  // Concept: OpenGraph → Social media link preview metadata
  // Controls the preview card when this URL is shared on LinkedIn/Slack/Twitter
  openGraph: {
    title: 'Recruitment Hub | The Future of Hiring is Here',
    description:
      'AI-powered recruitment — find, match, and hire top talent faster.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruitment Hub | The Future of Hiring is Here',
    description:
      'AI-powered recruitment — find, match, and hire top talent faster.',
  },
  // Canonical URL — prevents duplicate content penalties
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">

      {/* ─── Hero Image — next/image + LCP optimization ──────────────────────
          Concept: next/image → Optimized image loading component
          Concept: LCP → Measures main content loading speed

          priority={true}:
            → Adds <link rel="preload"> in <head> for this image
            → Disables lazy loading for above-the-fold content
            → CRITICAL for LCP — hero image IS the LCP element

          width + height:
            → Concept: CLS → Prevents layout shift during loading
            → Browser knows the space to reserve BEFORE image loads
            → Without this, content jumps when image loads (bad CLS score)

          sizes:
            → Tells browser which size to download at each viewport width
            → Prevents downloading a 1200px image on a 375px phone screen
      ─────────────────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-2xl mx-auto mb-4">
        <Image
          src="/hero-illustration.svg"
          alt="Recruitment Hub — AI-powered hiring platform illustration"
          width={700}
          height={400}
          priority={true}            // LCP fix: preloads this image in <head>
          sizes="(max-width: 768px) 100vw, 700px"  // Responsive sizing
          className="w-full h-auto"
          style={{ objectFit: 'contain' }}
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent">
          The future of hiring <br /> is here.
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Experience the power of Nex. A recruitment platform built for speed,
          driven by intelligence, and designed for humans.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-200"
        >
          Enter Dashboard
        </Link>
        <Link
          href="/jobs"
          className="px-8 py-4 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        >
          View Job Board
        </Link>
      </div>

      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
        {[
          {
            title: 'AI Matching',
            desc: 'Find the perfect candidate with our neural scoring engine.',
            icon: '🧠',
          },
          {
            title: 'Parallel Routing',
            desc: 'Seamlessly navigate through candidate profiles without losing context.',
            icon: '⚡',
          },
          {
            title: 'Real-time Analytics',
            desc: 'Monitor your hiring pipeline with live dashboard updates.',
            icon: '📊',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-indigo-600">
              {feature.title}
            </h3>
            <p className="text-slate-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
