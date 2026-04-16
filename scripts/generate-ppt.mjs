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

  slide.addText("2026년 4월 16일  |  레퍼럴 재설계 · 리뷰보상 연동 · 라이더 5km 필터 · 자동오프라인 Cron", {
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

  slide.addText("📊  PICK PICK 진행 현황 (4/16 최신)", {
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
    { label: "지갑 탭 재디자인 + Pi UI + 출석 Tap-to-Earn", pct: 100, color: C.green },
    { label: "사장님 사진리뷰보상 + 쿠폰 KRW 입력 설정",    pct: 100, color: C.green },
    { label: "친구 초대 리워드 역할별 배치 (사용자·사장님·라이더)", pct: 100, color: C.green },
    { label: "레퍼럴 재설계: 초대자 5K 고정 · 역할별 웰컴 보너스",  pct: 100, color: C.green },
    { label: "라이더 5km 반경 필터링 + 10분 자동오프라인 Cron",      pct: 100, color: C.green },
  ];

  progressItems.forEach((item, i) => {
    const y = 1.0 + i * 0.32;
    const barW = 5.5;

    slide.addText(item.label, {
      x: 0.5, y: y + 0.04, w: 4.2, h: 0.26,
      fontSize: 10, color: C.textDark,
    });

    slide.addShape(prs.ShapeType.rect, {
      x: 4.85, y: y + 0.1, w: barW, h: 0.13,
      fill: { color: "E5E7EB" }, line: { color: "E5E7EB" },
    });
    if (item.pct > 0) {
      slide.addShape(prs.ShapeType.rect, {
        x: 4.85, y: y + 0.1, w: barW * item.pct / 100, h: 0.13,
        fill: { color: item.color }, line: { color: item.color },
      });
    }

    slide.addText(`${item.pct}%`, {
      x: 10.5, y: y + 0.04, w: 0.7, h: 0.26,
      fontSize: 10, bold: true, color: item.color, align: "right",
    });
  });

  // 우측 요약 박스
  const summary = [
    { icon: "✅", label: "완료 기능",  value: "60개+", color: C.green,  pale: C.greenPale },
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: C.purple,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: C.green,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: C.yellow,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: C.blue,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "DB2777",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "16A34A",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 9 — Day 8 작업 내역 (4/14 최종) ───────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fill: { color: "F0FDFA" }, line: { color: "0D9488" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 14 (Day 8)", {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fontSize: 11, bold: true, color: "0D9488", align: "center",
  });

  slide.addText("🔐  카카오 로그인 설정 · KOE205 원인 분석 · 이메일 로그인 단독 운영 확정", {
    x: 3.4, y: 0.22, w: 10.2, h: 0.55,
    fontSize: 18, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day7 = [
    {
      emoji: "🔐", title: "카카오 소셜 로그인 설정 시도",
      desc: "Supabase Kakao Provider 설정\nREST API 키 + Client Secret 입력\nRedirect URI 등록 (플랫폼 키 페이지)",
    },
    {
      emoji: "❌", title: "KOE205 에러 원인 분석",
      desc: "account_email 스코프 요청 거부\nSupabase가 내부적으로 이메일 요청\n비즈니스 인증 없이 이메일 스코프 불가",
    },
    {
      emoji: "🔍", title: "해결책 탐색",
      desc: "scopes 옵션 수정 시도 (효과 없음)\nAllow users without email 토글 ON\nSupabase 하드코딩 scope 문제 확인",
    },
    {
      emoji: "✅", title: "카카오 로그인 제거 결정",
      desc: "비즈니스 인증 후 재추가 예정\n로그인 페이지 카카오 버튼 제거\n이메일/비밀번호 로그인만 운영",
    },
    {
      emoji: "🗺️", title: "카카오맵은 정상 유지",
      desc: "지도 SDK (JS Key) 정상 작동\n주소 검색 Daum Postcode 정상\n소셜 로그인만 제거, 지도 무관",
    },
    {
      emoji: "🚀", title: "다음 단계: Vercel 배포",
      desc: "이메일 로그인 단독 운영 확정\n샘플 데이터 추가 후 배포 예정\n카카오 비즈니스 인증 별도 진행",
    },
  ];

  day7.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "0D9488",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 10 — Day 9 작업 내역 (4/14 추가) ──────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fill: { color: C.orangePale }, line: { color: C.orange },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 14 (Day 9)", {
    x: 0.4, y: 0.18, w: 2.8, h: 0.55,
    fontSize: 11, bold: true, color: C.orange, align: "center",
  });

  slide.addText("🔔  알림음 TTS 완성 · 라이더 실시간 알림 · 주문 플로우 개선", {
    x: 3.4, y: 0.22, w: 10.2, h: 0.55,
    fontSize: 19, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day9 = [
    {
      emoji: "🔔", title: "사장님 알림음 완성",
      desc: "HTMLAudioElement 사전 렌더링 방식\nTTS '픽픽 주문이 들어왔습니다'\n3초 반복 · 수락 시 자동 중단",
    },
    {
      emoji: "🛵", title: "라이더 알림음 + Realtime",
      desc: "TTS '픽픽 라이더 요청이 왔습니다'\nSupabase Realtime orders.status=ready\n수락 시 알림 자동 중단",
    },
    {
      emoji: "👨‍🍳", title: "조리 중 라이더 호출 분리",
      desc: "조리 중 '라이더 호출' 버튼 독립\n조리 전 미리 라이더 출발 가능\n'조리 완료' 버튼 병행 유지",
    },
    {
      emoji: "✅", title: "PICK 주문 즉시 confirmed",
      desc: "PICK 결제 시 pending 대신 confirmed\nconfirmed_at 자동 기록\n'결제 확인 중' 대기 없이 즉시 수락",
    },
    {
      emoji: "🔧", title: "FK 모호성 버그 수정",
      desc: "PGRST201 오류 (orders→users FK 2개)\nusers!orders_user_id_fkey 힌트 적용\n통계·주문·라이더 API 4곳 수정",
    },
    {
      emoji: "🏷️", title: "메뉴 카테고리 정리",
      desc: "업종 중복 항목 제거 (치킨·피자 등)\n메뉴 섹션 전용 7개로 정리\n메인·사이드·음료·세트·디저트·스낵·기타",
    },
  ];

  day9.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.35;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.15,
      fill: { color: C.orangePale }, line: { color: "FDBA74" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "FDBA74" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: C.orange,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.75, w: 3.65, h: 1.25,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 11 — Day 10 작업 내역 (4/15~16) ──────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fill: { color: C.purplePale }, line: { color: C.purple },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 16 (Day 10)", {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fontSize: 11, bold: true, color: C.purple, align: "center",
  });

  slide.addText("💜  지갑 재디자인 · Tap-to-Earn · 사장님 자체 리워드 설정", {
    x: 3.5, y: 0.22, w: 10.1, h: 0.55,
    fontSize: 19, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day10 = [
    {
      emoji: "💜", title: "지갑 탭 전면 재디자인",
      desc: "퍼플 브랜드 테마 통일\nPi 잔액 UI (디자인 선설계)\nPICK↔Pi 교환 카드 (1π=300P)\n100억 PICK 발행 · 1PICK=₩1 정보",
    },
    {
      emoji: "📅", title: "출석 Tap-to-Earn",
      desc: "매일 출석 → 50 PICK 자동 지급\ndaily_checkins 테이블 + API\n연속 streak 카운터 + 진행 바\n중복 체크인 방지 (DB UNIQUE)",
    },
    {
      emoji: "🎁", title: "친구 초대 리워드 재배치",
      desc: "사용자 MyPick: 5,000 PICK 지급\n사장님 대시보드: 20,000 PICK\n라이더 내정보: 10,000 PICK\n지갑탭에서 제거 → 역할별 분산",
    },
    {
      emoji: "📸", title: "사진 리뷰 보상 설정",
      desc: "원화 입력 → PICK 자동환산\n₩300 / ₩500 / ₩1,000 단계 버튼\nPICK 시세 변동 시 원화가치 유지\nstores.photo_review_reward_krw DB",
    },
    {
      emoji: "🎟️", title: "쿠폰 KRW 입력 방식",
      desc: "fixed_pick 쿠폰: 원화 → PICK 환산\n₩500 입력 → 500P 자동 표시\n시세 변동 안내 문구 포함\n가맹점 PICK 잔액 차감 구조",
    },
    {
      emoji: "🗑️", title: "가게설정 UI 정리",
      desc: "PICK 적립률 설정 섹션 제거\n사장님 직접 조율 불필요 항목\n픽업대기 라이더 배정 상태 표시\n주문 상태 메시지 조건부 분기",
    },
  ];

  day10.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: C.purplePale }, line: { color: "C4B5FD" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "C4B5FD" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: C.purple,
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 12 — Day 11 작업 내역 (4/16 추가) ─────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fill: { color: "FDF2F8" }, line: { color: "BE185D" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 16 (Day 11)", {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fontSize: 11, bold: true, color: "BE185D", align: "center",
  });

  slide.addText("🔗  레퍼럴 재설계 · 리뷰보상 연동 · 라이더 위치 필터 · 자동오프라인", {
    x: 3.5, y: 0.22, w: 10.1, h: 0.55,
    fontSize: 18, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day11 = [
    {
      emoji: "🔗", title: "레퍼럴 시스템 재설계",
      desc: "초대자: 역할 무관 5,000 PICK 고정\n신규 가입자: 역할별 웰컴 보너스\n  사용자 5K · 사장님 20K · 라이더 10K\n회원가입 시 자동 지급 (서버사이드)",
    },
    {
      emoji: "👥", title: "MyPICK 초대 3버튼",
      desc: "일반 초대 / 사장님 초대 / 라이더 초대\n역할별 링크 (?ref=CODE&role=XXX)\n'상대방 +X,000 P' 라벨 + 복사 피드백\n사장님·라이더 대시보드도 자체 버튼",
    },
    {
      emoji: "📸", title: "리뷰 보상 가게설정 연동",
      desc: "하드코딩 10 PICK → 가게 설정값 연동\nphoto_review_reward_krw 필드 활용\n사진 첨부 시에만 보상 지급\n보상 0인 가게는 알림 미표시",
    },
    {
      emoji: "📍", title: "라이더 5km 반경 필터",
      desc: "Haversine 공식으로 거리 계산\n가게 기준 5km 이내 주문만 노출\n거리순 정렬 (가까운 주문 상단)\n조리완료 알림도 5km 라이더만 수신",
    },
    {
      emoji: "⏰", title: "라이더 자동오프라인 Cron",
      desc: "10분간 위치 미업데이트 → 자동 오프라인\nVercel Cron 매 5분 실행\nrider_locations.updated_at 기준 판별\n오프라인 전환 시 라이더에게 알림 발송",
    },
    {
      emoji: "✅", title: "사장님/라이더 타 가게 주문",
      desc: "사장님·라이더도 타 가게 주문 가능\n역할 제한 없음 (user/owner/rider 모두)\nAPI 주문 생성에 역할 제약 없음\n실제 사용 시나리오 검증 완료",
    },
  ];

  day11.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "FDF2F8" }, line: { color: "F9A8D4" },
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
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "BE185D",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 13 — 완료된 기능 전체 목록 (4/16 기준) ───
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addText("✅  완료된 기능 전체 목록 (4/16 최신)", {
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
        "카카오 소셜 로그인 (비즈니스 인증 후 재추가)",
        "RBAC 미들웨어 (user/owner/rider/admin)",
        "비밀번호 찾기·재설정 + 검색 히스토리",
        "프로필 수정 + 다중 배달 주소 + 레퍼럴 재설계",
      ],
    },
    {
      title: "🏠 사용자 탭 (4개) + UX",
      color: C.blue, pale: C.bluePale,
      items: [
        "홈: 카테고리·검색(GIN)·인기가게·광고",
        "지갑: 퍼플 재디자인 + Pi UI + 출석 Tap-to-Earn",
        "PICK주문: Realtime 추적 + 상세 + 재주문",
        "알림 드로어 + 딥링크 + 자동 트리거",
        "MyPICK 초대 3버튼 (사용자·사장님·라이더)",
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
        "가게 등록·설정·쿠폰(KRW 입력)·영업시간",
        "사진 리뷰 보상 설정 연동 (photo_review_reward_krw)",
        "주문 관리: 수락 ETA + 거절 확인 팝업",
        "매출 통계 대시보드 + 주간 차트",
        "신규주문 TTS 알림 '픽픽 주문이 들어왔습니다'",
        "신규 가맹점 초대 리워드 20,000 PICK",
      ],
    },
    {
      title: "🛵 라이더 / PWA / 인프라",
      color: "0891B2", pale: "ECFEFF",
      items: [
        "배달 수락 → PICK 자동 지급 + 위치 공유",
        "라이더 5km 반경 필터링 + 거리순 정렬",
        "10분 자동오프라인 Cron (매 5분 실행)",
        "FCM 푸시 알림 + 관리자 일괄 발송",
        "PWA 오프라인 캐싱 (Serwist) + Sentry 모니터링",
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
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.05 + row * 2.85;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.65,
      fill: { color: cat.pale }, line: { color: cat.color },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.12, y: y + 0.12, w: 3.86, h: 0.42,
      fill: { color: cat.color }, line: { color: cat.color },
      rectRadius: 0.08,
    });
    slide.addText(cat.title, {
      x: x + 0.12, y: y + 0.12, w: 3.86, h: 0.42,
      fontSize: 12, bold: true, color: C.white, align: "center",
    });
    cat.items.forEach((item, j) => {
      slide.addText(`✓  ${item}`, {
        x: x + 0.18, y: y + 0.65 + j * 0.38, w: 3.72, h: 0.37,
        fontSize: 10, color: C.textDark,
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
        { title: "인증 · 지갑 · 주문 플로우", desc: "이메일 로그인 (카카오 비즈니스 후 추가)\nPICK 토큰 지갑 + 토스페이먼츠\nRealtime 주문 추적 완성" },
        { title: "사장님 · 라이더 · 관리자", desc: "사장님 주문/메뉴/정산/통계\n라이더 수락/위치공유/수익\n관리자 5탭 대시보드" },
        { title: "PWA · 보안 · DB 최적화", desc: "Serwist 오프라인 캐싱\nRLS + 인덱스 30개+ + FCM 푸시\nSentry + Storage 정책 완성" },
      ],
    },
    {
      priority: "🟡 런칭 준비",
      pColor: C.yellow, pPale: "FFFBEB",
      items: [
        { title: "Firebase 환경변수 ✅", desc: "API Key ~ App ID 완성\nVAPID 키 완성\nAdmin SDK JSON 완성" },
        { title: "카카오 API 키 확인", desc: "앱 키 → JavaScript 키 재확인\nNEXT_PUBLIC_KAKAO_MAP_KEY 검증\nKakao Map 지도 표시 테스트" },
        { title: "샘플 데이터 + 배포", desc: "실 가맹점 + 메뉴 데이터 추가\n관리자 계정 role='admin' 설정\nVercel 프로덕션 배포 확인" },
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
      const x = 0.25 + ii * 4.27;

      slide.addShape(prs.ShapeType.roundRect, {
        x, y: y + 0.5, w: 4.1, h: 1.4,
        fill: { color: C.white }, line: { color: C.borderPurple },
        rectRadius: 0.13,
      });
      slide.addShape(prs.ShapeType.roundRect, {
        x: x + 0.15, y: y + 0.63, w: 3.8, h: 0.36,
        fill: { color: group.pPale }, line: { color: group.pPale },
        rectRadius: 0.08,
      });
      slide.addText(item.title, {
        x: x + 0.15, y: y + 0.63, w: 3.8, h: 0.36,
        fontSize: 12, bold: true, color: group.pColor, align: "center",
      });
      slide.addText(item.desc, {
        x: x + 0.18, y: y + 1.06, w: 3.74, h: 0.76,
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
        "✅ 로그인/회원가입 (이메일 단독 · 카카오 추후)",
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
        "⏳ 카카오 소셜 로그인 (비즈니스 인증 후)",
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
    const x = 0.2 + i * 3.23;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y: 1.0, w: 3.0, h: 5.45,
      fill: { color: ph.pale }, line: { color: ph.color },
      rectRadius: 0.18,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.12, y: 1.12, w: 2.76, h: 0.9,
      fill: { color: ph.color }, line: { color: ph.color },
      rectRadius: 0.12,
    });
    slide.addText(ph.phase, {
      x: x + 0.12, y: 1.12, w: 2.76, h: 0.44,
      fontSize: 13, bold: true, color: C.white, align: "center",
    });
    slide.addText(`${ph.label}  |  ${ph.period}`, {
      x: x + 0.15, y: 1.55, w: 2.9, h: 0.38,
      fontSize: 10, color: "DDD6FE", align: "center",
    });

    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.5, y: 2.12, w: 2.0, h: 0.35,
      fill: { color: i < 3 ? C.greenPale : "F3F4F6" },
      line: { color: i < 3 ? C.green : ph.color },
      rectRadius: 0.1,
    });
    slide.addText(ph.status, {
      x: x + 0.5, y: 2.12, w: 2.0, h: 0.35,
      fontSize: 10, bold: true, color: i < 3 ? C.green : C.textSub,
      align: "center",
    });

    ph.items.forEach((item, j) => {
      slide.addText(item, {
        x: x + 0.15, y: 2.6 + j * 0.48, w: 2.7, h: 0.44,
        fontSize: 10, color: C.textDark,
      });
    });
  });
}

// ── 저장 ───────────────────────────────────────────
const outPath = "./PICKPICK_프로젝트현황.pptx";
await prs.writeFile({ fileName: outPath });
console.log(`✅ PPT 생성 완료: ${outPath}`);
