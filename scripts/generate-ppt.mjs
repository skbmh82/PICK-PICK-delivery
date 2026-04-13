import PptxGenJS from "pptxgenjs";

const prs = new PptxGenJS();

// ── 공통 설정 ──────────────────────────────────────
prs.layout = "LAYOUT_WIDE"; // 16:9

const C = {
  purpleDark:  "4C1D95",
  purple:      "6B21A8",
  purpleLight: "A855F7",
  purplePale:  "EDE9FE",
  yellow:      "D97706",
  yellowLight: "FCD34D",
  white:       "FFFFFF",
  bgMain:      "FAF5FF",
  textDark:    "1F1235",
  textSub:     "6B7280",
  green:       "16A34A",
  greenPale:   "DCFCE7",
  orange:      "EA580C",
  orangePale:  "FFEDD5",
  red:         "DC2626",
  redPale:     "FEE2E2",
  borderPurple:"E9D5FF",
  blue:        "0369A1",
  bluePale:    "E0F2FE",
  blueLight:   "38BDF8",
};

// ── 슬라이드 1 — 타이틀 ───────────────────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.purpleDark };

  slide.addShape(prs.ShapeType.ellipse, {
    x: 8.5, y: -1.2, w: 3.5, h: 3.5,
    fill: { color: C.purple }, line: { color: C.purple },
  });
  slide.addShape(prs.ShapeType.ellipse, {
    x: -0.8, y: 4.5, w: 2.5, h: 2.5,
    fill: { color: C.purple }, line: { color: C.purple },
  });

  slide.addText("🛵", {
    x: 4.3, y: 0.5, w: 1.6, h: 1.2,
    fontSize: 54, align: "center",
  });

  slide.addText("PICK PICK", {
    x: 1, y: 1.5, w: 11.6, h: 1.2,
    fontSize: 52, bold: true, color: C.white,
    align: "center", fontFace: "Arial",
  });

  slide.addText("픽픽 배달앱 프로젝트 현황 보고서", {
    x: 1, y: 2.65, w: 11.6, h: 0.6,
    fontSize: 20, color: C.yellowLight,
    align: "center", fontFace: "Arial",
  });

  slide.addShape(prs.ShapeType.rect, {
    x: 3.5, y: 3.4, w: 6.6, h: 0.04,
    fill: { color: C.purpleLight }, line: { color: C.purpleLight },
  });

  slide.addText("2026년 4월 13일  |  Phase 1~3 완성 · FCM 푸시 · 관리자 5탭 · 미착수 0개", {
    x: 1, y: 3.6, w: 11.6, h: 0.5,
    fontSize: 14, color: "C4B5FD",
    align: "center",
  });

  const items = [
    { icon: "🎯", label: "한국형 배달 앱 (Web/PWA)" },
    { icon: "👥", label: "3역할: 사용자 · 사장님 · 라이더" },
    { icon: "💜", label: "자체 PICK 토큰 지갑 시스템" },
  ];
  items.forEach((it, i) => {
    slide.addText(`${it.icon}  ${it.label}`, {
      x: 1.8, y: 4.3 + i * 0.62, w: 10, h: 0.55,
      fontSize: 15, color: "DDD6FE", align: "left",
    });
  });
}

