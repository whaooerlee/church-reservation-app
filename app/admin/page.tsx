// app/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Next 16: cookies()가 Promise로 되어 있어서 한 번 기다리고 any로 잡아줍니다.
  const cookieStore = (await cookies()) as any;
  const auth = cookieStore.get ? cookieStore.get('admin_auth') : null;

  // 쿠키 없으면 로그인 페이지로 바로 보내기
  if (!auth) {
    redirect('/admin/login');
  }

  // ✅ 여기부터 실제 관리자 화면
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f8fafc' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        관리자 화면
      </h1>
      <p style={{ marginBottom: 12 }}>
        admin_auth 쿠키가 있어서 이 화면이 보입니다.
      </p>
      <Link
        href="/"
        style={{ color: '#0f172a', textDecoration: 'underline' }}
      >
        메인으로
      </Link>
    </div>
  );
}
