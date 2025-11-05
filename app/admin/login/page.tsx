// app/admin/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>로딩중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
