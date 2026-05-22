import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import Groq from 'groq-sdk';
import { logAiCall } from '@/lib/aiLogger';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now();
  let promptText = '';
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
      promptText = prompt;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional recruitment assistant. Provide ONLY the summary text. Do not include any introductory phrases like "Here is a summary" or "Here is a 2-sentence summary". Just start with the summary directly.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
      });

      const responseText = chatCompletion.choices[0]?.message?.content || 'Summary not available.';
      const latency = Date.now() - startTime;

      const promptTokens = chatCompletion.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      const completionTokens = chatCompletion.usage?.completion_tokens || Math.ceil(responseText.length / 4);
      const totalTokens = chatCompletion.usage?.total_tokens || (promptTokens + completionTokens);

      await logAiCall({
        endpoint: `/api/candidates/[id]/summary`,
        model: 'llama-3.1-8b-instant',
        prompt: prompt,
        response: responseText,
        promptTokens,
        completionTokens,
        totalTokens,
        latencyMs: latency,
        status: 'success',
      });

      return NextResponse.json(
        { summary: responseText },
        {
          headers: {
            'x-ai-endpoint': `/api/candidates/[id]/summary`,
            'x-ai-model': 'llama-3.1-8b-instant',
            'x-ai-latency': String(latency),
            'x-ai-tokens': String(totalTokens),
          },
        }
      );
    } else {
      const expText = candidate.experience ? (candidate.experience === 'Fresher' ? 'Entry-level' : `${candidate.experience}-year experienced`) : 'Professional';
      const skillsText = candidate.skills && candidate.skills.length > 0 ? `with skills in ${candidate.skills.slice(0, 3).join(', ')}` : 'ready for new opportunities';
      const summaryText = `${expText} ${candidate.role} ${skillsText}. Currently in the ${candidate.status} stage.`;
      
      const latency = Date.now() - startTime;
      await logAiCall({
        endpoint: `/api/candidates/[id]/summary (Fallback)`,
        model: 'llama-3.1-8b-instant (Simulated)',
        prompt: `Mock summary for candidate ${candidate.name}`,
        response: summaryText,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs: latency,
        status: 'success',
      });

      return NextResponse.json({ summary: summaryText });
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error('Groq Error:', error);
    await logAiCall({
      endpoint: `/api/candidates/[id]/summary`,
      model: 'llama-3.1-8b-instant',
      prompt: promptText || 'Unknown prompt',
      latencyMs: latency,
      status: 'error',
      errorMessage: error.message,
    });
    return NextResponse.json({ message: 'Failed to generate summary' }, { status: 500 });
  }
}
