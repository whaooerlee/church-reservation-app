// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Supabase 서비스키가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
}

export const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey)
  : (null as any);
