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

  slide.addText("2026년 7월 3일  |  서류 인증 · 3상태 심사 · 거리별 배달비 · 관리자 UX 강화", {
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

  slide.addText("📊  PICK PICK 진행 현황 (8/4 최신)", {
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
    { label: "주문 취소 즉시 반영 · calling_rider 상태 흐름 재설계",  pct: 100, color: C.green },
    { label: "주문 pending 흐름 · 라이더 heartbeat · Pi Network 플랜", pct: 100, color: C.green },
    { label: "다중 가게 통합 조회 · 안드로이드 알람 Web Audio 선예약", pct: 100, color: C.green },
    { label: "Pi SDK 통합 · 개발자 체크리스트 10/10 · Ecosystem Listing 신청", pct: 100, color: C.green },
    { label: "초대 코드 레퍼럴 플로우 재설계 + 카카오 레퍼럴 버그 수정",      pct: 100, color: C.green },
    { label: "DB 관리형 프로모션 배너 시스템",                               pct: 100, color: C.green },
    { label: "Pi 로그인 UX 개선 + 환경 감지 + FCM 알림 팝업 개선",           pct: 100, color: C.green },
    { label: "레퍼럴 역할별 보상 + 5명 한도 + 조건부 지급 시스템",            pct: 100, color: C.green },
    { label: "서류 인증 시스템 (가게·라이더) + 3상태 승인 (null/true/false)",    pct: 100, color: C.green },
    { label: "거리별 배달비 구역 (delivery_zones) + Haversine 거리 계산",        pct: 100, color: C.green },
    { label: "관리자 서류 이미지 뷰어 (dialog top-layer) + 라이더 배달 차단",     pct: 100, color: C.green },
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
    { icon: "✅", label: "완료 기능",  value: "90개+", color: C.green,  pale: C.greenPale },
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

// ── 슬라이드 13 — Day 12 작업 내역 (4/17) ─────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fill: { color: "F0FDFA" }, line: { color: "0D9488" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 17 (Day 12)", {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fontSize: 11, bold: true, color: "0D9488", align: "center",
  });

  slide.addText("🔧  주문 취소 즉시 반영 · calling_rider 상태 흐름 재설계 · RLS 정책 추가", {
    x: 3.5, y: 0.22, w: 10.1, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day12 = [
    {
      emoji: "🚫", title: "주문현황보기 홈이동 버그 수정",
      desc: "clearLastOrder() onClick 제거\n취소 클릭 시 useEffect(!lastOrder)\n→ /home 강제 이동 원인 차단\n주문 현황 페이지 정상 이동",
    },
    {
      emoji: "🔔", title: "취소 감지 즉시 반영",
      desc: "사장님·라이더 대시보드\nPolling 10s → 5s 단축\n취소 주문 감지 즉시 알림 중단\nuseStoreOrderStatusRealtime 연동",
    },
    {
      emoji: "🔄", title: "calling_rider 상태 흐름 재설계",
      desc: "수락 API: 상태별 분기 처리\n  ready → picked_up 즉시 전환\n  calling_rider → 상태 유지\nrider_id만 배정, 조리완료 대기",
    },
    {
      emoji: "🛵", title: "라이더 배달 페이지 개선",
      desc: "calling_rider: '조리 대기' 레이블\nready: '픽업 대기' + 픽업완료 버튼\nactiveStatuses에 calling_rider·ready 추가\n조리완료 후 주문 사라짐 버그 수정",
    },
    {
      emoji: "🛡️", title: "Supabase RLS 정책 추가",
      desc: "라이더 미배정 주문 조회 권한\nriders_can_read_available_orders\nstatus IN (ready, calling_rider)\nAND rider_id IS NULL 조건 추가",
    },
    {
      emoji: "⚙️", title: "activeStatuses 전반 수정",
      desc: "owner API: calling_rider 누락 추가\nrider deliveries: ready 누락 추가\nrider dashboard: 취소 감지 폴링 개선\nprevOrderCountRef 초기화 버그 수정",
    },
  ];

  day12.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "F0FDFA" }, line: { color: "99F6E4" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "99F6E4" },
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
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 14 — Day 13 작업 내역 (4/20) ─────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fill: { color: "F0FDF4" }, line: { color: "16A34A" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 20 (Day 13)", {
    x: 0.4, y: 0.18, w: 2.9, h: 0.55,
    fontSize: 11, bold: true, color: "16A34A", align: "center",
  });

  slide.addText("🔧  주문 흐름 재설계 · 라이더 안정성 · Pi Network 연동 플랜 수립", {
    x: 3.5, y: 0.22, w: 10.1, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day13 = [
    {
      emoji: "⏳", title: "주문 pending 흐름 재설계",
      desc: "PICK 결제도 pending으로 시작\n사장님 수락 후 confirmed 전환\n유저 화면: '사장님 수락 대기' 표시\n사장님 stats API pending 감지",
    },
    {
      emoji: "🔔", title: "사장님 대시보드 알람 개선",
      desc: "신규주문 카운트 pending 기준 수정\n유저 취소 시 알람 즉시 중단\n취소 감지 3중 보호 구조\n(Realtime + 폴링 + pendingCount)",
    },
    {
      emoji: "🛵", title: "라이더 자동오프라인 방지",
      desc: "온라인 상태 시 8분마다 heartbeat\nGPS 좌표 자동 갱신\nCron 10분 기준 절대 미도달\n앱 닫으면 자동오프라인 유지",
    },
    {
      emoji: "📦", title: "조리완료 → 라이더 즉시 반영",
      desc: "active 탭 5초 폴링 추가\n사장님 조리완료 → 최대 5초 내\n라이더 화면 픽업 완료 버튼 출현\n배달 출발 버튼 라벨 수정",
    },
    {
      emoji: "🔄", title: "버튼 라벨 정확화",
      desc: "픽업 완료(파랑) ready→picked_up\n배달 출발(주황) picked_up→delivering\n배달 완료(초록) delivering→delivered\n직관적 흐름으로 개선",
    },
    {
      emoji: "🌐", title: "Pi Network 연동 마스터 플랜",
      desc: "Open Network 현황 조사 완료\nVercel 유지 + Pi SDK 추가 구조 확정\n5단계 로드맵 수립\nfeature/pi-integration 브랜치 전략",
    },
  ];

  day13.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
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
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 15 — Day 14 작업 내역 (4/20 추가) ──────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "EFF6FF" }, line: { color: "2563EB" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 20 (Day 14)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "2563EB", align: "center",
  });

  slide.addText("🔧  다중 가게 주문 통합 · 안드로이드 알람 안정화 · Vercel 정리", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day14 = [
    {
      emoji: "🏪", title: "사장님 다중 가게 버그 수정",
      desc: "limit(1) → 전체 가게 IN 쿼리\n모든 소유 가게 주문 통합 조회\nRealtime도 storeIds 배열 지원\n핸드폰 주문 사장님 화면 미표시 해결",
    },
    {
      emoji: "🔔", title: "안드로이드 알람 Web Audio 전환",
      desc: "HTMLAudioElement → AudioContext\nWeb Audio 선예약 방식 도입\n30초 분량 비프 미리 스케줄링\nJS 타이머 throttle 완전 우회",
    },
    {
      emoji: "🎵", title: "AudioContext 안정성 강화",
      desc: "suspended → resume() 자동 처리\nvisibilitychange로 포그라운드 복구\nOfflineAudioContext 미리 렌더링\nuser gesture 컨텍스트 유지",
    },
    {
      emoji: "🗂️", title: "Vercel 중복 프로젝트 정리",
      desc: "3개 중복 배포 → 1개로 통합\npickpick-delivery 삭제\npickpick-business 삭제\npick-pick-delivery 단일 운영",
    },
    {
      emoji: "💡", title: "Pi Network PICK 토큰 전략",
      desc: "현재: DB 포인트로 카운팅\n파이 메인넷 오픈 후 실 토큰 전환\nTGE 에어드랍 방식 확정\n기존 사용자 소급 적용 가능",
    },
    {
      emoji: "🔄", title: "Realtime 훅 배열 지원",
      desc: "useStoreOrderRealtime 개선\nstring | string[] 타입 지원\nstoreIds 배열로 멀티 가게 감지\nINSERT/UPDATE 이벤트 모두 적용",
    },
  ];

  day14.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "EFF6FF" }, line: { color: "93C5FD" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "93C5FD" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "2563EB",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 16 — Day 15 작업 내역 (4/22) ───────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "F0FDF4" }, line: { color: "16A34A" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 22 (Day 15)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "16A34A", align: "center",
  });

  slide.addText("π  Pi Network SDK 연동 · 개발자 체크리스트 10/10 완료", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day15 = [
    {
      emoji: "π", title: "Pi SDK 앱 통합",
      desc: "pi-sdk.js layout에 Script 로드\ntypes/pi.d.ts 타입 선언 추가\nPi.init() + Pi.authenticate() 구현\nusePiPayment 커스텀 훅 작성",
    },
    {
      emoji: "✅", title: "개발자 체크리스트 10/10",
      desc: "앱 등록 ~ Domain Validation 완료\nPiNet 서브도메인 (plckplck1042)\n테스트 결제 트랜잭션 완료\nCompleted Steps: 10 of 10 달성",
    },
    {
      emoji: "🔌", title: "Pi 결제 서버 API",
      desc: "POST /api/pi/approve 구현\nPOST /api/pi/complete 구현\nPI_API_KEY 환경변수 설정\nVercel Production 환경 적용",
    },
    {
      emoji: "🧪", title: "Pi 결제 테스트 페이지",
      desc: "/pi-test 전용 페이지 생성\n로그인 없이 결제 테스트 가능\n실시간 로그 화면 출력\n0.001π Testnet 결제 성공",
    },
    {
      emoji: "🎨", title: "Pi Ecosystem Listing 준비",
      desc: "/brand/intro (400×400 OG 이미지)\n/brand/preview (750×1500 프리뷰)\n/privacy 개인정보처리방침 페이지\n/terms 이용약관 페이지 생성",
    },
    {
      emoji: "📋", title: "Ecosystem Listing 신청",
      desc: "Privacy Policy URL 등록\nTerms of Service URL 등록\nApp Name · Subtitle · Category 입력\nApply for Unverified Listing 진행 중",
    },
  ];

  day15.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
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
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 17 — Day 16 작업 내역 (4/22) ───────────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: C.purplePale }, line: { color: C.purple },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 04. 22 (Day 16)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: C.purple, align: "center",
  });

  slide.addText("💱  Pi ↔ 달러 ↔ 원화 계산기 완성 · 실시간 환율 연동",  {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day16 = [
    {
      emoji: "🔧", title: "Pi 로그인 버그 수정",
      desc: "createSession → generateLink 교체\nGoTrueAdminApi TS 빌드 오류 해결\nverifyOtp(hashed_token) 세션 수립\nVercel 배포 차단 문제 해소",
    },
    {
      emoji: "🚫", title: "Pi 로그인 버튼 제거",
      desc: "Pi Browser UA 감지 불일치 문제\nPi Network 생태계 차단으로 동작 불가\n테스트넷 승인 후 재추가 예정\n로그인 페이지 이메일 전용으로 원복",
    },
    {
      emoji: "💱", title: "Pi ↔ 달러 ↔ 원화 계산기",
      desc: "달러 입력 → 원화 자동계산 (환율×)\n원화 입력 → 달러 자동계산 (환율÷)\n시세 변경 시 수량 섹션 즉시 재계산\nlocalStorage에 설정값 자동 저장",
    },
    {
      emoji: "📡", title: "실시간 환율 자동 조회",
      desc: "open.er-api.com (시간당 갱신)\n달러 환율 자동 적용 · 수동 수정 가능\n기준일 + 출처(실시간/CDN) 표시\nFallback: fawazahmed0 CDN",
    },
    {
      emoji: "🏦", title: "한국수출입은행 API 시도",
      desc: "공식 매매기준율 API 연동 시도\n해외(Vercel US) IP 차단으로 미작동\nKOREAEXIM_API_KEY 발급·설정 완료\n향후 국내 서버 이전 시 재적용 가능",
    },
    {
      emoji: "🎯", title: "계산기 UI 개선",
      desc: "1 π = $X = ₩Y 요약 뱃지 표시\n환율 설정 박스 자동완성 UI\n[실시간] 초록 / [CDN] 주황 구분\nPi 수량↔원화 양방향 변환 유지",
    },
  ];

  day16.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
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
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 18 — Day 17 작업 내역 (6/29) — Pi 로그인 UX · FCM · 출석 개선 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "F0FDFA" }, line: { color: "0D9488" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 06. 29 (Day 17)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "0D9488", align: "center",
  });

  slide.addText("🎨  Pi 로그인 UX · FCM 알림 개선 · 출석 UI · Pi 환경 감지", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day17 = [
    {
      emoji: "🚪", title: "로그아웃 버튼 복원",
      desc: "MyPICK 페이지 로그아웃 버튼 재추가\n공지사항·FAQ 아래 배치\nhandleSignOut 기존 함수 활용\n빨간 LogOut 아이콘 적용",
    },
    {
      emoji: "🔔", title: "FCM 알림 팝업 개선",
      desc: "Chrome: user gesture 없이 팝업 불가\n자동 requestPermission() 제거\n사장님(amber)·라이더(sky) 배너 추가\n'허용하기' 버튼 클릭 시 팝업 표시",
    },
    {
      emoji: "π", title: "Pi 환경 감지 개선",
      desc: "UA 'PiBrowser' 감지 → 자동 전환\n도메인 .pinet.com/.minepi.com 감지\n기본: 이메일 표시 (Pi 환경만 자동 전환)\nPi Desktop 지원 (도메인 기반)",
    },
    {
      emoji: "🛡️", title: "PiSdkLoader 개선",
      desc: "/login·/register 페이지 SDK 로드 건너뜀\n일반 Chrome window.Pi mock 오염 방지\nPiLogin이 직접 loadPiSdk() 호출\n로그인 후 정상 페이지에서만 SDK 로드",
    },
    {
      emoji: "📅", title: "출석 주차 표시 제거",
      desc: "'N번째 주 출석 현황' → '연속 출석 현황'\n'N번째 주·X일 연속' → 'X일 연속 🔥'\n매일 50 PICK · 7연속 달성 +100 PICK\n하루 미체크 시 다음날 1일차로 리셋",
    },
    {
      emoji: "🎨", title: "Pi 로그인 버튼 디자인 개선",
      desc: "카카오 버튼 위로 이동 (최상단)\n보라 그라데이션 풀버튼 (#4C1D95→#A855F7)\n이메일 로그인 버튼 파랑 (#1d4ed8→#38bdf8)\n세 버튼 색상 명확히 구분",
    },
  ];

  day17.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
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
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 19 — Day 18 작업 내역 (6/29) — 레퍼럴 보안 강화 ───────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "EEF2FF" }, line: { color: "4338CA" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 06. 29 (Day 18)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "4338CA", align: "center",
  });

  slide.addText("🔐  레퍼럴 보안 강화 · 역할별 보상 · 조건부 지급 시스템", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day18 = [
    {
      emoji: "💰", title: "역할별 레퍼럴 보상",
      desc: "user:  5,000 PICK (즉시 지급)\nowner: 20,000 PICK (조건부 대기)\nrider: 10,000 PICK (조건부 대기)\n초대자: 5,000 PICK 고정",
    },
    {
      emoji: "🔒", title: "초대자 5명 제한",
      desc: "완료된 보상 + pending 합산 카운트\n5명 초과 시 초대자 보상 없음\n피초대자는 여전히 보상 수령\n한도 초과 시 알림만 발송",
    },
    {
      emoji: "🔍", title: "부정 사용 시나리오 분석",
      desc: "단일계정 역할 사이클링 → 차단됨\n다계정 반복 (이메일 환경 위험)\n가짜 사장님 이탈 (PICK만 취득)\nPi 전용 전환 시 다계정 자연 차단",
    },
    {
      emoji: "💾", title: "pending_referral_rewards 테이블",
      desc: "조건 타입: owner_first_order / rider_first_delivery\ninvitee_amount + referrer_amount 저장\nfulfilled 플래그로 상태 관리\nunique index (미완료 1건 제한)",
    },
    {
      emoji: "⏳", title: "조건부 보상 지급 로직",
      desc: "owner: 가게 등록 + 첫 주문 delivered 시\nrider: 첫 배달 delivered 시\nalreadyUsed: wallet_txn + pending 모두 체크\n환경변수로 보상액 설정 가능",
    },
    {
      emoji: "⚡", title: "자동 지급 처리",
      desc: "orders status='delivered' 시 자동 체크\n사장님·라이더 pending 각각 조회\n첫 주문/배달 count=1 확인 후 지급\n피초대자 + 초대자 모두 알림 발송",
    },
  ];

  day18.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "EEF2FF" }, line: { color: "A5B4FC" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "A5B4FC" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "4338CA",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 20 — Day 19 작업 내역 (7/3) — 서류 인증 · 차량 유형 · 거리 배달비 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "FFF7ED" }, line: { color: "C2410C" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 03 (Day 19)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "C2410C", align: "center",
  });

  slide.addText("📋  서류 인증 · 차량 유형 확장 · 거리별 배달비 구역 시스템", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day19 = [
    {
      emoji: "📱", title: "주문 시 전화번호 필수 검증",
      desc: "주문 생성 전 phone 필드 필수 체크\n없으면 입력 유도 팝업 표시\n역할 전환 시 phone null 사이드이펙트 방지\nmy-pick 프로필 편집 연동",
    },
    {
      emoji: "🏪", title: "사업자등록증 업로드 필수화",
      desc: "가게 등록 폼 businessRegImageUrl 추가\nZod Required 유효성 강제\nSupabase pick-pick-image 버킷 업로드\n미제출 시 등록 API 차단",
    },
    {
      emoji: "🚴", title: "라이더 서류 제출 플로우",
      desc: "신분증·차량등록증·보험증명서 3종\n각 이미지 Storage 업로드\nrider_documents 테이블 저장\n미제출 시 배달 배정 차단",
    },
    {
      emoji: "🚗", title: "라이더 차량 유형 자동차 추가",
      desc: "motorcycle·scooter·bicycle에 car 추가\nDB ALTER TYPE enum 적용\nAPI·폼 ENUM 동기화\n기존 라이더 데이터 호환 유지",
    },
    {
      emoji: "🗺️", title: "거리별 배달비 구역 시스템",
      desc: "delivery_zones 테이블 신설\n반경 km 단위 구역 + 구역별 배달비\nHaversine 공식 거리 계산\n가게 상세 + 주문 API 연동",
    },
    {
      emoji: "🚫", title: "미승인 라이더 배달 차단",
      desc: "rider_is_approved NULL/false 체크\n/api/rider/accept API 레벨 차단\n라이더 레이아웃 심사중 배너 표시\n승인 후 정상 플로우 자동 복원",
    },
  ];

  day19.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "FFF7ED" }, line: { color: "FED7AA" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "FED7AA" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "C2410C",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 21 — Day 20 작업 내역 (7/3) — 3상태 심사 · 관리자 서류 UX ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "FFF1F2" }, line: { color: "BE123C" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 03 (Day 20)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "BE123C", align: "center",
  });

  slide.addText("🔐  3상태 승인 시스템 · 관리자 서류 심사 UI · 이미지 뷰어", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day20 = [
    {
      emoji: "✅", title: "가게 3상태 승인 시스템",
      desc: "null=심사중, true=승인, false=반려\n관리자 [승인] [반려] 버튼 쌍\nis_approved NULL 기본값 적용\n사장님에게 알림 자동 발송",
    },
    {
      emoji: "🏍️", title: "라이더 3상태 승인 시스템",
      desc: "rider_is_approved NULL/true/false\n신규 라이더 null 상태로 시작\n관리자 [승인] [반려] 처리\n미승인 시 배달 자동 차단",
    },
    {
      emoji: "🖼️", title: "관리자 서류 이미지 뷰어",
      desc: "<dialog> showModal() top-layer 방식\nz-index·overflow 충돌 없음\niOS PWA 뒤로가기 안전 유지\n화면 탭 or Esc로 닫기",
    },
    {
      emoji: "📊", title: "관리자 가게 심사 UI",
      desc: "사업자등록증 이미지 표시\n주소·카테고리·사장님 정보 표시\n[승인][반려] 버튼 + 반려 사유 입력\n심사 상태 배지 (심사중/승인/반려)",
    },
    {
      emoji: "📋", title: "관리자 라이더 심사 UI",
      desc: "신분증·차량등록증·보험증명서 뷰어\n라이더 기본 정보 + 차량 유형 표시\n[승인][반려] 버튼 쌍\n서류 이미지 탭 → 전체화면 확대",
    },
    {
      emoji: "🔒", title: "역할 기반 접근 제어 강화",
      desc: "미승인 가게 공개 노출 차단\n미승인 라이더 배달 배정 차단\n심사중 라이더 전용 레이아웃 배너\n승인 후 정상 플로우 자동 복원",
    },
  ];

  day20.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "FFF1F2" }, line: { color: "FCA5A5" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "FCA5A5" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "BE123C",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 22 — Day 21 작업 내역 (7/6) — 배달 설정 거리 연동 대개편 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "F0FDFA" }, line: { color: "0D9488" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 06 (Day 21)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "0F766E", align: "center",
  });

  slide.addText("🛵  배달 설정 대개편 — 배달비·서비스 반경·예상시간 거리 연동", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 16, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day21 = [
    {
      emoji: "🔔", title: "사장님·라이더 알람 안정화",
      desc: "AudioContext 재정지 문제 해결\n맑은 Web Audio 벨소리 복원\n대시보드 알람 pendingCount 연동\nRealtime 누락돼도 확실히 울림",
    },
    {
      emoji: "🧮", title: "배달비 미리보기 = 청구액 일치",
      desc: "resolveDeliveryFee 공용 헬퍼\n주문 API·미리보기 API 단일 소스\n장바구니 표시 = 실제 청구 배달비\n불일치(예 32,500→31,500) 차단",
    },
    {
      emoji: "📐", title: "거리 할증 배달비 모델",
      desc: "구역 테이블 → 기본구간+비례 할증\n초과 거리 정비례(10원 반올림)\n예) 기본5km/2000·2km당1000\n7km=3,000 · 10km=4,500원",
    },
    {
      emoji: "🎯", title: "서비스 반경 통합",
      desc: "노출 반경 = 배달 한계 일원화\n사장님 1~20km 단일 설정\n반경 내 노출 + 주문 가능\n반경 밖 자동 배달 불가",
    },
    {
      emoji: "⏱️", title: "예상 시간 거리 연동",
      desc: "조리 시간 + 거리×(km당 이동)\n5분 단위 반올림 자동 계산\n장바구니 '예상 도착 약 N분'\n거리별 시간 미리보기 제공",
    },
    {
      emoji: "🗄️", title: "DB 스키마 확장",
      desc: "stores 6개 컬럼 추가\ndelivery_base_km/surcharge_unit/fee\nprep_time_min/travel_per_km_min\ndelivery_zones 방식 폐지",
    },
  ];

  day21.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
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
      fontSize: 12, bold: true, color: "0F766E",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 23 — Day 22 작업 내역 (7/7) — 로그인 안내 · 초대 보상 수정 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "EEF2FF" }, line: { color: "4F46E5" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 07 (Day 22)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "4338CA", align: "center",
  });

  slide.addText("🔐  Pi 생태계 전용 로그인 안내 · 초대 보상 표시 수정", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day22 = [
    {
      emoji: "🔐", title: "Pi 전용 로그인 화면 안내",
      desc: "Pi 생태계 전용 서비스임을 명시\nPi Browser 로그인 = 정식 경로 강조\n카카오·이메일 → 점선 박스로 분리\n'🔧 개발자 검토·테스트용' 배지 부착\n심사·테스트 목적 안내로 오해 방지",
    },
    {
      emoji: "🎁", title: "초대 보상 표시 버그 수정",
      desc: "'내가 받은 보상' 계산 오류 수정\n(건수 × 50 → 실제 지급액 합산)\n지갑엔 5,000 정상 적립, 표시만 50P\nwallet_transactions 금액 그대로 집계\n대기 중(사장님·라이더) 초대도 실적 포함",
    },
  ];

  day22.forEach((item, i) => {
    const x = 2.36 + i * 4.5;
    const y = 1.7;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 3.5,
      fill: { color: "EEF2FF" }, line: { color: "C7D2FE" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.22, y: y + 0.26, w: 0.7, h: 0.7,
      fill: { color: C.white }, line: { color: "C7D2FE" },
      rectRadius: 0.12,
    });
    slide.addText(item.emoji, {
      x: x + 0.22, y: y + 0.24, w: 0.72, h: 0.72,
      fontSize: 22, align: "center",
    });
    slide.addText(item.title, {
      x: x + 1.06, y: y + 0.34, w: 2.8, h: 0.55,
      fontSize: 14, bold: true, color: "4338CA",
    });
    slide.addText(item.desc, {
      x: x + 0.28, y: y + 1.15, w: 3.55, h: 2.2,
      fontSize: 11, color: C.textDark, wrap: true, lineSpacingMultiple: 1.15,
    });
  });
}

