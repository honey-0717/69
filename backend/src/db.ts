import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (process.env.NODE_ENV === 'production') {
  if (!supabaseUrl || supabaseUrl.trim() === '') {
    throw new Error('[FATAL ERROR] SUPABASE_URL environment variable must be set in production.');
  }
  if (!supabaseServiceKey || supabaseServiceKey.trim() === '') {
    throw new Error('[FATAL ERROR] SUPABASE_SERVICE_ROLE_KEY environment variable must be set in production.');
  }
} else {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[SUPABASE NOTICE] Operating in development mode with seed & local store fallback.');
  }
}

const customWebSocket = typeof globalThis.WebSocket !== 'undefined' ? globalThis.WebSocket : WebSocket;

export const adminSupabase = createClient(
  supabaseUrl || 'https://rkalzhrpjtgkhozpsqup.supabase.co',
  supabaseServiceKey || 'placeholder_key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: customWebSocket as any,
    },
  }
);

export async function verifyProductionSupabaseCredentials(): Promise<{
  urlConfigured: boolean;
  keyConfigured: boolean;
  isServiceRoleClaim: boolean;
  readSuccess: boolean;
  error: string | null;
}> {
  const urlConfigured = Boolean(supabaseUrl && supabaseUrl.trim().length > 0);
  const keyConfigured = Boolean(supabaseServiceKey && supabaseServiceKey.trim().length > 0);

  let isServiceRoleClaim = false;
  if (keyConfigured && supabaseServiceKey) {
    try {
      const parts = supabaseServiceKey.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);
        isServiceRoleClaim = payload.role === 'service_role';
      }
    } catch {
      isServiceRoleClaim = false;
    }
  }

  if (!urlConfigured || !keyConfigured) {
    return {
      urlConfigured,
      keyConfigured,
      isServiceRoleClaim,
      readSuccess: false,
      error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is missing',
    };
  }

  try {
    const { error } = await adminSupabase.from('profile').select('id').limit(1);
    if (error) {
      return {
        urlConfigured,
        keyConfigured,
        isServiceRoleClaim,
        readSuccess: false,
        error: error.message,
      };
    }

    return {
      urlConfigured,
      keyConfigured,
      isServiceRoleClaim,
      readSuccess: true,
      error: null,
    };
  } catch (err: any) {
    return {
      urlConfigured,
      keyConfigured,
      isServiceRoleClaim,
      readSuccess: false,
      error: err?.message || 'Database connection error',
    };
  }
}

