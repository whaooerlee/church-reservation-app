'use client';

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Link from 'next/link';

type Reservation = {
  id: string;
  title: string;
  team_name?: string;
  start_at: string;
  end_at: string;
  space_id: string;
  status?: string;
};

type Space = { id: string; name: string };

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

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [monthTitle, setMonthTitle] = useState('');
  const calRef = useRef<any>(null);

  const loadAll = async () => {
    // 지금 API는 status를 안 가려도 다 주니까 한 번만 불러도 됨
    const [r1, r2] = await Promise.all([
      fetch('/api/reservations'),
      fetch('/api/spaces'),
    ]);
    const rs = await safeJson(r1);
    const sp = await safeJson(r2);
    setReservations(rs as Reservation[]);
    setSpaces(sp as Space[]);
  };

  useEffect(() => {
    loadAll();
  }, []);

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

    const line = document.createElement('div');
    line.textContent = text;
    wrap.appendChild(line);

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '4px';
    btns.style.marginTop = '3px';

    const mk = (label: string, color: string, fn: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.padding = '2px 6px';
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

    if (status === 'approved') {
      btns.appendChild(mk('취소', '#d97706', () => unapprove(info.event.id)));
      btns.appendChild(mk('삭제', '#6b7280', () => remove(info.event.id)));
    } else {
      btns.appendChild(mk('승인', '#22a35a', () => approve(info.event.id)));
      btns.appendChild(mk('삭제', '#6b7280', () => remove(info.event.id)));
    }

    wrap.appendChild(btns);
    return { domNodes: [wrap] };
  };

  const prev = () => {
    const api = calRef.current?.getApi?.();
    api?.prev();
    setMonthTitle(api?.view?.title || '');
  };
  const next = () => {
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
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: '#042550' }}>
            세종교육관 예약관리
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>초록: 승인됨 / 노랑: 승인대기</p>
        </div>
        <Link
          href="/"
          style={{
            background: '#fff',
            border: '1px solid #a3272f',
            color: '#a3272f',
            padding: '6px 12px',
            borderRadius: 8,
            textDecoration: 'none',
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
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button onClick={prev} style={{ border: 'none', background: 'none', color: '#94a3b8' }}>
          ◀
        </button>
        <div style={{ minWidth: 160, textAlign: 'center' }}>{monthTitle}</div>
        <button onClick={next} style={{ border: 'none', background: 'none', color: '#94a3b8' }}>
          ▶
        </button>
      </div>

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
          ref={calRef}
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
