'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: 20,
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
            세종교육관 예약관리
          </h1>
          <p style={{ color: '#64748b' }}>
            여기서 승인·취소·삭제를 하시면 됩니다.
          </p>
        </div>
        <Link
          href="/"
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '6px 12px',
            textDecoration: 'none',
            color: '#0f172a',
          }}
        >
          ← 메인으로
        </Link>
      </header>

      {/* 여기 아래에 예전에 쓰시던 관리자 달력 컴포넌트 붙이시면 됩니다 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 16,
        }}
      >
        <p style={{ marginBottom: 8, color: '#475569' }}>
          지금은 로그인 체크를 잠시 꺼둔 상태입니다.
        </p>
        <p style={{ marginBottom: 0 }}>
          여기다가 기존 <code>FullCalendar</code> 쓰던 관리자 페이지 코드를
          다시 넣어주세요.
        </p>
      </div>
    </div>
  );
}
