import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { getProfile, updateProfile } from '../store';
import { adminSupabase } from '../db';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/profile
router.get('/', (_req: Request, res: Response) => {
  return res.json(getProfile());
});

// PUT /api/profile
router.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateProfile(req.body);
    return res.json(updated);
  } catch (err: any) {
    console.error('[PROFILE PUT ERROR]', err);
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// POST /api/profile/upload
router.post('/upload', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const fileExt = file.originalname.split('.').pop() || 'png';
    const fileName = `profile-${Date.now()}.${fileExt}`;

    const { error: uploadErr } = await adminSupabase.storage
      .from('profile-photos')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (!uploadErr) {
      const { data: publicUrlData } = adminSupabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);
      return res.json({ url: publicUrlData.publicUrl });
    }

    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return res.json({ url: dataUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

export default router;
