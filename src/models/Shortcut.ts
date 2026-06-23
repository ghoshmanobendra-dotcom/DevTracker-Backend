import mongoose, { Schema, Document } from 'mongoose';

export interface IShortcut extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  title: string;
  type: 'url' | 'file';
  value: string;
  file_type?: string;
  created_at: Date;
}

const ShortcutSchema = new Schema<IShortcut>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['url', 'file'], required: true },
  value: { type: String, required: true },
  file_type: { type: String },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IShortcut>('Shortcut', ShortcutSchema);
