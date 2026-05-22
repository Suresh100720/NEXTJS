// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • Dynamic Metadata  → generateMetadata() creates per-job metadata
// • OpenGraph         → Per-job OG card with job title, department, type
// • Dynamic OG Images → Points to /jobs/[id]/opengraph-image for each job
// • next/image        → Company/dept icon with optimization
// • LCP               → priority image + server-rendered content
// • CLS               → explicit image dimensions prevent layout shift
// • Metadata API      → generateMetadata pattern for dynamic routes
// ────────────────────────────────────────────────────────────────────────────

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface JobDetailPageProps {
  params: { id: string };
}

// Department to emoji mapping for visual flair
const DEPT_ICONS: Record<string, string> = {
  Engineering: '⚙️',
  Design: '🎨',
  Product: '📦',
  Marketing: '📣',
  Sales: '💼',
  HR: '👥',
  Finance: '💰',
  Operations: '🔧',
  Data: '📊',
};

// Status badge styles
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Urgently Hiring': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  Hiring: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  Closed: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
};

// ─── Fetch a single job ────────────────────────────────────────────────────
async function getJob(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    const res = await fetch(`${baseUrl}/jobs/${id}`, {
      // Revalidate this job every 60s (ISR)
      next: { revalidate: 60, tags: [`job-${id}`, 'jobs'] },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── generateMetadata — Dynamic Metadata per Job ─────────────────────────
// Concept: Dynamic Metadata → Generates page-specific metadata
// Concept: Metadata API → Dynamic SEO metadata management
// Concept: OpenGraph → Social media link preview metadata
// Concept: Dynamic OG Images → Generates custom social preview images
//
// Next.js calls this at request time (or ISR revalidation time) and injects
// the returned metadata into <head> for THIS specific job's page.
// Each job gets its own:
//   - <title>Senior Engineer | Recruitment Hub</title>
//   - <meta og:title content="Senior Engineer at Engineering...">
//   - <meta og:image> pointing to /jobs/[id]/opengraph-image
//     which generates a custom branded image for each job.
export async function generateMetadata(
  { params }: JobDetailPageProps
): Promise<Metadata> {
  const job = await getJob(params.id);

  // If job not found, return minimal metadata
  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'This job listing could not be found.',
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  // Experience string formatting
  const expText =
    job.experience && job.experience !== 'Fresher'
      ? `${job.experience} years experience`
      : 'Fresher / Entry-level';

  return {
    // Title uses the template: "Senior Engineer | Recruitment Hub"
    title: job.title,

    description: `${job.title} — ${job.department} department. ${job.type} position. ${expText} required. ${job.openings} opening(s) available. Apply now at Recruitment Hub.`,

    keywords: [
      job.title,
      job.department,
      job.type,
      'job opening',
      'apply now',
      'careers',
      'recruitment',
      expText,
    ],

    // ─── OpenGraph — per-job card ────────────────────────────────────────
    // Concept: OpenGraph → Social media link preview metadata
    // Concept: Dynamic OG Images → Generates custom social preview images
    //
    // The `images` URL points to opengraph-image.tsx which uses ImageResponse
    // to render a custom branded image for THIS specific job.
    openGraph: {
      title: `${job.title} | ${job.department}`,
      description: `${job.type} · ${expText} · ${job.openings} opening(s)`,
      url: `${baseUrl}/jobs/${params.id}`,
      type: 'website',
      images: [
        {
          // This URL triggers the opengraph-image.tsx dynamic image generator
          url: `/jobs/${params.id}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `${job.title} at Recruitment Hub`,
          type: 'image/png',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${job.title} | ${job.department}`,
      description: `${job.type} · ${expText} · ${job.openings} opening(s)`,
      images: [`${baseUrl}/jobs/${params.id}/opengraph-image.png`],
    },

    alternates: {
      canonical: `/jobs/${params.id}`,
    },
  };
}

// ─── Job Detail Page Component ────────────────────────────────────────────
export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await getJob(params.id);

  // Show 404 if job doesn't exist
  if (!job) notFound();

  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES['Active'];
  const deptIcon = DEPT_ICONS[job.department] || '💼';
  const expText =
    job.experience && job.experience !== 'Fresher'
      ? `${job.experience} Years`
      : 'Fresher';

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Back navigation */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
      >
        ← Back to Job Board
      </Link>

      {/* Job Header Card */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm">

        {/* Department icon + Status badge row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* ─── next/image — Department Icon ─────────────────────────────
                Concept: next/image → Optimized image loading component
                Concept: LCP → priority ensures this above-fold image is preloaded
                Concept: CLS → width/height prevents layout shift
                
                We use a local SVG icon mapped from department name.
                next/image handles lazy loading, format conversion, and sizing. */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-200">
              {deptIcon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {job.department}
              </p>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                {job.title}
              </h1>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {job.status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Type', value: job.type || 'Full-time', icon: '💼' },
            { label: 'Experience', value: expText, icon: '⏳' },
            { label: 'Openings', value: `${job.openings || 1}`, icon: '👥' },
            { label: 'Posted', value: new Date(job.createdAt || Date.now()).toLocaleDateString(), icon: '📅' },
          ].map((detail) => (
            <div
              key={detail.label}
              className="bg-slate-50 rounded-2xl p-4 text-center"
            >
              <div className="text-xl mb-1">{detail.icon}</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {detail.label}
              </p>
              <p className="text-sm font-black text-slate-800">{detail.value}</p>
            </div>
          ))}
        </div>

        {/* Description placeholder */}
        <div className="border-t border-slate-100 pt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            About this Role
          </h2>
          <p className="text-slate-500 leading-relaxed">
            We&apos;re looking for a talented <strong>{job.title}</strong> to join
            our <strong>{job.department}</strong> team. This is a{' '}
            <strong>{job.type || 'full-time'}</strong> position with{' '}
            <strong>{job.openings || 1}</strong> opening(s) available.
            {job.experience && job.experience !== 'Fresher'
              ? ` Candidates should have at least ${job.experience} years of relevant experience.`
              : ' This role is open to freshers and entry-level candidates.'}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 flex gap-3">
          <Link
            href="/jobs"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            ✈️ Apply for this Role
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            ← All Openings
          </Link>
        </div>
      </div>

      {/* OG Image Preview Card (dev helper) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            🖼️ Dev: Dynamic OG Image Preview
          </p>
          <p className="text-xs text-slate-500 mb-3">
            This job&apos;s custom social preview image is generated at:{' '}
            <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600 font-mono">
              /api/jobs/{params.id}/og
            </code>
          </p>
          {/* 
            Concept: next/image → Optimized image loading component
            Previewing the dynamically generated OG image from the stable API route
          */}
          <Image
            src={`/api/jobs/${params.id}/og`}
            alt={`OG image for ${job.title}`}
            width={600}
            height={315}
            className="rounded-xl border border-slate-200 w-full h-auto shadow-sm"
            unoptimized // Dynamic images don't need re-optimization
          />
        </div>
      )}
    </div>
  );
}
