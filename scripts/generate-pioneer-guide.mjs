import PptxGenJS from "pptxgenjs";

const prs = new PptxGenJS();
prs.layout = "LAYOUT_WIDE"; // 16:9

const C = {
  purpleDark:  "4C1D95",
  purple:      "6B21A8",
  purpleLight: "A855F7",
  purplePale:  "EDE9FE",
  yellow:      "D97706",
  yellowLight: "FCD34D",
  yellowPale:  "FEF3C7",
  white:       "FFFFFF",
  bgMain:      "FAF5FF",
  textDark:    "1F1235",
  textSub:     "6B7280",
  green:       "16A34A",
  greenPale:   "DCFCE7",
  orange:      "EA580C",
  orangePale:  "FFEDD5",
  border:      "E9D5FF",
  gray:        "F3F4F6",
  grayText:    "9CA3AF",
};

// ── 공통 헬퍼 ──────────────────────────────────────────
function addHeader(slide, title, sub) {
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 1.05,
    fill: { color: C.purpleDark }, line: { color: C.purpleDark },
  });
  slide.addText("PICK PICK", {
    x: 0.35, y: 0.08, w: 2.2, h: 0.45,
    fontSize: 13, bold: true, color: C.yellowLight, fontFace: "Arial",
  });
  slide.addText(title, {
    x: 0.35, y: 0.46, w: 9, h: 0.5,
    fontSize: 20, bold: true, color: C.white,
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.35, y: 0.46, w: 12.5, h: 0.5,
      fontSize: 12, color: "C4B5FD", align: "right",
    });
  }
}

function addPlaceholder(slide, x, y, w, h, label) {
  slide.addShape(prs.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.gray },
    line: { color: C.grayText, width: 1, dashType: "dash" },
  });
  slide.addText(`📷 ${label}`, {
    x, y: y + h / 2 - 0.2, w, h: 0.4,
    fontSize: 11, color: C.grayText, align: "center",
  });
}

function addStep(slide, x, y, num, title, desc) {
  // 번호 원
  slide.addShape(prs.ShapeType.ellipse, {
    x, y, w: 0.42, h: 0.42,
    fill: { color: C.purple }, line: { color: C.purple },
  });
  slide.addText(String(num), {
    x, y, w: 0.42, h: 0.42,
    fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle",
  });
  slide.addText(title, {
    x: x + 0.5, y: y, w: 3.8, h: 0.25,
    fontSize: 12, bold: true, color: C.textDark,
  });
  slide.addText(desc, {
    x: x + 0.5, y: y + 0.24, w: 3.8, h: 0.22,
    fontSize: 10, color: C.textSub,
  });
}

// ══════════════════════════════════════════════════════
// 슬라이드 1 — 표지
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.purpleDark };

  // 배경 장식
  slide.addShape(prs.ShapeType.ellipse, {
    x: 9.5, y: -1.5, w: 5, h: 5,
    fill: { color: C.purple }, line: { color: C.purple },
  });
  slide.addShape(prs.ShapeType.ellipse, {
    x: -1.5, y: 4.2, w: 3.5, h: 3.5,
    fill: { color: C.purple }, line: { color: C.purple },
  });

  // 이모지
  slide.addText("🛵", {
    x: 4.5, y: 0.4, w: 4, h: 1.3, fontSize: 60, align: "center",
  });

  // 메인 타이틀
  slide.addText("PICK PICK", {
    x: 1, y: 1.55, w: 11.3, h: 1.1,
    fontSize: 56, bold: true, color: C.white, align: "center", fontFace: "Arial",
  });

  slide.addText("파이오니어를 위한 사용 가이드", {
    x: 1, y: 2.65, w: 11.3, h: 0.65,
    fontSize: 22, color: C.yellowLight, align: "center",
  });

  // 구분선
  slide.addShape(prs.ShapeType.rect, {
    x: 3.2, y: 3.4, w: 6.9, h: 0.04,
    fill: { color: C.purpleLight }, line: { color: C.purpleLight },
  });

  // 설명
  const pts = [
    "🌐  Web3 파이 네트워크 생태계 배달앱",
    "💜  사장님 수수료 절감 · 상생 플랫폼",
    "🪙  자체 PICK 토큰 결제 · 적립 시스템",
  ];
  pts.forEach((t, i) => {
    slide.addText(t, {
      x: 2, y: 3.6 + i * 0.6, w: 9.3, h: 0.5,
      fontSize: 15, color: "C4B5FD", align: "center",
    });
  });

  slide.addText("pick-pick-delivery.vercel.app", {
    x: 3.5, y: 6.0, w: 6.3, h: 0.45,
    fontSize: 13, color: C.yellowLight, align: "center",
    hyperlink: { url: "https://pick-pick-delivery.vercel.app" },
  });
}

