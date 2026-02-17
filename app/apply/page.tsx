'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Space = {
  id: string;
  name: string;
};

function timeOptions(stepMinutes = 10) {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
}

const TIMES = timeOptions(10);

export default function ApplyPage() {
  const router = useRouter();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceId, setSpaceId] = useState('');
  const [title, setTitle] = useState('');
  const [requester, setRequester] = useState('');
  const [teamName, setTeamName] = useState('');

  // ✅ 서울시간 고정 입력
  const [useDate, setUseDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/spaces');
      const data = await res.json();
      setSpaces(data || []);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!spaceId || !title || !requester || !useDate) {
        throw new Error('필수 항목을 모두 입력해주세요.');
      }

      if (startTime >= endTime) {
        throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.');
      }

      // ✅ 타임존 없이 보냄 → 서버에서 서울로 해석
      const start_at = `${useDate}T${startTime}`;
      const end_at = `${useDate}T${endTime}`;

      const payload = {
        space_id: spaceId,
        title,
        requester,
        team_name: teamName,
        start_at,
        end_at,
      };

      setLoading(true);

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || '신청 실패');
      }

      // 성공 페이지 이동
      router.push(`/apply/success/${json.id}`);
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: '#fff',
          padding: 24,
          borderRadius: 16,
          border: '1px solid #e2e8f0',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
          세종교육관 공간사용 예약 신청
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>

          {/* 공간 선택 */}
          <div>
            <div style={{ marginBottom: 6 }}>공간 선택</div>
            <select
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              required
            >
              <option value="">선택하세요</option>
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 사용 목적 */}
          <div>
            <div style={{ marginBottom: 6 }}>사용 목적</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>

          {/* 날짜 + 시간 (서울 기준) */}
          <div>
            <div style={{ marginBottom: 6 }}>날짜 (서울시간 기준)</div>
            <input
              type="date"
              value={useDate}
              onChange={(e) => setUseDate(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ marginBottom: 6 }}>시작 시간 (서울)</div>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                required
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ marginBottom: 6 }}>종료 시간 (서울)</div>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                required
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#64748b' }}>
            ※ 입력/저장은 서울시간(Asia/Seoul) 기준으로 처리됩니다.
          </div>

          {/* 신청자 */}
          <div>
            <div style={{ marginBottom: 6 }}>신청자</div>
            <input
              type="text"
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              required
            />
          </div>

          {/* 순/팀 이름 */}
          <div>
            <div style={{ marginBottom: 6 }}>순 또는 팀 이름</div>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          {error && (
            <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#a3272f',
              color: '#fff',
              padding: 10,
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? '신청 중...' : '예약 신청'}
          </button>
        </form>
      </div>
    </div>
  );
}