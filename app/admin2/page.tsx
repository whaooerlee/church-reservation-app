// app/admin2/page.tsx
'use client';

export default function Admin2Page() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e2e8f0',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
        ✅ 여기는 /admin2 입니다
      </h1>
      <p style={{ fontSize: 15, marginBottom: 8 }}>
        이 화면이 보이면, 우리가 만든 새 라우트는 잘 뜨는 겁니다.
      </p>
      <p style={{ fontSize: 14, color: '#475569' }}>
        이게 안 보이고 계속 예전 로그인 화면만 보이면, 지금 Next가 보고 있는
        폴더가 <code>app/</code>가 아니거나, middleware에서 가로채는 겁니다.
      </p>
    </div>
  );
}
