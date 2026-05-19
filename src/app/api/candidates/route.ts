import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import { z } from 'zod';

// Zod Schema for type-safe validation
const CandidateCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  score: z.number().min(0).max(100).optional(),
  status: z.enum(['Screening', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected']).optional().default('Screening'),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
});

export async function GET() {
  try {
    await connectDB();
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Perform Zod validation
    const validation = CandidateCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.error.format() 
      }, { status: 400 });
    }

    const candidate = new Candidate(validation.data);
    const savedCandidate = await candidate.save();
    return NextResponse.json(savedCandidate, { status: 201 });
  } catch (error: any) {
    // Handle duplicate key error for email
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A candidate with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

