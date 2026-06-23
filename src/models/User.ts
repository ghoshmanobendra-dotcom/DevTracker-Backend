import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  full_name: string;
  avatar_url?: string;
  current_streak: number;
  max_streak: number;
  total_score: number;
  career_path?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true, trim: true },
  avatar_url: { type: String },
  current_streak: { type: Number, default: 0 },
  max_streak: { type: Number, default: 0 },
  total_score: { type: Number, default: 0 },
  career_path: { type: String },
  github_url: { type: String },
  linkedin_url: { type: String },
  leetcode_url: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

UserSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
