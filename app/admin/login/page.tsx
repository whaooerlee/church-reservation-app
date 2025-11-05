// app/admin/login/page.tsx
'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json().catch(() => null);
      console.log('admin-login response', json);

      if (!json) {
        setError('서버에서 올바른 응답을 받지 못했습니다.');
        return;
      }

      if (json.ok) {
        // 로그인 성공
        window.location.href = '/admin';
        return;
      }

      // 서버가 ok:false 보낸 경우
      setError(json.message || '로그인에 실패했습니다.');
    } catch (err) {
      console.error(err);
      setError('통신 오류가 발생했습니다.');
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '28px 26px',
          width: '100%',
          maxWidth: 360,
          display: 'grid',
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          관리자 로그인
        </h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          관리자 비밀번호를 입력해 주세요.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
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
          {loading ? '확인중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
