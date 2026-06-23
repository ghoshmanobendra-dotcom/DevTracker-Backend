import { Router, Response } from 'express';
import WebProject from '../models/WebProject';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const formatProject = (p: any) => ({
  id: p._id.toString(),
  user_id: p.user_id.toString(),
  project_name: p.project_name,
  description: p.description,
  tech_stack: p.tech_stack,
  repo_url: p.repo_url,
  demo_url: p.demo_url,
  status: p.status,
  created_at: p.created_at.toISOString(),
  updated_at: p.updated_at.toISOString(),
});

// GET /api/projects
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await WebProject.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .lean();
    res.json(projects.map(formatProject));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project_name, description, tech_stack, repo_url, demo_url, status } = req.body;

    const project = new WebProject({
      user_id: req.userId,
      project_name,
      description: description || undefined,
      tech_stack: tech_stack || undefined,
      repo_url: repo_url || undefined,
      demo_url: demo_url || undefined,
      status: status || 'Planned',
    });

    await project.save();
    res.status(201).json(formatProject(project));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projects/:id
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const project = await WebProject.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: { status, updated_at: new Date() } },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(formatProject(project));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await WebProject.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