// ── 슬라이드 2 — 진행 현황 요약 (4/11 기준) ──────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addText("📊  PICK PICK 진행 현황 (4/13 최종)", {
    x: 0.4, y: 0.25, w: 13.2, h: 0.65,
    fontSize: 26, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.88, w: 3.6, h: 0.05,
    fill: { color: C.purple }, line: { color: C.purple },
  });

  const progressItems = [
    { label: "인증 / 이메일 로그인 + 지갑 자동생성",       pct: 100, color: C.green },
    { label: "카카오 소셜 로그인 + OAuth 콜백",             pct: 100, color: C.green },
    { label: "홈 탭 + 검색(전문검색 GIN) + 가맹점",        pct: 100, color: C.green },
    { label: "지갑 탭 (충전·보내기·거래내역)",              pct: 100, color: C.green },
    { label: "PICK주문 탭 + 취소 + 재주문 + 리뷰(이미지)", pct: 100, color: C.green },
    { label: "장바구니 + 메뉴 옵션 + 쿠폰 + PICK 할인",    pct: 100, color: C.green },
    { label: "사장님 대시보드 / 주문 / 메뉴 / 정산",       pct: 100, color: C.green },
    { label: "라이더 대시보드 / 배달 / 수익 / 위치 공유",  pct: 100, color: C.green },
    { label: "관리자 대시보드 + PICK 지급 + 가게 승인",    pct: 100, color: C.green },
    { label: "미들웨어 RBAC + 비밀번호 찾기/재설정",       pct: 100, color: C.green },
    { label: "DB 인덱스 30개+ + 운영 RLS 정책 전환",        pct: 100, color: C.green },
    { label: "PWA + 다크모드 + 에러/404/로딩 페이지",       pct: 100, color: C.green },
    { label: "토스페이먼츠 카드·간편결제 연동",             pct: 100, color: C.green },
    { label: "가맹점 광고 시스템 + Sentry 모니터링",        pct: 100, color: C.green },
    { label: "주간 영업시간 표시 + 실사 이미지 연동",       pct: 100, color: C.green },
    { label: "FCM 푸시 알림 + 관리자 일괄 발송",             pct: 100, color: C.green },
  ];

  progressItems.forEach((item, i) => {
    const y = 1.0 + i * 0.36;
    const barW = 5.5;

    slide.addText(item.label, {
      x: 0.5, y: y + 0.04, w: 4.2, h: 0.28,
      fontSize: 10.5, color: C.textDark,
    });

    slide.addShape(prs.ShapeType.rect, {
      x: 4.85, y: y + 0.1, w: barW, h: 0.15,
      fill: { color: "E5E7EB" }, line: { color: "E5E7EB" },
    });
    if (item.pct > 0) {
      slide.addShape(prs.ShapeType.rect, {
        x: 4.85, y: y + 0.1, w: barW * item.pct / 100, h: 0.15,
        fill: { color: item.color }, line: { color: item.color },
      });
    }

    slide.addText(`${item.pct}%`, {
      x: 10.5, y: y + 0.04, w: 0.7, h: 0.28,
      fontSize: 10.5, bold: true, color: item.color, align: "right",
    });
  });

  // 우측 요약 박스
  const summary = [
    { icon: "✅", label: "완료 기능",  value: "55개+", color: C.green,  pale: C.greenPale },
    { icon: "🚧", label: "진행 중",    value: "0개",   color: C.yellow, pale: "FFFBEB" },
    { icon: "⏳", label: "미착수",     value: "0개",   color: C.textSub, pale: "F3F4F6" },
  ];
  summary.forEach((s, i) => {
    const y = 1.3 + i * 1.55;
    slide.addShape(prs.ShapeType.roundRect, {
      x: 11.3, y, w: 2.3, h: 1.3,
      fill: { color: s.pale }, line: { color: s.color },
      rectRadius: 0.15,
    });
    slide.addText(s.icon, {
      x: 11.3, y: y + 0.08, w: 2.3, h: 0.45,
      fontSize: 22, align: "center",
    });
    slide.addText(s.value, {
      x: 11.3, y: y + 0.5, w: 2.3, h: 0.38,
      fontSize: 18, bold: true, color: s.color, align: "center",
    });
    slide.addText(s.label, {
      x: 11.3, y: y + 0.88, w: 2.3, h: 0.3,
      fontSize: 10, color: C.textSub, align: "center",
    });
  });
}

