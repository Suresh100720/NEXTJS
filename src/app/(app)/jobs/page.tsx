// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • Metadata API     → Dynamic SEO metadata management
// • Dynamic Metadata → Generates page-specific metadata
// • OpenGraph        → Social media link preview metadata
// • LCP              → Server-prefetch ensures content is in HTML (no loading flash)
// ────────────────────────────────────────────────────────────────────────────

import { getJobs } from '@/lib/api';
import JobsClient from './JobsClient';
import { Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

// ─── Dynamic Metadata ─────────────────────────────────────────────────────
// Concept: Dynamic Metadata → Generates page-specific metadata
// Concept: Metadata API → Dynamic SEO metadata management
//
// This metadata is STATIC for the jobs listing page.
// For per-job metadata, see /jobs/[id]/page.tsx which uses generateMetadata()
// to create DYNAMIC metadata with the job title, department, etc.
export const metadata: Metadata = {
  // Using the template from root layout: "Public Job Board | Recruitment Hub"
  title: 'Public Job Board',
  description:
    'Explore the latest career opportunities at Recruitment Hub. Browse open positions across engineering, design, product, and more. Apply directly online.',

  keywords: [
    'job board',
    'open positions',
    'careers',
    'software engineering jobs',
    'remote jobs',
    'hiring',
    'job listings',
  ],

  // Prevent search engines from caching stale job counts in SERP snippets
  robots: {
    index: true,
    follow: true,
    'max-snippet': 200,         // Allow rich snippets up to 200 chars
    'max-image-preview': 'large',
  },

  // ─── OpenGraph ────────────────────────────────────────────────────────────
  // Concept: OpenGraph → Social media link preview metadata
  openGraph: {
    title: 'Public Job Board | Recruitment Hub',
    description:
      'Browse open positions and apply directly. Join a team that builds with AI.',
    url: '/jobs',
    type: 'website',
    images: [
      {
        url: '/og-jobs.png',   // Custom OG image for job board (fallback)
        width: 1200,
        height: 630,
        alt: 'Recruitment Hub — Public Job Board',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Public Job Board | Recruitment Hub',
    description:
      'Browse open positions and apply directly. Join a team that builds with AI.',
  },

  alternates: {
    canonical: '/jobs',
  },
};

export default async function JobsPage() {
  const queryClient = new QueryClient();

  try {
    // ─── PREFETCHING + LCP Optimization ─────────────────────────────────────
    // Concept: LCP → Measures main content loading speed
    // By prefetching on the SERVER, the job cards HTML is in the initial
    // response — no client-side loading state on first paint = better LCP.
    await queryClient.prefetchQuery({
      queryKey: ['jobs'],
      queryFn: () => getJobs(),
    });
  } catch (error) {
    console.error('Failed to prefetch jobs:', error);
  }

  // Serialize server cache state for client reuse
  const dehydratedState = dehydrate(queryClient);

  return (
    // Transfer server-fetched data into client cache — eliminates duplicate fetch
    <HydrationBoundary state={dehydratedState}>
      <JobsClient />
    </HydrationBoundary>
  );
}
