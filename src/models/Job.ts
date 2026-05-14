import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department: string;
  type: string;
  status: 'Active' | 'Closed' | 'Hiring' | 'Urgently Hiring';
  createdAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Closed', 'Hiring', 'Urgently Hiring'], default: 'Active' },
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
