import PptxGenJS from "pptxgenjs";

// ════════════════════════════════════════════════════════════
//  PICK PICK 사용설명서 (파이오니어 가이드)
//  - 초보 사용자가 한 번만 봐도 이해할 수 있는 단계별 매뉴얼
//  - 화면 캡처 자리는 점선 테두리 박스(📷)로 표시 → 사용자가 직접 삽입
//  실행:  node scripts/generate-user-guide.mjs
// ════════════════════════════════════════════════════════════

const prs = new PptxGenJS();
prs.layout = "LAYOUT_WIDE"; // 16:9 (13.33 x 7.5 inch)

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
  amber:       "B45309",
  amberLine:   "F59E0B",
  amberPale:   "FEF3C7",
  red:         "DC2626",
  redPale:     "FEE2E2",
  borderPurple:"E9D5FF",
  blue:        "0369A1",
  bluePale:    "E0F2FE",
  blueLine:    "38BDF8",
  teal:        "0F766E",
  tealLine:    "2DD4BF",
  tealPale:    "F0FDFA",
  rose:        "BE123C",
  roseLine:    "FB7185",
  rosePale:    "FFF1F2",
};

// ── 공통 헬퍼 ────────────────────────────────────────────────
function header(slide, badge, badgeFill, badgeLine, badgeColor, title) {
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 0.22, w: 3.1, h: 0.55,
    fill: { color: badgeFill }, line: { color: badgeLine }, rectRadius: 0.1,
  });
  slide.addText(badge, {
    x: 0.4, y: 0.22, w: 3.1, h: 0.55,
    fontSize: 12, bold: true, color: badgeColor, align: "center",
  });
  slide.addText(title, {
    x: 3.7, y: 0.24, w: 9.4, h: 0.55,
    fontSize: 19, bold: true, color: C.purpleDark,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.4, y: 0.86, w: 12.5, h: 0.045,
    fill: { color: C.borderPurple }, line: { color: C.borderPurple },
  });
}

// 사진 자리 — 점선 테두리 박스
function photoBox(slide, x, y, w, h, label = "앱 화면 캡처를 넣어주세요") {
  slide.addShape(prs.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: "FFFFFF" },
    line: { color: "C4B5FD", width: 1.75, dashType: "dash" },
    rectRadius: 0.12,
  });
  slide.addText(`📷\n${label}`, {
    x, y, w, h,
    fontSize: 12, color: "9CA3AF", align: "center", valign: "middle",
    lineSpacingMultiple: 1.3,
  });
}

// 번호 매긴 단계 카드 (세로 스택)
function steps(slide, list, x, y, w, totalH, accent, accentPale) {
  const gap = 0.16;
  const h = (totalH - gap * (list.length - 1)) / list.length;
  list.forEach((s, i) => {
    const yy = y + i * (h + gap);
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: yy, w, h,
      fill: { color: "FFFFFF" }, line: { color: accentPale }, rectRadius: 0.1,
    });
    // 번호 원
    slide.addShape(prs.ShapeType.ellipse, {
      x: x + 0.18, y: yy + h / 2 - 0.28, w: 0.56, h: 0.56,
      fill: { color: accent }, line: { color: accent },
    });
    slide.addText(String(i + 1), {
      x: x + 0.18, y: yy + h / 2 - 0.28, w: 0.56, h: 0.56,
      fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle",
    });
    slide.addText(
      [
        { text: s.t + "\n", options: { fontSize: 13, bold: true, color: accent } },
        { text: s.d, options: { fontSize: 11, color: C.textSub } },
      ],
      { x: x + 0.95, y: yy + 0.1, w: w - 1.15, h: h - 0.2, valign: "middle", lineSpacingMultiple: 1.05 },
    );
  });
}

function footNote(slide, text, color = C.textSub) {
  slide.addText(text, {
    x: 0.4, y: 6.95, w: 12.5, h: 0.4,
    fontSize: 11, italic: true, color, align: "center",
  });
}

