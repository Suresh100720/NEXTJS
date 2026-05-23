import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { logAiCall } from '@/lib/aiLogger';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'nodejs';

// Ensure the Groq API key is present at startup; otherwise the endpoint will fail.
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is missing – the /api/completion route cannot function.');
}

const groq = createGroq({ apiKey: GROQ_API_KEY ?? '' });

export async function POST(req: Request) {
  const startTime = Date.now();
  let promptText = '';
  try {
    const { prompt } = await req.json();
    promptText = prompt;

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return new Response('Server misconfiguration: missing GROQ_API_KEY', { status: 500 });
    }

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `You are a recruitment copywriting assistant.\nDraft professional, polished content for HR teams.\nFormat your output in clean markdown.\n\nTask: ${prompt}`,
      onFinish: async (event) => {
        const latency = Date.now() - startTime;
        await logAiCall({
          endpoint: '/api/completion',
          model: 'llama-3.3-70b-versatile',
          prompt: prompt,
          response: event.text,
          promptTokens: (event.usage as any)?.promptTokens || 0,
          completionTokens: (event.usage as any)?.completionTokens || 0,
          totalTokens: (event.usage as any)?.totalTokens || 0,
          latencyMs: latency,
          status: 'success',
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'x-ai-endpoint': '/api/completion',
        'x-ai-model': 'llama-3.3-70b-versatile',
      },
    });
  } catch (err: any) {
    const latency = Date.now() - startTime;
    console.error('⚠️ /api/completion error:', err);
    Sentry.captureException(err);
    await logAiCall({
      endpoint: '/api/completion',
      model: 'llama-3.3-70b-versatile',
      prompt: promptText || 'Unknown prompt',
      latencyMs: latency,
      status: 'error',
      errorMessage: err.message,
    });
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(`Server error: ${message}`, { status: 500 });
  }
}
