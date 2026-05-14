import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const candidate = await Candidate.findById(params.id);
    if (!candidate) return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });

    if (process.env.GROQ_API_KEY) {
      const prompt = `Generate a professional, concise 2-sentence summary for the following candidate:
      Name: ${candidate.name}
      Role: ${candidate.role}
      Experience: ${candidate.experience ? (candidate.experience === 'Fresher' ? 'Fresher/Recent Graduate' : `${candidate.experience} years`) : 'Not specified'}
      Skills: ${candidate.skills?.join(', ') || 'None listed'}
      Status: ${candidate.status}
      
      The summary should explicitly mention their years of experience and highlight their suitability for the role based on their skills.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional recruitment assistant. Provide ONLY the summary text. Do not include any introductory phrases like "Here is a summary" or "Here is a 2-sentence summary". Just start with the summary directly.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
      });

      return NextResponse.json({ summary: chatCompletion.choices[0]?.message?.content || 'Summary not available.' });
    } else {
      const expText = candidate.experience ? (candidate.experience === 'Fresher' ? 'Entry-level' : `${candidate.experience}-year experienced`) : 'Professional';
      const skillsText = candidate.skills && candidate.skills.length > 0 ? `with skills in ${candidate.skills.slice(0, 3).join(', ')}` : 'ready for new opportunities';
      return NextResponse.json({ summary: `${expText} ${candidate.role} ${skillsText}. Currently in the ${candidate.status} stage.` });
    }
  } catch (error) {
    console.error('Groq Error:', error);
    return NextResponse.json({ message: 'Failed to generate summary' }, { status: 500 });
  }
}