// ════════════════════════════════════════════════════════════
// 슬라이드 1 — 표지
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.purpleDark };
  slide.addShape(prs.ShapeType.ellipse, { x: 9.2, y: -1.3, w: 3.8, h: 3.8, fill: { color: C.purple }, line: { color: C.purple } });
  slide.addShape(prs.ShapeType.ellipse, { x: -1.0, y: 4.6, w: 2.8, h: 2.8, fill: { color: C.purple }, line: { color: C.purple } });

  slide.addText("🛵", { x: 5.6, y: 0.7, w: 2.1, h: 1.4, fontSize: 60, align: "center" });
  slide.addText("PICK PICK 사용설명서", {
    x: 1, y: 2.1, w: 11.33, h: 1.1, fontSize: 46, bold: true, color: C.white, align: "center",
  });
  slide.addText("처음 오신 파이오니어를 위한 완벽 가이드", {
    x: 1, y: 3.25, w: 11.33, h: 0.6, fontSize: 20, color: C.yellowLight, align: "center",
  });
  slide.addShape(prs.ShapeType.rect, { x: 3.7, y: 4.0, w: 6.0, h: 0.04, fill: { color: C.purpleLight }, line: { color: C.purpleLight } });

  const items = [
    "π  Pi Browser 로그인 · 역할 선택",
    "🛒  주문 · 혼합 결제 (현금 + π 테스트 토큰)",
    "🏪  사장님 가게·메뉴 등록    🛵  라이더 배달",
    "🎁  친구 초대 & PICK 토큰 보상",
  ];
  items.forEach((t, i) => {
    slide.addText(t, { x: 2.2, y: 4.35 + i * 0.55, w: 9, h: 0.5, fontSize: 15, color: "DDD6FE" });
  });
  slide.addText("⚠️ 현재 Pi 테스트넷 단계 — 실제 금전 거래가 아닌 테스트 환경입니다", {
    x: 1, y: 6.85, w: 11.33, h: 0.4, fontSize: 12, color: "C4B5FD", align: "center",
  });
}