// ── 슬라이드 24 — Day 23 작업 내역 (7/7) — 영업/운행 스위치 · 헤더 UX 대개편 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "ECFDF5" }, line: { color: "10B981" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 07 (Day 23)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "047857", align: "center",
  });

  slide.addText("🔔  알림 = '영업/운행 시작' 스위치 통합 · 사장님·라이더 헤더 UX 정리", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 16, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day23 = [
    {
      emoji: "🔔", title: "'영업/운행 시작' 스위치 통합",
      desc: "종·스피커 버튼의 정체 모호 문제 개선\n브라우저 정책상 필요한 알림 arm을\n'영업 시작'·'운행 시작' 행동에 녹임\n누르면 확인음 + 영업/운행 시작",
    },
    {
      emoji: "🔀", title: "사장님 영업 토글 일원화",
      desc: "대시보드 중복 '영업 시작' 버튼 제거\n상단 헤더 영업 토글 하나로 통일\n(is_open 오픈 + 알림을 함께 처리)\n'영업 중' 표기 중복 혼란 해소",
    },
    {
      emoji: "🏷️", title: "라이더 문구 통일",
      desc: "온라인/오프라인 → '운행 중/운행 시작'\n꺼진 상태 = 행동형 '시작' 라벨\n프로필 상태 배지도 동일하게 통일\n사장님 '영업 중'과 톤 일치",
    },
    {
      emoji: "🔕", title: "알림 꺼짐 감지 배너",
      desc: "영업/운행 중이나 이번 세션 알림 미활성 시\n헤더 아래 얇은 띠로 '알림 켜기' 안내\n탭하면 알림만 arm (영업상태 불변)\n상단바에서 분리 → 심플 유지",
    },
    {
      emoji: "♻️", title: "재진입 알림 오표시 수정",
      desc: "MyPICK 갔다와도 알림 다시 눌러야 하던\n오표시 제거. isOrderSoundArmed()로\n실제 오디오(컨텍스트) 상태 판별\n이미 켜져 있으면 배너 안 뜸",
    },
    {
      emoji: "🧭", title: "헤더 UX 심플화",
      desc: "타이틀 중앙 정렬 + 확대(text-xl)\n가게명·이름 서브텍스트 제거\n뒤로가기 → '‹ MyPICK' 라벨 버튼\n양옆 버튼 축소로 타이틀 강조",
    },
  ];

  day23.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "ECFDF5" }, line: { color: "6EE7B7" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "6EE7B7" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "047857",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 25 — Day 24 작업 내역 (7/22) — 데이터 클린업 · 어뷰징 방지 · 지표 정상화 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "F5F3FF" }, line: { color: "7C3AED" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 22 (Day 24)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "6D28D9", align: "center",
  });

  slide.addText("🧹  테스트넷 데이터 클린업 · 초대 어뷰징 방지 · 관리자 지표 정상화", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 16, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day24 = [
    {
      emoji: "🧹", title: "테스트넷 데이터 클린업",
      desc: "중복 관리자·비-Pi 테스트 계정 정리\n주인 없는 고아 시드 가게 삭제\n(Pi 유저·데모 카탈로그·본인 계정 보존)\n가맹점 37 → 21로 정상화",
    },
    {
      emoji: "🔗", title: "Pi 리셋 중복 계정 방지",
      desc: "테스트넷 리셋로 pi_uid 바뀌어도\n같은 pi_username 계정에 재연결\nPI_RELINK_BY_USERNAME(테스트넷 전용)\n로그인 이메일·비번 자동 갱신",
    },
    {
      emoji: "🛡️", title: "초대 어뷰징 방지",
      desc: "양방향(서로) 초대 차단 → 자기초대 파밍 방지\n초대코드 입력·출석부에 전환 안내 노출\n어뷰징 감사 SQL(pick-abuse-audit)\n파밍 클러스터 30,050 PICK 회수",
    },
    {
      emoji: "🗓️", title: "출석 활동 보너스",
      desc: "최근 7일 실주문 있으면 출석 +50\n순수 탭 파밍 50 / 실이용 유저 100\n진짜 이용 → 보상 연결\n지갑 UI에 보너스 표시",
    },
    {
      emoji: "📄", title: "PICK 전환 정책 문서화",
      desc: "테스트넷→메인넷 비율 전환 정책\n출처별 가중치(실주문1.0/초대0.5/출석0.2)\nKYC 게이트·어뷰징 제외·산정 공식\ndocs/pick-conversion-policy.md",
    },
    {
      emoji: "📊", title: "관리자 지표 정상화",
      desc: "PICK 유통량을 Pi 인증 유저만 집계\n(테스트 계정 대량 충전 왜곡 제거)\n454,230 → 실제 Pi 분배 ~15,750\n대시보드 라벨 'Pi 기준' 명시",
    },
  ];

  day24.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "F5F3FF" }, line: { color: "C4B5FD" },
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
      fontSize: 12, bold: true, color: "6D28D9",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 9.5, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 26 — Day 25 작업 내역 (7/23) — 라이더 UX 수정 · 보상 정책 보강 · FAQ 정리 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "FFF7ED" }, line: { color: "EA580C" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 07. 23 (Day 25)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "C2410C", align: "center",
  });

  slide.addText("🏍️  라이더 UX 수정 · 보상/전환 정책 보강 · FAQ 정리", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day25 = [
    {
      emoji: "🏍️", title: "라이더 '심사 대기' 배너 플래시 수정",
      desc: "승인된 라이더도 진입 시 '서류 심사 대기'\n배너가 잠깐 뜨던 문제(초기값 false).\nisApproved를 3-상태(null/true/false)로\n바꿔 조회 완료 후에만 표시.",
    },
    {
      emoji: "🛡️", title: "전환 정책·감사 보강",
      desc: "라이더 배달 수익 가중치(1.0) 명시\n'잔액 아닌 출처' 원칙 + 전송받은 PICK 제외\n자기거래 링·전송 몰빵 감사 쿼리 추가\n(다계정 몰빵으로 KYC 우회 차단)",
    },
    {
      emoji: "🏅", title: "라이더 등급 중립화",
      desc: "미적용 혜택 '배달비 +X% 보너스' 제거\n→ '누적 수익 레벨'로 게이미피케이션화\n등급 혜택 로직은 메인넷 숙제로 보류\n(경제 확정 후 설계)",
    },
    {
      emoji: "📝", title: "FAQ·공지 실제화",
      desc: "옛날/미구현 문구 교정: 초대 50→역할별,\n리뷰 10→사진리뷰 보상, 첫주문 30 삭제,\nPICK결제→혼합결제, 등급혜택→메인넷 예정,\n배달시간·배달비 거리연동, Pi 로그인 반영.",
    },
  ];

  day25.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.7 + col * 6.2;
    const y = 1.15 + row * 2.75;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 5.9, h: 2.5,
      fill: { color: "FFF7ED" }, line: { color: "FED7AA" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.22, y: y + 0.24, w: 0.62, h: 0.62,
      fill: { color: C.white }, line: { color: "FED7AA" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.22, y: y + 0.22, w: 0.64, h: 0.64,
      fontSize: 20, align: "center",
    });
    slide.addText(item.title, {
      x: x + 1.0, y: y + 0.3, w: 4.7, h: 0.5, valign: "middle",
      fontSize: 14, bold: true, color: "C2410C",
    });
    slide.addText(item.desc, {
      x: x + 0.28, y: y + 1.0, w: 5.35, h: 1.4,
      fontSize: 11, color: C.textDark, wrap: true, lineSpacingMultiple: 1.12,
    });
  });
}

