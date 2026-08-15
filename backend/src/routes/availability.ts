import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { getProfile, updateAvailability } from '../store';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const profile = getProfile();
  return res.json({ availability: profile?.availability || 'available' });
});

router.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { availability } = req.body;
    if (!['available', 'busy', 'offline'].includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }

    const updated = await updateAvailability(availability);
    return res.json(updated);
  } catch (err: any) {
    console.error('[AVAILABILITY PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update availability' });
  }
});

export default router;
