import { adminSupabase } from './db';
import { store } from './store';
import { broadcastChange } from './events';

export interface SheetServiceRow {
  id: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price: number;
  duration: string;
  status: 'enabled' | 'disabled';
  display_order: number;
  thumbnail_url: string;
  gallery_urls: string;
  updated_at: string;
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1kTP12rOWkT5r0ty86hUB53VYs73Ys7V7DpOj1z0WMuE';
const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || '';

let isSyncing = false;
let lastSyncStatus: { success: boolean; lastSyncTime: string; error?: string } = {
  success: true,
  lastSyncTime: new Date().toISOString(),
};

export function getGoogleSheetSyncStatus() {
  return lastSyncStatus;
}

/**
 * Synchronize a single service creation or update to Google Sheet
 */
export async function syncServiceToGoogleSheet(service: any): Promise<boolean> {
  try {
    const row: SheetServiceRow = {
      id: service.id,
      name: service.name || '',
      category: service.category_id || '',
      short_description: service.short_description || '',
      description: service.full_description || service.description || '',
      price: Number(service.price) || 0,
      duration: service.duration || '',
      status: service.enabled ? 'enabled' : 'disabled',
      display_order: Number(service.position ?? 0),
      thumbnail_url: service.photos?.[0] || '',
      gallery_urls: JSON.stringify(service.photos || []),
      updated_at: service.updated_at || new Date().toISOString(),
    };

    if (WEBHOOK_URL) {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPSERT', service: row }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`Webhook returned status ${res.status}`);
      }
    }

    lastSyncStatus = { success: true, lastSyncTime: new Date().toISOString() };
    console.log(`[GOOGLE SHEETS SYNC] Synced service ${service.id} to sheet`);
    return true;
  } catch (err: any) {
    console.warn(`[GOOGLE SHEETS SYNC WARNING] Failed to sync service ${service.id} to sheet:`, err.message);
    lastSyncStatus = { success: false, lastSyncTime: new Date().toISOString(), error: err.message };
    return false;
  }
}

/**
 * Delete a service row from Google Sheet
 */
export async function deleteServiceFromGoogleSheet(serviceId: string): Promise<boolean> {
  try {
    if (WEBHOOK_URL) {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id: serviceId }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`Webhook returned status ${res.status}`);
      }
    }

    lastSyncStatus = { success: true, lastSyncTime: new Date().toISOString() };
    console.log(`[GOOGLE SHEETS SYNC] Deleted service ${serviceId} from sheet`);
    return true;
  } catch (err: any) {
    console.warn(`[GOOGLE SHEETS SYNC WARNING] Failed to delete service ${serviceId} from sheet:`, err.message);
    lastSyncStatus = { success: false, lastSyncTime: new Date().toISOString(), error: err.message };
    return false;
  }
}

/**
 * Pull and synchronize Google Sheet changes into Supabase PostgreSQL
 */
export async function syncGoogleSheetToSupabase(): Promise<{ updated: number; error?: string }> {
  if (isSyncing) return { updated: 0 };
  isSyncing = true;

  try {
    // If Apps Script Webhook or CSV export endpoint is configured
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    const res = await fetch(csvUrl, { signal: AbortSignal.timeout(15000) });

    if (!res.ok) {
      isSyncing = false;
      return { updated: 0, error: `CSV fetch status ${res.status}` };
    }

    const csvText = await res.text();
    if (!csvText || csvText.trim().length === 0) {
      // Sheet is empty - initial seed of current Supabase catalog into Google Sheet if webhook is configured
      if (WEBHOOK_URL && store.services.length > 0) {
        console.log('[GOOGLE SHEETS SYNC] Initializing empty Google Sheet with current Supabase services...');
        for (const s of store.services) {
          await syncServiceToGoogleSheet(s);
        }
      }
      isSyncing = false;
      return { updated: 0 };
    }

    const rows = parseCSV(csvText);
    let updatedCount = 0;

    for (const r of rows) {
      if (!r.id || !r.name) continue;

      let photos: string[] = [];
      try {
        photos = r.gallery_urls ? JSON.parse(r.gallery_urls) : r.thumbnail_url ? [r.thumbnail_url] : [];
      } catch {
        photos = r.thumbnail_url ? [r.thumbnail_url] : [];
      }

      const existingIndex = store.services.findIndex((s: any) => s.id === r.id);
      const isEnabled = r.status?.toLowerCase() === 'enabled';
      const updatedServiceData = {
        id: r.id,
        name: r.name,
        category_id: r.category || store.categories[0]?.id || 'cat-vc',
        short_description: r.short_description || '',
        full_description: r.description || '',
        price: Number(r.price) || 0,
        duration: r.duration || '5 MIN',
        enabled: isEnabled,
        position: Number(r.display_order ?? 0),
        photos,
        updated_at: r.updated_at || new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Compare if changed
        const current = store.services[existingIndex];
        const isChanged =
          current.name !== updatedServiceData.name ||
          current.price !== updatedServiceData.price ||
          current.enabled !== updatedServiceData.enabled ||
          current.duration !== updatedServiceData.duration ||
          current.short_description !== updatedServiceData.short_description;

        if (isChanged) {
          store.services[existingIndex] = { ...current, ...updatedServiceData };
          await adminSupabase.from('services').upsert(store.services[existingIndex]);
          updatedCount++;
        }
      } else {
        // Create new service from Sheet
        store.services.push(updatedServiceData as any);
        await adminSupabase.from('services').upsert(updatedServiceData);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      broadcastChange('service_updated', { source: 'google_sheets', count: updatedCount });
    }

    lastSyncStatus = { success: true, lastSyncTime: new Date().toISOString() };
    isSyncing = false;
    return { updated: updatedCount };
  } catch (err: any) {
    console.warn('[GOOGLE SHEETS SYNC WARNING] Sheet sync failed:', err.message);
    lastSyncStatus = { success: false, lastSyncTime: new Date().toISOString(), error: err.message };
    isSyncing = false;
    return { updated: 0, error: err.message };
  }
}

/**
 * Simple CSV parser for Google Sheet export
 */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, index) => {
      const cleanHeader = h.replace(/^"|"$/g, '').trim().toLowerCase();
      obj[cleanHeader] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
    });
    result.push(obj);
  }

  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
