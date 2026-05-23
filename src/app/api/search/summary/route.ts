import Groq from 'groq-sdk';
import { logAiCall } from '@/lib/aiLogger';
import * as Sentry from '@sentry/nextjs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
  const startTime = Date.now();
  let promptText = '';
  try {
    const { q, role, experience, status } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return new Response('No Groq API Key found.', { status: 500 });
    }

    const prompt = `You are an AI assistant helping a recruiter summarize search intent.
      The recruiter is searching their database using the following filters:
      - Search Query: ${q || 'None'}
      - Role: ${role || 'None'}
      - Experience: ${experience || 'None'}
      - Status: ${status || 'None'}
      
      Based on this, write a concise, professional 2-sentence summary of what type of talent they are looking for and what action they seem to be taking. Do not start with "The recruiter is looking for...". Start directly with the insight.`;
    promptText = prompt;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullText += content;
            controller.enqueue(content);
          }
          controller.close();

          const latency = Date.now() - startTime;
          const promptTokens = Math.ceil(prompt.length / 4);
          const completionTokens = Math.ceil(fullText.length / 4);

          await logAiCall({
            endpoint: '/api/search/summary',
            model: 'llama-3.1-8b-instant',
            prompt: prompt,
            response: fullText,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            latencyMs: latency,
            status: 'success',
          });
        } catch (err: any) {
          const latency = Date.now() - startTime;
          console.error('AI Summary stream reading error:', err);
          Sentry.captureException(err);
          await logAiCall({
            endpoint: '/api/search/summary',
            model: 'llama-3.1-8b-instant',
            prompt: prompt,
            latencyMs: latency,
            status: 'error',
            errorMessage: err.message,
          });
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-ai-endpoint': '/api/search/summary',
        'x-ai-model': 'llama-3.1-8b-instant',
      }
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error('AI Summary error:', error);
    Sentry.captureException(error);
    await logAiCall({
      endpoint: '/api/search/summary',
      model: 'llama-3.1-8b-instant',
      prompt: promptText || 'Unknown prompt',
      latencyMs: latency,
      status: 'error',
      errorMessage: error.message,
    });
    return new Response('Failed to generate summary.', { status: 500 });
  }
}
