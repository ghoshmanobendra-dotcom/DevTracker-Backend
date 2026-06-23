import { Router, Response } from 'express';
import CareerProgress from '../models/CareerProgress';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/career-progress
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await CareerProgress.find({ user_id: req.userId }).lean();
    res.json(progress.map(p => ({ topic_id: p.topic_id })));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/career-progress
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic_id } = req.body;

    await CareerProgress.findOneAndUpdate(
      { user_id: req.userId, topic_id },
      { user_id: req.userId, topic_id },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/career-progress/:topicId
router.delete('/:topicId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await CareerProgress.findOneAndDelete({ user_id: req.userId, topic_id: req.params.topicId });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
