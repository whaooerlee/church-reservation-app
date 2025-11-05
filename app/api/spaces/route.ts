// app/api/spaces/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'supabase not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('spaces')
      .select('id,name,color')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'unknown error' }, { status: 500 });
  }
}
