// app/admin/page.js

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#eef2f7',
        padding: 20,
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        ✅ 이 파일은 app/admin/page.js 입니다
      </h1>
      <p style={{ marginBottom: 16 }}>
        이 화면이 보이면 이제 제대로 된 파일을 찾은 겁니다.
        <br />
        여기다가 아까 쓰시던 “예약 승인 달력” 코드를 다시 붙이면 됩니다.
      </p>
      <p
        style={{
          background: '#fff',
          border: '1px solid #d4d4d8',
          borderRadius: 10,
          padding: 12,
        }}
      >
        만약 이것도 안 바뀌면, <code>src/app/admin/page.js</code> 나{' '}
        <code>src/app/admin/page.tsx</code> 쪽이 실제로 쓰이고 있는 겁니다.
      </p>
    </div>
  );
}
