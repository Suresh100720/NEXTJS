import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('API GET /api/jobs failed:', error);
    Sentry.captureException(error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const job = new Job(body);
    const savedJob = await job.save();
    revalidatePath('/jobs');
    revalidatePath('/dashboard');
    return NextResponse.json(savedJob, { status: 201 });
  } catch (error) {
    console.error('API POST /api/jobs failed:', error);
    Sentry.captureException(error);
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}
