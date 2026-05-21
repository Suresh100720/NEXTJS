import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const runtime = 'nodejs';

// Ensure the Groq API key is present at startup; otherwise the endpoint will fail.
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is missing – the /api/completion route cannot function.');
}

const groq = createGroq({ apiKey: GROQ_API_KEY ?? '' });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return new Response('Server misconfiguration: missing GROQ_API_KEY', { status: 500 });
    }

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `You are a recruitment copywriting assistant.\nDraft professional, polished content for HR teams.\nFormat your output in clean markdown.\n\nTask: ${prompt}`,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('⚠️ /api/completion error:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(`Server error: ${message}`, { status: 500 });
  }
}
