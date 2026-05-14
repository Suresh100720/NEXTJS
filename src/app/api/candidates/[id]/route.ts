import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const candidate = await Candidate.findById(params.id);
    if (!candidate) return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const candidate = await Candidate.findByIdAndUpdate(params.id, body, { new: true });
    if (!candidate) return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const candidate = await Candidate.findByIdAndDelete(params.id);
    if (!candidate) return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    return NextResponse.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
