import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { ids } = await req.json();
    await Candidate.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: 'Candidates deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
