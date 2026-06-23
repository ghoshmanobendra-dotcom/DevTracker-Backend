import { Router, Response } from 'express';
import User from '../models/User';
import DailyScore from '../models/DailyScore';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      current_streak: user.current_streak,
      max_streak: user.max_streak,
      total_score: user.total_score,
      career_path: user.career_path,
      github_url: user.github_url,
      linkedin_url: user.linkedin_url,
      leetcode_url: user.leetcode_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile
router.put('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { github_url, linkedin_url, leetcode_url, career_path, current_streak, max_streak, total_score } = req.body;

    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (github_url !== undefined) updateData.github_url = github_url || null;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url || null;
    if (leetcode_url !== undefined) updateData.leetcode_url = leetcode_url || null;
    if (career_path !== undefined) updateData.career_path = career_path;
    if (current_streak !== undefined) updateData.current_streak = current_streak;
    if (max_streak !== undefined) updateData.max_streak = max_streak;
    if (total_score !== undefined) updateData.total_score = total_score;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      current_streak: user.current_streak,
      max_streak: user.max_streak,
      total_score: user.total_score,
      career_path: user.career_path,
      github_url: user.github_url,
      linkedin_url: user.linkedin_url,
      leetcode_url: user.leetcode_url,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile/streaks - Recalculate and update streaks
router.put('/streaks', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scores = await DailyScore.find({ user_id: req.userId, score: { $gt: 0 } })
      .sort({ date: -1 })
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sortedDates = scores.map(s => new Date(s.date));

    let currentStreak = 0;
    let maxStreak = 0;

    if (sortedDates.length > 0) {
      const mostRecent = new Date(sortedDates[0]);
      mostRecent.setHours(0, 0, 0, 0);

      if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        let checkDate = new Date(mostRecent);
        for (let i = 1; i < sortedDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const nextDate = new Date(sortedDates[i]);
          nextDate.setHours(0, 0, 0, 0);
          if (nextDate.getTime() === checkDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    let tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { current_streak: currentStreak, max_streak: maxStreak, updated_at: new Date() } },
      { new: true, select: '-password' }
    );

    res.json({ current_streak: currentStreak, max_streak: maxStreak });
  } catch (error) {
    console.error('Update streaks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