// ══════════════════════════════════════════════════════
// 슬라이드 2 — PICK PICK이란?
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "PICK PICK이란?", "개요");

  // 왼쪽 설명
  slide.addText("파이 네트워크 생태계 전용\n배달 플랫폼입니다", {
    x: 0.5, y: 1.25, w: 5.5, h: 0.9,
    fontSize: 18, bold: true, color: C.purpleDark,
  });

  const cards = [
    { icon: "🏪", title: "사장님 수수료 절감", desc: "기존 배달앱 대비\n낮은 수수료 구조" },
    { icon: "🪙", title: "PICK 토큰 경제", desc: "주문 시 PICK 토큰\n결제 및 적립" },
    { icon: "🛵", title: "3역할 구조", desc: "사용자·사장님·라이더\n모두 참여 가능" },
    { icon: "🌐", title: "Pi Network 연동 예정", desc: "Pi 코인 결제·로그인\n(Testnet 승인 후)" },
  ];

  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 3.0;
    const y = 2.25 + row * 1.7;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: 2.7, h: 1.45, rectRadius: 0.15,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    slide.addText(c.icon, {
      x, y: y + 0.1, w: 2.7, h: 0.45, fontSize: 22, align: "center",
    });
    slide.addText(c.title, {
      x, y: y + 0.52, w: 2.7, h: 0.3,
      fontSize: 11, bold: true, color: C.purpleDark, align: "center",
    });
    slide.addText(c.desc, {
      x, y: y + 0.82, w: 2.7, h: 0.5,
      fontSize: 9.5, color: C.textSub, align: "center",
    });
  });

  // 오른쪽 이미지 placeholder
  addPlaceholder(slide, 6.8, 1.2, 6.0, 5.4, "앱 메인 화면 스크린샷");
}

