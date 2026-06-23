import { Router, Response } from 'express';
import DailyScore from '../models/DailyScore';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const formatScore = (s: any) => ({
  id: s._id.toString(),
  user_id: s.user_id.toString(),
  date: s.date,
  score: s.score,
  goals_completed: s.goals_completed,
  total_goals: s.total_goals,
  coding_problems_solved: s.coding_problems_solved || 0,
  created_at: s.created_at.toISOString(),
});

// GET /api/scores
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scores = await DailyScore.find({ user_id: req.userId }).sort({ date: 1 }).lean();
    res.json(scores.map(formatScore));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/scores - Upsert score for a date
router.put('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, score, goals_completed, total_goals, coding_problems_solved } = req.body;

    const result = await DailyScore.findOneAndUpdate(
      { user_id: req.userId, date },
      {
        $set: {
          score,
          goals_completed,
          total_goals,
          coding_problems_solved: coding_problems_solved || 0,
        },
      },
      { upsert: true, new: true }
    );

    // Update user's total score (sum of all daily scores)
    const allScores = await DailyScore.find({ user_id: req.userId });
    const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);
    await User.findByIdAndUpdate(req.userId, { $set: { total_score: totalScore } });

    res.json(formatScore(result));
  } catch (error) {
    console.error('Upsert score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
