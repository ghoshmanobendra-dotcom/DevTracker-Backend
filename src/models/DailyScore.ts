import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyScore extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  date: string;
  score: number;
  goals_completed: number;
  total_goals: number;
  coding_problems_solved: number;
  created_at: Date;
}

const DailyScoreSchema = new Schema<IDailyScore>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true },
  score: { type: Number, default: 0 },
  goals_completed: { type: Number, default: 0 },
  total_goals: { type: Number, default: 0 },
  coding_problems_solved: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

// Unique constraint: one score per user per date
DailyScoreSchema.index({ user_id: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyScore>('DailyScore', DailyScoreSchema);