// ══════════════════════════════════════════════════════
// 슬라이드 3 — 접속 & 설치 방법
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "접속 & 설치 방법", "시작하기");

  const steps = [
    { num: 1, icon: "📱", title: "모바일 브라우저 열기", desc: "Chrome · Safari · 카카오톡 내 브라우저 모두 가능" },
    { num: 2, icon: "🔗", title: "URL 입력", desc: "pick-pick-delivery.vercel.app" },
    { num: 3, icon: "➕", title: "홈 화면에 추가 (선택)", desc: "브라우저 메뉴 → '홈 화면에 추가' → 앱처럼 사용" },
    { num: 4, icon: "🎉", title: "가입 후 시작!", desc: "이메일 또는 카카오 계정으로 30초 만에 가입" },
  ];

  steps.forEach((s, i) => {
    const y = 1.3 + i * 1.3;
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.5, y, w: 6.0, h: 1.1, rectRadius: 0.15,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    // 번호
    slide.addShape(prs.ShapeType.ellipse, {
      x: 0.75, y: y + 0.34, w: 0.42, h: 0.42,
      fill: { color: C.purple }, line: { color: C.purple },
    });
    slide.addText(String(s.num), {
      x: 0.75, y: y + 0.34, w: 0.42, h: 0.42,
      fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle",
    });
    slide.addText(s.icon + "  " + s.title, {
      x: 1.3, y: y + 0.15, w: 5.0, h: 0.38,
      fontSize: 13, bold: true, color: C.purpleDark,
    });
    slide.addText(s.desc, {
      x: 1.3, y: y + 0.52, w: 5.0, h: 0.35,
      fontSize: 11, color: C.textSub,
    });
  });

  // 오른쪽 placeholder들
  addPlaceholder(slide, 7.0, 1.2, 2.8, 4.5, "브라우저 접속 화면");
  addPlaceholder(slide, 10.1, 1.2, 2.8, 4.5, "홈 화면 추가 화면");

  // URL 강조 박스
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: 6.45, w: 6.0, h: 0.65, rectRadius: 0.12,
    fill: { color: C.purpleDark }, line: { color: C.purpleDark },
  });
  slide.addText("🔗  pick-pick-delivery.vercel.app", {
    x: 0.5, y: 6.45, w: 6.0, h: 0.65,
    fontSize: 14, bold: true, color: C.yellowLight, align: "center",
  });
}

// ══════════════════════════════════════════════════════
// 슬라이드 4 — 가입 & 역할 선택
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "가입 & 역할 선택", "처음 한 번만!");

  // 왼쪽 설명
  slide.addText("가입 방법", {
    x: 0.5, y: 1.2, w: 6.0, h: 0.4,
    fontSize: 15, bold: true, color: C.purpleDark,
  });

  const methods = [
    { icon: "💛", title: "카카오로 시작하기", desc: "가장 빠른 방법 — 클릭 한 번으로 가입" },
    { icon: "📧", title: "이메일로 가입", desc: "이메일 + 비밀번호 입력 후 가입" },
  ];
  methods.forEach((m, i) => {
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.5, y: 1.7 + i * 1.0, w: 5.8, h: 0.82, rectRadius: 0.12,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    slide.addText(m.icon + "  " + m.title, {
      x: 0.8, y: 1.75 + i * 1.0, w: 5.2, h: 0.3,
      fontSize: 12, bold: true, color: C.textDark,
    });
    slide.addText(m.desc, {
      x: 0.8, y: 2.05 + i * 1.0, w: 5.2, h: 0.3,
      fontSize: 10, color: C.textSub,
    });
  });

  // 역할 선택 설명
  slide.addText("역할 선택 (가입 시 1회)", {
    x: 0.5, y: 3.85, w: 6.0, h: 0.4,
    fontSize: 15, bold: true, color: C.purpleDark,
  });

  const roles = [
    { icon: "👤", name: "일반 사용자", desc: "음식 주문 & PICK 적립", color: C.purple, pale: C.purplePale },
    { icon: "🏪", name: "사장님",      desc: "가게 등록 & 주문 관리",  color: C.yellow, pale: C.yellowPale },
    { icon: "🛵", name: "라이더",      desc: "배달 & 수익 관리",       color: C.green,  pale: C.greenPale },
  ];
  roles.forEach((r, i) => {
    const x = 0.5 + i * 1.98;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: 4.35, w: 1.8, h: 1.8, rectRadius: 0.15,
      fill: { color: r.pale }, line: { color: r.color, width: 2 },
    });
    slide.addText(r.icon, {
      x, y: 4.45, w: 1.8, h: 0.55, fontSize: 26, align: "center",
    });
    slide.addText(r.name, {
      x, y: 5.0, w: 1.8, h: 0.3,
      fontSize: 11, bold: true, color: r.color, align: "center",
    });
    slide.addText(r.desc, {
      x, y: 5.3, w: 1.8, h: 0.6,
      fontSize: 9, color: C.textSub, align: "center",
    });
  });

  slide.addText("⚠️  역할은 가입 후 변경이 어려우니 신중하게 선택해 주세요", {
    x: 0.5, y: 6.35, w: 5.9, h: 0.35,
    fontSize: 10, color: C.orange, bold: true,
  });

  // 오른쪽 placeholders
  addPlaceholder(slide, 7.0, 1.2, 2.8, 5.5, "가입 화면 스크린샷");
  addPlaceholder(slide, 10.1, 1.2, 2.8, 5.5, "역할 선택 화면 스크린샷");
}

