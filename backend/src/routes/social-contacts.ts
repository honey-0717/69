import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import { getSocialContacts, updateSocialContacts } from '../store';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json(getSocialContacts());
});

router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const contacts = Array.isArray(req.body) ? req.body : req.body?.contacts;
    if (!Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Array of social contacts expected' });
    }

    const updated = await updateSocialContacts(contacts);
    return res.json(updated);
  } catch (err: any) {
    console.error('[SOCIAL CONTACTS PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update social contacts' });
  }
});

export default router;
