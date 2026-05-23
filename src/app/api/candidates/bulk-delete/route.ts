import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { ids } = await req.json();
    await Candidate.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: 'Candidates deleted successfully' });
  } catch (error) {
    console.error('API POST /api/candidates/bulk-delete failed:', error);
    Sentry.captureException(error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