// ══════════════════════════════════════════════════════
// 슬라이드 5 — 일반 사용자 : 홈 & 주문
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "일반 사용자 — 음식 주문하기", "사용자 가이드 ①");

  // 단계 흐름
  const flow = [
    { icon: "🏠", label: "홈 화면",     desc: "카테고리 탭" },
    { icon: "🏪", label: "매장 선택",   desc: "메뉴 확인" },
    { icon: "🛒", label: "메뉴 담기",   desc: "옵션 선택" },
    { icon: "💳", label: "결제",        desc: "PICK 사용" },
    { icon: "✅", label: "주문 완료",   desc: "실시간 추적" },
  ];

  flow.forEach((f, i) => {
    const x = 0.4 + i * 2.5;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: 1.25, w: 2.0, h: 1.8, rectRadius: 0.15,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    slide.addText(f.icon, {
      x, y: 1.35, w: 2.0, h: 0.55, fontSize: 26, align: "center",
    });
    slide.addText(f.label, {
      x, y: 1.9, w: 2.0, h: 0.3,
      fontSize: 12, bold: true, color: C.purpleDark, align: "center",
    });
    slide.addText(f.desc, {
      x, y: 2.22, w: 2.0, h: 0.55,
      fontSize: 10, color: C.textSub, align: "center",
    });
    // 화살표
    if (i < flow.length - 1) {
      slide.addText("→", {
        x: x + 2.02, y: 1.95, w: 0.44, h: 0.4,
        fontSize: 18, color: C.purpleLight, align: "center", bold: true,
      });
    }
  });

  // 하단 placeholders
  addPlaceholder(slide, 0.4,  3.3, 2.5, 3.6, "홈 화면");
  addPlaceholder(slide, 3.1,  3.3, 2.5, 3.6, "매장 상세");
  addPlaceholder(slide, 5.8,  3.3, 2.5, 3.6, "메뉴 선택");
  addPlaceholder(slide, 8.5,  3.3, 2.5, 3.6, "결제 화면");
  addPlaceholder(slide, 11.2, 3.3, 1.7, 3.6, "주문 완료");
}

// ══════════════════════════════════════════════════════
// 슬라이드 6 — 일반 사용자 : 실시간 주문 추적
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "일반 사용자 — 실시간 주문 추적", "사용자 가이드 ②");

  const statuses = [
    { icon: "⏳", label: "결제 확인 중",        color: C.textSub },
    { icon: "✅", label: "사장님 수락",          color: C.green },
    { icon: "🍳", label: "조리 중",              color: C.orange },
    { icon: "🛵", label: "라이더 픽업 → 배달 중", color: C.purple },
    { icon: "🎉", label: "배달 완료",            color: C.green },
  ];

  statuses.forEach((s, i) => {
    const y = 1.25 + i * 1.0;
    // 연결선
    if (i < statuses.length - 1) {
      slide.addShape(prs.ShapeType.line, {
        x: 1.07, y: y + 0.42, w: 0, h: 0.6,
        line: { color: C.border, width: 2 },
      });
    }
    // 원
    slide.addShape(prs.ShapeType.ellipse, {
      x: 0.8, y: y + 0.05, w: 0.55, h: 0.55,
      fill: { color: i === 4 ? C.green : (i === 0 ? C.gray : C.white) },
      line: { color: s.color, width: 2 },
    });
    slide.addText(s.icon, {
      x: 0.8, y: y + 0.05, w: 0.55, h: 0.55,
      fontSize: 14, align: "center", valign: "middle",
    });
    slide.addText(s.label, {
      x: 1.5, y: y + 0.1, w: 4.5, h: 0.4,
      fontSize: 13, bold: true, color: s.color,
    });
  });

  // PICK 보상 박스
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: 6.3, w: 5.8, h: 0.65, rectRadius: 0.12,
    fill: { color: C.purpleDark }, line: { color: C.purpleDark },
  });
  slide.addText("🪙  배달 완료 후 PICK 토큰 자동 적립!", {
    x: 0.5, y: 6.3, w: 5.8, h: 0.65,
    fontSize: 13, bold: true, color: C.yellowLight, align: "center",
  });

  // 오른쪽 placeholder
  addPlaceholder(slide, 7.0, 1.2, 5.9, 5.7, "주문 추적 화면 스크린샷");
}

