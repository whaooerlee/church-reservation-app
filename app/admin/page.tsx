// app/admin/page.tsx
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Next 16: cookies()가 Promise처럼 타이핑돼 있어서 한 번 기다립니다.
  const cookieStore = (await cookies()) as any;

  // 받아온 전체 쿠키 보기
  const allCookies: Array<{ name: string; value: string }> = cookieStore.getAll
    ? cookieStore.getAll()
    : [];

  // 우리가 기대하는 쿠키
  const auth = cookieStore.get ? cookieStore.get('admin_auth') : null;

  const isAuthed = !!auth;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
        관리자 페이지 (디버그 모드)
      </h1>

      <p style={{ marginBottom: 16 }}>
        지금 서버가 본 쿠키 기준으로는:{' '}
        <strong style={{ color: isAuthed ? 'green' : 'red' }}>
          {isAuthed ? '✅ 로그인됨' : '❌ 로그인 안 됨'}
        </strong>
      </p>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>서버가 받은 쿠키</h2>
        {allCookies.length === 0 ? (
          <p style={{ color: '#64748b' }}>쿠키가 하나도 없습니다.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {allCookies.map((c) => (
              <li key={c.name}>
                <code>
                  {c.name}: {c.value}
                </code>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAuthed ? (
        <>
          <p style={{ marginBottom: 12 }}>여기에 원래 관리자 캘린더를 렌더링하시면 됩니다.</p>
          <Link href="/" style={{ color: '#0f172a', textDecoration: 'underline' }}>
            메인으로
          </Link>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 12 }}>
            로그인 쿠키 <code>admin_auth</code> 를 서버가 못 봤습니다.
          </p>
          <Link
            href="/admin/login"
            style={{
              display: 'inline-block',
              background: '#a3272f',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            다시 로그인 하러 가기
          </Link>
        </>
      )}
    </div>
  );
}