// ════════════════════════════════════════════════════════════
// 슬라이드 2 — PICK PICK이란? (개요 · 3역할)
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "📖  서비스 소개", C.purplePale, C.purpleLight, C.purple, "PICK PICK은 어떤 서비스인가요?");

  slide.addText(
    "PICK PICK은 Pi 생태계 안에서 음식을 주문·결제하고, 자체 PICK 토큰으로 적립·보상을 받는 한국형 배달 앱이에요.\n한 앱 안에서 3가지 역할로 참여할 수 있어요.",
    { x: 0.5, y: 1.05, w: 12.3, h: 0.9, fontSize: 14, color: C.textDark, lineSpacingMultiple: 1.2 },
  );

  const roles = [
    { emoji: "👤", label: "일반 이용자", fill: C.bluePale, line: C.blueLine, color: C.blue,
      d: "음식 주문 · 배달 받기\nPICK 토큰 적립/사용\n리뷰 작성 · 친구 초대" },
    { emoji: "🏪", label: "사장님", fill: C.amberPale, line: C.amberLine, color: C.amber,
      d: "가게 등록 · 메뉴 관리\n실시간 주문 접수/조리\n배달비·영업시간 설정" },
    { emoji: "🛵", label: "라이더", fill: C.tealPale, line: C.tealLine, color: C.teal,
      d: "배달 요청 수락\n픽업 → 배달 완료\nPICK 수익 적립" },
  ];
  roles.forEach((r, i) => {
    const x = 0.6 + i * 4.15;
    slide.addShape(prs.ShapeType.roundRect, { x, y: 2.15, w: 3.85, h: 2.5, fill: { color: r.fill }, line: { color: r.line }, rectRadius: 0.15 });
    slide.addText(r.emoji, { x, y: 2.35, w: 3.85, h: 0.9, fontSize: 42, align: "center" });
    slide.addText(r.label, { x, y: 3.3, w: 3.85, h: 0.5, fontSize: 17, bold: true, color: r.color, align: "center" });
    slide.addText(r.d, { x: x + 0.3, y: 3.85, w: 3.25, h: 0.75, fontSize: 11.5, color: C.textDark, align: "center", lineSpacingMultiple: 1.15 });
  });

  // 전체 흐름 한 줄
  slide.addShape(prs.ShapeType.roundRect, { x: 0.6, y: 5.0, w: 12.15, h: 1.6, fill: { color: C.purplePale }, line: { color: C.purpleLight }, rectRadius: 0.15 });
  slide.addText("🔄  전체 흐름", { x: 0.85, y: 5.15, w: 4, h: 0.4, fontSize: 13, bold: true, color: C.purple });
  slide.addText(
    "손님이 주문  →  사장님이 접수·조리  →  라이더가 픽업·배달  →  배달 완료 후 리뷰·PICK 적립",
    { x: 0.85, y: 5.6, w: 11.6, h: 0.9, fontSize: 15, bold: true, color: C.purpleDark, valign: "middle" },
  );
  footNote(slide, "하나의 계정으로 시작하고, 역할은 MyPICK에서 언제든 바꿀 수 있어요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 3 — 시작하기 ① Pi Browser 로그인
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🚀  시작하기 ①", C.purplePale, C.purpleLight, C.purple, "Pi Browser로 로그인하기");

  steps(slide, [
    { t: "Pi Browser로 접속", d: "Pi 앱 내 브라우저에서 PICK PICK 주소를 열어요. (일반 브라우저의 카카오·이메일은 개발자 검토·테스트용)" },
    { t: "[Pi Browser로 로그인] 탭", d: "보라색 π 버튼을 누르면 Pi 계정 인증창이 떠요." },
    { t: "권한 허용 (username)", d: "Pi가 사용자 이름 확인을 요청해요. [Allow]를 눌러 진행." },
    { t: "자동 회원가입 완료", d: "처음이면 계정이 자동 생성되고, 역할 선택 화면으로 넘어가요." },
  ], 0.5, 1.15, 7.0, 5.4, C.purple, C.borderPurple);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "로그인 화면 캡처");
  footNote(slide, "PICK PICK은 Pi 생태계 전용 서비스 — 정식 로그인은 반드시 Pi Browser를 이용하세요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 4 — 시작하기 ② 역할 선택
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🚀  시작하기 ②", C.purplePale, C.purpleLight, C.purple, "역할 선택하기 (최초 1회)");

  steps(slide, [
    { t: "역할 3가지 중 선택", d: "👤 일반 유저 / 🏪 사장님 / 🛵 라이더 중 하나를 골라요." },
    { t: "[시작하기] 누르기", d: "선택한 역할에 맞는 홈 화면으로 이동해요." },
    { t: "나중에 변경 가능", d: "MyPICK 탭에서 언제든 역할을 바꿀 수 있어요. (부담 없이 선택)" },
  ], 0.5, 1.15, 7.0, 5.4, C.purple, C.borderPurple);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "역할 선택 화면 캡처");
  footNote(slide, "사장님·라이더는 선택 후 서류 승인 절차가 있어요 (뒤 슬라이드 참고).");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 5 — PICK 토큰 & 지갑
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "💜  지갑", C.yellowPale, C.amberLine, C.amber, "PICK 토큰과 지갑 사용법");

  slide.addText(
    "PICK 토큰은 PICK PICK 안에서 쓰는 포인트형 토큰이에요. 적립하고, 충전하고, 친구에게 보낼 수 있어요.",
    { x: 0.5, y: 1.05, w: 12.3, h: 0.6, fontSize: 14, color: C.textDark },
  );

  const cards = [
    { e: "🎁", t: "적립하기", d: "출석 체크(하루 50 PICK)\n친구 초대 · 리뷰 작성\n주문 시 등급별 적립" },
    { e: "➕", t: "충전하기", d: "지갑 [충전] 버튼\n테스트용 PICK 직접 충전\n(최소 100 PICK)" },
    { e: "📤", t: "보내기", d: "다른 파이오니어에게\nPICK 토큰 전송\n(상대 검색 후 송금)" },
    { e: "🔒", t: "잠금 잔액", d: "주문 진행 중 홀드\n주문 완료/취소 시\n자동 해제·정산" },
  ];
  cards.forEach((c, i) => {
    const x = 0.6 + i * 3.08;
    slide.addShape(prs.ShapeType.roundRect, { x, y: 1.8, w: 2.85, h: 2.4, fill: { color: C.yellowPale }, line: { color: C.amberLine }, rectRadius: 0.15 });
    slide.addText(c.e, { x, y: 1.98, w: 2.85, h: 0.8, fontSize: 34, align: "center" });
    slide.addText(c.t, { x, y: 2.82, w: 2.85, h: 0.45, fontSize: 15, bold: true, color: C.amber, align: "center" });
    slide.addText(c.d, { x: x + 0.2, y: 3.3, w: 2.45, h: 0.85, fontSize: 11, color: C.textDark, align: "center", lineSpacingMultiple: 1.15 });
  });

  // 등급
  slide.addShape(prs.ShapeType.roundRect, { x: 0.6, y: 4.45, w: 12.15, h: 2.05, fill: { color: C.white }, line: { color: C.borderPurple }, rectRadius: 0.15 });
  slide.addText("🏆  PICK 등급 (누적 사용량 기준 · 적립률 상승)", { x: 0.85, y: 4.6, w: 11, h: 0.4, fontSize: 13, bold: true, color: C.purple });
  const grades = [
    { g: "🌱 SEED", c: "기본", r: "적립 1%" },
    { g: "🌿 SPROUT", c: "누적 1,000", r: "적립 1.5%" },
    { g: "🌳 TREE", c: "누적 5,000", r: "적립 2%" },
    { g: "🌲 FOREST", c: "누적 20,000", r: "적립 3% + 혜택" },
  ];
  grades.forEach((g, i) => {
    const x = 0.85 + i * 2.97;
    slide.addShape(prs.ShapeType.roundRect, { x, y: 5.1, w: 2.75, h: 1.25, fill: { color: C.bgMain }, line: { color: C.borderPurple }, rectRadius: 0.1 });
    slide.addText(g.g, { x, y: 5.22, w: 2.75, h: 0.4, fontSize: 13, bold: true, color: C.purpleDark, align: "center" });
    slide.addText(`${g.c} PICK\n${g.r}`, { x, y: 5.62, w: 2.75, h: 0.65, fontSize: 11, color: C.textSub, align: "center", lineSpacingMultiple: 1.1 });
  });
  footNote(slide, "⚠️ 테스트넷: PICK/π는 테스트용이며 실제 금전 가치가 없습니다.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 6 — 친구 초대 & PICK 배분 과정
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🎁  친구 초대", C.rosePale, C.roseLine, C.rose, "초대 코드 & PICK 보상 배분 과정");

  // 좌: 흐름
  steps(slide, [
    { t: "내 초대 코드 확인", d: "MyPICK → 초대 코드(8자리)를 복사해 파이오니어에게 공유." },
    { t: "상대가 코드 입력", d: "새 파이오니어가 가입 시 내 코드를 입력하면 연결돼요." },
    { t: "역할별 가입 보상 지급", d: "피초대자에게 역할별 PICK 지급 (아래 표)." },
    { t: "나에게 초대 보상 5,000", d: "1명당 5,000 PICK · 최대 5명까지 (총 25,000)." },
  ], 0.5, 1.15, 6.9, 4.4, C.rose, "FECDD3");

  // 우: 보상 표 + 조건
  slide.addShape(prs.ShapeType.roundRect, { x: 7.7, y: 1.15, w: 5.2, h: 2.6, fill: { color: C.white }, line: { color: C.roseLine }, rectRadius: 0.15 });
  slide.addText("💰  피초대자 역할별 가입 보상", { x: 7.9, y: 1.28, w: 4.8, h: 0.4, fontSize: 13, bold: true, color: C.rose });
  const rewards = [
    { r: "👤 일반 이용자", v: "+5,000 PICK" },
    { r: "🏪 사장님", v: "+20,000 PICK" },
    { r: "🛵 라이더", v: "+10,000 PICK" },
  ];
  rewards.forEach((rw, i) => {
    const y = 1.75 + i * 0.62;
    slide.addText(rw.r, { x: 8.0, y, w: 3.0, h: 0.5, fontSize: 13, bold: true, color: C.textDark, valign: "middle" });
    slide.addText(rw.v, { x: 10.9, y, w: 1.85, h: 0.5, fontSize: 14, bold: true, color: C.amber, align: "right", valign: "middle" });
  });

  slide.addShape(prs.ShapeType.roundRect, { x: 7.7, y: 3.95, w: 5.2, h: 1.6, fill: { color: C.amberPale }, line: { color: C.amberLine }, rectRadius: 0.15 });
  slide.addText("⏳  지급 시점", { x: 7.9, y: 4.08, w: 4.8, h: 0.4, fontSize: 13, bold: true, color: C.amber });
  slide.addText(
    "• 일반 이용자 → 코드 입력 즉시 지급\n• 사장님 → 가게 등록 + 첫 주문 완료 후\n• 라이더 → 첫 배달 완료 후",
    { x: 7.95, y: 4.5, w: 4.85, h: 1.0, fontSize: 12, color: C.textDark, lineSpacingMultiple: 1.25 },
  );

  // 하단 예시 흐름
  slide.addShape(prs.ShapeType.roundRect, { x: 0.5, y: 5.75, w: 12.4, h: 0.95, fill: { color: C.rosePale }, line: { color: C.roseLine }, rectRadius: 0.12 });
  slide.addText(
    "예시)  내가 A(일반)를 초대 → A 즉시 +5,000, 나 +5,000    |    B(사장님)를 초대 → B가 첫 주문 완료 시 B +20,000, 나 +5,000",
    { x: 0.7, y: 5.75, w: 12.0, h: 0.95, fontSize: 12.5, bold: true, color: C.rose, valign: "middle", lineSpacingMultiple: 1.1 },
  );
  footNote(slide, "'내가 받은 보상'은 실제 지급된 초대 보상 합계로 표시돼요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 7 — [사용자] 주문하기 ① 가게·메뉴 선택
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🛒  주문하기 ①", C.bluePale, C.blueLine, C.blue, "가게 고르고 메뉴 담기");

  steps(slide, [
    { t: "홈에서 카테고리 선택", d: "한식·치킨·피자·분식·카페 등 큼직한 카테고리 카드를 탭." },
    { t: "가게 선택", d: "평점·예상 시간·배달비를 보고 원하는 가게로 들어가요." },
    { t: "메뉴 담기", d: "메뉴를 누르고 옵션·수량 선택 후 장바구니에 담아요." },
    { t: "장바구니로 이동", d: "하단 장바구니에서 담은 메뉴와 금액을 확인." },
  ], 0.5, 1.15, 7.0, 5.4, C.blue, C.bluePale);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "홈 · 가게 상세 화면 캡처");
  footNote(slide, "가게 상세에서 '기본 배달비 + 거리 할증'과 예상 조리 시간을 미리 볼 수 있어요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 8 — [사용자] 주문하기 ② 장바구니·결제
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🛒  주문하기 ②", C.bluePale, C.blueLine, C.blue, "장바구니 · 혼합 결제 (현금 + π)");

  steps(slide, [
    { t: "배달 주소 입력", d: "주소를 넣으면 거리에 맞춘 배달비와 예상 도착 시간이 자동 표시돼요." },
    { t: "결제 수단: π 혼합", d: "테스트넷에서는 '현금 + π 테스트 토큰' 혼합 결제를 사용해요." },
    { t: "1π 테스트 가격·비율 설정", d: "1π의 테스트 가격과 현금 : π 비율(슬라이더)을 정하면 π 수량이 자동 계산." },
    { t: "결제 진행 → 주문 완료", d: "혼합 결제 버튼 → Pi로 테스트 결제 승인 → 주문 완료 화면." },
  ], 0.5, 1.15, 7.0, 5.4, C.blue, C.bluePale);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "장바구니 · 혼합 결제 화면 캡처");
  footNote(slide, "20km를 넘는 주소는 '배달 불가'로 안내돼요. PICK 토큰 결제는 준비 중입니다.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 9 — [사용자] 주문 추적
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "📦  주문 추적", C.bluePale, C.blueLine, C.blue, "실시간 주문 상태 따라가기");

  const stages = [
    { e: "🧾", t: "결제 확인", d: "주문 접수 대기" },
    { e: "✅", t: "주문 수락", d: "사장님이 확인" },
    { e: "🍳", t: "조리 중", d: "음식 준비" },
    { e: "🛵", t: "배달 중", d: "라이더 픽업·이동" },
    { e: "🎉", t: "배달 완료", d: "리뷰 작성 유도" },
  ];
  stages.forEach((s, i) => {
    const x = 0.55 + i * 2.55;
    slide.addShape(prs.ShapeType.roundRect, { x, y: 1.7, w: 2.3, h: 2.2, fill: { color: C.bluePale }, line: { color: C.blueLine }, rectRadius: 0.15 });
    slide.addText(s.e, { x, y: 1.95, w: 2.3, h: 0.85, fontSize: 34, align: "center" });
    slide.addText(s.t, { x, y: 2.85, w: 2.3, h: 0.45, fontSize: 14, bold: true, color: C.blue, align: "center" });
    slide.addText(s.d, { x, y: 3.3, w: 2.3, h: 0.5, fontSize: 11, color: C.textSub, align: "center" });
    if (i < stages.length - 1) {
      slide.addText("→", { x: x + 2.28, y: 1.7, w: 0.3, h: 2.2, fontSize: 20, bold: true, color: C.blueLine, align: "center", valign: "middle" });
    }
  });

  slide.addShape(prs.ShapeType.roundRect, { x: 0.55, y: 4.25, w: 12.35, h: 2.25, fill: { color: C.white }, line: { color: C.borderPurple }, rectRadius: 0.15 });
  slide.addText("💡  PICK주문 탭에서 할 수 있는 것", { x: 0.8, y: 4.4, w: 11, h: 0.4, fontSize: 13, bold: true, color: C.purple });
  slide.addText(
    "• 진행 중 주문의 실시간 상태 확인 (배달 중이면 라이더 위치 지도)\n" +
    "• 지난 주문 내역 보기 · 영수증(메뉴·금액·PICK 내역) 확인\n" +
    "• 같은 메뉴 빠른 재주문 · 주문 취소/환불 신청\n" +
    "• 배달 완료 후 리뷰 작성 → PICK 보상 적립",
    { x: 0.9, y: 4.85, w: 11.6, h: 1.5, fontSize: 13, color: C.textDark, lineSpacingMultiple: 1.35 },
  );
}

