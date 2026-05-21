// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • sitemap.ts → Search engine sitemap generation
// • Dynamic Metadata → Generates page-specific metadata (per-job URLs)
// ────────────────────────────────────────────────────────────────────────────
//
// force-dynamic: Generate the sitemap at REQUEST TIME (not build time).
// Without this, Next.js tries to statically generate /sitemap.xml during
// `next build` — but at that point the API server isn't running yet,
// so the fetch() to /api/jobs fails with ECONNREFUSED.
// With force-dynamic, sitemap is freshly generated on each crawl request.
export const dynamic = 'force-dynamic';
//
// Next.js App Router generates /sitemap.xml automatically from this file.
// A sitemap tells search engines about ALL the pages on your site so they
// can crawl and index them efficiently — crucial for SEO.
//
// This sitemap is DYNAMIC — it fetches all current job listings from the DB
// and includes a URL entry for each job's detail page.
//
// PRIORITY VALUES (0.0 – 1.0):
//   1.0 → Most important (homepage)
//   0.8 → Very important (job board, job listings)
//   0.5 → Normal (static pages)
//
// CHANGE FREQUENCY:
//   always   → Changes with every request
//   hourly   → Changes multiple times per day
//   daily    → Changes once a day
//   weekly   → Changes once a week
//   monthly  → Changes once a month
//   never    → Static, never changes
//
// Verify at: http://localhost:3001/sitemap.xml

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  // ─── Static Routes ────────────────────────────────────────────────────────
  // These pages always exist and don't depend on database content
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0, // Highest — homepage
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly', // Job board changes frequently
      priority: 0.9,             // Very high — main public page
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // ─── Dynamic Job Routes ───────────────────────────────────────────────────
  // Concept: Dynamic Metadata → Generates page-specific metadata
  // Fetch all jobs and create a sitemap entry for each one.
  // This runs at BUILD TIME (or ISR revalidation), not on every request.
  let jobRoutes: MetadataRoute.Sitemap = [];

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const res = await fetch(`${apiUrl}/jobs`, {
      // Revalidate every hour — sitemap stays reasonably fresh
      next: { revalidate: 3600, tags: ['jobs'] },
    });

    if (res.ok) {
      const jobs: Array<{
        _id: string;
        title: string;
        status: string;
        createdAt: string;
        updatedAt?: string;
      }> = await res.json();

      // Map each job to a sitemap entry
      jobRoutes = jobs
        // Only include active/hiring jobs — closed jobs don't need SEO
        .filter((job) =>
          ['Active', 'Hiring', 'Urgently Hiring'].includes(job.status)
        )
        .map((job) => ({
          url: `${baseUrl}/jobs/${job._id}`,
          lastModified: new Date(job.updatedAt || job.createdAt),
          changeFrequency: 'daily' as const, // Job details may update daily
          priority: 0.8, // High priority — individual job pages are landing pages
        }));
    }
  } catch (error) {
    // Don't fail the build if jobs can't be fetched
    // Sitemap will still include static routes
    console.warn('[sitemap.ts] Could not fetch jobs for sitemap:', error);
  }

  // Combine static + dynamic routes
  return [...staticRoutes, ...jobRoutes];
}
