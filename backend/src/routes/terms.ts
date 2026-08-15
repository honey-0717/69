import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import { getTerms, updateTerms } from '../store';
import { broadcastChange } from '../events';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json(getTerms());
});

router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const updated = await updateTerms(content || '');
    return res.json(updated);
  } catch (err: any) {
    console.error('[TERMS PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update terms' });
  }
});

router.post('/publish', requireAuth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const updated = await updateTerms(content || '');
    broadcastChange('terms_published', updated);
    return res.json({ success: true, message: 'Terms published successfully', content: updated });
  } catch (err: any) {
    console.error('[TERMS PUBLISH ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to publish terms' });
  }
});

export default router;
