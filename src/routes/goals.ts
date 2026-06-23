import { Router, Response } from 'express';
import mongoose from 'mongoose';
import DailyGoal from '../models/DailyGoal';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/goals?date=YYYY-MM-DD
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const query: Record<string, unknown> = { user_id: req.userId };
    if (date) query.date = date as string;

    const goals = await DailyGoal.find(query).sort({ created_at: 1 }).lean();

    const formatted = goals.map(g => ({
      id: g._id.toString(),
      user_id: g.user_id.toString(),
      title: g.title,
      category: g.category,
      points: g.points,
      is_completed: g.is_completed,
      completed_at: g.completed_at?.toISOString(),
      date: g.date,
      is_recurring: g.is_recurring,
      duration_minutes: g.duration_minutes,
      started_at: g.started_at?.toISOString(),
      created_at: g.created_at.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/goals
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, points, is_recurring, duration_minutes, date } = req.body;

    const goal = new DailyGoal({
      user_id: req.userId,
      title,
      category,
      points,
      is_recurring: is_recurring || false,
      duration_minutes: duration_minutes || 0,
      date: date || new Date().toISOString().split('T')[0],
    });

    await goal.save();

    res.status(201).json({
      id: goal._id.toString(),
      user_id: goal.user_id.toString(),
      title: goal.title,
      category: goal.category,
      points: goal.points,
      is_completed: goal.is_completed,
      date: goal.date,
      is_recurring: goal.is_recurring,
      duration_minutes: goal.duration_minutes,
      created_at: goal.created_at.toISOString(),
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/goals/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_completed, completed_at, started_at } = req.body;

    const updateData: Record<string, unknown> = {};
    if (is_completed !== undefined) updateData.is_completed = is_completed;
    if (completed_at !== undefined) updateData.completed_at = completed_at ? new Date(completed_at) : null;
    if (started_at !== undefined) updateData.started_at = started_at ? new Date(started_at) : null;

    const goal = await DailyGoal.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      { $set: updateData },
      { new: true }
    );

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({
      id: goal._id.toString(),
      user_id: goal.user_id.toString(),
      title: goal.title,
      category: goal.category,
      points: goal.points,
      is_completed: goal.is_completed,
      completed_at: goal.completed_at?.toISOString(),
      date: goal.date,
      is_recurring: goal.is_recurring,
      duration_minutes: goal.duration_minutes,
      started_at: goal.started_at?.toISOString(),
      created_at: goal.created_at.toISOString(),
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/goals/cleanup?olderThan=YYYY-MM-DD
router.delete('/cleanup', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { olderThan } = req.query;
    if (!olderThan) {
      res.status(400).json({ error: 'olderThan query param required' });
      return;
    }

    await DailyGoal.deleteMany({
      user_id: req.userId,
      date: { $lt: olderThan as string },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Cleanup goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await DailyGoal.findOneAndDelete({ _id: id, user_id: req.userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
