// app/admin/login/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === '1' ? '잘못된 접근입니다.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.message || '로그인에 실패했습니다.');
        return;
      }

      // 성공하면 관리자 페이지로
      router.push('/admin');
    } catch (err) {
      setError('서버와 통신 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
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
            disabled={loading}
            style={{
              background: loading ? '#c43b42' : '#a3272f',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 10px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
