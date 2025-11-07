'use client';

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
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
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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
  const calRef = useRef<any>(null);

  // ✅ 여기서 기존 API만 사용
  const loadAll = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/reservations?status=pending'),
        fetch('/api/reservations?status=approved'),
        fetch('/api/spaces'),
      ]);
      const pending = await safeJson(r1);
      const approved = await safeJson(r2);
      const spaceList = await safeJson(r3);
      setReservations([...(pending || []), ...(approved || [])]);
      setSpaces(spaceList || []);
    } catch (err) {
      console.error('관리자 데이터 로드 실패', err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ✅ 승인
  const approve = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (!res.ok) {
      alert('승인 실패');
      return;
    }
    loadAll();
  };

  // ✅ 승인취소
  const unapprove = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' }),
    });
    if (!res.ok) {
      alert('승인 취소 실패');
      return;
    }
    loadAll();
  };

  // ✅ 삭제
  const remove = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert('삭제 실패');
      return;
    }
    loadAll();
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
    wrap.style.fontSize = '0.7rem';
    wrap.style.whiteSpace = 'normal';

    const line = document.createElement('div');
    line.textContent = text;
    wrap.appendChild(line);

    const btns = document.createElement('div');
    btns.style.marginTop = '3px';
    btns.style.display = 'flex';
    btns.style.gap = '4px';

    const makeBtn = (label: string, color: string, fn: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.padding = '2px 5px';
      b.style.fontSize = '0.65rem';
      b.style.border = 'none';
      b.style.borderRadius = '4px';
      b.style.background = color;
      b.style.color = '#fff';
      b.style.cursor = 'pointer';
      b.onclick = (e) => {
        e.stopPropagation();
        fn();
      };
      return b;
    };

    if (status === 'pending') {
      btns.appendChild(makeBtn('승인', '#22a35a', () => approve(info.event.id)));
      btns.appendChild(makeBtn('삭제', '#6b7280', () => remove(info.event.id)));
    } else {
      btns.appendChild(makeBtn('취소', '#d97706', () => unapprove(info.event.id)));
      btns.appendChild(makeBtn('삭제', '#6b7280', () => remove(info.event.id)));
    }

    wrap.appendChild(btns);
    return { domNodes: [wrap] };
  };

  const gotoPrev = () => {
    const api = calRef.current?.getApi?.();
    api?.prev();
    setMonthTitle(api?.view?.title || '');
  };
  const gotoNext = () => {
    const api = calRef.current?.getApi?.();
    api?.next();
    setMonthTitle(api?.view?.title || '');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 20 }}>
      <header
        style={{
          maxWidth: 1200,
          margin: '0 auto 16px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          alignItems: 'flex-end',
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#042550' }}>
            세종교육관 예약관리
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            초록: 승인됨 / 노랑: 승인대기
          </p>
        </div>
        <Link
          href="/"
          style={{
            background: '#fff',
            border: '1px solid #a3272f',
            color: '#a3272f',
            borderRadius: 8,
            padding: '6px 12px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          ← 사용자 화면
        </Link>
      </header>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto 12px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
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

      <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
        <FullCalendar
          ref={calRef}
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

      {/* 최소 스타일만 전역으로 */}
      <style jsx global>{`
        .fc {
          font-family: 'Noto Sans KR', system-ui, sans-serif;
        }
        .fc .fc-col-header {
          background: #f3f4f6;
        }
        .fc-event.evt-approved {
          background: #22c55e !important;
          border: 1px solid #16a34a !important;
          color: #052e16 !important;
        }
        .fc-event.evt-pending {
          background: #fde68a !important;
          border: 1px solid #f59e0b !important;
          color: #3b2f07 !important;
        }
      `}</style>
    </div>
  );
}
