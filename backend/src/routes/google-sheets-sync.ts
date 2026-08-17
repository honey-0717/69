import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import {
  syncGoogleSheetToSupabase,
  getGoogleSheetSyncStatus,
  SheetServiceRow,
} from '../google-sheets-sync';
import { store } from '../store';
import { broadcastChange } from '../events';
import { adminSupabase } from '../db';

const router = Router();

// GET /api/google-sheets-sync/status
router.get('/status', (_req: Request, res: Response) => {
  return res.json({
    sheet_id: process.env.GOOGLE_SHEET_ID || '1kTP12rOWkT5r0ty86hUB53VYs73Ys7V7DpOj1z0WMuE',
    ...getGoogleSheetSyncStatus(),
  });
});

// GET /api/google-sheets-sync/export-csv
router.get('/export-csv', (_req: Request, res: Response) => {
  const headers = [
    'id',
    'name',
    'category',
    'short_description',
    'description',
    'price',
    'duration',
    'status',
    'display_order',
    'thumbnail_url',
    'gallery_urls',
    'updated_at',
  ];
  let csv = headers.join(',') + '\n';

  for (const s of store.services) {
    const row = [
      `"${s.id}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.category_id || ''}"`,
      `"${(s.short_description || '').replace(/"/g, '""')}"`,
      `"${(s.full_description || (s as any).description || '').replace(/"/g, '""')}"`,
      s.price || 0,
      `"${s.duration || ''}"`,
      s.enabled ? '"enabled"' : '"disabled"',
      s.position ?? 0,
      `"${(s.photos?.[0] || '').replace(/"/g, '""')}"`,
      `"${JSON.stringify(s.photos || []).replace(/"/g, '""')}"`,
      `"${s.updated_at || new Date().toISOString()}"`,
    ];
    csv += row.join(',') + '\n';
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="hotharini69-services.csv"');
  return res.send(csv);
});

// POST /api/google-sheets-sync/manual
router.post('/manual', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await syncGoogleSheetToSupabase();
    return res.json({
      success: true,
      message: `Manual sync completed. Updated ${result.updated} services.`,
      ...result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Manual sync failed' });
  }
});

// POST /api/google-sheets-sync/webhook (Receives edit events from Google Apps Script)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { action, service, id } = req.body;

    if (action === 'DELETE' && id) {
      const index = store.services.findIndex((s: any) => s.id === id);
      if (index >= 0) {
        store.services.splice(index, 1);
        await adminSupabase.from('services').delete().eq('id', id);
        broadcastChange('service_deleted', { id });
      }
      return res.json({ status: 'success', message: `Deleted service ${id}` });
    }

    if (action === 'UPSERT' && service && service.id) {
      const isEnabled = service.status?.toLowerCase() === 'enabled';
      let photos: string[] = [];
      try {
        photos = service.gallery_urls ? JSON.parse(service.gallery_urls) : service.thumbnail_url ? [service.thumbnail_url] : [];
      } catch {
        photos = service.thumbnail_url ? [service.thumbnail_url] : [];
      }

      const updatedData = {
        id: service.id,
        name: service.name || 'Untitled Service',
        category_id: service.category || store.categories[0]?.id || 'cat-vc',
        short_description: service.short_description || '',
        full_description: service.description || '',
        price: Number(service.price) || 0,
        duration: service.duration || '5 MIN',
        enabled: isEnabled,
        position: Number(service.display_order ?? 0),
        photos,
        updated_at: service.updated_at || new Date().toISOString(),
      };

      const existingIndex = store.services.findIndex((s: any) => s.id === service.id);
      if (existingIndex >= 0) {
        store.services[existingIndex] = { ...store.services[existingIndex], ...updatedData };
      } else {
        store.services.push(updatedData as any);
      }

      await adminSupabase.from('services').upsert(updatedData);
      broadcastChange('service_updated', updatedData);

      return res.json({ status: 'success', message: `Upserted service ${service.id}` });
    }

    return res.json({ status: 'ignored' });
  } catch (err: any) {
    console.warn('[GOOGLE SHEETS WEBHOOK ERROR]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
