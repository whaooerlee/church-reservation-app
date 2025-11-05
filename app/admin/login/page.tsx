// app/admin/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>로그인 폼 불러오는 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
