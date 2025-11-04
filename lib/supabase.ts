// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 브라우저/서버 공용 읽기용(Anon Key) Supabase 클라이언트
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // 예: https://xxxx.supabase.co
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!   // Anon 키
);
