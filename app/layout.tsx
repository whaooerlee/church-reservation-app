export const metadata = {
  title: '세종교육관 공간예약',
  description: '세종교육관 공간사용 예약 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* FullCalendar(월간표 쓰면) */}
        <link rel="stylesheet" href="https://unpkg.com/@fullcalendar/daygrid@6.1.15/main.css" />
        {/* Google Fonts: Noto Sans KR + Inter */}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root{
            --brand-navy: #042550;   /* Onnuri Green Vogue */
            --brand-teal: #429f8e;   /* Onnuri Ocean Green */
            --brand-bg:   #f5f7fa;   /* 밝은 배경 */
            --brand-text: #1f2937;   /* 본문 텍스트 */
            --brand-line: #d7dde5;   /* 구분선 */
          }
          html,body{margin:0;padding:0;background:var(--brand-bg);color:var(--brand-text);}
          body{font-family: 'Noto Sans KR','Inter',system-ui,-apple-system,Segoe UI,Roboto,Apple SD Gothic Neo,'Malgun Gothic',sans-serif;}

          /* 공통 UI 토큰 */
          .btn{
            border:1px solid var(--brand-navy);
            background: var(--brand-navy);
            color:#fff; border-radius:12px; padding:.6rem 1rem; font-weight:600;
            transition: transform .04s ease, background .2s ease, box-shadow .2s ease;
          }
          .btn:hover{ background: #073173; }
          .btn:active{ transform: translateY(1px); }
          .btn-outline{
            border:1px solid var(--brand-navy); color:var(--brand-navy); background:#fff;
          }
          .btn-outline:hover{ background:#eef2f8; }

          .card{ background:#fff; border:1px solid var(--brand-line); border-radius:16px; box-shadow:0 10px 24px rgba(4,37,80,.06); }
          .card-hd{ padding:16px 20px; border-bottom:1px solid var(--brand-line); background:#fbfcfe;}
          .card-bd{ padding:20px; }
          .card-ft{ padding:16px 20px; border-top:1px solid var(--brand-line); background:#fbfcfe;}

          .label{font-size:.9rem; color:#475569; font-weight:500;}
          .input, .select, .textarea{
            width:100%; padding:.7rem .9rem; border:1px solid var(--brand-line); border-radius:12px; background:#fff;
            outline:none; transition: border .15s ease, box-shadow .15s ease;
          }
          .input:focus, .select:focus, .textarea:focus{
            border-color: var(--brand-teal);
            box-shadow: 0 0 0 3px rgba(66,159,142,.15);
          }

          /* 포인트 배지/강조 텍스트 */
          .badge{display:inline-block; padding:.2rem .5rem; border-radius:999px; background:rgba(66,159,142,.12); color:var(--brand-teal); font-weight:600; font-size:.75rem;}

          /* FullCalendar 오늘 강조(월간표) */
          .fc .fc-day-today{
            background:#fff9e6 !important; position:relative;
            outline:2px solid rgba(4,37,80,.18);
          }
          .fc .fc-day-today .fc-daygrid-day-number{ color:#b45309; font-weight:700; }

          @media print{
            @page{ size: A4 landscape; margin:10mm; }
            body{ background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          }

          /* ====== 반응형 토큰 ====== */
          .container { width:100%; max-width:760px; margin:0 auto; padding:24px 16px; }
          .card-bd{ padding:16px 18px; } .card-ft{ padding:12px 18px; }

          /* 폼 요소: 넘침 방지 & 높이 축소 */
          .input, .select, .textarea{
            width:100%; max-width:100%;
            font-size:0.95rem;
            padding:.55rem .7rem;
            border:1px solid var(--brand-line);
            border-radius:10px; background:#fff; outline:none;
            transition: border .15s ease, box-shadow .15s ease;
            box-sizing:border-box; /* 👈 중요 */
          }

          /* 버튼 */
          .btn{ border:1px solid var(--brand-navy); background:var(--brand-navy);
            color:#fff; border-radius:12px; padding:.55rem .9rem; font-weight:600;
            transition: transform .04s ease, background .2s ease, box-shadow .2s ease; }
          .btn:hover{ background:#073173; } .btn:active{ transform:translateY(1px); }
          .btn-outline{ border:1px solid var(--brand-navy); color:var(--brand-navy); background:#fff; }

          /* 그리드 유틸 (데스크탑 기본) */
          .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
          .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .stack  { display:grid; gap:18px; }

          /* ====== 반응형 브레이크포인트 ====== */
          @media (max-width: 900px){
            .container{ max-width:720px; padding:20px 14px; }
          }

          @media (max-width: 768px){
            .container{ max-width:640px; padding:18px 12px; }
            .grid-3 { grid-template-columns:1fr; }   /* 날짜/시간 3칸 → 1열 */
            .grid-2 { grid-template-columns:1fr; }   /* 신청자/팀 2칸 → 1열 */
            .btn { width:100%; }                     /* 버튼 가로 꽉 차게 */
            .actions { flex-direction:column; align-items:stretch; gap:10px; }
          }

          @media (max-width: 480px){
            .container{ max-width:100%; padding:16px 10px; }
            .input, .select, .textarea{ font-size:0.92rem; padding:.5rem .65rem; }
          }

          
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
