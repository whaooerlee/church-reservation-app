// app/admin/login/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vercel에 넣어둔 값이 있으면 이걸로 검사하고,
  // 없으면 임시로 어떤 비번이든 통과시키게 해둡니다.
  const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === '1' ? '잘못된 접근입니다.' : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1) 환경변수가 있는 경우 → 그걸로 체크
    if (ADMIN_PASS) {
      if (password === ADMIN_PASS) {
        router.push('/admin');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
      return;
    }

    // 2) 환경변수가 없는 경우 → 일단 통과 (Vercel env 안 들어갔을 때)
    router.push('/admin');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '28px 26px',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 18,
            color: '#042550',
          }}
        >
          관리자 로그인
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          관리자 비밀번호를 입력해 주세요.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '8px 10px',
              fontSize: 14,
              outline: 'none',
            }}
          />
          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: 12,
                padding: '6px 8px',
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              background: '#a3272f',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            로그인
          </button>
        </form>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
          {ADMIN_PASS
            ? '환경변수에 설정된 비밀번호로만 진입 가능합니다.'
            : '⚠ Vercel 환경변수가 없어서 임시로 통과시키고 있습니다.'}
        </p>
      </div>
    </div>
  );
}
