// ─── BUNDLE ANALYZER ───────────────────────────────────────────────────────
// Concept: Bundle Analyzer → Visualizes JavaScript bundle sizes
// Run: ANALYZE=true npm run build  (or npm run analyze)
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── FONT OPTIMIZATION ────────────────────────────────────────────────────
  // Concept: next/font → Automatic font optimization system
  // Concept: Font Subsetting → Loads only required font files
  // Next.js automatically subsets, self-hosts, and inlines font CSS
  optimizeFonts: true,

  // Standalone output — changes build trace collection mechanism.
  // Fixes known Next.js 14 bug: "_app.js.nft.json not found" ENOENT
  // when using serverComponentsExternalPackages in pure App Router apps.
  // Standalone also bundles only the files needed to run the app (smaller deploy).
  output: 'standalone',

  // ─── IMAGE OPTIMIZATION ───────────────────────────────────────────────────
  // Concept: next/image → Optimized image loading component
  // Serves modern formats (WebP/AVIF), resizes, lazy-loads, prevents CLS
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Allow external images from common CDNs (extend as needed)
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
    ],
  },

  transpilePackages: [
    'react-markdown',
    'remark-gfm',
    'remark-parse',
    'unified',
    'bail',
    'is-plain-obj',
    'trough',
    'vfile',
    'vfile-message',
    'unist-util-stringify-position',
    'mdast-util-from-markdown',
    'mdast-util-to-markdown',
    'micromark',
    'decode-named-character-reference',
    'character-entities',
  ],

  experimental: {
    // Next.js 14.2 key for server-only external packages
    // groq-sdk added to prevent PageNotFoundError during 'Collecting page data'
    serverComponentsExternalPackages: ['pdfjs-dist', 'mammoth', 'pdf-parse', 'groq-sdk'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

// Sentry Webpack and Options Configuration
export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    silent: true,
    org: 'recruitment-hub',
    project: 'recruitment-hub',
  },
  {
    widenClientSandbox: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
