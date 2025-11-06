// app/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  // ✅ 동기입니다. await 쓰지 마세요.
  const cookieStore = cookies();
  const auth = cookieStore.get('admin_auth');

  // 쿠키 없으면 바로 로그인 페이지로 보냄
  if (!auth) {
    return redirect('/admin/login');
  }

  // ✅ 여기부터가 실제 관리자 화면
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
