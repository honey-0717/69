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

