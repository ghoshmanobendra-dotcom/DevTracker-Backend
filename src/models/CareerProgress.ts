import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerProgress extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  topic_id: string;
  created_at: Date;
}

const CareerProgressSchema = new Schema<ICareerProgress>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

// Unique constraint: one entry per user per topic
CareerProgressSchema.index({ user_id: 1, topic_id: 1 }, { unique: true });

export default mongoose.model<ICareerProgress>('CareerProgress', CareerProgressSchema);
