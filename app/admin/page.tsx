// app/admin/page.tsx
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = cookies();
  const auth = cookieStore.get('admin_auth');

  // 쿠키 없으면 로그인으로
  if (!auth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: 12 }}>로그인이 필요합니다.</p>
          <Link
            href="/admin/login"
            style={{
              background: '#a3272f',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            관리자 로그인으로
          </Link>
        </div>
      </div>
    );
  }

  // ✅ 여기부터가 진짜 관리자 화면
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        관리자 화면
      </h1>
      <p style={{ marginBottom: 12 }}>
        여기서 캘린더 + 승인/삭제 하는 기존 그 화면을 렌더링하면 됩니다.
      </p>
      <Link
        href="/"
        style={{
          color: '#0f172a',
          textDecoration: 'underline',
        }}
      >
        메인으로
      </Link>
    </div>
  );
}
