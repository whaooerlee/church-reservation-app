'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        ✅ 관리자 페이지 접속 성공
      </h1>
      <p style={{ fontSize: 16, color: '#334155' }}>
        이 화면이 보이면 로그인 문제는 “쿠키 체크 로직”에 있습니다.
      </p>
      <Link
        href="/"
        style={{
          background: '#a3272f',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
}
