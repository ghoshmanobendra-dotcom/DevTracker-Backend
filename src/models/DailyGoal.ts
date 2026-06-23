import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyGoal extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  points: number;
  is_completed: boolean;
  completed_at?: Date;
  date: string;
  is_recurring: boolean;
  duration_minutes: number;
  started_at?: Date;
  created_at: Date;
}

const DailyGoalSchema = new Schema<IDailyGoal>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true, default: 'General' },
  points: { type: Number, required: true, default: 10 },
  is_completed: { type: Boolean, default: false },
  completed_at: { type: Date },
  date: { type: String, required: true, index: true },
  is_recurring: { type: Boolean, default: false },
  duration_minutes: { type: Number, default: 0 },
  started_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IDailyGoal>('DailyGoal', DailyGoalSchema);