// ════════════════════════════════════════════════════════════
// 슬라이드 10 — [사장님] 가입 & 가게 등록
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🏪  사장님 ①", C.amberPale, C.amberLine, C.amber, "사장님 가입 & 가게 등록");

  steps(slide, [
    { t: "역할을 '사장님'으로", d: "역할 선택 또는 MyPICK에서 사장님으로 전환." },
    { t: "가게 정보 입력", d: "가게명·카테고리·주소·전화·소개를 입력." },
    { t: "사업자등록증 업로드", d: "사업자등록증 사진을 첨부해요. (승인 심사용)" },
    { t: "관리자 승인 대기", d: "심사중(대기) → 승인 시 영업 시작 / 반려 시 사유 안내." },
  ], 0.5, 1.15, 7.0, 5.4, C.amber, C.amberPale);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "가게 등록 폼 캡처");
  footNote(slide, "승인 상태는 3단계: ⏳ 심사중 · ✅ 승인 · ❌ 반려. 승인 후 손님에게 노출돼요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 11 — [사장님] 메뉴 등록 & 배달 설정
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🏪  사장님 ②", C.amberPale, C.amberLine, C.amber, "메뉴 등록 & 배달 설정");

  // 좌: 메뉴 등록
  slide.addShape(prs.ShapeType.roundRect, { x: 0.5, y: 1.15, w: 6.05, h: 5.35, fill: { color: C.white }, line: { color: C.amberLine }, rectRadius: 0.15 });
  slide.addText("🍽️  메뉴 등록", { x: 0.75, y: 1.3, w: 5.5, h: 0.45, fontSize: 15, bold: true, color: C.amber });
  slide.addText(
    "①  [메뉴 관리] → [메뉴 추가]\n\n" +
    "②  메뉴명 · 가격 · 설명 · 사진 입력\n\n" +
    "③  옵션 그룹 추가 (맵기·사이즈 등)\n\n" +
    "④  인기 메뉴 지정 · 품절 처리\n\n" +
    "⑤  순서 정렬 후 저장 → 손님에게 노출",
    { x: 0.85, y: 1.85, w: 5.4, h: 3.0, fontSize: 13, color: C.textDark, lineSpacingMultiple: 1.15 },
  );
  photoBox(slide, 0.85, 4.75, 5.35, 1.6, "메뉴 등록 화면 캡처");

  // 우: 배달 설정
  slide.addShape(prs.ShapeType.roundRect, { x: 6.75, y: 1.15, w: 6.15, h: 5.35, fill: { color: C.white }, line: { color: C.amberLine }, rectRadius: 0.15 });
  slide.addText("🛵  배달 설정 (거리 연동)", { x: 7.0, y: 1.3, w: 5.6, h: 0.45, fontSize: 15, bold: true, color: C.amber });
  slide.addText(
    "• 기본 배달비 + 기본 구간(km)\n" +
    "• 초과 거리 할증: N km당 +M원 (거리 비례)\n" +
    "   예) 기본 5km/2,000 · 2km당 1,000\n" +
    "        → 7km = 3,000 · 10km = 4,500원\n\n" +
    "• 서비스 반경(1~20km): 이 안에서만\n" +
    "   가게 노출 + 배달 (밖은 주문 불가)\n\n" +
    "• 예상 시간 = 조리 시간 + 거리×km당 이동\n\n" +
    "• 최소 주문금액 · 영업시간 · 휴무 설정",
    { x: 7.1, y: 1.85, w: 5.6, h: 3.4, fontSize: 12.5, color: C.textDark, lineSpacingMultiple: 1.2 },
  );
  slide.addText("💡 입력하면 '예상 배달비/시간 미리보기'로 바로 확인돼요.", { x: 7.1, y: 5.95, w: 5.6, h: 0.5, fontSize: 11.5, italic: true, color: C.amber });
}

