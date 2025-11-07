'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Reservation = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  space_id: string;
  team_name?: string;
  status: 'pending' | 'approved';
};

type Space = { id: string; name: string; color?: string };

function hhmm(d: Date | null) {
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [monthTitle, setMonthTitle] = useState('');
  const calendarRef = useRef<any>(null);

  // ✅ 여기만 중요
  const fetchData = async () => {
    try {
      // 기존에 있던 API만 사용합니다.
      const [approvedRes, pendingRes, spacesRes] = await Promise.all([
        fetch('/api/reservations?status=approved'),
        fetch('/api/reservations?status=pending'),
        fetch('/api/spaces'),
      ]);

      const approved = await safeJson(approvedRes);
      const pending = await safeJson(pendingRes);
      const spaces = await safeJson(spacesRes);

      // 승인 + 대기 통합
      setReservations([...(pending || []), ...(approved || [])]);
      setSpaces(spaces || []);
    } catch (e) {
      console.error('관리자 데이터 로드 실패', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 승인/취소/삭제는 기존에 만들어둔 API를 호출하는 형태 그대로 둡니다.
  const approveReservation = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (!res.ok) {
      alert('승인 실패');
      return;
    }
    fetchData();
  };

  const cancelApproval = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' }),
    });
    if (!res.ok) {
      alert('승인 취소 실패');
      return;
    }
    fetchData();
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('삭제 실패');
      return;
    }
    fetchData();
  };

  const nameBySpace = new Map(spaces.map((s) => [s.id, s.name]));

  const events = reservations.map((r) => ({
    id: r.id,
    title: r.team_name ? r.team_name : r.title,
    start: r.start_at,
    end: r.end_at,
    extendedProps: {
      status: r.status,
      spaceName: nameBySpace.get(r.space_id) || '',
    },
    classNames: [r.status === 'approved' ? 'evt-approved' : 'evt-pending'],
  }));

  const eventContent = (info: any) => {
    const { spaceName, status } = info.event.extendedProps;
    const start = hhmm(info.event.start);
    const end = hhmm(info.event.end);
    const text = `[${spaceName}] ${info.event.title} ${start && end ? `${start}~${end}` : ''}`;

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.lineHeight = '1.25';
    wrap.style.fontSize = '0.75rem';
    wrap.style.whiteSpace = 'normal';
    wrap.style.wordBreak = 'keep-all';

    const title = document.createElement('span');
    title.textContent = text;
    wrap.appendChild(title);

    const row = document.createElement('div');
    row.style.marginTop = '3px';
    row.style.display = 'flex';
    row.style.gap = '4px';

    const mk = (label: string, color: string, onClick: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.padding = '2px 6px';
      b.style.fontSize = '0.7rem';
      b.style.border = `1px solid ${color}`;
      b.style.borderRadius = '4px';
      b.style.background = color;
      b.style.color = '#fff';
      b.style.cursor = 'pointer';
      b.onclick = (e) => {
        e.stopPropagation();
        onClick();
      };
      return b;
    };

    if (status === 'pending') {
      row.appendChild(mk('승인', '#22a35a', () => approveReservation(info.event.id)));
      row.appendChild(mk('삭제', '#6b7280', () => deleteReservation(info.event.id)));
    } else {
      row.appendChild(mk('승인취소', '#d97706', () => cancelApproval(info.event.id)));
      row.appendChild(mk('삭제', '#6b7280', () => deleteReservation(info.event.id)));
    }

    wrap.appendChild(row);
    return { domNodes: [wrap] };
  };

  const calendarRef = useRef<any>(null);

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
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 600,
              color: 'var(--brand-navy)',
              margin: '8px 0 4px',
            }}
          >
            세종교육관 예약관리
          </h1>
          <p style={{ color: '#5b6b7c', fontWeight: 400, margin: 0 }}>
            ✅ 초록: 승인됨 / 🟡 노랑: 승인대기 — 각 항목에서 승인, 취소, 삭제 가능
          </p>
        </div>
        <Link href="/" className="btn btn-primary-outline">
          ← 사용자 화면
        </Link>
      </header>

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
        <button type="button" className="nav-btn" onClick={gotoPrev}>
          ◀
        </button>
        <div className="month-title">{monthTitle || ' '}</div>
        <button type="button" className="nav-btn" onClick={gotoNext}>
          ▶
        </button>
      </div>

      <div className="card" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card-bd">
          <FullCalendar
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
          />
        </div>
      </div>

      <style jsx global>{`
        :root {
          --brand-primary: #a3272f;
          --brand-bg: #f8fafc;
          --brand-navy: #042550;
          --brand-line: #e1e5eb;
        }
        .fc {
          font-family: 'Noto Sans KR', 'Inter', system-ui;
          font-weight: 400;
        }
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
        .fc .fc-event {
          border-radius: 4px;
          font-size: 0.75rem !important;
          font-weight: 400 !important;
          white-space: normal !important;
        }
        .fc-event.evt-approved {
          background-color: #22c55e !important;
          border-color: #16a34a !important;
          color: #073b18 !important;
        }
        .fc-event.evt-pending {
          background-color: #fde68a !important;
          border-color: #f59e0b !important;
          color: #3b2f07 !important;
        }
        .btn {
          border-radius: 8px;
          padding: 7px 14px;
          text-decoration: none !important;
          font-weight: 500;
        }
        .btn-primary-outline {
          background: #fff;
          color: var(--brand-primary);
          border: 1px solid var(--brand-primary);
        }
        .nav-btn {
          border: none;
          background: none;
          color: #94a3b8;
          font-size: 1rem;
          cursor: pointer;
        }
        .month-title {
          min-width: 160px;
          text-align: center;
          font-size: 1.05rem;
          color: #1f2937;
          font-weight: 400;
        }
        .card {
          background: #fff;
          border: 1px solid var(--brand-line);
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(4, 37, 80, 0.06);
        }
        .card-bd {
          padding: 20px;
        }
      `}</style>
    </div>
  );
}