// ── 슬라이드 27 — Day 26 작업 내역 (8/4) — 활성화 넛지 + DB 보안 하드닝 ──
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "ECFEFF" }, line: { color: "0891B2" },
    rectRadius: 0.1,
  });
  slide.addText("📅  2026. 08. 04 (Day 26)", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "0E7490", align: "center",
  });

  slide.addText("🚀  온보딩·활성화 넛지 + DB 보안 하드닝", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 17, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const day26 = [
    {
      emoji: "🎁", title: "온보딩 초대코드 입력",
      desc: "Pi 신규 가입(역할 선택) 화면에 초대코드칸 추가\nreferral/use 연동(역할 설정 + 5,000 PICK)\n지금까지 초대 유입 0이던 원인(입력 순간 부재)\n해소 → 바이럴 루프 가동",
    },
    {
      emoji: "🗓️", title: "홈 출석 게이트",
      desc: "검색바 자리에 '오늘 출석 +N PICK' 탭\n원탭 체크인 → '완료' 잠깐 → 검색바 전환\n지갑에 숨어있던 출석을 홈 최상단으로\n(출석 활성률 6% 개선 목적)",
    },
    {
      emoji: "🔒", title: "RLS 활성화 (보안 경고 해결)",
      desc: "공개 접근되던 5개 테이블 RLS on\n(coupons·user_coupons·store_hours·\ndaily_checkins·pending_referral_rewards)\nSupabase 메일 경고 원인 제거",
    },
    {
      emoji: "🛡️", title: "함수 search_path 고정",
      desc: "public 함수의 mutable search_path 경고 제거\n'public, pg_temp'로 고정(호출자 상속 차단)\n앱 동작 영향 없음\n18개 함수 일괄 하드닝",
    },
    {
      emoji: "🚫", title: "PICK 함수 anon 실행 차단",
      desc: "reward/deduct/refund/spend_pick·update_order_status\n를 service_role 전용으로 (anon·authenticated 회수)\n누구나 REST로 PICK 자가발행하던 경로 폐쇄\n앱은 서버(admin) 호출이라 정상",
    },
    {
      emoji: "🔍", title: "무단 유용 감사",
      desc: "전 지갑거래를 출처 원장과 대사\n출석 309건=309행 완벽 일치, 미분류 0건\n→ 취약점은 열렸었지만 악용 흔적 없음 확인\n(라이더 불일치는 정리 작업 부수효과)",
    },
  ];

  day26.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.25 + col * 4.3;
    const y = 1.0 + row * 2.55;

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.1, h: 2.35,
      fill: { color: "ECFEFF" }, line: { color: "A5F3FC" },
      rectRadius: 0.15,
    });
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: y + 0.2, w: 0.58, h: 0.58,
      fill: { color: C.white }, line: { color: "A5F3FC" },
      rectRadius: 0.1,
    });
    slide.addText(item.emoji, {
      x: x + 0.18, y: y + 0.18, w: 0.6, h: 0.6,
      fontSize: 18, align: "center",
    });
    slide.addText(item.title, {
      x: x + 0.88, y: y + 0.22, w: 3.0, h: 0.4,
      fontSize: 12, bold: true, color: "0E7490",
    });
    slide.addText(item.desc, {
      x: x + 0.22, y: y + 0.78, w: 3.65, h: 1.42,
      fontSize: 9, color: C.textDark, wrap: true,
    });
  });
}

