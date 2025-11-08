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

async function safeJson(res: Response) {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

function hhmm(d: Date | null) {
  if (!d) return '';
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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

  const colorBySpace = new Map(
    spaces.map((s) => [s.id, s.color || '#429f8e'])
  );
  const nameBySpace = new Map(spaces.map((s) => [s.id, s.name]));

  // 의미 없는 단어는 지우는 헬퍼
  const cleanTitle = (title: string) =>
    title.replace(/모임|예배|리허설|회의/gi, '').trim();

  const events = reservations.map((r) => {
    const spaceName = nameBySpace.get(r.space_id) || '';
    const baseTitle = cleanTitle(r.title);
    // 캘린더에 한 줄로 보일 짧은 제목
    const shortTitle = `[${spaceName}] ${baseTitle}`;
    return {
      id: r.id,
      title: shortTitle,
      start: r.start_at,
      end: r.end_at,
      backgroundColor: colorBySpace.get(r.space_id) || '#d9f0e4',
      borderColor: colorBySpace.get(r.space_id) || '#d9f0e4',
      extendedProps: {
        spaceName,
        rawTitle: baseTitle,
        requester: r.requester || '',
        teamName: r.team_name || '',
      },
    };
  });

  // ✅ 이벤트 안에 들어갈 실제 DOM
  const eventContent = (info: any) => {
    const start = hhmm(info.event.start);
    const end = hhmm(info.event.end);
    const spaceName = info.event.extendedProps?.spaceName || '';
    const title = info.event.extendedProps?.rawTitle || info.event.title;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.lineHeight = '1.15';
    wrapper.style.fontSize = '0.72rem';
    wrapper.style.whiteSpace = 'normal';

    // 한 줄로: [402호] 3-2순 19:10~21:00
    const text = `[${spaceName}] ${title}${
      start && end ? ` ${start}~${end}` : ''
    }`;

    wrapper.textContent = text;
    return { domNodes: [wrapper] };
  };

  // ✅ 브라우저 툴팁으로 상세 띄우기
  const eventDidMount = (info: any) => {
    const { spaceName, rawTitle, requester, teamName } = info.event.extendedProps;
    const start = hhmm(info.event.start);
    const end = hhmm(info.event.end);
    info.el.title = [
      spaceName ? `공간: ${spaceName}` : '',
      rawTitle ? `모임: ${rawTitle}` : '',
      teamName ? `순/팀: ${teamName}` : '',
      requester ? `신청자: ${requester}` : '',
      start && end ? `시간: ${start} ~ ${end}` : '',
    ]
      .filter(Boolean)
      .join('\n');
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
    <div style={{ minHeight: '100vh', background: '#edf2f6', padding: '20px' }}>
      {/* 상단 헤더 */}
      <header className="top-header">
        <div>
          {/* 여기 교회 이름 바꿈 */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff2e6',
              color: '#b45309',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '999px',
                background: '#f97316',
                display: 'inline-block',
              }}
            ></span>
            대전온누리교회
          </span>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#042550',
              margin: '10px 0 4px',
            }}
          >
            세종교육관 공간예약 현황
          </h1>
          <p style={{ color: '#5b6b7c', margin: 0 }}>승인된 예약만 표시됩니다.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/apply" className="btn-primary">
            공간예약신청
          </Link>
          <Link href="/admin" className="btn-outline">
            관리자
          </Link>
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

      {/* 달력 카드 */}
      <div className="app-card" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ padding: 20 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            height="auto"
            events={events}
            eventContent={eventContent}
            eventDidMount={eventDidMount} // 👈 여기서 툴팁
            locale="ko"
            dayMaxEvents={true}
            datesSet={(arg) => setMonthTitle(arg.view?.title || '')}
          />
        </div>
      </div>
    </div>
  );
}
