import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { logAiCall } from '@/lib/aiLogger';
import * as Sentry from '@sentry/nextjs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required and must be an array.' }, { status: 400 });
    }

    const lastMsg = messages[messages.length - 1];
    const lastUserMessage = lastMsg?.parts
      ? lastMsg.parts
          .filter((p: any) => p.type === 'text' || p.type === 'reasoning')
          .map((p: any) => p.text)
          .join('')
      : lastMsg?.content ?? "";

    // 1. Establish the ReadableStream for real-time text-streaming
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Attempt streaming from GROQ LLM (acting as Claude/AI Chat assistant)
          if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not defined");
          }

          const chatCompletion = await groq.chat.completions.create({
            messages: messages.map((m: any) => {
              const content = m.parts
                ? m.parts
                    .filter((p: any) => p.type === 'text' || p.type === 'reasoning')
                    .map((p: any) => p.text)
                    .join('')
                : m.content ?? '';
              return {
                role: m.role,
                content
              };
            }),
            model: 'llama-3.3-70b-versatile',
            stream: true,
          });

          let fullText = '';
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();

          const latency = Date.now() - startTime;
          const promptTokens = Math.ceil(lastUserMessage.length / 4);
          const completionTokens = Math.ceil(fullText.length / 4);

          await logAiCall({
            endpoint: '/api/chat',
            model: 'llama-3.3-70b-versatile',
            prompt: lastUserMessage,
            response: fullText,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            latencyMs: latency,
            status: 'success',
          });
        } catch (err: any) {
          console.error("⚠️ Groq streaming failed, propagating error:", err.message);
          Sentry.captureException(err);
          
          await logAiCall({
            endpoint: '/api/chat',
            model: 'llama-3.3-70b-versatile',
            prompt: lastUserMessage,
            latencyMs: Date.now() - startTime,
            status: 'error',
            errorMessage: err.message,
          });

          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'x-ai-endpoint': '/api/chat',
        'x-ai-model': 'llama-3.3-70b-versatile',
      },
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error("❌ Error in chat endpoint:", error);
    Sentry.captureException(error);
    logAiCall({
      endpoint: '/api/chat',
      model: 'llama-3.3-70b-versatile',
      prompt: 'Error parsing body',
      latencyMs: latency,
      status: 'error',
      errorMessage: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
