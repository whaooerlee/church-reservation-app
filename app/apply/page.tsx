'use client';

import { useState } from 'react';

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const f = e.currentTarget;

    // ✅ 날짜와 시간 분리 입력 → 서버가 조합해서 처리
    const payload = {
      space_id: (f as any).space_id?.value,      // "402호" 등 (서버에서 name→UUID 자동 매핑)
      title: (f as any).title?.value,
      requester: (f as any).requester?.value,
      team_name: (f as any).team_name?.value,
      date: (f as any).date?.value,              // YYYY-MM-DD
      start_time: (f as any).start_time?.value,  // HH:mm
      end_time: (f as any).end_time?.value,      // HH:mm
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || '신청 실패');

      window.location.href = `/apply/success/${json.id}`;
    } catch (err: any) {
      console.error('신청 실패:', err);
      setMsg(err.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
        세종교육관 공간사용 예약 신청
      </h1>
      <p style={{ color: '#5b6b7c', marginBottom: 20 }}>
        아래 항목을 모두 입력해 주세요.
      </p>

      <form onSubmit={handleSubmit} className="stack" style={{ display: 'grid', gap: 12 }}>
        <label>
          <div className="label">공간 선택</div>
          <select name="space_id" required className="input">
            <option value="">선택하세요</option>
            <option value="402호">402호</option>
            <option value="407호">407호</option>
            <option value="409호">409호</option>
            <option value="410호">410호</option>
            <option value="411호">411호</option>
          </select>
        </label>

        <label>
          <div className="label">사용 목적</div>
          <input type="text" name="title" placeholder="예: 3-2순 모임" required className="input" />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            <div className="label">신청자</div>
            <input type="text" name="requester" placeholder="신청자 이름" required className="input" />
          </label>

          <label>
            <div className="label">순 또는 팀 이름</div>
            <input type="text" name="team_name" placeholder="예: 3-2순" required className="input" />
          </label>
        </div>

        {/* ✅ 날짜 1번 입력 */}
        <label>
          <div className="label">날짜</div>
          <input type="date" name="date" required className="input" />
        </label>

        {/* ✅ 시간 2개 입력 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            <div className="label">시작 시간</div>
            <input type="time" name="start_time" required className="input" />
          </label>
          <label>
            <div className="label">종료 시간</div>
            <input type="time" name="end_time" required className="input" />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            background: '#a3272f',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? '신청 중...' : '신청하기'}
        </button>

        {msg && <p style={{ color: '#b91c1c', marginTop: 10 }}>{msg}</p>}
      </form>
    </div>
  );
}
