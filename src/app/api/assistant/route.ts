import { streamText, tool } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';

export const runtime = 'nodejs';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an intelligent Recruitment AI Assistant. You help HR managers and recruiters query their database.

You have two tools available:
- searchElasticsearch: For full-text search across job listings and candidate profiles
- queryMongo: For direct database queries like counting records, fetching by ID, or listing documents

Always use these tools when the user asks about data. Explain what tool you are calling, then summarize the results in a clear, formatted markdown response.
[ignoring loop detection]`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages,
    maxSteps: 5,
    toolChoice: 'auto',
    tools: {

      // ── ES Tool Call ───────────────────────────────────────────────────────────
      searchElasticsearch: tool({
        description:
          'Simulated Elasticsearch full-text search across jobs or candidates. Use this for keyword/skill/title searches.',
        parameters: z.object({
          query: z.string().describe('The search keyword or phrase.'),
          index: z
            .enum(['jobs', 'candidates'])
            .describe('Which index to search: "jobs" or "candidates".'),
        }),
        execute: async ({ query, index }) => {
          await connectDB();
          const regex = new RegExp(query, 'i');
          let hits: any[] = [];

          if (index === 'jobs') {
            const docs = await Job.find({
              $or: [{ title: regex }, { department: regex }, { type: regex }, { status: regex }],
            }).limit(5).lean();
            hits = docs;
          } else {
            const docs = await Candidate.find({
              $or: [{ name: regex }, { role: regex }, { skills: regex }, { status: regex }],
            }).limit(5).lean();
            hits = docs;
          }

          // Return an Elasticsearch-shaped response
          return {
            took: Math.floor(Math.random() * 20) + 5,
            timed_out: false,
            _shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
            hits: {
              total: { value: hits.length, relation: 'eq' },
              max_score: 1.85,
              hits: hits.map((doc, i) => ({
                _index: index,
                _id: String(doc._id),
                _score: parseFloat((1.85 - i * 0.1).toFixed(2)),
                _source: { ...doc, _id: String(doc._id) },
              })),
            },
          };
        },
      }),

      // ── Mongo Tool Call ────────────────────────────────────────────────────────
      queryMongo: tool({
        description:
          'Direct MongoDB query for counting records, listing documents, or fetching by ID.',
        parameters: z.object({
          collection: z
            .enum(['jobs', 'candidates'])
            .describe('MongoDB collection to query.'),
          operation: z
            .enum(['count', 'find', 'findById'])
            .describe('Operation: "count" total docs, "find" with optional filter, "findById" for one doc.'),
          filter: z
            .string()
            .optional()
            .describe('Optional keyword to filter by title (jobs) or name (candidates).'),
          id: z.string().optional().describe('Document ID for findById operation.'),
        }),
        execute: async ({ collection, operation, filter, id }) => {
          await connectDB();

          if (collection === 'jobs') {
            if (operation === 'count') {
              const count = await Job.countDocuments();
              return { collection, operation, count, message: `There are ${count} job listings in MongoDB.` };
            }
            if (operation === 'findById' && id) {
              const doc = await Job.findById(id).lean();
              return { collection, operation, document: doc ? { ...doc, _id: String((doc as any)._id) } : null };
            }
            const query = filter ? { title: new RegExp(filter, 'i') } : {};
            const docs = await Job.find(query).limit(5).lean();
            return {
              collection,
              operation,
              count: docs.length,
              documents: docs.map((d) => ({ ...d, _id: String((d as any)._id) })),
            };
          } else {
            if (operation === 'count') {
              const count = await Candidate.countDocuments();
              return { collection, operation, count, message: `There are ${count} candidates in MongoDB.` };
            }
            if (operation === 'findById' && id) {
              const doc = await Candidate.findById(id).lean();
              return { collection, operation, document: doc ? { ...doc, _id: String((doc as any)._id) } : null };
            }
            const query = filter ? { name: new RegExp(filter, 'i') } : {};
            const docs = await Candidate.find(query).limit(5).lean();
            return {
              collection,
              operation,
              count: docs.length,
              documents: docs.map((d) => ({ ...d, _id: String((d as any)._id) })),
            };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
