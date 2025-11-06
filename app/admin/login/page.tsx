'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',        // 쿠키 주고받기
        cache: 'no-store',
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        // JSON 아니면 무시
      }

      // 1) HTTP 에러
      if (!res.ok) {
        alert(json?.message || `로그인 실패 (HTTP ${res.status})`);
        setLoading(false);
        return;
      }

      // 2) OK인데 ok:true가 아닌 경우
      if (!json || !json.ok) {
        alert(json?.message || '로그인에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 3) ✅ 여기까지 왔으면 진짜 성공 → 그냥 주소창 바꿔버리기
      // 캐시된 페이지가 있어도 강제로 새로 열리게 timestamp 붙입니다.
      window.location.href = `/admin?ts=${Date.now()}`;
      return;
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      // 혹시 위에서 return 못 타면 여기서 버튼 풀림
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
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 30px rgba(15,23,42,.04)',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          관리자 로그인
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          관리자 비밀번호를 입력해 주세요.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
          style={{
            width: '100%',
            border: '1px solid #d1d5db',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 14,
          }}
        />

        {errorMsg ? (
          <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 8 }}>
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
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '확인중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
