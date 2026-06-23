import { Router, Response } from 'express';
import CodingProblem from '../models/CodingProblem';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const formatProblem = (p: any) => ({
  id: p._id.toString(),
  user_id: p.user_id.toString(),
  section_name: p.section_name,
  problem_name: p.problem_name,
  problem_link: p.problem_link,
  difficulty: p.difficulty,
  status: p.status,
  youtube_solution: p.youtube_solution,
  resource_url: p.resource_url,
  notes: p.notes,
  completed_at: p.completed_at?.toISOString(),
  created_at: p.created_at.toISOString(),
});

// GET /api/problems
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problems = await CodingProblem.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .lean();
    res.json(problems.map(formatProblem));
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/problems
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { section_name, problem_name, problem_link, difficulty, status, youtube_solution, resource_url, notes, completed_at } = req.body;

    const problem = new CodingProblem({
      user_id: req.userId,
      section_name,
      problem_name,
      problem_link: problem_link || undefined,
      difficulty,
      status,
      youtube_solution: youtube_solution || undefined,
      resource_url: resource_url || undefined,
      notes: notes || undefined,
      completed_at: completed_at ? new Date(completed_at) : undefined,
    });

    await problem.save();
    res.status(201).json(formatProblem(problem));
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/problems/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, completed_at } = req.body;

    const problem = await CodingProblem.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      { $set: { status, completed_at: completed_at ? new Date(completed_at) : null } },
      { new: true }
    );

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json(formatProblem(problem));
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/problems/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await CodingProblem.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/problems/sync - LeetCode sync
router.post('/sync', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissions } = req.body;
    if (!submissions || !Array.isArray(submissions)) {
      res.status(400).json({ error: 'submissions array required' });
      return;
    }

    const existing = await CodingProblem.find({
      user_id: req.userId,
      section_name: 'LeetCode',
    }).select('problem_link status').lean();

    const existingMap = new Map<string, string>();
    existing.forEach(p => {
      if (p.problem_link) existingMap.set(p.problem_link, p.status);
    });

    let newCount = 0;

    for (const sub of [...submissions].reverse()) {
      const link = `https://leetcode.com/problems/${sub.titleSlug}/`;
      const newStatus = sub.statusDisplay === 'Accepted' ? 'Solved' : 'Attempted';
      const currentStatus = existingMap.get(link);

      if (currentStatus === 'Solved') continue;
      if (currentStatus === 'Attempted' && newStatus === 'Attempted') continue;

      if (currentStatus === 'Attempted' && newStatus === 'Solved') {
        await CodingProblem.findOneAndUpdate(
          { user_id: req.userId, problem_link: link },
          { $set: { status: 'Solved', completed_at: new Date(parseInt(sub.timestamp) * 1000) } }
        );
        newCount++;
        continue;
      }

      if (!currentStatus) {
        await CodingProblem.create({
          user_id: req.userId,
          section_name: 'LeetCode',
          problem_name: sub.title,
          problem_link: link,
          difficulty: 'Medium',
          status: newStatus,
          completed_at: newStatus === 'Solved' ? new Date(parseInt(sub.timestamp) * 1000) : undefined,
        });
        newCount++;
        existingMap.set(link, newStatus);
      }
    }

    res.json({ synced: newCount > 0, count: newCount });
  } catch (error) {
    console.error('Sync problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