// ══════════════════════════════════════════════════════
// 슬라이드 7 — PICK 지갑
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "PICK 지갑", "지갑 탭 안내");

  const features = [
    { icon: "💜", title: "PICK 잔액 확인",    desc: "언제든지 실시간 잔액 조회" },
    { icon: "⬇️", title: "충전하기",          desc: "이벤트·관리자 지급으로 충전" },
    { icon: "➡️", title: "보내기",            desc: "다른 PICK PICK 사용자에게 전송" },
    { icon: "📋", title: "거래 내역",          desc: "충전·사용·적립 전체 이력 확인" },
    { icon: "🧮", title: "Pi ↔ 원화 계산기",  desc: "Pi 시세 기준 실시간 환율 계산" },
  ];

  features.forEach((f, i) => {
    const y = 1.25 + i * 1.05;
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.5, y, w: 6.0, h: 0.88, rectRadius: 0.12,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    slide.addText(f.icon, {
      x: 0.7, y: y + 0.2, w: 0.55, h: 0.5, fontSize: 20, align: "center",
    });
    slide.addText(f.title, {
      x: 1.4, y: y + 0.1, w: 4.8, h: 0.3,
      fontSize: 12, bold: true, color: C.purpleDark,
    });
    slide.addText(f.desc, {
      x: 1.4, y: y + 0.42, w: 4.8, h: 0.28,
      fontSize: 10, color: C.textSub,
    });
  });

  // 오른쪽 placeholders
  addPlaceholder(slide, 7.2, 1.2, 2.7, 5.5, "지갑 잔액 화면");
  addPlaceholder(slide, 10.2, 1.2, 2.7, 5.5, "Pi 계산기 화면");
}

