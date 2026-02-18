'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Reservation = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  space_id: string;
  status: string;
  requester?: string;
  team_name?: string;
};

type Space = { id: string; name: string; color?: string };

function normalizeTeamLabel(raw?: string) {
  const t = (raw || '').trim();
  if (!t) return '';
  return t.endsWith('순') ? t : `${t}순`;
}

function stripDuplicateSun(text: string) {
  // "3-2순 순" 같은 케이스 정리
  return text.replace(/(순)\s*\1/g, '$1').trim();
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  if (!text) return [];
  try { return JSON.parse(text); } catch { return []; }
}

function hhmmSeoul(d: Date | null) {
  if (!d) return '';
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  });
}

export default function HomePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const calendarRef = useRef<any>(null);
  const [monthTitle, setMonthTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        // ✅ 사용자 화면은 승인된 것만 보여야 함
        const [r1, r2] = await Promise.all([
          fetch('/api/reservations'), // ← status=approved 안 보내도 됨 (API가 기본 approved만 반환)
          fetch('/api/spaces'),
        ]);
        const data1 = await safeJson(r1);
        const data2 = await safeJson(r2);
        setReservations(data1);
        setSpaces(data2);
      } catch (e) {
        console.error('초기 로딩 실패:', e);
      }
    })();
  }, []);

  const colorBySpace = new Map(spaces.map((s) => [s.id, s.color || '#429f8e']));
  const nameBySpace = new Map(spaces.map((s) => [s.id, s.name]));

  const cleanTitle = (title: string) =>
    title.replace(/모임|예배|리허설|회의/gi, '').trim();

  const events = reservations.map((r) => {
    const spaceName = nameBySpace.get(r.space_id) || '';
    const baseTitle = cleanTitle(r.title);

    // ✅ 3-2순 표시 우선
    const displayTitle =
      r.team_name && r.team_name.trim().length > 0 ? r.team_name.trim() : baseTitle;

    return {
      id: r.id,
      title: displayTitle,
      start: r.start_at,
      end: r.end_at,
      backgroundColor: colorBySpace.get(r.space_id) || '#d9f0e4',
      borderColor: colorBySpace.get(r.space_id) || '#d9f0e4',
      extendedProps: {
        spaceName,
        requester: r.requester || '',
      },
    };
  });

  // ✅ 한 줄 + 신청자 표시 + 서울시간 표시
  // 예: [402호] 3-2순 (홍길동) 19:10~21:12
  const eventContent = (info: any) => {
    const spaceName = info.event.extendedProps?.spaceName || '';
    const requester = info.event.extendedProps?.requester || '';
    const title = info.event.title || '';

    const start = hhmmSeoul(info.event.start);
    const end = hhmmSeoul(info.event.end);

    const wrapper = document.createElement('div');
    wrapper.style.display = 'block';
    wrapper.style.lineHeight = '1.2';
    wrapper.style.fontSize = '0.78rem';
    wrapper.style.whiteSpace = 'nowrap';
    wrapper.style.overflow = 'hidden';
    wrapper.style.textOverflow = 'ellipsis';
    wrapper.style.color = '#0f172a';

    /*
    const text =
      `[${spaceName}] ${title}` +
      (requester ? ` (${requester})` : '') +
      (start && end ? ` ${start}~${end}` : '');
*/
    const text = stripDuplicateSun(
      `[${spaceName}] ${info.event.title} ${start && end ? `${start}~${end}` : ''}`
    );

    wrapper.textContent = text;
    return { domNodes: [wrapper] };
  };

  const gotoPrev = () => {
    const api = calendarRef.current?.getApi?.();
    api?.prev();
    setMonthTitle(api?.view?.title || '');
  };
  const gotoNext = () => {
    const api = calendarRef.current?.getApi?.();
    api?.next();
    setMonthTitle(api?.view?.title || '');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-bg)', padding: '20px' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        margin: '0 auto 16px', maxWidth: 1200, flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <div className="badge">세종교육관</div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--brand-navy)', margin: '8px 0 4px' }}>
            세종교육관 공간예약 현황
          </h1>
          <p style={{ color: '#5b6b7c', fontWeight: 400, margin: 0 }}>
            승인된 예약만 표시됩니다. (기준 시간대: 서울)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/apply" className="btn btn-primary">공간예약신청</Link>
          <Link href="/admin" className="btn btn-primary-outline">관리자</Link>
        </div>
      </header>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, margin: '0 auto 12px', maxWidth: 1200,
      }}>
        <button type="button" className="nav-btn" onClick={gotoPrev} aria-label="이전 달">◀</button>
        <div className="month-title">{monthTitle || ' '}</div>
        <button type="button" className="nav-btn" onClick={gotoNext} aria-label="다음 달">▶</button>
      </div>

      <div className="card" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card-bd">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            height="auto"
            // ✅ FullCalendar도 서울시간 기준으로
            timeZone="Asia/Seoul"
            events={events}
            eventContent={eventContent}
            locale="ko"
            dayMaxEvents={true}
            datesSet={(arg) => setMonthTitle(arg.view?.title || '')}
          />
        </div>
      </div>

      <style jsx global>{`
        :root {
          --brand-primary: #a3272f;
          --brand-primary-dark: #8f2027;
          --brand-line: #e1e5eb;
          --brand-bg: #f8fafc;
          --brand-navy: #042550;
        }
        .badge {
          display:inline-block; padding:4px 10px; border-radius:999px;
          background: rgba(4, 37, 80, 0.07); color:#042550; font-size:.7rem; font-weight:600;
        }
        .btn {
          border-radius: 8px; padding: 7px 14px; text-decoration: none !important;
          font-weight: 500; transition: background .2s ease, transform .1s ease;
        }
        .btn-primary { background: var(--brand-primary); color:#fff; border:1px solid var(--brand-primary); }
        .btn-primary:hover { background: var(--brand-primary-dark); transform: translateY(-1px); }
        .btn-primary-outline { background:#fff; color: var(--brand-primary); border:1px solid var(--brand-primary); }
        .btn-primary-outline:hover { background: var(--brand-primary); color:#fff; transform: translateY(-1px); }

        .card { background:#fff; border:1px solid var(--brand-line); border-radius:16px; box-shadow:0 10px 24px rgba(4,37,80,.06); }
        .card-bd { padding:20px; }

        .fc { font-family:'Noto Sans KR','Inter',system-ui; font-weight:400; }
        .fc .fc-col-header { background:#f5f7fa; border:1px solid var(--brand-line); }
        .fc .fc-col-header-cell-cushion { font-weight:400 !important; color:#334155; padding:8px 0; }
        .fc .fc-daygrid-day-number { color:#1e293b; font-weight:400 !important; }

        /* 오늘은 숫자만 */
        .fc .fc-day-today { background: transparent !important; outline:none !important; }
        .fc .fc-day-today .fc-daygrid-day-number { color:#0f766e !important; font-weight:600 !important; }

        /* 이벤트 */
        .fc .fc-event {
          border-radius:4px;
          font-size:0.78rem !important;
          font-weight:400 !important;
          line-height:1.25 !important;
          padding:2px 3px !important;
          white-space:normal !important;
          background-color: rgba(66,159,142,0.15) !important;
          border:1px solid rgba(66,159,142,0.35) !important;
          color:#0f172a !important;
        }

        .nav-btn {
          border:none; background:none; color:#94a3b8; font-size:1rem; cursor:pointer;
          transition: color .15s ease, transform .1s ease;
        }
        .nav-btn:hover { color:#475569; transform: translateY(-1px); }

        .month-title {
          min-width:160px; text-align:center; font-size:1.05rem; color:#1f2937; font-weight:400;
        }
      `}</style>
    </div>
  );
}