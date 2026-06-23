import 'dotenv/config';
import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import StudyNote from '../models/StudyNote';
import { authenticate, AuthRequest } from '../middleware/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const uploadToCloudinary = (buffer: Buffer, options: Record<string, unknown>): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result as { secure_url: string });
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const formatNote = (n: any) => ({
  id: n._id.toString(),
  user_id: n.user_id.toString(),
  title: n.title,
  content: n.content,
  category: n.category,
  tags: n.tags || [],
  media_url: n.media_url,
  media_type: n.media_type,
  media_name: n.media_name,
  created_at: n.created_at.toISOString(),
  updated_at: n.updated_at.toISOString(),
});

const router = Router();

// GET /api/notes
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await StudyNote.find({ user_id: req.userId }).sort({ created_at: -1 }).lean();
    res.json(notes.map(formatNote));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notes
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, tags } = req.body;

    let media_url: string | undefined;
    let media_type: string | undefined;
    let media_name: string | undefined;

    if (req.file) {
      const isImage = req.file.mimetype.startsWith('image/');
      const isPdf = req.file.mimetype === 'application/pdf';

      // Images → resource_type 'image' (Cloudinary optimises them)
      // PDFs & all other files → resource_type 'raw' (served as-is, direct URL)
      const resourceType = isImage ? 'image' : 'raw';

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: `devtracker/${req.userId}/notes`,
        resource_type: resourceType,
        // For PDFs keep the original extension so browsers open them correctly
        ...(isPdf && { format: 'pdf' }),
      });
      media_url = result.secure_url;
      media_type = req.file.mimetype;
      media_name = req.file.originalname;
    }

    const tagsArray = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    const note = new StudyNote({
      user_id: req.userId,
      title,
      content,
      category: category || 'General',
      tags: tagsArray,
      media_url,
      media_type,
      media_name,
    });

    await note.save();
    res.status(201).json(formatNote(note));
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await StudyNote.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