// ══════════════════════════════════════════════════════
// 슬라이드 8 — 사장님 가이드
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "사장님 — 가게 등록 & 주문 관리", "사장님 가이드");

  // 왼쪽: 가게 등록 단계
  slide.addText("① 가게 등록", {
    x: 0.5, y: 1.2, w: 5.8, h: 0.38,
    fontSize: 14, bold: true, color: C.purpleDark,
  });

  const regSteps = [
    "가게 이름·카테고리·주소 입력",
    "대표 이미지·배너 사진 업로드",
    "배달비·최소 주문금액 설정",
    "메뉴 등록 (이름·가격·옵션)",
    "관리자 승인 후 오픈 완료 ✅",
  ];
  regSteps.forEach((s, i) => {
    slide.addShape(prs.ShapeType.ellipse, {
      x: 0.55, y: 1.7 + i * 0.7, w: 0.32, h: 0.32,
      fill: { color: C.yellow }, line: { color: C.yellow },
    });
    slide.addText(String(i + 1), {
      x: 0.55, y: 1.7 + i * 0.7, w: 0.32, h: 0.32,
      fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
    });
    slide.addText(s, {
      x: 1.0, y: 1.73 + i * 0.7, w: 5.2, h: 0.3,
      fontSize: 11, color: C.textDark,
    });
  });

  // 주문 관리 설명
  slide.addShape(prs.ShapeType.rect, {
    x: 0.5, y: 5.3, w: 5.8, h: 0.03,
    fill: { color: C.border }, line: { color: C.border },
  });
  slide.addText("② 실시간 주문 수락", {
    x: 0.5, y: 5.45, w: 5.8, h: 0.38,
    fontSize: 14, bold: true, color: C.purpleDark,
  });

  const orderFlow = [
    { icon: "🔔", text: "신규 주문 알림" },
    { icon: "✅", text: "수락 버튼 탭" },
    { icon: "🍳", text: "조리 완료 처리" },
    { icon: "🛵", text: "라이더 자동 배정" },
  ];
  orderFlow.forEach((o, i) => {
    slide.addText(`${o.icon} ${o.text}${i < 3 ? "  →" : "  🎉"}`, {
      x: 0.5 + i * 1.5, y: 5.95, w: 1.6, h: 0.5,
      fontSize: 10.5, color: C.textDark, align: "center",
    });
  });

  // 오른쪽 placeholders
  addPlaceholder(slide, 7.0, 1.2, 2.8, 3.0, "가게 설정 화면");
  addPlaceholder(slide, 10.1, 1.2, 2.8, 3.0, "메뉴 관리 화면");
  addPlaceholder(slide, 7.0, 4.4, 5.9, 2.4, "주문 수락 화면");
}

// ══════════════════════════════════════════════════════
// 슬라이드 9 — 라이더 가이드
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "라이더 — 배달하기", "라이더 가이드");

  const steps = [
    { num: 1, icon: "🟢", title: "온라인 상태 전환",   desc: "라이더 대시보드에서 '배달 가능' 활성화" },
    { num: 2, icon: "🔔", title: "배달 요청 수신",      desc: "주변 배달 가능 주문 알림 수신" },
    { num: 3, icon: "✅", title: "배달 수락",           desc: "수락 버튼 탭 → 픽업 정보 확인" },
    { num: 4, icon: "📍", title: "가게로 이동 · 픽업",  desc: "지도 안내 따라 매장 방문 후 픽업" },
    { num: 5, icon: "🛵", title: "배달 완료",           desc: "배달 완료 처리 → PICK 수익 자동 적립" },
  ];

  steps.forEach((s, i) => {
    const y = 1.25 + i * 1.05;
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.5, y, w: 6.0, h: 0.88, rectRadius: 0.12,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    slide.addShape(prs.ShapeType.ellipse, {
      x: 0.7, y: y + 0.23, w: 0.42, h: 0.42,
      fill: { color: C.green }, line: { color: C.green },
    });
    slide.addText(String(s.num), {
      x: 0.7, y: y + 0.23, w: 0.42, h: 0.42,
      fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle",
    });
    slide.addText(s.icon + "  " + s.title, {
      x: 1.28, y: y + 0.1, w: 5.0, h: 0.3,
      fontSize: 12, bold: true, color: C.textDark,
    });
    slide.addText(s.desc, {
      x: 1.28, y: y + 0.44, w: 5.0, h: 0.3,
      fontSize: 10, color: C.textSub,
    });
  });

  // 수익 박스
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: 6.55, w: 5.8, h: 0.55, rectRadius: 0.12,
    fill: { color: C.greenPale }, line: { color: C.green, width: 1.5 },
  });
  slide.addText("💰  배달 완료 시 PICK 토큰 수익 자동 지급 (라이더 대시보드에서 내역 확인)", {
    x: 0.5, y: 6.55, w: 5.8, h: 0.55,
    fontSize: 10, bold: true, color: C.green, align: "center",
  });

  // 오른쪽 placeholders
  addPlaceholder(slide, 7.0, 1.2, 2.8, 5.9, "라이더 대시보드");
  addPlaceholder(slide, 10.1, 1.2, 2.8, 5.9, "배달 지도 화면");
}

