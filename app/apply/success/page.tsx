import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams?.id;

  // ✅ 기존 /apply/success?id=UUID 형식으로 접근 시 새 경로로 자동 이동
  if (id) redirect(`/apply/success/${id}`);

  // ✅ id가 없으면 잘못된 접근 메시지 출력
  return <div style={{ padding: 24 }}>잘못된 접근입니다.</div>;
}