// ════════════════════════════════════════════════════════════
// 슬라이드 12 — [사장님] 주문 관리
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🏪  사장님 ③", C.amberPale, C.amberLine, C.amber, "실시간 주문 관리");

  steps(slide, [
    { t: "신규 주문 알림", d: "새 주문이 오면 화면 배지 + 알림음(🔔)으로 즉시 알려줘요." },
    { t: "주문 수락 / 거절", d: "주문 내용을 확인하고 수락하면 조리 시작." },
    { t: "조리 완료 → 라이더 호출", d: "음식이 준비되면 '조리 완료' 처리 → 주변 라이더에게 배달 요청." },
    { t: "매출·정산 확인", d: "일/주/월 매출 통계와 PICK 정산을 대시보드에서 확인." },
  ], 0.5, 1.15, 7.0, 5.4, C.amber, C.amberPale);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "사장님 주문 관리 화면 캡처");
  footNote(slide, "🔔 알림음은 페이지에서 한 번 클릭(또는 종 버튼)하면 이후 자동으로 울려요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 13 — [라이더] 가입 & 서류 제출
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🛵  라이더 ①", C.tealPale, C.tealLine, C.teal, "라이더 가입 & 서류 제출");

  steps(slide, [
    { t: "역할을 '라이더'로", d: "역할 선택 또는 MyPICK에서 라이더로 전환." },
    { t: "배달 수단 선택", d: "자동차 · 오토바이 · 자전거 · 킥보드 중 선택." },
    { t: "서류 제출", d: "수단에 따라 필요한 서류 사진 업로드 (오른쪽 참고)." },
    { t: "승인 후 배달 시작", d: "심사중 → 승인되면 배달 요청을 받을 수 있어요." },
  ], 0.5, 1.15, 7.0, 4.0, C.teal, C.tealPale);

  // 서류 안내 박스
  slide.addShape(prs.ShapeType.roundRect, { x: 7.9, y: 1.15, w: 5.0, h: 4.0, fill: { color: C.white }, line: { color: C.tealLine }, rectRadius: 0.15 });
  slide.addText("📋  배달 수단별 필요 서류", { x: 8.1, y: 1.3, w: 4.6, h: 0.4, fontSize: 13, bold: true, color: C.teal });
  slide.addText(
    "🚗 자동차 · 🏍️ 오토바이\n" +
    "   • 운전면허증 / 신분증\n" +
    "   • 차량등록증\n" +
    "   • 보험가입증명서\n\n" +
    "🚲 자전거 · 🛴 킥보드\n" +
    "   • 신분증 또는 면허증",
    { x: 8.15, y: 1.8, w: 4.6, h: 3.2, fontSize: 13, color: C.textDark, lineSpacingMultiple: 1.3 },
  );
  photoBox(slide, 0.5, 5.35, 7.0, 1.15, "서류 제출 화면 캡처");
  footNote(slide, "서류 제출 후 관리자 검토를 거쳐 승인됩니다. 미승인 시 배달 요청이 오지 않아요.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 14 — [라이더] 배달 수행
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🛵  라이더 ②", C.tealPale, C.tealLine, C.teal, "배달 수행 & 수익");

  steps(slide, [
    { t: "온라인으로 전환", d: "대시보드에서 '온라인'을 켜면 주변 배달 요청을 받아요." },
    { t: "배달 요청 수락", d: "가게·거리·예상 수익을 보고 요청을 수락." },
    { t: "픽업 → 배달", d: "가게에서 음식 픽업 → 손님에게 이동(위치 실시간 공유) → 전달." },
    { t: "배달 완료 & 수익 적립", d: "완료 처리하면 PICK 수익 적립. 정산 신청 가능." },
  ], 0.5, 1.15, 7.0, 5.4, C.teal, C.tealPale);

  photoBox(slide, 7.9, 1.15, 5.0, 5.4, "라이더 대시보드 화면 캡처");
  footNote(slide, "가게 반경 안의 요청만 노출돼요. 10분간 미활동 시 자동 오프라인.");
}

// ════════════════════════════════════════════════════════════
// 슬라이드 15 — 하단 탭 & 자주 묻는 질문
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.bgMain };
  header(slide, "🧭  기본 화면", C.purplePale, C.purpleLight, C.purple, "하단 탭 & 자주 묻는 질문");

  const tabs = [
    { e: "🏠", t: "홈", d: "카테고리·가게 탐색" },
    { e: "💜", t: "지갑", d: "PICK 잔액·충전·전송" },
    { e: "📋", t: "PICK주문", d: "주문 내역·실시간 추적" },
    { e: "👤", t: "MyPICK", d: "내 정보·역할·초대·등급" },
  ];
  tabs.forEach((t, i) => {
    const x = 0.6 + i * 3.08;
    slide.addShape(prs.ShapeType.roundRect, { x, y: 1.65, w: 2.85, h: 1.75, fill: { color: C.purplePale }, line: { color: C.purpleLight }, rectRadius: 0.15 });
    slide.addText(t.e, { x, y: 1.8, w: 2.85, h: 0.7, fontSize: 30, align: "center" });
    slide.addText(t.t, { x, y: 2.5, w: 2.85, h: 0.4, fontSize: 14, bold: true, color: C.purple, align: "center" });
    slide.addText(t.d, { x, y: 2.9, w: 2.85, h: 0.45, fontSize: 11, color: C.textSub, align: "center" });
  });

  slide.addShape(prs.ShapeType.roundRect, { x: 0.6, y: 3.65, w: 12.3, h: 2.85, fill: { color: C.white }, line: { color: C.borderPurple }, rectRadius: 0.15 });
  slide.addText("❓  자주 묻는 질문", { x: 0.85, y: 3.8, w: 11, h: 0.4, fontSize: 14, bold: true, color: C.purple });
  slide.addText(
    [
      { text: "Q. 로그인은 어떻게 하나요?\n", options: { bold: true, color: C.textDark } },
      { text: "A. Pi Browser의 [Pi Browser로 로그인]을 이용하세요. 카카오·이메일은 개발자 검토·테스트용입니다.\n\n", options: { color: C.textSub } },
      { text: "Q. PICK 토큰은 어떻게 모으나요?\n", options: { bold: true, color: C.textDark } },
      { text: "A. 출석 체크(하루 50), 친구 초대(1명 5,000), 리뷰 작성, 주문 적립으로 모을 수 있어요.\n\n", options: { color: C.textSub } },
      { text: "Q. 결제는 진짜 돈인가요?\n", options: { bold: true, color: C.textDark } },
      { text: "A. 아니요. 지금은 Pi 테스트넷 단계로, π·PICK 모두 테스트용이며 실제 금전 가치가 없습니다.", options: { color: C.textSub } },
    ],
    { x: 0.9, y: 4.25, w: 11.9, h: 2.1, fontSize: 12.5, lineSpacingMultiple: 1.15 },
  );
}

