import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const role = searchParams.get('role');
    const experience = searchParams.get('experience');
    const status = searchParams.get('status');
    
    const jobFilter: any = {};
    const candidateFilter: any = {};

    const escapeRegex = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (q) {
      const query = { $regex: '\\b' + escapeRegex(q), $options: 'i' };
      jobFilter.$or = [{ title: query }, { department: query }];
      candidateFilter.$or = [{ name: query }, { role: query }, { skills: query }];
    }

    if (role) {
      const roleQuery = { $regex: '\\b' + escapeRegex(role), $options: 'i' };
      jobFilter.title = roleQuery;
      candidateFilter.role = roleQuery;
    }

    if (experience) {
      jobFilter.experience = experience;
      candidateFilter.experience = experience;
    }

    if (status) {
      const statusQuery = { $regex: '\\b' + escapeRegex(status), $options: 'i' };
      jobFilter.status = statusQuery;
      candidateFilter.status = statusQuery;
    }

    // If no query and no filters, return empty results (prevent showing all 9 jobs by default)
    if (!q && !role && !experience && !status) {
      return NextResponse.json({ jobs: [], candidates: [] });
    }

    const jobs = await Job.find(jobFilter);
    const candidates = await Candidate.find(candidateFilter);

    return NextResponse.json({ jobs, candidates });
  } catch (error) {
    console.error('API GET /api/search failed:', error);
    Sentry.captureException(error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
