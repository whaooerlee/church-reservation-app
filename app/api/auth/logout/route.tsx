import { NextResponse } from 'next/server';

export async function POST() {
  const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
  res.cookies.set('admin', '', { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge:0 });
  return res;
}