// ── 슬라이드 28 — Pi Network 현황 & 아키텍처 ───────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "FFF7ED" }, line: { color: "EA580C" },
    rectRadius: 0.1,
  });
  slide.addText("🌐  Pi Network 연동 마스터 플랜", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "EA580C", align: "center",
  });
  slide.addText("Pi Network × PICK PICK 통합 전략", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 22, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  // 왼쪽: Pi 현황
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.3, y: 0.92, w: 4.0, h: 5.7,
    fill: { color: "FFF7ED" }, line: { color: "FED7AA" },
    rectRadius: 0.15,
  });
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.42, y: 1.02, w: 3.76, h: 0.42,
    fill: { color: "EA580C" }, line: { color: "EA580C" },
    rectRadius: 0.08,
  });
  slide.addText("📡  Pi Network 현황 (4/20)", {
    x: 0.42, y: 1.02, w: 3.76, h: 0.42,
    fontSize: 11, bold: true, color: C.white, align: "center",
  });
  const piStatus = [
    { icon: "✅", text: "Open Network 가동 중\n(2025.02.20 출시)" },
    { icon: "✅", text: "Pi SDK 사용 가능\n(U2A/A2U 결제, 로그인)" },
    { icon: "✅", text: "KYC 완료 1,750만+\nFast Track KYC 지원" },
    { icon: "🧪", text: "Pi DEX/AMM/토큰생성\nTestnet 라이브" },
    { icon: "⏳", text: "Protocol 23 (스마트컨트랙트)\n출시 예정" },
    { icon: "💰", text: "Pi 현재가격 ~$0.187\n(2026.02 기준)" },
  ];
  piStatus.forEach((s, i) => {
    slide.addText(`${s.icon}  ${s.text}`, {
      x: 0.55, y: 1.55 + i * 0.74, w: 3.5, h: 0.66,
      fontSize: 10, color: C.textDark, wrap: true,
    });
  });

  // 중간: 아키텍처
  slide.addShape(prs.ShapeType.roundRect, {
    x: 4.55, y: 0.92, w: 4.2, h: 5.7,
    fill: { color: C.purplePale }, line: { color: C.borderPurple },
    rectRadius: 0.15,
  });
  slide.addShape(prs.ShapeType.roundRect, {
    x: 4.67, y: 1.02, w: 3.96, h: 0.42,
    fill: { color: C.purple }, line: { color: C.purple },
    rectRadius: 0.08,
  });
  slide.addText("🏗️  연동 아키텍처", {
    x: 4.67, y: 1.02, w: 3.96, h: 0.42,
    fontSize: 11, bold: true, color: C.white, align: "center",
  });
  const archLines = [
    { bold: true,  text: "기존 인프라 100% 유지" },
    { bold: false, text: "Vercel (Next.js) 그대로" },
    { bold: false, text: "Supabase DB 그대로" },
    { bold: false, text: "PICK 토큰 시스템 그대로" },
    { bold: false, text: "토스페이먼츠 그대로" },
    { bold: true,  text: "추가되는 것" },
    { bold: false, text: "Pi SDK 스크립트 1줄 추가" },
    { bold: false, text: "Pi 로그인 버튼 (선택)" },
    { bold: false, text: "Pi 결제 옵션 추가" },
    { bold: false, text: "Pi 보상 지급 API" },
    { bold: true,  text: "Pi Browser = 그냥 브라우저" },
    { bold: false, text: "URL 열면 Vercel에서 서빙" },
    { bold: false, text: "Pi 노드 = 거래 검증만" },
  ];
  archLines.forEach((line, i) => {
    slide.addText((line.bold ? "▶  " : "    ") + line.text, {
      x: 4.72, y: 1.54 + i * 0.3, w: 3.85, h: 0.28,
      fontSize: line.bold ? 10.5 : 9.5,
      bold: line.bold,
      color: line.bold ? C.purple : C.textDark,
    });
  });

  // 오른쪽: 지금 vs 나중
  slide.addShape(prs.ShapeType.roundRect, {
    x: 9.0, y: 0.92, w: 4.55, h: 5.7,
    fill: { color: C.bluePale }, line: { color: C.blueLight },
    rectRadius: 0.15,
  });
  slide.addShape(prs.ShapeType.roundRect, {
    x: 9.12, y: 1.02, w: 4.31, h: 0.42,
    fill: { color: C.blue }, line: { color: C.blue },
    rectRadius: 0.08,
  });
  slide.addText("🗓️  지금 vs 나중", {
    x: 9.12, y: 1.02, w: 4.31, h: 0.42,
    fontSize: 11, bold: true, color: C.white, align: "center",
  });
  const nowLater = [
    { now: true,  text: "Pi 로그인", sub: "SDK 제공 · Mainnet 가동" },
    { now: true,  text: "U2A Pi 결제", sub: "유저 → 앱 결제" },
    { now: true,  text: "A2U Pi 지급", sub: "라이더·리뷰 보상" },
    { now: true,  text: "Testnet 앱 등록", sub: "개발/테스트 가능" },
    { now: false, text: "PICK 온체인 토큰", sub: "Protocol 23 후" },
    { now: false, text: "PICK↔Pi DEX 스왑", sub: "Mainnet 배포 후" },
    { now: false, text: "에코시스템 공개 등재", sub: "Pi Only 조건 검토" },
  ];
  nowLater.forEach((item, i) => {
    const y = 1.55 + i * 0.68;
    slide.addShape(prs.ShapeType.roundRect, {
      x: 9.15, y, w: 4.25, h: 0.58,
      fill: { color: item.now ? C.greenPale : "FEF3C7" },
      line: { color: item.now ? C.green : C.yellow },
      rectRadius: 0.1,
    });
    slide.addText(`${item.now ? "✅" : "⏳"}  ${item.text}`, {
      x: 9.22, y: y + 0.04, w: 4.1, h: 0.28,
      fontSize: 10.5, bold: true,
      color: item.now ? C.green : C.yellow,
    });
    slide.addText(item.sub, {
      x: 9.38, y: y + 0.3, w: 3.94, h: 0.22,
      fontSize: 9, color: C.textSub,
    });
  });
}

