'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      const redirect = sp.get('redirect') || '/admin';
      r.replace(redirect);
    } else {
      const t = await res.text().catch(()=> '');
      setErr(t || '로그인 실패');
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#f8fafc',padding:20}}>
      <form onSubmit={submit} style={{background:'#fff',padding:24,border:'1px solid #e5e7eb',borderRadius:12,width:320}}>
        <h1 style={{margin:0,marginBottom:12,fontSize:20,color:'#1f2937'}}>관리자 로그인</h1>
        <p style={{marginTop:0,marginBottom:16,color:'#6b7280',fontSize:14}}>비밀번호를 입력하세요.</p>
        <input
          type="password"
          value={pw}
          onChange={e=>setPw(e.target.value)}
          placeholder="관리자 비밀번호"
          required
          style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,outline:'none'}}
        />
        {err && <div style={{color:'#b91c1c',fontSize:13,marginTop:8}}>{err}</div>}
        <button type="submit" className="btn" style={{width:'100%',marginTop:12,background:'#a3272f',color:'#fff',border:'1px solid #a3272f',borderRadius:8,padding:'10px 12px'}}>
          로그인
        </button>
      </form>
    </div>
  );
}
