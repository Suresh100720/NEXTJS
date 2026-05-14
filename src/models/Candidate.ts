import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  email: string;
  role: string;
  score?: number;
  status: string;
  experience?: string;
  skills: string[];
  createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  score: { type: Number },
  status: { type: String, default: 'Screening' },
  experience: { type: String },
  skills: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
