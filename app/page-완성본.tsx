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
};

type Space = { id: string; name: string; color?: string };

async function safeJson(res: Response) {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  if (!text) return [];
  try { return JSON.parse(text); } catch { return []; }
}

function hhmm(d: Date | null) {
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function HomePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const calendarRef = useRef<any>(null);
  const [monthTitle, setMonthTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/reservations?status=approved'),
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

  const events = reservations.map((r) => ({
    id: r.id,
    title: cleanTitle(r.title),
    start: r.start_at,
    end: r.end_at,
    resourceId: r.space_id,
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
    <div style={{ minHeight: '100vh', background: 'var(--brand-bg)', padding: '20px' }}>
      {/* 상단 헤더: 제목 + 공지 + 버튼 */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          margin: '0 auto 16px',
          maxWidth: 1200,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <div className="badge">대전온누리교회</div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 600,
              color: 'var(--brand-navy)',
              margin: '8px 0 4px',
            }}
          >
            세종교육관 공간예약 현황
          </h1>
          <p style={{ color: '#5b6b7c', fontWeight: 400, margin: 0 }}>
            승인된 예약만 표시됩니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/apply" className="btn btn-primary">공간예약신청</Link>
          <Link href="/admin" className="btn btn-primary-outline">관리자</Link>
        </div>
      </header>

      {/* 월 표시 + 화살표 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          margin: '0 auto 12px',
          maxWidth: 1200,
        }}
      >
        <button type="button" className="nav-btn" onClick={gotoPrev} aria-label="이전 달">
          ◀
        </button>
        <div className="month-title">{monthTitle || ' '}</div>
        <button type="button" className="nav-btn" onClick={gotoNext} aria-label="다음 달">
          ▶
        </button>
      </div>

      {/* 달력 */}
      <div className="card" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card-bd">
          <FullCalendar
          /*
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            height="auto"
            events={events}
            eventContent={eventContent}
            locale="ko"
            dayMaxEvents={true}
            datesSet={(arg) => setMonthTitle(arg.view?.title || '')}
            */

            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            height="auto"
            events={events}
            eventContent={eventContent}
            locale="ko"
            dayMaxEvents={true}
            datesSet={(arg) => setMonthTitle(arg.view?.title || '')}
            /** 👇 이 한 줄이 핵심 (dot → block) */
            eventDisplay="block"
            /** 선택: 여러 줄 보이도록 강제 제한 해제 */
            dayMaxEventRows={false}

          />
        </div>
      </div>

      {/* 스타일 */}
      <style jsx global>{`
        :root {
          --brand-primary: #a3272f; /* 교회 로고 계열 붉은색 */
          --brand-primary-dark: #8f2027;
          --brand-line: #e1e5eb;
          --brand-bg: #f8fafc;
          --brand-navy: #042550;
        }

        .fc {
          font-family: 'Noto Sans KR', 'Inter', system-ui;
          font-weight: 400;
        }

        /* 요일 헤더 배경 */
        .fc .fc-col-header {
          background: #f5f7fa;
          border: 1px solid var(--brand-line);
        }
        .fc .fc-col-header-cell-cushion {
          font-weight: 400 !important;
          color: #334155;
          padding: 8px 0;
        }

        .fc .fc-daygrid-day-number {
          color: #1e293b;
          font-weight: 400 !important;
        }

        .fc .fc-day-today {
          background: transparent !important;
          outline: none !important;
        }

        /* 이벤트 스타일 */
        .fc .fc-event {
          border-radius: 4px;
          font-size: 0.8rem !important;
          font-weight: 400 !important;
          line-height: 1.25 !important;
          padding: 2px 3px !important;
          white-space: normal !important;
          color: #0a1e4f !important;
          background-color: rgba(66, 159, 142, 0.15) !important;
          border: 1px solid rgba(66, 159, 142, 0.35) !important;
        }

        /* 월 타이틀 */
        .month-title {
          min-width: 160px;
          text-align: center;
          font-size: 1.05rem;
          color: #1f2937;
          font-weight: 400;
        }

        /* 화살표 버튼 - 작고 은은한 회색 */
        .nav-btn {
          border: none;
          background: none;
          color: #94a3b8;
          font-size: 1rem;
          cursor: pointer;
          transition: color 0.2s ease, transform 0.1s ease;
        }
        .nav-btn:hover {
          color: #64748b;
          transform: translateY(-1px);
        }

        /* 버튼 (로고 컬러) */
        .btn {
          border-radius: 8px;
          padding: 7px 14px;
          text-decoration: none !important;
          font-weight: 500;
          transition: background 0.2s ease, transform 0.1s ease, border-color 0.2s ease;
        }
        .btn-primary {
          background: var(--brand-primary);
          color: #fff;
          border: 1px solid var(--brand-primary);
        }
        .btn-primary:hover {
          background: var(--brand-primary-dark);
          border-color: var(--brand-primary-dark);
          transform: translateY(-1px);
        }
        .btn-primary-outline {
          background: #fff;
          color: var(--brand-primary);
          border: 1px solid var(--brand-primary);
        }
        .btn-primary-outline:hover {
          background: var(--brand-primary);
          color: #fff;
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .fc .fc-event {
            font-size: 0.75rem !important;
          }
        }

        /* 이벤트가 짤리지 않도록 설정 */
        .fc-daygrid-event-harness { 
          max-height: none !important; 
        }
        .fc-daygrid-event { 
          white-space: normal !important; 
          height: auto !important; 
          line-height: 1.25; 
        }

        /* 이벤트 배경과 글씨 색상 */
        .fc .fc-event {
          color: #0b3d2e !important; /* 짙은 녹색 글자 (또는 #1e293b 진회색으로 변경 가능) */
          background-color: rgba(66, 159, 142, 0.15) !important; /* 연녹색 배경 */
          border: 1px solid rgba(66, 159, 142, 0.35) !important; /* 테두리 */
        }

        /* FullCalendar 이벤트 색상(텍스트/배경/테두리) */
        .fc {
          --fc-event-text-color: #0b3d2e;                    /* 짙은 녹색 글자 (원하면 #1f2937 진회색) */
          --fc-event-bg-color: rgba(66,159,142,.15);         /* 연녹색 배경 */
          --fc-event-border-color: rgba(66,159,142,.35);     /* 테두리 */
        }


      `}</style>
    </div>
  );
}
