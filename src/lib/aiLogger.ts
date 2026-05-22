import connectDB from '@/lib/db';
import AiLog from '@/models/AiLog';

export interface LogAiCallArgs {
  endpoint: string;
  model: string;
  prompt: string;
  response?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export async function logAiCall({
  endpoint,
  model,
  prompt,
  response,
  promptTokens,
  completionTokens,
  totalTokens,
  latencyMs,
  status,
  errorMessage,
}: LogAiCallArgs) {
  try {
    await connectDB();
    const pTokens = promptTokens || 0;
    const cTokens = completionTokens || 0;
    const tTokens = totalTokens || (pTokens + cTokens);

    const log = await new AiLog({
      endpoint,
      model,
      prompt: typeof prompt === 'object' ? JSON.stringify(prompt) : prompt,
      response: typeof response === 'object' ? JSON.stringify(response) : response,
      promptTokens: pTokens,
      completionTokens: cTokens,
      totalTokens: tTokens,
      latencyMs,
      status,
      errorMessage,
    }).save();

    console.log(
      `🤖 [AI PERFORMANCE LOG] saved successfully:\n` +
      `   - Endpoint: ${endpoint}\n` +
      `   - Model: ${model}\n` +
      `   - Latency: ${latencyMs}ms\n` +
      `   - Tokens: ${tTokens} (Prompt: ${pTokens}, Completion: ${cTokens})\n` +
      `   - Status: ${status}`
    );

    return log;
  } catch (error) {
    console.error('❌ Failed to save AI log telemetry:', error);
  }
}
