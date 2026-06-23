import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyNote extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  media_url?: string;
  media_type?: string;
  media_name?: string;
  created_at: Date;
  updated_at: Date;
}

const StudyNoteSchema = new Schema<IStudyNote>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  media_url: { type: String },
  media_type: { type: String },
  media_name: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model<IStudyNote>('StudyNote', StudyNoteSchema);