// ── 슬라이드 3 — Day 1 작업 내역 (4/8) ──────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fill: { color: C.purplePale }, line: { color: C.purple },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 08 (Day 1)", {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fontSize: 11, bold: true, color: C.purple, align: "center",
  });

  slide.addText("🔐  로그인 · 회원가입 · 홈 UI 구현", {
    x: 3.2, y: 0.22, w: 10.4, h: 0.55,
    fontSize: 22, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day1 = [
    { emoji: "🔑", title: "Supabase Auth 연동",    desc: "이메일 로그인 / 회원가입\n역할 선택 UI (user / owner / rider)\nZod 유효성 검사" },
    { emoji: "🏪", title: "Zustand authStore",      desc: "AuthProvider (세션 자동 복원)\n로그인 상태 전역 관리\n역할별 분기 처리" },
    { emoji: "🏠", title: "홈 탭 카테고리 UI",     desc: "16개 카테고리 그리드\n귀여운 이모지 + rounded-3xl\n브랜드 디자인 전면 적용" },
    { emoji: "🧭", title: "공통 레이아웃",          desc: "BottomNav rounded-t-3xl\n활성 탭 pill 스타일\nHeader PICK 잔액 위젯" },
    { emoji: "👤", title: "MyPICK 탭",              desc: "프로필 카드\nPICK 등급 배너\n사장님 / 라이더 역할별 배너" },
    { emoji: "🗄️", title: "Supabase DB 스키마",    desc: "전체 테이블 SQL 작성\nAuth cascade 트리거\nJua 폰트 PICK PICK 로고" },
  ];

  day1.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: C.purplePale }, line: { color: C.borderPurple },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: C.borderPurple },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: C.purple,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 4 — Day 2 작업 내역 (4/9) ──────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fill: { color: C.greenPale }, line: { color: C.green },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 09 (Day 2)", {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fontSize: 11, bold: true, color: C.green, align: "center",
  });

  slide.addText("🛒  가맹점·장바구니·주문·사장님·라이더 실DB 연동", {
    x: 3.2, y: 0.22, w: 10.4, h: 0.55,
    fontSize: 19, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day2 = [
    { emoji: "🏪", title: "가맹점 목록 / 상세",    desc: "카테고리별 필터링\nSupabase stores 실데이터 연동\n메뉴 목록 + 이모지 매핑" },
    { emoji: "🛒", title: "장바구니 시스템",        desc: "Zustand cartStore 구현\nCartBottomSheet 컴포넌트\n수량 조절 / 총액 계산" },
    { emoji: "📋", title: "주문 생성 + 결제",       desc: "POST /api/orders 서버 API\nPICK 토큰 차감 (deduct_pick RPC)\n주문 완료 페이지" },
    { emoji: "👨‍🍳", title: "사장님 전체 실DB",    desc: "대시보드 + 주문관리 + 메뉴관리\n정산/매출 통계\nSupabase Realtime 신규주문 알림" },
    { emoji: "🛵", title: "라이더 전체 실DB",       desc: "대시보드 + 배달하기 + 수익내역\n배달 수락 → PICK 지급 연동\nrider_earnings 정산 처리" },
    { emoji: "⚡", title: "Realtime + Zustand",     desc: "useOrderRealtime 훅\nuseStoreOrderRealtime 훅\norderStore / walletStore" },
  ];

  day2.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: C.greenPale }, line: { color: "86EFAC" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "86EFAC" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: C.green,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 5 — Day 3 작업 내역 (4/10) ─────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fill: { color: "FEF3C7" }, line: { color: C.yellow },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 10 (Day 3)", {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fontSize: 11, bold: true, color: C.yellow, align: "center",
  });

  slide.addText("🎯  즐겨찾기·리뷰·검색·관리자·프로필 수정 완성", {
    x: 3.2, y: 0.22, w: 10.4, h: 0.55,
    fontSize: 19, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day3 = [
    { emoji: "❤️",  title: "즐겨찾기 토글",         desc: "가게 상세 배너 ♥ 버튼\nPOST /api/favorites/[storeId]\n서버사이드 초기값 주입" },
    { emoji: "🛡️", title: "관리자 대시보드",        desc: "/admin/dashboard\n전체 유저 목록 + PICK 지급 모달\n/admin 역할 기반 보호 추가" },
    { emoji: "💳",  title: "회원가입 서버화",        desc: "POST /api/auth/register\nAdmin 클라이언트로 지갑 자동생성\nSQL 트리거 스크립트 작성" },
    { emoji: "⭐",  title: "리뷰 작성 + PICK 보상", desc: "배달완료 후 리뷰 버튼\n별점 1~5 + 텍스트 후기\n+10 PICK 자동 지급" },
    { emoji: "🔄",  title: "주문 취소 / 재주문",    desc: "pending 상태 취소 버튼\n이전 주문 장바구니 재담기\n재주문 → 가게 페이지 이동" },
    { emoji: "🔍",  title: "검색 + 프로필 수정",    desc: "홈 검색바 실제 동작 (ilike)\n가게 상세 리뷰 목록 섹션\nMyPICK 이름/전화/주소 수정" },
  ];

  day3.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: "FFFBEB" }, line: { color: "FCD34D" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "FCD34D" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: C.yellow,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 6 — Day 4 작업 내역 (4/11) — 신규 ────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fill: { color: C.bluePale }, line: { color: C.blue },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 11 (Day 4)", {
    x: 0.4, y: 0.18, w: 2.6, h: 0.55,
    fontSize: 11, bold: true, color: C.blue, align: "center",
  });

  slide.addText("🚀  전체 주문 플로우 완성 + 메뉴 옵션 + 실동작 연결", {
    x: 3.2, y: 0.22, w: 10.4, h: 0.55,
    fontSize: 18, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day4 = [
    {
      emoji: "💸", title: "PICK 보내기 + 알림",
      desc: "POST /api/wallet/transfer (송금)\n알림 드로어 컴포넌트\n주문 상태 변경 시 자동 알림 트리거",
    },
    {
      emoji: "🛵", title: "라이더 실동작 완성",
      desc: "라이더 실시간 위치 공유\n수익 내역 실DB + 주간/월간 차트\n수락 버튼 → PICK 적립 자동화",
    },
    {
      emoji: "👨‍🍳", title: "사장님 기능 강화",
      desc: "가게 등록 배너 + 모달 + API\n매출 통계 대시보드 강화\n관리자 가게 승인 탭 + 건수 배지",
    },
    {
      emoji: "📍", title: "다중 배달 주소 + 주문",
      desc: "user_addresses 테이블 + CRUD API\nCartBottomSheet 실주소 연동\n배달 메모 입력 + SelectedOption 타입",
    },
    {
      emoji: "🍽️", title: "메뉴 옵션 시스템",
      desc: "사장님: 옵션 그룹/옵션 CRUD UI\n고객: OptionSelectModal 바텀시트\n필수/선택·추가금액 실시간 합산",
    },
    {
      emoji: "✅", title: "주문 관리 실동작 완성",
      desc: "사장님 수락 시 ETA 선택 (10~60분)\nsetup-functions.sql (RPC 3개)\nuseStoreOrderStatusRealtime 추가",
    },
  ];

  day4.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: C.bluePale }, line: { color: "7DD3FC" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "7DD3FC" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: C.blue,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 7 — Day 5 작업 내역 (4/11~12) ──────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fill: { color: "FCE7F3" }, line: { color: "DB2777" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 11~12 (Day 5)", {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fontSize: 11, bold: true, color: "DB2777", align: "center",
  });

  slide.addText("🎁  쿠폰·PWA·주문상세·에러/로딩 페이지 완성", {
    x: 3.4, y: 0.22, w: 10.2, h: 0.55,
    fontSize: 19, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day5 = [
    {
      emoji: "🎟️", title: "쿠폰 시스템 전체",
      desc: "관리자·사장님·사용자 쿠폰 API\n고정할인·비율할인·무료배달 3종\nCartBottomSheet 할인 적용 연동",
    },
    {
      emoji: "📱", title: "PWA 앱 설치",
      desc: "manifest.json + 앱 아이콘 SVG\nAndroid beforeinstallprompt 배너\niOS Safari '홈 화면 추가' 안내",
    },
    {
      emoji: "📋", title: "주문 상세 페이지",
      desc: "/orders/[orderId] 신규 구현\n실시간 5단계 진행 스테퍼\n리뷰 모달 + 재주문 + 취소 버튼",
    },
    {
      emoji: "⚠️", title: "에러·로딩·404 페이지",
      desc: "app/not-found.tsx (404 브랜드)\napp/error.tsx (에러 바운더리)\napp/loading.tsx (스플래시 화면)",
    },
    {
      emoji: "🏠", title: "홈 화면 업그레이드",
      desc: "프로모션 배너 (가로 스크롤 3종)\n인기 가게 섹션 fetchTopStores\npick-bounce-dot CSS 애니메이션",
    },
    {
      emoji: "🔊", title: "사장님 소리 알림",
      desc: "Web Audio API 신규주문 알림음\nVolume 토글 버튼 (헤더 우측)\n파일 없이 브라우저 네이티브 생성",
    },
  ];

  day5.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: "FCE7F3" }, line: { color: "F9A8D4" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "F9A8D4" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: "DB2777",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 8 — Day 6 작업 내역 (4/12~13) ─────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fill: { color: "F0FDF4" }, line: { color: "16A34A" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 12~13 (Day 6)", {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fontSize: 11, bold: true, color: "16A34A", align: "center",
  });

  slide.addText("🔐  보안 강화 · DB 최적화 · 소셜 로그인 · 전문검색 완성", {
    x: 3.4, y: 0.22, w: 10.2, h: 0.55,
    fontSize: 18, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day6 = [
    {
      emoji: "🛡️", title: "운영 RLS 전환",
      desc: "14개 테이블 dev_allow_all → 운영 정책\nauth_user_id / auth_user_role 헬퍼 함수\n역할별 SELECT·INSERT·UPDATE 세밀 제어",
    },
    {
      emoji: "⚡", title: "DB 인덱스 30개+ 추가",
      desc: "orders / notifications / stores / menus\nGIN 전문검색 인덱스 (menus.name)\n복합 인덱스로 쿼리 성능 대폭 개선",
    },
    {
      emoji: "🔍", title: "전문검색 업그레이드",
      desc: "search_stores RPC 함수 신규 생성\nwebsearch_to_tsquery 'simple' 딕셔너리\nts_rank 매칭 점수 기반 결과 정렬",
    },
    {
      emoji: "🟡", title: "카카오 소셜 로그인",
      desc: "/api/auth/callback OAuth 콜백 라우트\n신규 가입 시 users + wallets 자동 생성\n로그인·회원가입 페이지 버튼 추가",
    },
    {
      emoji: "📅", title: "주간 영업시간 표시",
      desc: "store_hours 7일 전체 조회·표시\n오늘 요일 퍼플 강조 + '오늘' 뱃지\n아코디언 UI (접기/펼치기)",
    },
    {
      emoji: "🔒", title: "미들웨어 + 비밀번호",
      desc: "Next.js Edge middleware RBAC\n비밀번호 찾기·재설정 페이지 신규\n검색 히스토리 + 리뷰 이미지 업로드",
    },
  ];

  day6.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: "F0FDF4" }, line: { color: "86EFAC" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "86EFAC" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: "16A34A",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 9 — Day 7 작업 내역 (4/13 최종) ───────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fill: { color: "F0FDFA" }, line: { color: "0D9488" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 13 (Day 7)", {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fontSize: 11, bold: true, color: "0D9488", align: "center",
  });

  slide.addText("🏁  Storage RLS · 관리자 FCM 푸시 · Phase 1~3 완전 완성", {
    x: 3.4, y: 0.22, w: 10.2, h: 0.55,
    fontSize: 18, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day7 = [
    {
      emoji: "🪣", title: "Storage RLS 수정",
      desc: "버킷명 pick-pick-images → pick-pick-image 수정\n4개 운영 정책 신규 생성\n(공개 SELECT / 인증 INSERT·UPDATE·DELETE)",
    },
    {
      emoji: "📡", title: "관리자 FCM 일괄 발송 API",
      desc: "POST /api/admin/push 신규 API\n역할별 필터 (전체·사용자·사장님·라이더)\n500개 청크 멀티캐스트 발송",
    },
    {
      emoji: "🔔", title: "관리자 대시보드 5번째 탭",
      desc: "PushTab 컴포넌트 (Bell 아이콘)\n제목·내용·URL·역할 선택 UI\n발송 결과 카드 (전송 기기수 표시)",
    },
    {
      emoji: "🏆", title: "미착수 기능 0개 달성",
      desc: "Phase 1~3 전체 완성\n총 55개+ 기능 구현 완료\nPi Network 연동만 남은 상태",
    },
    {
      emoji: "📊", title: "관리자 대시보드 5탭 완성",
      desc: "통계 · 회원 · 가게 · 쿠폰 · FCM 푸시\nPICK 지급 + 가게 승인 + 쿠폰 CRUD\n플랫폼 전체 운영 가능 상태",
    },
    {
      emoji: "🚀", title: "서비스 런칭 준비 완료",
      desc: "46개 커밋 / API 라우트 57개\nDay 1~7 총 7일 개발\n배달앱 기본 기능 100% 완성",
    },
  ];

  day7.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.47;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.15,
      fill: { color: "F0FDFA" }, line: { color: "5EEAD4" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "5EEAD4" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.14, h: 0.4,
      fontSize: 12, bold: true, color: "0D9488",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.8, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 10 — 완료된 기능 전체 목록 (4/13 기준) ───
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addText("✅  완료된 기능 전체 목록 (4/13 최종)", {
    x: 0.4, y: 0.25, w: 13.2, h: 0.65,
    fontSize: 24, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.88, w: 4.2, h: 0.05,
    fill: { color: C.green }, line: { color: C.green },
  });

  const categories = [
    {
      title: "🔐 인증 / 사용자 관리",
      color: C.purple, pale: C.purplePale,
      items: [
        "이메일 로그인/회원가입 + 지갑 자동생성",
        "카카오 소셜 로그인 + OAuth 콜백",
        "RBAC 미들웨어 (user/owner/rider/admin)",
        "비밀번호 찾기·재설정 + 검색 히스토리",
        "프로필 수정 + 다중 배달 주소 + 레퍼럴",
      ],
    },
    {
      title: "🏠 사용자 탭 (4개) + UX",
      color: C.blue, pale: C.bluePale,
      items: [
        "홈: 카테고리·검색(GIN)·인기가게·광고",
        "지갑: 실잔액 + 충전 + PICK 보내기",
        "PICK주문: Realtime 추적 + 상세 + 재주문",
        "알림 드로어 + 딥링크 + 자동 트리거",
        "주간 영업시간 아코디언 + 실사 이미지",
      ],
    },
    {
      title: "🛒 가맹점 / 주문 플로우",
      color: C.green, pale: C.greenPale,
      items: [
        "가맹점 목록 (카테고리/전문검색 필터)",
        "가맹점 상세 + 메뉴 옵션 + 리뷰(이미지)",
        "쿠폰(3종) + PICK 할인 + 배달 메모",
        "PICK 결제 + 토스페이먼츠 카드 결제",
        "주문 생성 → PICK 차감 → 완료 적립",
      ],
    },
    {
      title: "👨‍🍳 사장님 기능",
      color: C.yellow, pale: "FFFBEB",
      items: [
        "가게 등록·설정·쿠폰 관리·주간 영업시간",
        "주문 관리: 수락 ETA + 거절 확인 팝업",
        "메뉴 옵션 그룹/옵션 CRUD UI",
        "매출 통계 대시보드 + 주간 차트",
        "신규 주문 소리 알림 (Web Audio API)",
      ],
    },
    {
      title: "🛵 라이더 / PWA / 인프라",
      color: "0891B2", pale: "ECFEFF",
      items: [
        "배달 수락 → PICK 자동 지급 + 위치 공유",
        "수익 내역 실DB + 주간/월간 차트",
        "FCM 푸시 알림 + 관리자 일괄 발송",
        "PWA 오프라인 캐싱 (Serwist)",
        "Sentry 모니터링 + 가맹점 광고 시스템",
      ],
    },
    {
      title: "🛡️ DB / 보안 / 관리자",
      color: C.orange, pale: C.orangePale,
      items: [
        "DB 인덱스 30개+ (GIN 전문검색 포함)",
        "운영 RLS 정책 + Storage 버킷 정책",
        "관리자 5탭: 통계·회원·가게·쿠폰·FCM 푸시",
        "404·에러·로딩·스플래시 페이지",
        "다크모드 + Tailwind dark: 클래스 전면 적용",
      ],
    },
  ];

  categories.forEach((cat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 2);
    const x = 0.35 + col * 4.45;
    const y = 1.05 + row * 2.85;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.2, h: 2.65,
      fill: { color: cat.pale }, line: { color: cat.color },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.15, y: y + 0.12, w: 3.9, h: 0.42,
      fill: { color: cat.color }, line: { color: cat.color },
      rectRadius: 0.08,
    });
    slide.addText(cat.title, {
      x: x + 0.15, y: y + 0.12, w: 3.9, h: 0.42,
      fontSize: 12, bold: true, color: C.white, align: "center",
    });
    cat.items.forEach((item, j) => {
      slide.addText(`✓  ${item}`, {
        x: x + 0.22, y: y + 0.65 + j * 0.39, w: 3.76, h: 0.37,
        fontSize: 10.5, color: C.textDark,
      });
    });
  });
}

// ── 슬라이드 8 — 남은 작업 & 다음 단계 ──────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addText("🚀  Phase 1~3 완성 · 다음 단계 로드맵", {
    x: 0.4, y: 0.25, w: 13.2, h: 0.65,
    fontSize: 26, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.88, w: 4.0, h: 0.05,
    fill: { color: C.green }, line: { color: C.green },
  });

  // Phase 1 완료 배너
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 1.0, w: 13.2, h: 0.6,
    fill: { color: C.greenPale }, line: { color: C.green },
    rectRadius: 0.12,
  });
  slide.addText("🎉  Phase 1~3 완성! 55개+ 기능 구현 · 미착수 기능 0개 · Pi Network 연동만 남음", {
    x: 0.4, y: 1.0, w: 13.2, h: 0.6,
    fontSize: 14, bold: true, color: C.green, align: "center",
  });

  const todos = [
    {
      priority: "✅ Phase 1~3",
      pColor: C.green, pPale: C.greenPale,
      items: [
        { title: "인증 · 지갑 · 주문 플로우", desc: "이메일 + 카카오 소셜 로그인\nPICK 토큰 지갑 + 토스페이먼츠\nRealtime 주문 추적 완성" },
        { title: "사장님 · 라이더 · 관리자", desc: "사장님 주문/메뉴/정산/통계\n라이더 수락/위치공유/수익\n관리자 5탭 대시보드" },
        { title: "PWA · 보안 · DB 최적화", desc: "Serwist 오프라인 캐싱\nRLS + 인덱스 30개+ + FCM 푸시\nSentry + Storage 정책 완성" },
      ],
    },
    {
      priority: "🟡 런칭 준비",
      pColor: C.yellow, pPale: "FFFBEB",
      items: [
        { title: "Firebase 환경변수 설정", desc: "FIREBASE_ADMIN_SDK_JSON 주입\nVAPID 키 발급 및 설정\nFCM 실제 발송 테스트" },
        { title: "카카오 OAuth 키 설정", desc: "Supabase → Kakao provider 활성화\nRedirect URI 등록\n실계정 로그인 테스트" },
        { title: "샘플 데이터 투입", desc: "실 가맹점 + 메뉴 데이터 추가\n관리자 계정 role='admin' 설정\nVercel 프로덕션 배포 확인" },
      ],
    },
    {
      priority: "⏳ Phase 4",
      pColor: C.orange, pPale: C.orangePale,
      items: [
        { title: "Pi Network SDK 인증", desc: "Pi SDK 연동 (Mainnet 개방 후)\npi_uid / pi_username 필드 활성화\nPi 기반 로그인 플로우" },
        { title: "Pi 코인 결제 연동", desc: "Pi 결제 API 연동\nPICK ↔ Pi 토큰 전환\nPi 기반 정산 시스템" },
        { title: "Pi 생태계 확장", desc: "Pi 마이닝 연동 혜택\nPi 홀더 전용 할인 쿠폰\nPi Network 커뮤니티 마케팅" },
      ],
    },
  ];

  todos.forEach((group, gi) => {
    const y = 1.75 + gi * 2.0;

    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.4, y: y, w: 1.45, h: 0.42,
      fill: { color: group.pPale }, line: { color: group.pColor },
      rectRadius: 0.1,
    });
    slide.addText(group.priority, {
      x: 0.4, y: y, w: 1.45, h: 0.42,
      fontSize: 11, bold: true, color: group.pColor, align: "center",
    });

    group.items.forEach((item, ii) => {
      const x = 0.4 + ii * 4.6;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y: y + 0.5, w: 4.3, h: 1.4,
        fill: { color: C.white }, line: { color: C.borderPurple },
        rectRadius: 0.13,
      });
      slide.addShape(prs.ShapeType.roundRect, {
        x: x + 0.18, y: y + 0.63, w: 3.9, h: 0.36,
        fill: { color: group.pPale }, line: { color: group.pPale },
        rectRadius: 0.08,
      });
      slide.addText(item.title, {
        x: x + 0.18, y: y + 0.63, w: 3.9, h: 0.36,
        fontSize: 12, bold: true, color: group.pColor, align: "center",
      });
      slide.addText(item.desc, {
        x: x + 0.22, y: y + 1.06, w: 3.86, h: 0.76,
        fontSize: 10.5, color: C.textSub, wrap: true,
      });
    });
  });
}