// ════════════════════════════════════════════════════════════
// 슬라이드 16 — 마무리
// ════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();
  slide.background = { color: C.purpleDark };
  slide.addShape(prs.ShapeType.ellipse, { x: -1.0, y: -1.2, w: 3.2, h: 3.2, fill: { color: C.purple }, line: { color: C.purple } });
  slide.addShape(prs.ShapeType.ellipse, { x: 10.8, y: 5.0, w: 3.0, h: 3.0, fill: { color: C.purple }, line: { color: C.purple } });

  slide.addText("🎉", { x: 5.66, y: 0.9, w: 2, h: 1.2, fontSize: 52, align: "center" });
  slide.addText("이제 PICK PICK을 즐겨보세요!", {
    x: 1, y: 2.1, w: 11.33, h: 1.0, fontSize: 36, bold: true, color: C.white, align: "center",
  });

  const recap = [
    "π  Pi Browser로 로그인하고 역할을 선택",
    "🛒  가게 → 메뉴 → 장바구니 → 혼합 결제(현금+π)",
    "🏪  사장님: 가게·메뉴 등록 후 승인받고 영업",
    "🛵  라이더: 서류 제출 후 승인받고 배달",
    "🎁  친구를 초대하고 PICK 보상 함께 받기",
  ];
  recap.forEach((t, i) => {
    slide.addText(t, { x: 2.7, y: 3.35 + i * 0.56, w: 8, h: 0.5, fontSize: 15, color: "DDD6FE" });
  });

  slide.addShape(prs.ShapeType.rect, { x: 3.7, y: 6.35, w: 6.0, h: 0.035, fill: { color: C.purpleLight }, line: { color: C.purpleLight } });
  slide.addText("PICK PICK · Pi 생태계 전용 배달 서비스  (Pi 테스트넷)", {
    x: 1, y: 6.5, w: 11.33, h: 0.5, fontSize: 13, color: "C4B5FD", align: "center",
  });
}

// ── 저장 ─────────────────────────────────────────────────────
const outPath = "./PICKPICK_사용설명서.pptx";
await prs.writeFile({ fileName: outPath });
console.log(`✅ 사용설명서 PPT 생성 완료: ${outPath}`);