// ══════════════════════════════════════════════════════
// 슬라이드 10 — 친구 초대 (레퍼럴)
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "친구 초대하고 PICK 받기", "레퍼럴 보상");

  // 초대 방법
  slide.addText("내 초대 코드 공유 → 친구 가입 → PICK 즉시 지급!", {
    x: 0.5, y: 1.2, w: 12.3, h: 0.45,
    fontSize: 14, bold: true, color: C.purpleDark,
  });

  // 보상 카드
  const rewards = [
    { role: "일반 사용자 초대", me: "5,000 P", friend: "5,000 P",  color: C.purple, pale: C.purplePale, icon: "👤" },
    { role: "사장님 초대",      me: "5,000 P", friend: "20,000 P", color: C.yellow, pale: C.yellowPale, icon: "🏪" },
    { role: "라이더 초대",      me: "5,000 P", friend: "10,000 P", color: C.green,  pale: C.greenPale,  icon: "🛵" },
  ];

  rewards.forEach((r, i) => {
    const x = 0.5 + i * 4.2;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: 1.85, w: 3.9, h: 3.2, rectRadius: 0.15,
      fill: { color: r.pale }, line: { color: r.color, width: 2 },
    });
    slide.addText(r.icon, {
      x, y: 1.95, w: 3.9, h: 0.55, fontSize: 28, align: "center",
    });
    slide.addText(r.role, {
      x, y: 2.5, w: 3.9, h: 0.35,
      fontSize: 12, bold: true, color: r.color, align: "center",
    });
    slide.addShape(prs.ShapeType.rect, {
      x: x + 0.3, y: 2.95, w: 3.3, h: 0.02,
      fill: { color: r.color }, line: { color: r.color },
    });
    slide.addText("나에게", {
      x, y: 3.1, w: 3.9, h: 0.25,
      fontSize: 10, color: C.textSub, align: "center",
    });
    slide.addText(`+${r.me}`, {
      x, y: 3.35, w: 3.9, h: 0.4,
      fontSize: 16, bold: true, color: r.color, align: "center",
    });
    slide.addText("친구에게", {
      x, y: 3.8, w: 3.9, h: 0.25,
      fontSize: 10, color: C.textSub, align: "center",
    });
    slide.addText(`+${r.friend}`, {
      x, y: 4.05, w: 3.9, h: 0.4,
      fontSize: 16, bold: true, color: r.color, align: "center",
    });
  });

  // 사용 방법
  slide.addText("사용 방법: MyPICK 탭 → 친구 초대 → 초대 코드 복사 → 카카오톡·SNS로 공유", {
    x: 0.5, y: 5.25, w: 12.3, h: 0.4,
    fontSize: 11, color: C.textSub,
  });

  addPlaceholder(slide, 0.5, 5.8, 12.3, 1.3, "초대 화면 스크린샷");
}

