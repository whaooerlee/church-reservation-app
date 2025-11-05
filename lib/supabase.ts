// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Vercel에 안 들어가 있으면 여기서 콘솔 찍히고, API들이 전부 에러를 내요.
  console.error('Supabase 공개 키가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
}

export const supabase = url && anon
  ? createClient(url, anon)
  : (null as any);
