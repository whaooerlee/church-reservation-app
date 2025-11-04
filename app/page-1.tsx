'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import koLocale from '@fullcalendar/core/locales/ko';

type Space = { id: string; name: string };
type Resv = {
  id: string;
  space_id: string;
  team?: string;
  title?: string;
  start_at: string;
  end_at: string;
  status: 'approved' | 'pending' | 'rejected';
};

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [r1, r2] = await Promise.all([
        fetch('/api/reservations?status=approved'),
        fetch('/api/spaces'),
      ]);
      const resvs: Resv[] = await r1.json();
      const spaces: Space[] = await r2.json();

      const spaceMap: Record<string, string> = {};
      for (const s of spaces || []) spaceMap[s.id] = s.name;

      const hhmm = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      const mapped = (resvs || []).map((r) => {
        const space = spaceMap[r.space_id] || '';
        const team = r.team || r.title || '';
        return {
          id: r.id,
          title: `[${space}] ${team} ${hhmm(r.start_at)}~${hhmm(r.end_at)}`,
          start: r.start_at,
          end: r.end_at,
          // 색상은 CSS 변수로 조절 (관리자 페이지와 동일 톤)
          backgroundColor: 'var(--adm-evt-bg)',
          borderColor: 'var(--adm-evt-bd)',
          textColor: 'var(--adm-evt-tx)',
        };
      });

      setEvents(mapped);
    })().catch(console.error);
  }, []);

  return (
    <div className="adm adm-wrap">
      <header className="adm-header">
        <span className="adm-badge">세종교육관</span>
        <h1 className="adm-title">세종교육관 공간예약 현황</h1>
        <p className="adm-sub">승인된 예약만 표시됩니다.</p>
        <nav className="adm-links">
          <a href="/apply" className="adm-btn adm-btn-primary">공간예약신청</a>
          <a href="/admin" className="adm-btn adm-btn-outline">관리자</a>
        </nav>
      </header>

      <div className="adm-card">
        <FullCalendar
          locales={[koLocale]}
          locale="ko"
          plugins={[dayGridPlugin, resourceTimeGridPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          titleFormat={{ year: 'numeric', month: 'long' }}
          buttonText={{ prev: '‹', next: '›' }}
          // 👇 기본 점(●) 리스트 대신 ‘배지(블록)’로 보이게
          eventDisplay="block"
          dayMaxEventRows={false}
          events={events}
        />
      </div>
    </div>
  );
}
