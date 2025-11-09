'use client';

import { useEffect, useState } from 'react';

type Space = {
  id: string;
  name: string;
};

export default function ApplyPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceId, setSpaceId] = useState('');
  const [title, setTitle] = useState('순모임');
  const [requester, setRequester] = useState('');
  const [teamName, setTeamName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  // 공간 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/spaces');
        const json = await res.json();
        setSpaces(json);
        if (json.length > 0) {
          setSpaceId(json[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // 날짜 + 시간 → ISO 로 만들어주는 함수
  function makeIso(dateStr: string, timeStr: string) {
    // timeStr 이 "오후 08:21" 이런 포맷일 수도 있으니까 input type="time" 으로 보낼 거라고 가정
    if (!dateStr || !timeStr) return '';
    // yyyy-mm-ddThh:mm:00
    return `${dateStr}T${timeStr}:00`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // 1) 필수값 체크
    if (!spaceId || !title || !requester || !date || !startTime || !endTime) {
      setError('필수 항목을 모두 입력해 주세요.');
      return;
    }

    const start_at = makeIso(date, startTime);
    const end_at = makeIso(date, endTime);

    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          title,                // 사용 목적
          requester,            // 신청자
          team_name: teamName,  // 순/팀 이름
          start_at,
          end_at,
        }),
      });

      const json = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        // 서버에서 주는 메시지가 있으면 보여주기
        setError(
          json?.error ||
            '신청 중 오류가 발생했습니다. (필수 필드를 다시 확인해 주세요)'
        );
        return;
      }

      // 성공
      setDoneId(json.id || json[0]?.id || ''); // 서버에서 뭘 주든 일단 저장
    } catch (err) {
      console.error(err);
      setError('신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 신청 완료 화면
  if (doneId) {
    return (
      <div style={{ minHeight: '100vh', background: '#e2e8f0', padding: '32px 16px' }}>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            background: '#fff',
            borderRadius: 14,
            padding: 24,
            border: '1px solid #cbd5e1',
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
            신청이 접수되었습니다.
          </h1>
          <p style={{ marginBottom: 18, color: '#475569' }}>
            관리자가 검토 후 승인하면 메인 달력에 표시됩니다.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
              신청번호: {doneId}
            </div>
            <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
              공간: {spaces.find((s) => s.id === spaceId)?.name || '-'}
            </div>
            <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
              순/팀 & 목적: {title}
            </div>
            <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
              신청자: {requester}
            </div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>
              일시: {date} {startTime} ~ {endTime}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href="/"
              style={{
                background: '#0f172a',
                color: '#fff',
                padding: '7px 14px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              메인으로
            </a>
            <button
              onClick={() => {
                // 다시 신청하기
                setDoneId(null);
                setError('');
              }}
              style={{
                background: '#fff',
                border: '1px solid #0f172a',
                color: '#0f172a',
                padding: '7px 14px',
                borderRadius: 8,
              }}
            >
              다른 시간 신청
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e2e8f0', padding: '32px 16px' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 14,
          padding: 24,
          border: '1px solid #cbd5e1',
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          세종교육관 공간사용 예약 신청
        </h1>
        <p style={{ marginBottom: 18, color: '#475569' }}>
          아래 항목을 모두 입력해 주세요.
        </p>

        {/* 공간 선택 */}
        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>공간 선택</div>
          <select
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            style={{
              width: '80%',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '8px 12px',
            }}
            required
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {/* 사용 목적 */}
        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>사용 목적</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 순모임, 찬양팀, 회의..."
            style={{
              width: '80%',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '8px 12px',
            }}
            required
          />
        </label>

        {/* 신청자 + 순/팀 이름 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <label style={{ flex: 1 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>신청자</div>
            <input
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="신청자 성함"
              style={{
                width: '80%',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '8px 12px',
              }}
              required
            />
          </label>
          <label style={{ flex: 1 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>순 또는 팀 이름</div>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 3-2순, 찬양팀"
              style={{
                width: '80%',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '8px 12px',
              }}
            />
          </label>
        </div>

        {/* 날짜 */}
        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>날짜</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '80%',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '8px 12px',
            }}
            required
          />
        </label>

        {/* 시간 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <label style={{ flex: 1 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>시작 시간</div>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                width: '80%',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '8px 12px',
              }}
              required
            />
          </label>
          <label style={{ flex: 1 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>종료 시간</div>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                width: '80%',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '8px 12px',
              }}
              required
            />
          </label>
        </div>

        {error && (
          <div style={{ marginBottom: 12, color: '#b91c1c', fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#a3272f',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 0',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '신청 중...' : '신청하기'}
        </button>
        <p style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
          필수 항목: 공간, 사용 목적, 신청자, 날짜, 시작/종료 시간
        </p>
      </form>
    </div>
  );
}
