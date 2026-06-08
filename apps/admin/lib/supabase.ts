'use client';
import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('[glint-admin] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example → .env at the repo root.');
}

// Fallbacks keep the build from throwing when env is absent; real env wins at runtime.
export const supabase = createBrowserClient(url ?? 'http://localhost:54321', key ?? 'anon-key-placeholder');
