import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
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

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(content);
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error) {
    console.error('AI Summary error:', error);
    return new Response('Failed to generate summary.', { status: 500 });
  }
}
