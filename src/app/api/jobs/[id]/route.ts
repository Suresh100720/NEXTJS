// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • Dynamic Metadata  → GET endpoint feeds generateMetadata() + sitemap.ts
// • Dynamic OG Images → GET endpoint feeds the OG image generator
// • sitemap.ts        → revalidateTag('jobs') keeps sitemap fresh
// ────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { revalidatePath, revalidateTag } from 'next/cache';
import * as Sentry from '@sentry/nextjs';

// ─── GET /api/jobs/[id] ────────────────────────────────────────────────────
// Used by:
//   1. Job detail page (/jobs/[id]) via getJob()
//   2. generateMetadata() for per-job dynamic metadata
//   3. opengraph-image.tsx for dynamic OG image generation
//   4. sitemap.ts for per-job sitemap entries
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const job = await Job.findById(params.id);
    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error(`API GET /api/jobs/${params.id} failed:`, error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const job = await Job.findByIdAndUpdate(params.id, body, { new: true });
    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${params.id}`);
    revalidatePath('/dashboard');
    // Concept: sitemap.ts → revalidateTag keeps the dynamic sitemap fresh
    revalidateTag('jobs');
    return NextResponse.json(job);
  } catch (error) {
    console.error(`API PUT /api/jobs/${params.id} failed:`, error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const job = await Job.findByIdAndDelete(params.id);
    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }
    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    // Concept: sitemap.ts → revalidateTag triggers sitemap regeneration
    revalidateTag('jobs');
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(`API DELETE /api/jobs/${params.id} failed:`, error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
