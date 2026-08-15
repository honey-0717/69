import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { adminSupabase } from '../db';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  try {
    let query = adminSupabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (user.id !== 'admin-local-id') {
      query = query.eq('admin_id', user.id);
    }

    const { data, error } = await query;
    if (error) {
      return res.json([]);
    }
    return res.json(data ?? []);
  } catch (err: any) {
    return res.json([]);
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  try {
    const { action_type, details } = req.body;
    if (!action_type) {
      return res.status(400).json({ error: 'Action type is required' });
    }

    const logEntry = {
      admin_id: user.id,
      action_type,
      details: details || '',
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from('activity_logs')
      .insert(logEntry)
      .select('*')
      .maybeSingle();

    if (error) {
      console.warn('Activity log DB record skipped:', error.message);
    }

    return res.status(201).json(data || logEntry);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
