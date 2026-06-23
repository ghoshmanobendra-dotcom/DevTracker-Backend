import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingProblem extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  section_name: string;
  problem_name: string;
  problem_link?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Attempted' | 'Unsolved';
  youtube_solution?: string;
  resource_url?: string;
  notes?: string;
  completed_at?: Date;
  created_at: Date;
}

const CodingProblemSchema = new Schema<ICodingProblem>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section_name: { type: String, required: true },
  problem_name: { type: String, required: true },
  problem_link: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  status: { type: String, enum: ['Solved', 'Attempted', 'Unsolved'], default: 'Unsolved' },
  youtube_solution: { type: String },
  resource_url: { type: String },
  notes: { type: String },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ICodingProblem>('CodingProblem', CodingProblemSchema);
