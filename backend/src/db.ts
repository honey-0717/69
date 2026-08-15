import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[FATAL ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided in environment variables for production.');
  }
  console.warn('[SUPABASE WARNING] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
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

