// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • robots.ts → Search engine crawling control
// ────────────────────────────────────────────────────────────────────────────
//
// Next.js 13+ App Router generates /robots.txt automatically from this file.
// It tells search engine crawlers (Googlebot, Bingbot, etc.) which pages
// they are allowed or disallowed from indexing.
//
// RULES:
//   allow   → crawler CAN index this path
//   disallow → crawler MUST NOT index this path
//
// WHY DISALLOW SOME PATHS?
//   /api/*       → Raw JSON endpoints — no user value, wastes crawl budget
//   /dashboard   → Auth-protected — crawlers can't log in anyway
//   /register    → Registration form — no SEO value
//   /login       → Login form — no SEO value
//
// The `sitemap` field tells crawlers WHERE to find your sitemap.xml
// which lists all the pages you WANT indexed.
//
// Verify at: http://localhost:3001/robots.txt

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  return {
    rules: [
      {
        // Default rule for all crawlers
        userAgent: '*',
        // ✅ Public pages — allow indexing
        allow: [
          '/',        // Homepage
          '/jobs',    // Public job board ← most important for SEO
          '/jobs/',   // Individual job pages
        ],
        // 🚫 Private / non-valuable pages — block indexing
        disallow: [
          '/api/',        // API routes — JSON, no SEO value
          '/dashboard',   // Auth-protected area
          '/register',    // Registration page
          '/login',       // Login page
          '/_next/',      // Next.js internal files
          '/search',      // Dynamic search results — prevent duplicate content
        ],
      },
      {
        // Googlebot-specific rules (inherits above + can be more permissive/strict)
        userAgent: 'Googlebot',
        allow: ['/', '/jobs', '/jobs/'],
        disallow: ['/api/', '/dashboard', '/register', '/login'],
      },
    ],

    // Sitemap location — helps crawlers discover all your pages efficiently
    // Concept: sitemap.ts → Search engine sitemap generation
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
