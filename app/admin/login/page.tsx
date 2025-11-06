'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ 쿠키 받기
        body: JSON.stringify({ password }),
      });

      const text = await res.text(); // 응답이 비어있어도 일단 문자열로
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      if (!res.ok || !json.ok) {
        setErrorMsg(json?.message || '로그인에 실패했습니다.');
        return;
      }

      // ✅ 로그인 성공 → 관리자 페이지로
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('login error', err);
      setErrorMsg('서버와 통신 중 문제가 생겼습니다.');
    } finally {
      // ✅ 어떤 경우에도 버튼은 원래대로
      setLoading(false);
    }
  }

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
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
          관리자 로그인
        </h1>
        <p style={{ fontSize: 14, color: '#5b6b7c', marginBottom: 16 }}>
          관리자 비밀번호를 입력해 주세요.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          style={{
            width: '100%',
            border: '1px solid #d1d5db',
            borderRadius: 10,
            padding: '10px 12px',
            outline: 'none',
            marginBottom: 14,
          }}
          required
        />

        {errorMsg ? (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            {errorMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#b0232b',
            border: 'none',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 12px',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? '확인중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
