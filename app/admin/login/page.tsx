'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok || !json?.ok) {
        alert(json?.message || '로그인 실패');
        setLoading(false);
        return;
      }

      // ★ 여기서 진짜 /admin 으로 보냅니다
      window.location.href = '/admin?ts=' + Date.now();
    } catch (err) {
      alert('서버 오류');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e2e8f0', width: 360 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>관리자 로그인</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: '#a3272f', color: '#fff', border: 'none', borderRadius: 8, padding: 10 }}
        >
          {loading ? '확인중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}
