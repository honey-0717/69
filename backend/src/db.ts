import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[SUPABASE NOTICE] Operating with seed & local store fallback. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables for Supabase sync.');
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

