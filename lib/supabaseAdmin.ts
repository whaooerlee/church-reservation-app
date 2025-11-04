

// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ← 반드시 Service Role Key

if (!url) throw new Error('SUPABASE URL missing (NEXT_PUBLIC_SUPABASE_URL)');
if (!serviceKey) throw new Error('Service Role Key missing (SUPABASE_SERVICE_ROLE_KEY)');

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
