// app/admin/login/LoginForm.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === '1' ? '잘못된 접근입니다.' : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 환경변수에 넣어둔 관리자 비번과 비교
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;
    if (!adminPass) {
      setError('관리자 비밀번호가 설정되지 않았습니다.');
      return;
    }

    if (password === adminPass) {
      router.push('/admin');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
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
      </div>
    </div>
  );
}
