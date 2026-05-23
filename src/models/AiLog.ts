import mongoose, { Schema } from 'mongoose';

export interface IAiLog {
  endpoint: string;
  model: string;
  prompt: string;
  response?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiLogSchema: Schema = new Schema({
  endpoint: { type: String, required: true },
  model: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  latencyMs: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'error'], default: 'success' },
  errorMessage: { type: String },
}, { timestamps: true });

export default mongoose.models.AiLog || mongoose.model<IAiLog>('AiLog', AiLogSchema);
