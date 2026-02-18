'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Reservation = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  space_id: string;
  status: 'pending' | 'approved';
  requester?: string;
  team_name?: string;
};

type Space = { id: string; name: string; color?: string };

function hhmm(date: Date | null) {
  if (!date) return '';
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [monthTitle, setMonthTitle] = useState('');
  const calendarRef = useRef<any>(null);

  const fetchData = async () => {
    const { data: resData } = await supabase
      .from('reservations')
      .select('*')
      .order('start_at', { ascending: true });

    const { data: spaceData } = await supabase
      .from('spaces')
      .select('id,name,color')
      .order('name');

    setReservations(resData || []);
    setSpaces(spaceData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function readTextOrJson(res: Response) {
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    return { text, json };
  }

  const approveReservation = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      const { text, json } = await readTextOrJson(res);
      if (!res.ok) throw new Error(json?.error || text || `HTTP ${res.status}`);

      await fetchData();
    } catch (e: any) {
      alert(`승인 실패: ${e?.message || e}`);
    }
  };

  const cancelApproval = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });

      const { text, json } = await readTextOrJson(res);
      if (!res.ok) throw new Error(json?.error || text || `HTTP ${res.status}`);

      await fetchData();
    } catch (e: any) {
      alert(`승인취소 실패: ${e?.message || e}`);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('정말 이 예약을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });

      const { text, json } = await readTextOrJson(res);
      if (!res.ok) throw new Error(json?.error || text || `HTTP ${res.status}`);

      await fetchData();
    } catch (e: any) {
      alert(`삭제 실패: ${e?.message || e}`);
    }
  };



  const nameBySpace = new Map(spaces.map(s => [s.id, s.name]));

  const events = reservations.map(r => {
    const spaceName = nameBySpace.get(r.space_id) || '-';
    const team = r.team_name ? r.team_name.trim() : '';
    const requester = r.requester || '';

    // ✅ 팀명 중복 제거
    const cleanTitle =
      r.title?.replace(team, '').trim() || '';

    return {
      id: r.id,
      title: cleanTitle,
      start: r.start_at,
      end: r.end_at,
      extendedProps: {
        status: r.status,
        spaceName,
        team,
        requester,
      },
      classNames: [r.status === 'approved' ? 'evt-approved' : 'evt-pending'],
    };
  });

  const eventContent = (info: any) => {
    const { spaceName, status, team, requester } =
      info.event.extendedProps;

    const start = hhmm(info.event.start);
    const end = hhmm(info.event.end);

    const line = `[${spaceName}] ${team ? team + ' ' : ''}${info.event.title} ${start}~${end}`;

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.lineHeight = '1.3';
    wrap.style.fontSize = '0.78rem';
    wrap.style.whiteSpace = 'nowrap';
    wrap.style.overflow = 'hidden';
    wrap.style.textOverflow = 'ellipsis';

    const title = document.createElement('div');
    title.textContent = requester
      ? `${line} (${requester})`
      : line;

    wrap.appendChild(title);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '6px';
    btnRow.style.marginTop = '4px';

    const mkBtn = (label: string, color: string, cb: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.padding = '2px 8px';
      b.style.fontSize = '0.72rem';
      b.style.border = 'none';
      b.style.borderRadius = '6px';
      b.style.background = color;
      b.style.color = '#fff';
      b.style.cursor = 'pointer';
      b.onclick = (e) => {
        e.stopPropagation();
        cb();
      };
      return b;
    };

    if (status === 'pending') {
      btnRow.appendChild(mkBtn('승인', '#22a35a', () => approveReservation(info.event.id)));
      btnRow.appendChild(mkBtn('삭제', '#6b7280', () => deleteReservation(info.event.id)));
    } else {
      btnRow.appendChild(mkBtn('승인취소', '#d97706', () => cancelApproval(info.event.id)));
      btnRow.appendChild(mkBtn('삭제', '#6b7280', () => deleteReservation(info.event.id)));
    }

    wrap.appendChild(btnRow);
    return { domNodes: [wrap] };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        관리자 예약 관리
      </h1>

      <Link href="/" style={{ marginBottom: 16, display: 'inline-block' }}>
        ← 사용자 화면
      </Link>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        height="auto"
        events={events}
        eventContent={eventContent}
        locale="ko"
        timeZone="Asia/Seoul"   // ✅ 이거 추가
        dayMaxEvents
        datesSet={(arg) => setMonthTitle(arg.view.title)}
      />

      <style jsx global>{`
        .fc-event {
          border-radius: 6px;
          padding: 3px 6px !important;
        }
        .evt-approved {
          background-color: #d1fae5 !important;
          border-color: #10b981 !important;
        }
        .evt-pending {
          background-color: #fef3c7 !important;
          border-color: #f59e0b !important;
        }
      `}</style>
    </div>
  );
}