// ── 슬라이드 9 — 전체 로드맵 ──────────────────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addText("🗺️  전체 개발 로드맵", {
    x: 0.4, y: 0.25, w: 13.2, h: 0.65,
    fontSize: 26, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.88, w: 2.8, h: 0.05,
    fill: { color: C.purpleLight }, line: { color: C.purpleLight },
  });

  const phases = [
    {
      phase: "Phase 1",
      label: "MVP",
      period: "완료",
      color: C.purple, pale: C.purplePale,
      status: "완료 ✅",
      statusColor: C.green,
      items: [
        "✅ 로그인/회원가입 + 카카오 소셜 로그인",
        "✅ 홈 탭 + 전문검색(GIN) + 광고",
        "✅ 지갑·주문·리뷰(이미지)·레퍼럴·알림",
        "✅ 사장님 / 라이더 / 관리자 전체",
        "✅ 쿠폰 (3종) + 토스페이먼츠 카드결제",
        "✅ RBAC 미들웨어 + 운영 RLS",
        "✅ DB 인덱스 30개+ 최적화",
        "✅ FCM 푸시 알림 + 관리자 일괄 발송",
      ],
    },
    {
      phase: "Phase 2",
      label: "완성도",
      period: "완료 🎉",
      color: C.blue, pale: C.bluePale,
      status: "완료 ✅",
      statusColor: C.green,
      items: [
        "✅ 다크모드 (Tailwind dark: 전면 적용)",
        "✅ 다중 배달 주소 + 카카오 주소검색",
        "✅ PICK 등급 적립 배율 적용",
        "✅ 가맹점 광고·노출 시스템",
        "✅ 주간 영업시간 표시 + 실사 이미지",
        "✅ FCM 푸시 알림 완성",
      ],
    },
    {
      phase: "Phase 3",
      label: "성장",
      period: "완료 🎉",
      color: C.green, pale: C.greenPale,
      status: "완료 ✅",
      statusColor: C.green,
      items: [
        "✅ 토스페이먼츠 카드·간편결제",
        "✅ PWA 오프라인 (Serwist 캐싱)",
        "✅ 가맹점 광고 시스템",
        "✅ Sentry 모니터링 설정",
        "✅ 카카오 소셜 로그인",
        "✅ 전문검색 GIN + RPC 함수",
      ],
    },
    {
      phase: "Phase 4",
      label: "Pi 연동",
      period: "Mainnet 후",
      color: C.orange, pale: C.orangePale,
      status: "대기",
      statusColor: C.textSub,
      items: [
        "⏳ Pi Network SDK 인증",
        "⏳ Pi 코인 결제 연동",
        "⏳ PICK ↔ Pi 토큰 전환",
        "⏳ Pi 기반 정산 시스템",
      ],
    },
  ];

  phases.forEach((ph, i) => {
    const x = 0.3 + i * 3.45;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y: 1.0, w: 3.2, h: 5.45,
      fill: { color: ph.pale }, line: { color: ph.color },
      rectRadius: 0.18,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.15, y: 1.12, w: 2.9, h: 0.9,
      fill: { color: ph.color }, line: { color: ph.color },
      rectRadius: 0.12,
    });
    slide.addText(ph.phase, {
      x: x + 0.15, y: 1.12, w: 2.9, h: 0.44,
      fontSize: 13, bold: true, color: C.white, align: "center",
    });
    slide.addText(`${ph.label}  |  ${ph.period}`, {
      x: x + 0.15, y: 1.55, w: 2.9, h: 0.38,
      fontSize: 10, color: "DDD6FE", align: "center",
    });

    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.6, y: 2.12, w: 2.0, h: 0.35,
      fill: { color: i < 3 ? C.greenPale : "F3F4F6" },
      line: { color: i < 3 ? C.green : ph.color },
      rectRadius: 0.1,
    });
    slide.addText(ph.status, {
      x: x + 0.6, y: 2.12, w: 2.0, h: 0.35,
      fontSize: 10, bold: true, color: i < 3 ? C.green : C.textSub,
      align: "center",
    });

    ph.items.forEach((item, j) => {
      slide.addText(item, {
        x: x + 0.18, y: 2.6 + j * 0.52, w: 2.85, h: 0.46,
        fontSize: 10.5, color: C.textDark,
      });
    });
  });
}

// ── 저장 ───────────────────────────────────────────
const outPath = "./PICKPICK_프로젝트현황.pptx";
await prs.writeFile({ fileName: outPath });
console.log(`✅ PPT 생성 완료: ${outPath}`);
