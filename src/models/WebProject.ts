import mongoose, { Schema, Document } from 'mongoose';

export interface IWebProject extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  project_name: string;
  description?: string;
  tech_stack?: string;
  repo_url?: string;
  demo_url?: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  created_at: Date;
  updated_at: Date;
}

const WebProjectSchema = new Schema<IWebProject>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  project_name: { type: String, required: true },
  description: { type: String },
  tech_stack: { type: String },
  repo_url: { type: String },
  demo_url: { type: String },
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed'], default: 'Planned' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model<IWebProject>('WebProject', WebProjectSchema);
