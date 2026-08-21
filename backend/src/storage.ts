import { adminSupabase } from './db';
import fs from 'fs';
import path from 'path';

const BUCKET_NAMES = ['public-assets', 'service-photos', 'profile-photos'];

export async function ensureStorageBuckets(): Promise<void> {
  for (const bucket of BUCKET_NAMES) {
    try {
      const { data } = await adminSupabase.storage.getBucket(bucket);
      if (!data) {
        const { error } = await adminSupabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        });
        if (!error) {
          console.log(`[STORAGE] Created public bucket '${bucket}' successfully.`);
        }
      }
    } catch (err: any) {
      console.warn(`[STORAGE BUCKET INIT NOTICE] '${bucket}':`, err?.message || err);
    }
  }
}

export async function uploadImageFile(
  fileBuffer: Buffer,
  mimetype: string,
  originalName: string,
  preferredBucket: string = 'public-assets'
): Promise<string> {
  const fileExt = (originalName.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const fileName = `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt || 'png'}`;

  // Prioritize buckets to try: preferredBucket, 'public-assets', 'service-photos', 'profile-photos'
  const bucketsToTry = [preferredBucket, 'public-assets', 'service-photos', 'profile-photos'].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  for (const bucket of bucketsToTry) {
    try {
      // Ensure bucket exists in Supabase
      await adminSupabase.storage.createBucket(bucket, { public: true }).catch(() => {});

      const { error: uploadErr } = await adminSupabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: mimetype,
          upsert: true,
        });

      if (!uploadErr) {
        const { data } = adminSupabase.storage.from(bucket).getPublicUrl(fileName);
        if (data?.publicUrl) {
          console.log(`[STORAGE UPLOAD SUCCESS] Saved image to bucket '${bucket}': ${data.publicUrl}`);
          return data.publicUrl;
        }
      } else {
        console.warn(`[STORAGE UPLOAD WARNING] Bucket '${bucket}' error:`, uploadErr.message);
      }
    } catch (e: any) {
      console.warn(`[STORAGE UPLOAD EXCEPTION] '${bucket}':`, e?.message || e);
    }
  }

  // Fallback 1: Save file to local data/uploads directory on backend server
  try {
    const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localFilePath, fileBuffer);

    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').trim().replace(/\/+$/, '');
    if (backendUrl) {
      return `${backendUrl}/uploads/${fileName}`;
    }
    return `/uploads/${fileName}`;
  } catch (err: any) {
    console.warn('[STORAGE LOCAL FALLBACK WARNING]', err?.message || err);
  }

  // Fallback 2: Compact base64 Data URL
  const base64 = fileBuffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}
