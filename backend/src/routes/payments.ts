import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethod,
} from '../store';

const router = Router();

// GET /api/payments
router.get('/', (_req: Request, res: Response) => {
  return res.json(getPaymentMethods());
});

// POST /api/payments
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, enabled, position } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Payment method name is required' });
    }

    const created = await createPaymentMethod({ name, enabled, position });
    return res.status(201).json(created);
  } catch (err: any) {
    console.error('[PAYMENTS POST ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to create payment method' });
  }
});

// PUT /api/payments/:id
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updatePaymentMethod(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Payment method not found' });
    return res.json(updated);
  } catch (err: any) {
    console.error('[PAYMENTS PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update payment method' });
  }
});

// DELETE /api/payments/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await deletePaymentMethod(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Payment method not found' });
    return res.json({ success: true, message: 'Payment method deleted' });
  } catch (err: any) {
    console.error('[PAYMENTS DELETE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to delete payment method' });
  }
});

// PATCH /api/payments/:id/toggle
router.patch('/:id/toggle', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const toggled = await togglePaymentMethod(req.params.id);
    if (!toggled) return res.status(404).json({ error: 'Payment method not found' });
    return res.json(toggled);
  } catch (err: any) {
    console.error('[PAYMENTS TOGGLE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to toggle payment method' });
  }
});

export default router;
