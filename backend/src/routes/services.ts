import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth, AuthenticatedRequest } from '../auth';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleService,
} from '../store';
import { adminSupabase } from '../db';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/services
router.get('/', (_req: Request, res: Response) => {
  return res.json(getServices());
});

// GET /api/services/:id
router.get('/:id', (req: Request, res: Response) => {
  const service = getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  return res.json(service);
});

// POST /api/services
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, price, duration, category_id, short_description, full_description, important_info, photos, enabled, position } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const created = await createService({
      name,
      price,
      duration,
      category_id,
      short_description,
      full_description,
      important_info,
      photos,
      enabled,
      position,
    });

    return res.status(201).json(created);
  } catch (err: any) {
    console.error('[SERVICES POST ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to create service' });
  }
});

// PUT /api/services/:id
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(updated);
  } catch (err: any) {
    console.error('[SERVICES PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update service' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json({ success: true, message: 'Service deleted' });
  } catch (err: any) {
    console.error('[SERVICES DELETE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to delete service' });
  }
});

// PATCH /api/services/:id/toggle
router.patch('/:id/toggle', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const toggled = await toggleService(req.params.id);
    if (!toggled) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(toggled);
  } catch (err: any) {
    console.error('[SERVICES TOGGLE ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to toggle service' });
  }
});

import { uploadImageFile } from '../storage';

// POST /api/services/upload
router.post('/upload', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const publicUrl = await uploadImageFile(file.buffer, file.mimetype, file.originalname, 'service-photos');
    return res.json({ url: publicUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

export default router;
