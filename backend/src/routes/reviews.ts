import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import { getReviews, createReview, toggleHideReview, toggleFlagReview } from '../store';

const router = Router();

// GET /api/reviews
router.get('/', (_req: Request, res: Response) => {
  return res.json(getReviews());
});

// POST /api/reviews (Public Submission)
router.post('/', async (req: Request, res: Response) => {
  const { rating, review_text, reviewer_name } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating between 1 and 5 is required' });
  }

  const newReview = await createReview({ rating, review_text, reviewer_name });
  return res.status(201).json(newReview);
});

// PATCH /api/reviews/:id/hide
router.patch('/:id/hide', requireAuth, async (req: Request, res: Response) => {
  const updated = await toggleHideReview(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Review not found' });
  return res.json(updated);
});

// PATCH /api/reviews/:id/flag
router.patch('/:id/flag', requireAuth, async (req: Request, res: Response) => {
  const updated = await toggleFlagReview(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Review not found' });
  return res.json(updated);
});

export default router;