// ── 슬라이드 18 — Pi Network 5단계 연동 시퀀스 ─────────
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fill: { color: "FFF7ED" }, line: { color: "EA580C" },
    rectRadius: 0.1,
  });
  slide.addText("🌐  Pi Network 연동 마스터 플랜", {
    x: 0.4, y: 0.18, w: 3.2, h: 0.55,
    fontSize: 11, bold: true, color: "EA580C", align: "center",
  });
  slide.addText("5단계 개발 시퀀스 (feature/pi-integration 브랜치)", {
    x: 3.8, y: 0.22, w: 9.8, h: 0.55,
    fontSize: 20, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.78, w: 12.8, h: 0.04,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });

  const steps = [
    {
      step: "STEP 1", week: "Week 1 · 1~2일",
      title: "사전 준비",
      color: C.purple, pale: C.purplePale, border: C.borderPurple,
      items: [
        "Pi Developer Portal 앱 2개 등록",
        "PICK PICK Dev (Testnet)",
        "PICK PICK (Mainnet)",
        "API Key 발급 → .env.local 저장",
        "Pi SDK 스크립트 layout.tsx 추가",
        "Pi Browser 감지 유틸 작성",
      ],
    },
    {
      step: "STEP 2", week: "Week 1 · 2~3일",
      title: "Pi 로그인",
      color: C.blue, pale: C.bluePale, border: C.blueLight,
      items: [
        "Pi.authenticate() 클라이언트 연동",
        "POST /api/auth/pi-login 서버 API",
        "GET /v2/me 로 uid 검증",
        "users 테이블 pi_uid 컬럼 활성화",
        "기존 이메일 로그인과 병행 운영",
        "Pi Browser에서만 버튼 노출",
      ],
    },
    {
      step: "STEP 3", week: "Week 2 · 3~4일",
      title: "U2A Pi 결제",
      color: C.green, pale: C.greenPale, border: "86EFAC",
      items: [
        "Pi.createPayment() 장바구니 연동",
        "POST /api/payments/pi/approve",
        "POST /api/payments/pi/complete",
        "orders 테이블 payment_pi_id 추가",
        "원화 → Pi 환율 실시간 적용",
        "결제 수단에 Pi 옵션 추가",
      ],
    },
    {
      step: "STEP 4", week: "Week 3 · 2~3일",
      title: "A2U Pi 지급",
      color: C.yellow, pale: "FFFBEB", border: "FCD34D",
      items: [
        "POST /api/payments/pi/payout",
        "라이더 배달완료 → Pi 수익 지급",
        "리뷰 작성 → Pi 보상 지급",
        "친구 초대 → Pi 레퍼럴 보상",
        "미완료 결제 주기적 확인 Cron",
        "rider_earnings Pi 수익 기록",
      ],
    },
    {
      step: "STEP 5", week: "추후 · Protocol 23 후",
      title: "PICK 온체인 토큰",
      color: C.orange, pale: C.orangePale, border: "FED7AA",
      items: [
        "Pi DEX/AMM Mainnet 배포 확인",
        "PICK 토큰 Pi 생태계 발행",
        "PICK/PI 유동성 풀 등록",
        "기존 DB PICK → 온체인 마이그레이션",
        "에코시스템 공개 등재 신청",
        "Pi Only 앱 별도 버전 검토",
      ],
    },
  ];

  steps.forEach((s, i) => {
    const x = 0.22 + i * 2.64;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: 0.92, w: 2.52, h: 5.75,
      fill: { color: s.pale }, line: { color: s.color },
      rectRadius: 0.15,
    });
    // 스텝 헤더
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.1, y: 1.02, w: 2.32, h: 0.72,
      fill: { color: s.color }, line: { color: s.color },
      rectRadius: 0.1,
    });
    slide.addText(s.step, {
      x: x + 0.1, y: 1.04, w: 2.32, h: 0.3,
      fontSize: 12, bold: true, color: C.white, align: "center",
    });
    slide.addText(s.title, {
      x: x + 0.1, y: 1.32, w: 2.32, h: 0.3,
      fontSize: 10.5, bold: true, color: C.white, align: "center",
    });
    // 주차
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: 1.82, w: 2.16, h: 0.3,
      fill: { color: C.white }, line: { color: s.border },
      rectRadius: 0.07,
    });
    slide.addText(s.week, {
      x: x + 0.18, y: 1.82, w: 2.16, h: 0.3,
      fontSize: 8.5, color: s.color, align: "center", bold: true,
    });
    // 아이템
    s.items.forEach((item, j) => {
      slide.addText(`• ${item}`, {
        x: x + 0.2, y: 2.22 + j * 0.68, w: 2.12, h: 0.62,
        fontSize: 9.5, color: C.textDark, wrap: true,
      });
    });
  });

  // 하단 브랜치 전략 배너
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 6.75, w: 12.8, h: 0.52,
    fill: { color: C.purplePale }, line: { color: C.purple },
    rectRadius: 0.1,
  });
  slide.addText("🌿  브랜치 전략: main (운영 유지) → feature/pi-integration (Pi 개발) → 테스트 완료 후 PR 머지  |  Vercel 브랜치별 독립 URL 자동 생성", {
    x: 0.4, y: 6.75, w: 12.8, h: 0.52,
    fontSize: 11, color: C.purple, align: "center", bold: true,
  });
}

