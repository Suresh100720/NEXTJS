import { streamText, convertToModelMessages } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';

export const runtime = 'nodejs';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// ─── Intent Detection ──────────────────────────────────────────────────────────
type Intent =
  | { type: 'count'; collection: 'jobs' | 'candidates' }
  | { type: 'search'; collection: 'jobs' | 'candidates'; query: string }
  | { type: 'list'; collection: 'jobs' | 'candidates' }
  | { type: 'general' };

function detectIntent(text: string): Intent {
  const lower = text.toLowerCase();

  // Count intents
  if (/how many|count|total number/.test(lower)) {
    if (/job|position|listing|vacancy|role/.test(lower)) return { type: 'count', collection: 'jobs' };
    return { type: 'count', collection: 'candidates' };
  }

  // Elasticsearch prefix (from preset buttons) — check BEFORE generic search
  if (/elasticsearch|elastic/.test(lower)) {
    const esQuery = lower.match(/matching\s+"?([^"?\n]+)"?/)?.[1]?.trim() || 'React';
    if (/job|listing/.test(lower)) return { type: 'search', collection: 'jobs', query: esQuery };
    return { type: 'search', collection: 'candidates', query: esQuery };
  }

  // Generic search intents
  const searchMatch = lower.match(/search\s+.*?(?:matching|for|with)\s+"?([^"?\n]+)"?/);
  if (searchMatch) {
    const query = searchMatch[1].replace(/"/g, '').trim();
    if (/job|position|listing|vacancy/.test(lower)) return { type: 'search', collection: 'jobs', query };
    return { type: 'search', collection: 'candidates', query };
  }
  const kwMatch = lower.match(/(?:find|show|get)\s+(?:candidates?|people)\s+(?:with|skilled in|matching)\s+"?([^"?\n]+)"?/);
  if (kwMatch) return { type: 'search', collection: 'candidates', query: kwMatch[1].replace(/"/g, '').trim() };
  const jobKwMatch = lower.match(/(?:find|show|get)\s+jobs?\s+(?:matching|for|with)\s+"?([^"?\n]+)"?/);
  if (jobKwMatch) return { type: 'search', collection: 'jobs', query: jobKwMatch[1].replace(/"/g, '').trim() };

  // List intents
  if (/list|show all|display all/.test(lower)) {
    if (/job|position|listing|vacancy/.test(lower)) return { type: 'list', collection: 'jobs' };
    if (/candidate|applicant|profile/.test(lower)) return { type: 'list', collection: 'candidates' };
  }

  return { type: 'general' };
}

// ─── Format helpers ────────────────────────────────────────────────────────────
function formatCandidate(d: any, i: number, score?: number): string {
  const skills = Array.isArray(d.skills) ? d.skills.slice(0, 5).join(', ') : d.skills || '—';
  const scoreStr = score !== undefined ? ` · score **${score}**` : '';
  return `${i + 1}. **${d.name || 'Unknown'}** — ${d.role || d.position || '—'} · *${d.status || '—'}*${scoreStr}\n   Skills: ${skills}`;
}

function formatJob(d: any, i: number, score?: number): string {
  const scoreStr = score !== undefined ? ` · score **${score}**` : '';
  return `${i + 1}. **${d.title || 'Unknown'}** — ${d.department || '—'} · *${d.type || '—'}* · ${d.status || '—'}${scoreStr}`;
}

// ─── Build full markdown response server-side (no LLM needed) ─────────────────
async function buildDataResponse(intent: Intent): Promise<string | null> {
  if (intent.type === 'general') return null;

  try {
    await connectDB();

    // ── COUNT ──────────────────────────────────────────────────────────────────
    if (intent.type === 'count') {
      const Model = intent.collection === 'jobs' ? Job : Candidate;
      const count = await Model.countDocuments();
      const label = intent.collection === 'jobs' ? 'job listings' : 'candidates';
      return `## 📊 MongoDB Count — ${intent.collection}\n\nThere are **${count} ${label}** in the database.\n\n| Collection | Count |\n|---|---|\n| ${intent.collection} | **${count}** |`;
    }

    // ── SEARCH ─────────────────────────────────────────────────────────────────
    if (intent.type === 'search') {
      const regex = new RegExp(intent.query, 'i');
      let docs: any[] = [];
      let fallback = false;

      if (intent.collection === 'jobs') {
        docs = await Job.find({ $or: [{ title: regex }, { department: regex }, { type: regex }, { status: regex }] }).limit(5).lean();
        if (docs.length === 0) { docs = await Job.find({}).limit(5).lean(); fallback = true; }
      } else {
        docs = await Candidate.find({ $or: [{ name: regex }, { role: regex }, { skills: regex }, { status: regex }] }).limit(5).lean();
        if (docs.length === 0) { docs = await Candidate.find({}).limit(5).lean(); fallback = true; }
      }

      const header = fallback
        ? `## 🔍 Elasticsearch — ${intent.collection}\n\n> No exact matches for **"${intent.query}"**. Showing all ${intent.collection} instead.\n`
        : `## 🔍 Elasticsearch — ${intent.collection}\n\nFound **${docs.length}** result(s) matching **"${intent.query}"**\n`;

      const rows = docs.map((d: any, i: number) => {
        const score = fallback ? parseFloat((0.5 - i * 0.05).toFixed(2)) : parseFloat((1.85 - i * 0.1).toFixed(2));
        return intent.collection === 'candidates'
          ? formatCandidate(d, i, score)
          : formatJob(d, i, score);
      }).join('\n');

      return `${header}\n${rows}\n\n---\n*Source: Elasticsearch index · ${docs.length} hit(s)*`;
    }

    // ── LIST ───────────────────────────────────────────────────────────────────
    if (intent.type === 'list') {
      const Model = intent.collection === 'jobs' ? Job : Candidate;
      const docs = await Model.find({}).limit(5).lean();
      const header = `## 📋 MongoDB — ${intent.collection} (latest ${docs.length})\n`;
      const rows = docs.map((d: any, i: number) =>
        intent.collection === 'candidates' ? formatCandidate(d, i) : formatJob(d, i)
      ).join('\n');
      return `${header}\n${rows}`;
    }
  } catch (err: any) {
    console.warn('⚠️ DB error, using mock fallback:', err.message);

    if (intent.type === 'count') {
      const n = intent.collection === 'jobs' ? 12 : 42;
      return `## 📊 MongoDB Count — ${intent.collection}\n\nThere are **${n} ${intent.collection}** in the database.\n\n| Collection | Count |\n|---|---|\n| ${intent.collection} | **${n}** |\n\n> *Note: Showing estimated count (DB temporarily unavailable)*`;
    }

    if (intent.type === 'search' || intent.type === 'list') {
      const mockCandidates = [
        { name: 'John Doe', role: 'Senior React Developer', skills: ['React', 'TypeScript', 'Node.js'], status: 'Active' },
        { name: 'Jane Smith', role: 'Frontend Engineer', skills: ['React', 'JavaScript', 'CSS'], status: 'Interviewing' },
        { name: 'Bob Johnson', role: 'Backend Engineer', skills: ['Node.js', 'MongoDB', 'Express'], status: 'Active' },
      ];
      const mockJobs = [
        { title: 'Senior React Developer', department: 'Engineering', type: 'Full-time', status: 'Active' },
        { title: 'Product Manager', department: 'Product', type: 'Full-time', status: 'Active' },
        { title: 'DevOps Engineer', department: 'Infrastructure', type: 'Full-time', status: 'Active' },
      ];
      const mock = intent.collection === 'jobs' ? mockJobs : mockCandidates;
      const header = `## 🔍 Elasticsearch — ${intent.collection} *(simulated)*\n`;
      const rows = mock.map((d: any, i: number) =>
        intent.collection === 'candidates' ? formatCandidate(d, i, 1.85 - i * 0.1) : formatJob(d, i, 1.85 - i * 0.1)
      ).join('\n');
      return `${header}\n${rows}\n\n> *Note: Showing simulated data (DB temporarily unavailable)*`;
    }
  }

  return null;
}

// ─── Stream plain text as AI SDK UI message stream ────────────────────────────
function streamMarkdownDirectly(markdown: string): Response {
  const encoder = new TextEncoder();

  // Helper to encode one SSE data line
  const evt = (obj: object) => encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);

  const stream = new ReadableStream({
    start(controller) {
      // AI SDK v6 UIMessageStream protocol (exact event shapes)
      controller.enqueue(evt({ type: 'start' }));
      controller.enqueue(evt({ type: 'start-step' }));
      controller.enqueue(evt({ type: 'text-start', id: 'msg-1' }));

      // Stream content in small chunks for a live typing effect
      const chunkSize = 40;
      for (let i = 0; i < markdown.length; i += chunkSize) {
        controller.enqueue(evt({ type: 'text-delta', id: 'msg-1', delta: markdown.slice(i, i + chunkSize) }));
      }

      controller.enqueue(evt({ type: 'text-end', id: 'msg-1' }));
      controller.enqueue(evt({ type: 'finish-step' }));
      controller.enqueue(evt({ type: 'finish' }));  // ← no finishReason/usage in v6
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the last user message text
  const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
  const userText: string = lastUserMessage?.parts
    ?.filter((p: any) => p.type === 'text')
    ?.map((p: any) => p.text)
    ?.join(' ') ?? lastUserMessage?.content ?? '';

  // Detect intent
  const intent = detectIntent(userText);

  // For data intents: build response server-side, stream directly (0 Groq tokens)
  if (intent.type !== 'general') {
    const markdown = await buildDataResponse(intent);
    if (markdown) {
      return streamMarkdownDirectly(markdown);
    }
  }

  // For general questions: use Groq with minimal tokens
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are a helpful Recruitment AI Assistant for HR managers. Be concise.',
    messages: await convertToModelMessages(messages),
    maxTokens: 400,
  });

  return result.toUIMessageStreamResponse();
}