// ══════════════════════════════════════════════════════
// 슬라이드 11 — 자주 묻는 질문 (FAQ)
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  addHeader(slide, "자주 묻는 질문 (FAQ)", "");

  const faqs = [
    { q: "Pi 코인으로 바로 결제할 수 있나요?", a: "현재는 PICK 토큰(내부 포인트)으로 결제합니다.\nPi Network Testnet 승인 후 Pi 코인 직접 결제를 연동할 예정입니다." },
    { q: "PICK 토큰은 어떻게 충전하나요?", a: "현재는 관리자 지급·이벤트 보상으로 충전됩니다.\n추후 Pi 코인 → PICK 전환 기능이 추가됩니다." },
    { q: "사장님으로 가입하면 바로 영업할 수 있나요?", a: "가게 등록 후 관리자 승인이 필요합니다. 보통 1~2일 이내 처리됩니다." },
    { q: "라이더는 어디서나 활동할 수 있나요?", a: "현재 서비스 지역 내에서만 배달 가능합니다." },
    { q: "앱 설치가 필요한가요?", a: "별도 설치 없이 브라우저로 접속 가능합니다. (PWA — 홈 화면에 추가하면 앱처럼 사용 가능)" },
  ];

  faqs.forEach((f, i) => {
    const y = 1.2 + i * 1.1;
    slide.addShape(prs.ShapeType.roundRect, {
      x: 0.5, y, w: 12.3, h: 0.95, rectRadius: 0.12,
      fill: { color: C.white }, line: { color: C.border, width: 1.5 },
    });
    slide.addText("Q.", {
      x: 0.7, y: y + 0.08, w: 0.4, h: 0.3,
      fontSize: 12, bold: true, color: C.purple,
    });
    slide.addText(f.q, {
      x: 1.1, y: y + 0.08, w: 11.4, h: 0.3,
      fontSize: 12, bold: true, color: C.textDark,
    });
    slide.addText("A.  " + f.a, {
      x: 0.7, y: y + 0.42, w: 11.8, h: 0.45,
      fontSize: 10, color: C.textSub,
    });
  });
}

// ══════════════════════════════════════════════════════
// 슬라이드 12 — 마무리
// ══════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.purpleDark };

  // 배경 장식
  slide.addShape(prs.ShapeType.ellipse, {
    x: 9.0, y: -1.0, w: 5.5, h: 5.5,
    fill: { color: C.purple }, line: { color: C.purple },
  });
  slide.addShape(prs.ShapeType.ellipse, {
    x: -2.0, y: 4.5, w: 4.0, h: 4.0,
    fill: { color: C.purple }, line: { color: C.purple },
  });

  slide.addText("🎉", {
    x: 4.5, y: 0.5, w: 4.0, h: 1.3, fontSize: 58, align: "center",
  });

  slide.addText("지금 바로 시작해보세요!", {
    x: 1.0, y: 1.7, w: 11.3, h: 0.9,
    fontSize: 34, bold: true, color: C.white, align: "center",
  });

  slide.addText("PICK PICK과 함께하는 Web3 배달 생태계", {
    x: 1.0, y: 2.6, w: 11.3, h: 0.55,
    fontSize: 18, color: C.yellowLight, align: "center",
  });

  slide.addShape(prs.ShapeType.roundRect, {
    x: 3.2, y: 3.4, w: 6.9, h: 0.7, rectRadius: 0.15,
    fill: { color: C.yellow }, line: { color: C.yellow },
  });
  slide.addText("🔗  pick-pick-delivery.vercel.app", {
    x: 3.2, y: 3.4, w: 6.9, h: 0.7,
    fontSize: 17, bold: true, color: C.white, align: "center",
    hyperlink: { url: "https://pick-pick-delivery.vercel.app" },
  });

  const bullets = [
    "👤  일반 사용자 — 음식 주문 & PICK 적립",
    "🏪  사장님 — 가게 등록 & 주문 관리",
    "🛵  라이더 — 배달 & 수익 창출",
  ];
  bullets.forEach((b, i) => {
    slide.addText(b, {
      x: 2.0, y: 4.35 + i * 0.62, w: 9.3, h: 0.52,
      fontSize: 14, color: "C4B5FD", align: "center",
    });
  });

  slide.addText("Pi Network Testnet 승인 후 Pi 코인 로그인 · 결제 연동 예정 🚀", {
    x: 1.5, y: 6.35, w: 10.3, h: 0.45,
    fontSize: 12, color: C.yellowLight, align: "center",
  });
}

// ══════════════════════════════════════════════════════
// 저장
// ══════════════════════════════════════════════════════
const filename = "PICKPICK_파이오니어_사용가이드.pptx";
await prs.writeFile({ fileName: filename });
console.log(`✅  ${filename} 생성 완료`);