// ── 슬라이드 19 — 완료된 기능 전체 목록 (4/20 기준) ───
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };

  slide.addText("✅  완료된 기능 전체 목록 (Day 15 최신)", {
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
        "calling_rider 상태 흐름 재설계 + 픽업완료 버튼",
        "주문 pending 흐름 · 라이더 heartbeat · 조리완료 폴링",
        "다중 가게 통합 조회 · Realtime storeIds 배열 지원",
        "안드로이드 알람 Web Audio 선예약 (JS throttle 우회)",
        "FCM 푸시 알림 + 관리자 일괄 발송",
        "PWA 오프라인 캐싱 (Serwist) + Sentry 모니터링",
      ],
    },
    {
      title: "π Pi Network 연동",
      color: "7C3AED", pale: C.purplePale,
      items: [
        "Pi SDK 앱 통합 (pi-sdk.js + types/pi.d.ts)",
        "Pi.init() + Pi.authenticate() + Pi.createPayment()",
        "서버 API: /api/pi/approve · /api/pi/complete",
        "개발자 체크리스트 10/10 완료",
        "Pi Ecosystem Listing 신청 진행 중",
        "/pi-test 전용 테스트 페이지",
        "/privacy · /terms · 브랜드 OG 이미지 생성",
      ],
    },
    {
      title: "🛡️ DB / 보안 / 관리자",
      color: C.orange, pale: C.orangePale,
      items: [
        "DB 인덱스 30개+ (GIN 전문검색 포함)",
        "운영 RLS 정책 + Storage 버킷 정책",
        "RLS 라이더 미배정 주문 조회 정책 추가",
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
  slide.addText("🎉  Phase 1~4 진입! 80개+ 기능 구현 · Pi SDK 연동 · 개발자 체크리스트 10/10 · Ecosystem Listing 신청", {
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
