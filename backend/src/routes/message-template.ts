import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import { getMessageTemplate, updateMessageTemplate } from '../store';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json(getMessageTemplate());
});

router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { template } = req.body;
    const updated = await updateMessageTemplate(template || '');
    return res.json(updated);
  } catch (err: any) {
    console.error('[MESSAGE TEMPLATE PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update message template' });
  }
});

export default router;
