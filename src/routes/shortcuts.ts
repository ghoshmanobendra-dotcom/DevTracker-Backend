import 'dotenv/config';
import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Shortcut from '../models/Shortcut';
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

const formatShortcut = (s: any) => ({
  id: s._id.toString(),
  user_id: s.user_id.toString(),
  title: s.title,
  type: s.type,
  value: s.value,
  file_type: s.file_type,
  created_at: s.created_at.toISOString(),
});

const router = Router();

// GET /api/shortcuts
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shortcuts = await Shortcut.find({ user_id: req.userId }).sort({ created_at: 1 }).lean();
    res.json(shortcuts.map(formatShortcut));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/shortcuts
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, url, value: bodyValue } = req.body;

    let value = bodyValue || url || '';
    let file_type: string | undefined;

    if (type === 'file' && req.file) {
      const isImageOrPdf = req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf';
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: `devtracker/${req.userId}/shortcuts`,
        resource_type: isImageOrPdf ? 'image' : 'raw',
      });
      value = result.secure_url;
      file_type = req.file.mimetype;
    }

    const shortcut = new Shortcut({
      user_id: req.userId,
      title,
      type,
      value,
      file_type,
    });

    await shortcut.save();
    res.status(201).json(formatShortcut(shortcut));
  } catch (error) {
    console.error('Create shortcut error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/shortcuts/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Shortcut.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
