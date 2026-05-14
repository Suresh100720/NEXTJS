import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q) return NextResponse.json({ jobs: [], candidates: [] });

    const query = { $regex: q, $options: 'i' };
    
    const jobs = await Job.find({
      $or: [{ title: query }, { department: query }]
    });

    const candidates = await Candidate.find({
      $or: [{ name: query }, { role: query }, { skills: query }]
    });

    return NextResponse.json({ jobs, candidates });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
