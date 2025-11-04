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
};

type Space = { id: string; name: string; color?: string };

function hhmm(d: Date | null) {
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [monthTitle, setMonthTitle] = useState('');
  const calendarRef = useRef<any>(null);

  const fetchData = async () => {
    const { data: resData } = await supabase
      .from('reservations')
      .select('id,title,start_at,end_at,space_id,status')
      .order('start_at', { ascending: true });
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('id,name,color')
      .order('name');
    setReservations((resData as Reservation[]) || []);
    setSpaces(spaceData || []);
  };
  useEffect(() => { fetchData(); }, []);
  
  const approveReservation = async (id: string) => {
  try {
    console.log('[approveReservation] id=', id);
    const res = await fetch(`/api/reservations/${id}`, { method: 'PATCH' });
    const payload = await res.json().catch(async () => ({ raw: await res.text() }));
    if (!res.ok) {
      console.error('PATCH /api/reservations/:id failed', res.status, payload);
      alert(`승인 실패: ${payload?.error || `HTTP ${res.status}`}\n${id}`);
      return;
    }
    console.log('PATCH OK:', payload);
    await fetchData();
  } catch (e: any) {
    console.error(e);
    alert(`승인 실패: ${e?.message ?? e}`);
  }
};



const cancelApproval = async (id: string) => {
  try {
    console.log('[cancelApproval] id=', id);
    const res = await fetch(`/api/admin/status?id=${id}&to=pending`, { method: 'POST' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
    await fetchData();
  } catch (e: any) {
    alert(`승인 취소 실패: ${e?.message ?? e}`);
  }
};

const deleteReservation = async (id: string) => {
  try {
    if (!confirm('정말 이 예약을 삭제하시겠습니까?')) return;
    console.log('[deleteReservation] id=', id);
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
    await fetchData();
  } catch (e: any) {
    alert(`삭제 실패: ${e?.message ?? e}`);
  }
};





  const nameBySpace = new Map(spaces.map(s => [s.id, s.name]));
/*
  const events = reservations.map(r => ({
    id: r.id,
    title: r.title.replace(/모임|예배|리허설|회의/gi, '').trim(),
    start: r.start_at,
    end: r.end_at,
    extendedProps: {
      status: r.status,
      spaceName: nameBySpace.get(r.space_id) || '',
    },
    // 상태별 클래스로 색상 제어 (CSS에서 !important로 강제)
    classNames: [r.status === 'approved' ? 'evt-approved' : 'evt-pending'],
  }));
  */

  const events = reservations.map(r => ({
    id: r.id, // 유지해도 되지만, 클릭 시 이 값은 쓰지 않을 거예요
    title: r.title.replace(/모임|예배|리허설|회의/gi, '').trim(),
    start: r.start_at,
    end: r.end_at,
    extendedProps: {
      reservationId: r.id,            // ✅ DB의 진짜 uuid를 별도로 보관
      status: r.status,
      spaceName: nameBySpace.get(r.space_id) || '',
    },
    classNames: [r.status === 'approved' ? 'evt-approved' : 'evt-pending'],
  }));


  const eventContent = (info: any) => {
    const { spaceName = '', status, teamName = '' } = info.event.extendedProps ?? {};
    const start = hhmm(info.event.start);
    const end = hhmm(info.event.end);

    // title은 원래 신청자가 적은 목적
    const originalTitle = info.event.title || '';

    // teamName이 있으면 그걸 우선, 없으면 title 사용
    const rawText = teamName || originalTitle;

    // 🔍 teamName/title 안에 이미 [402호] 같은 공간명이 들어있으면 한 번만 보이도록 제거
    const spacePattern = spaceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape
    const re = new RegExp(`\\[?\\s*${spacePattern}\\s*\\]?`, 'gi');
    const cleaned = rawText.replace(re, '').trim();

    // ✅ 화면에 보여줄 1줄 텍스트
    const mainLine = `[${spaceName}] ${cleaned}${start && end ? ` ${start}~${end}` : ''}`;

    // 래퍼
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'flex-start';
    wrap.style.lineHeight = '1.15';
    wrap.style.fontSize = '0.72rem';
    wrap.style.whiteSpace = 'normal';

    // ── 1줄 텍스트
    const titleEl = document.createElement('div');
    titleEl.textContent = mainLine;
    titleEl.style.whiteSpace = 'nowrap';
    titleEl.style.overflow = 'hidden';
    titleEl.style.textOverflow = 'ellipsis';
    wrap.appendChild(titleEl);

    // ── 버튼줄
    const row = document.createElement('div');
    row.style.marginTop = '4px';
    row.style.display = 'flex';
    row.style.gap = '4px';

    const mkBtn = (label: string, color: string, onClick: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.padding = '2px 6px';
      b.style.fontSize = '0.65rem';
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
      row.appendChild(
        mkBtn('승인', '#22a35a', () => approveReservation(info.event.id))
      );
      row.appendChild(
        mkBtn('삭제', '#6b7280', () => deleteReservation(info.event.id))
      );
    } else {
      row.appendChild(
        mkBtn('승인취소', '#d97706', () => cancelApproval(info.event.id))
      );
      row.appendChild(
        mkBtn('삭제', '#6b7280', () => deleteReservation(info.event.id))
      );
    }

    wrap.appendChild(row);
    return { domNodes: [wrap] };
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
          <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--brand-navy)', margin: '8px 0 4px' }}>
            세종교육관 예약관리
          </h1>
          <p style={{ color: '#5b6b7c', fontWeight: 400, margin: 0 }}>
            ✅ 초록: 승인됨 / 🟡 노랑: 승인대기 — 각 항목에서 승인, 취소, 삭제 가능
          </p>
        </div>
        <div>
        <Link href="/" className="btn btn-primary-outline">← 사용자 화면</Link>

            <button
            className="btn btn-primary-outline"
            onClick={async ()=>{
              await fetch('/api/auth/logout',{method:'POST'});
              window.location.href='/';
            }}
            >
              로그아웃
            </button>
      </div>
      </header>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, margin: '0 auto 12px', maxWidth: 1200,
      }}>
        <button type="button" className="nav-btn" onClick={gotoPrev}>◀</button>
        <div className="month-title">{monthTitle || ' '}</div>
        <button type="button" className="nav-btn" onClick={gotoNext}>▶</button>
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
          --brand-primary-dark: #8f2027;
          --brand-bg: #f8fafc;
          --brand-navy: #042550;
          --brand-line: #e1e5eb;
        }

        .fc { font-family: 'Noto Sans KR','Inter',system-ui; font-weight: 400; }
        .fc .fc-col-header { background: #f5f7fa; border: 1px solid var(--brand-line); }
        .fc .fc-col-header-cell-cushion { font-weight: 400 !important; color: #334155; padding: 8px 0; }
        .fc .fc-daygrid-day-number { color: #1e293b; font-weight: 400 !important; }
        .fc .fc-day-today { background: transparent !important; outline: none !important; }

        .month-title { min-width: 160px; text-align: center; font-size: 1.05rem; color: #1f2937; }
        .nav-btn { border: none; background: none; color: #94a3b8; font-size: 1rem; cursor: pointer; }

        .btn { border-radius: 8px; padding: 7px 14px; text-decoration: none !important; font-weight: 500; transition: all .2s; }
        .btn-primary-outline { background: #fff; color: var(--brand-primary); border: 1px solid var(--brand-primary); }
        .btn-primary-outline:hover { background: var(--brand-primary); color: #fff; }

        /* ✅ 상태별 색상 강제 (다른 전역 스타일보다 우선 적용) */
        .fc .fc-event { border-radius: 4px; font-size: 0.8rem !important; font-weight: 400 !important; white-space: normal !important; }
        .fc-event.evt-approved { 
          background-color: #22c55e !important;   /* 초록 */
          border-color: #16a34a !important;
          color: #073b18 !important;
        }
        .fc-event.evt-pending {
          background-color: #fde68a !important;   /* 노랑 */
          border-color: #f59e0b !important;
          color: #3b2f07 !important;
        }
      `}</style>
    </div>
  );
}
