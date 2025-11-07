'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Reservation = {
  id: string;
  title: string;
  team_name?: string;
  start_at: string;
  end_at: string;
  space_id: string;
  status?: string;
};

type Space = { id: string; name: string; color?: string };

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

function hhmm(d: Date | null) {
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function HomePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const calendarRef = useRef<any>(null);
  const [monthTitle, setMonthTitle] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // 이제 이 한 줄로 다 가져옵니다
        const [r1, r2] = await Promise.all([
          fetch('/api/reservations'),
          fetch('/api/spaces'),
        ]);
        const rs = await safeJson(r1);
        const sp = await safeJson(r2);

        // 사용자 화면에서는 승인된 것만 보여주기로
        const approved = (rs as Reservation[]).filter(
          (r) => !r.status || r.status === 'approved'
        );

        setReservations(approved);
        setSpaces(sp);
      } catch (e) {
        console.error('초기 로딩 실패:', e);
      }
    })();
  }, []);

  const colorBySpace = new Map(spaces.map((s) => [s.id, s.color || '#429f8e']));
  const nameBySpace = new Map(spaces.map((s) => [s.id, s.name]));

  const events = reservations.map((r) => ({
    id: r.id,
    title: r.team_name ? r.team_name : r.title,
    start: r.start_at,
    end: r.end_at,
    backgroundColor: colorBySpace.get(r.space_id) || '#429f8e',
    borderColor: colorBySpace.get(r.space_id) || '#429f8e',
    extendedProps: { spaceName: nameBySpace.get(r.space_id) || '' },
  }));

  const eventContent = (info: any) => {
    const spaceName = info.event.extendedProps?.spaceName || '';
    const start = hhmm(info.event.start);
    const end = hhmm(info.event.end);
    const text = `[${spaceName}] ${info.event.title} ${start && end ? `${start}~${end}` : ''}`;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.lineHeight = '1.25';
    wrapper.style.fontSize = '0.8rem';
    wrapper.style.fontWeight = '400';
    wrapper.style.whiteSpace = 'normal';
    wrapper.style.wordBreak = 'keep-all';
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      {/* 헤더 */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          margin: '0 auto 16px',
          maxWidth: 1200,
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: '#64748b' }}>세종교육관</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: '#042550', margin: '8px 0 4px' }}>
            세종교육관 공간예약 현황
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>승인된 예약만 표시됩니다.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            href="/apply"
            style={{
              background: '#a3272f',
              color: '#fff',
              padding: '7px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            공간예약신청
          </Link>
          <Link
            href="/admin"
            style={{
              background: '#fff',
              border: '1px solid #a3272f',
              color: '#a3272f',
              padding: '7px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            관리자
          </Link>
        </div>
      </header>

      {/* 월 이동 */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <button onClick={gotoPrev} style={{ border: 'none', background: 'none', color: '#94a3b8' }}>
          ◀
        </button>
        <div style={{ minWidth: 160, textAlign: 'center' }}>{monthTitle}</div>
        <button onClick={gotoNext} style={{ border: 'none', background: 'none', color: '#94a3b8' }}>
          ▶
        </button>
      </div>

      {/* 달력 */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 16,
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="auto"
          events={events}
          eventContent={eventContent}
          locale="ko"
          dayMaxEvents
          datesSet={(arg) => setMonthTitle(arg.view?.title || '')}
        />
      </div>

      <style jsx global>{`
        .fc {
          font-family: 'Noto Sans KR', system-ui, sans-serif;
        }
        .fc .fc-col-header {
          background: #f3f4f6;
        }
        .fc .fc-day-today {
          background: transparent !important;
        }
        .fc .fc-event {
          background: rgba(66, 159, 142, 0.12) !important;
          border: 1px solid rgba(66, 159, 142, 0.35) !important;
          color: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
