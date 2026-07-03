/**
 * CryptON × PICK PICK 배달 플랫폼 발표 자료
 * 출력: C:\Users\LG\OneDrive\Desktop\Business\프로젝트 발표 자료\CryptON_PICKPICK_발표자료.pptx
 */
import PptxGenJS from "pptxgenjs";
import path from "path";

const prs = new PptxGenJS();
prs.layout = "LAYOUT_WIDE"; // 16:9  (33.87 × 19.05 cm)

// ── 컬러 팔레트 ────────────────────────────────────────────────
const C = {
  purpleDeep:  "3B0764",
  purpleDark:  "4C1D95",
  purple:      "6B21A8",
  purpleMid:   "7C3AED",
  purpleLight: "A855F7",
  purplePale:  "EDE9FE",
  purpleTint:  "F5F3FF",
  yellow:      "D97706",
  yellowLight: "FCD34D",
  yellowPale:  "FEF9C3",
  white:       "FFFFFF",
  offWhite:    "FAF5FF",
  textDark:    "1F1235",
  textSub:     "6B7280",
  textLight:   "9CA3AF",
  green:       "059669",
  greenPale:   "D1FAE5",
  red:         "DC2626",
  redPale:     "FEE2E2",
  orange:      "EA580C",
  orangePale:  "FED7AA",
  slate:       "1E293B",
  border:      "DDD6FE",
  piGold:      "F59E0B",
};

// ── 로고 경로 ──────────────────────────────────────────────────
const LOGO_CRYPTON   = "C:/Users/LG/OneDrive/Desktop/Business/회사로고/CryptoON_회사로고.jpg";
const LOGO_PICKPICK  = "C:/Users/LG/OneDrive/Desktop/Business/브랜드로고/PickPick logo.jpg";
const OUTPUT_PATH    = "C:/Users/LG/OneDrive/Desktop/Business/프로젝트 발표 자료/CryptON_PICKPICK_발표자료.pptx";

// ── 공통 헬퍼 ─────────────────────────────────────────────────
function addBgRect(slide, color = C.purpleDark) {
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color } });
}

function sectionBadge(slide, text, x = 0.4, y = 0.28) {
  slide.addShape(prs.ShapeType.roundRect, {
    x, y, w: 2.0, h: 0.38, fill: { color: C.yellow }, rectRadius: 0.12,
  });
  slide.addText(text, {
    x, y, w: 2.0, h: 0.38,
    fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
  });
}

function logoRow(slide, y = 18.4) {
  // 슬라이드 하단 로고 줄
  slide.addImage({ path: LOGO_CRYPTON,  x: 0.4, y, w: 1.6, h: 0.5, sizing: { type: "contain", w: 1.6, h: 0.5 } });
  slide.addImage({ path: LOGO_PICKPICK, x: 2.3, y, w: 1.6, h: 0.5, sizing: { type: "contain", w: 1.6, h: 0.5 } });
}

function divider(slide, x, y, w, color = C.yellow) {
  slide.addShape(prs.ShapeType.rect, { x, y, w, h: 0.05, fill: { color } });
}

function statBox(slide, emoji, value, label, x, y, w = 2.8, accent = C.yellow) {
  slide.addShape(prs.ShapeType.roundRect, {
    x, y, w, h: 2.2, fill: { color: C.purpleDark }, rectRadius: 0.2,
    line: { color: accent, width: 2 },
  });
  slide.addText(emoji, { x, y: y + 0.18, w, h: 0.7, fontSize: 30, align: "center" });
  slide.addText(value, { x, y: y + 0.85, w, h: 0.7, fontSize: 28, bold: true, color: accent, align: "center" });
  slide.addText(label, { x, y: y + 1.5,  w, h: 0.55, fontSize: 11, color: C.purpleLight, align: "center", wrap: true });
}

function techCard(slide, icon, title, points, x, y, w = 3.5, h = 3.6) {
  slide.addShape(prs.ShapeType.roundRect, {
    x, y, w, h, fill: { color: C.purpleDark }, rectRadius: 0.2,
    line: { color: C.purpleLight, width: 1.5 },
  });
  slide.addText(icon + "  " + title, {
    x: x + 0.2, y: y + 0.22, w: w - 0.4, h: 0.5,
    fontSize: 14, bold: true, color: C.white,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: x + 0.2, y: y + 0.72, w: w - 0.4, h: 0.03, fill: { color: C.purpleLight },
  });
  points.forEach((pt, i) => {
    slide.addText("▸  " + pt, {
      x: x + 0.25, y: y + 0.88 + i * 0.52, w: w - 0.5, h: 0.45,
      fontSize: 11, color: C.purplePale, bullet: false, wrap: true,
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 1 ── 타이틀
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();

  // 배경 그라데이션 (직사각형 레이어)
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.slate } });
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "60%",  h: "100%", fill: { color: C.purpleDeep } });

  // 장식 원
  sl.addShape(prs.ShapeType.ellipse, { x: -1.2, y: -1.2, w: 5, h: 5, fill: { color: C.purple }, line: { color: C.purple } });
  sl.addShape(prs.ShapeType.ellipse, { x: 7.5,  y: 12,   w: 8, h: 8, fill: { color: C.purpleDark }, line: { color: C.purpleDark } });

  // 로고
  sl.addImage({ path: LOGO_CRYPTON,  x: 0.7, y: 0.6, w: 2.2, h: 0.7, sizing: { type: "contain", w: 2.2, h: 0.7 } });
  sl.addImage({ path: LOGO_PICKPICK, x: 3.3, y: 0.5, w: 2.8, h: 0.9, sizing: { type: "contain", w: 2.8, h: 0.9 } });

  // × 구분자
  sl.addText("×", { x: 2.85, y: 0.52, w: 0.5, h: 0.8, fontSize: 28, color: C.yellow, bold: true, align: "center" });

  // 메인 타이틀
  sl.addText("PICK PICK", {
    x: 0.6, y: 2.0, w: 9, h: 2.0,
    fontSize: 80, bold: true, color: C.white,
    charSpacing: 4,
  });
  sl.addText("배달 플랫폼", {
    x: 0.6, y: 3.7, w: 9, h: 1.2,
    fontSize: 46, bold: true, color: C.yellowLight,
  });

  divider(sl, 0.6, 5.1, 6.5);

  sl.addText("Pi Network 생태계 기반  ·  PICK 토큰 경제  ·  자영업자 상생 플랫폼", {
    x: 0.6, y: 5.3, w: 9.5, h: 0.6,
    fontSize: 16, color: C.purpleLight, italic: true,
  });

  // 우측 스택 정보
  sl.addShape(prs.ShapeType.roundRect, {
    x: 11.2, y: 1.5, w: 4.5, h: 8.0, fill: { color: C.purpleDark }, rectRadius: 0.25,
    line: { color: C.purpleLight, width: 1.5 },
  });
  sl.addText("🛠  Tech Stack", {
    x: 11.4, y: 1.8, w: 4.1, h: 0.55, fontSize: 14, bold: true, color: C.yellow,
  });
  [
    "⚡  Next.js 14  (App Router)",
    "🗄  Supabase  (DB + Auth + Realtime)",
    "🗺  Kakao Maps API",
    "🔷  Pi Network SDK",
    "💜  PICK 토큰 시스템",
    "☁️  Vercel 배포",
    "🔔  Firebase FCM",
  ].forEach((item, i) => {
    sl.addText(item, {
      x: 11.4, y: 2.55 + i * 0.88, w: 4.1, h: 0.7,
      fontSize: 12.5, color: C.purplePale, bold: i === 0,
    });
  });

  // 발표자 정보
  sl.addText("CryptON 대표  |  2026", {
    x: 0.6, y: 17.8, w: 6, h: 0.5,
    fontSize: 13, color: C.textSub, italic: true,
  });

  // 우측 하단 Pi 심볼
  sl.addText("π", {
    x: 14.5, y: 14.5, w: 2.5, h: 2.5,
    fontSize: 120, color: C.purpleLight, bold: true, align: "center",
    transparency: 60,
  });
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 2 ── SECTION 1  문제 정의
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });

  sectionBadge(sl, "SECTION 01", 0.5, 0.28);
  sl.addText("문제 정의 & 기획 의도", {
    x: 2.8, y: 0.18, w: 10, h: 0.9,
    fontSize: 30, bold: true, color: C.white,
  });
  sl.addImage({ path: LOGO_CRYPTON, x: 14.5, y: 0.15, w: 1.8, h: 0.6, sizing: { type: "contain", w: 1.8, h: 0.6 } });

  // 중앙 타이틀
  sl.addText("자영업자의 숨겨진 비용", {
    x: 0.5, y: 1.5, w: 15.5, h: 1.2,
    fontSize: 42, bold: true, color: C.yellowLight, align: "center",
  });
  sl.addText("배달 플랫폼 수수료가 소상공인을 짓누르고 있습니다", {
    x: 0.5, y: 2.55, w: 15.5, h: 0.6,
    fontSize: 18, color: C.purpleLight, align: "center", italic: true,
  });

  // 수수료 비교 카드
  const feeData = [
    { name: "배달의민족", fee: "15~27%", color: C.orange, emoji: "😰" },
    { name: "쿠팡이츠",   fee: "15~35%", color: C.red,    emoji: "😱" },
    { name: "요기요",     fee: "12~27%", color: C.orange, emoji: "😰" },
    { name: "PICK PICK",  fee: "4%",     color: C.green,  emoji: "🎉" },
  ];

  feeData.forEach((d, i) => {
    const x = 0.5 + i * 3.9;
    const isPickPick = d.name === "PICK PICK";
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: 3.4, w: 3.5, h: 4.8,
      fill: { color: isPickPick ? C.purpleDark : C.slate },
      line: { color: isPickPick ? C.yellow : d.color, width: isPickPick ? 3 : 1.5 },
      rectRadius: 0.2,
    });
    sl.addText(d.emoji, { x, y: 3.6, w: 3.5, h: 0.8, fontSize: 36, align: "center" });
    sl.addText(d.name, {
      x, y: 4.45, w: 3.5, h: 0.55,
      fontSize: 15, bold: true, color: isPickPick ? C.yellowLight : C.white, align: "center",
    });
    sl.addText(d.fee, {
      x, y: 5.1, w: 3.5, h: 1.1,
      fontSize: 36, bold: true, color: d.color, align: "center",
    });
    sl.addText("수수료", { x, y: 6.2, w: 3.5, h: 0.4, fontSize: 12, color: C.textSub, align: "center" });
    if (isPickPick) {
      sl.addShape(prs.ShapeType.roundRect, {
        x: x + 0.4, y: 7.0, w: 2.7, h: 0.55, fill: { color: C.yellow }, rectRadius: 0.15,
      });
      sl.addText("→ 약 31% 절감!", {
        x: x + 0.4, y: 7.0, w: 2.7, h: 0.55,
        fontSize: 13, bold: true, color: C.purpleDeep, align: "center", valign: "middle",
      });
    }
  });

  // 하단 포인트
  sl.addText("💡  \"왜 Pi Network인가?\"", {
    x: 0.5, y: 8.6, w: 15.5, h: 0.6,
    fontSize: 20, bold: true, color: C.yellow, align: "center",
  });
  sl.addText("Pi Network는 3,500만 파이오니어가 구축한 Web3 생태계 — 수수료 없는 P2P 결제 인프라가 이미 존재합니다",
    {
      x: 0.5, y: 9.3, w: 15.5, h: 0.6,
      fontSize: 14, color: C.purpleLight, align: "center",
    }
  );

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 3 ── SECTION 1  페인포인트 상세
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 01", 0.5, 0.28);
  sl.addText("기획 의도 — Why PICK PICK?", {
    x: 2.8, y: 0.18, w: 12, h: 0.9, fontSize: 30, bold: true, color: C.white,
  });

  // 왼쪽: 문제
  sl.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 1.5, w: 7.3, h: 8.8,
    fill: { color: C.purpleDark }, line: { color: C.red, width: 2 }, rectRadius: 0.25,
  });
  sl.addText("😰  기존 문제점", {
    x: 0.7, y: 1.75, w: 6.7, h: 0.65, fontSize: 20, bold: true, color: C.red,
  });
  [
    { t: "높은 수수료", d: "배달앱 플랫폼 15~35% + PG수수료 2~3.5% → 총 18~38% 부담" },
    { t: "광고비 강요", d: "노출을 위해 별도 광고비 지출 필수, 중소 자영업자 역차별" },
    { t: "현금흐름 문제", d: "정산 주기 2주~1개월, 자금 운용에 심각한 제약" },
    { t: "플랫폼 종속", d: "고객 데이터 없음, 플랫폼 정책 변경 시 속수무책" },
  ].forEach((item, i) => {
    sl.addText("✗  " + item.t, {
      x: 0.7, y: 2.65 + i * 1.78, w: 6.7, h: 0.5,
      fontSize: 15, bold: true, color: C.yellowLight,
    });
    sl.addText(item.d, {
      x: 0.9, y: 3.15 + i * 1.78, w: 6.5, h: 0.75,
      fontSize: 12, color: C.purplePale, wrap: true,
    });
    if (i < 3) {
      sl.addShape(prs.ShapeType.rect, { x: 0.7, y: 4.35 + i * 1.78, w: 6.5, h: 0.02, fill: { color: C.purpleMid } });
    }
  });

  // 오른쪽: 솔루션
  sl.addShape(prs.ShapeType.roundRect, {
    x: 8.1, y: 1.5, w: 7.7, h: 8.8,
    fill: { color: C.purpleDark }, line: { color: C.green, width: 2 }, rectRadius: 0.25,
  });
  sl.addText("🚀  PICK PICK 솔루션", {
    x: 8.4, y: 1.75, w: 7.1, h: 0.65, fontSize: 20, bold: true, color: C.green,
  });
  [
    { t: "수수료 4%",        d: "PICK 토큰 기반 결제로 플랫폼 수수료 최소화, 자영업자 순익 극대화" },
    { t: "Pi 생태계 노출",   d: "3,500만 파이오니어 네트워크 내 자동 노출, 광고비 부담 제로" },
    { t: "즉시 정산",        d: "PICK 토큰 즉시 지급, 블록체인 기반 투명한 정산 시스템" },
    { t: "고객 데이터 소유", d: "가맹점이 직접 고객 데이터 관리, CRM 활용 가능" },
  ].forEach((item, i) => {
    sl.addText("✓  " + item.t, {
      x: 8.4, y: 2.65 + i * 1.78, w: 7.1, h: 0.5,
      fontSize: 15, bold: true, color: C.yellowLight,
    });
    sl.addText(item.d, {
      x: 8.6, y: 3.15 + i * 1.78, w: 6.9, h: 0.75,
      fontSize: 12, color: C.purplePale, wrap: true,
    });
    if (i < 3) {
      sl.addShape(prs.ShapeType.rect, { x: 8.4, y: 4.35 + i * 1.78, w: 6.9, h: 0.02, fill: { color: C.purpleMid } });
    }
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 4 ── SECTION 2  솔루션 아키텍처
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 02", 0.5, 0.28);
  sl.addText("솔루션 아키텍처 — PICK PICK 전체 구조", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 28, bold: true, color: C.white,
  });

  // 3개 레이어: 사용자 / 앱 / 인프라
  const layers = [
    {
      title: "👤  사용자 레이어 (3 역할)",
      color: C.purpleMid,
      items: ["일반 사용자\n주문·결제·리뷰", "가맹점 사장님\n메뉴·주문관리·정산", "라이더\n배달수락·GPS추적"],
    },
    {
      title: "⚡  앱 레이어 (Next.js 14)",
      color: C.purple,
      items: ["홈 탭\n카테고리·검색·매장", "지갑 탭\nPICK 토큰·Pi 결제", "주문 탭\n실시간 트래킹·리뷰"],
    },
    {
      title: "🗄  인프라 레이어 (Supabase + Pi)",
      color: C.purpleDark,
      items: ["PostgreSQL\n주문·사용자·메뉴 DB", "Realtime\n실시간 상태 동기화", "Pi SDK\n결제·인증 연동"],
    },
  ];

  layers.forEach((layer, li) => {
    const y = 1.55 + li * 3.0;
    sl.addShape(prs.ShapeType.roundRect, {
      x: 0.3, y, w: 15.7, h: 2.75,
      fill: { color: layer.color }, rectRadius: 0.18,
      line: { color: C.purpleLight, width: 1 },
    });
    sl.addText(layer.title, {
      x: 0.6, y: y + 0.18, w: 4.5, h: 0.55,
      fontSize: 14, bold: true, color: C.white,
    });
    layer.items.forEach((item, ii) => {
      const bx = 5.2 + ii * 3.6;
      sl.addShape(prs.ShapeType.roundRect, {
        x: bx, y: y + 0.3, w: 3.2, h: 2.1,
        fill: { color: C.purpleDeep }, rectRadius: 0.15,
        line: { color: C.purpleLight, width: 1 },
      });
      sl.addText(item, {
        x: bx + 0.1, y: y + 0.55, w: 3.0, h: 1.6,
        fontSize: 12.5, color: C.purplePale, align: "center", valign: "middle",
        wrap: true, bold: false,
      });
    });

    if (li < 2) {
      sl.addText("▼", {
        x: 7.5, y: y + 2.78, w: 1.3, h: 0.5,
        fontSize: 20, color: C.yellow, align: "center",
      });
    }
  });

  // 하단 기술 태그
  const tags = ["Next.js 14", "TypeScript", "Supabase", "Kakao Maps", "Pi SDK", "Zustand", "TanStack Query", "Vercel", "FCM"];
  tags.forEach((tag, i) => {
    const tx = 0.5 + (i % 5) * 3.2;
    const ty = 10.4 + Math.floor(i / 5) * 0.75;
    sl.addShape(prs.ShapeType.roundRect, {
      x: tx, y: ty, w: 2.8, h: 0.5, fill: { color: C.purpleDark }, rectRadius: 0.15,
      line: { color: C.purpleLight, width: 1 },
    });
    sl.addText(tag, { x: tx, y: ty, w: 2.8, h: 0.5, fontSize: 11, color: C.purpleLight, align: "center", valign: "middle", bold: true });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 5 ── SECTION 3  배운 내용 적용 (인트로)
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.purpleDeep);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.slate } });
  sectionBadge(sl, "SECTION 03", 0.5, 0.28);
  sl.addText("배운 내용의 적용 — How We Built It", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 28, bold: true, color: C.white,
  });

  sl.addText("배운 것  →  적용  →  결과", {
    x: 0, y: 1.6, w: "100%", h: 1.0,
    fontSize: 36, bold: true, color: C.yellow, align: "center",
  });
  sl.addText("각 기술을 실제 서비스에 어떻게 녹여냈는가", {
    x: 0, y: 2.55, w: "100%", h: 0.6,
    fontSize: 16, color: C.purpleLight, align: "center", italic: true,
  });

  divider(sl, 2, 3.3, 12, C.yellow);

  const techs = [
    { icon: "⚡", name: "Next.js 14\nApp Router",    col: C.purpleMid },
    { icon: "🗄", name: "Supabase\nRLS + Realtime",  col: C.purple },
    { icon: "🗺", name: "Kakao Maps\n지도 API",      col: C.purpleDark },
    { icon: "💜", name: "PICK 토큰\n경제 설계",      col: C.purpleMid },
    { icon: "π", name: "Pi SDK\n결제 통합",          col: C.purple },
    { icon: "⚙️", name: "Zustand\n상태관리",         col: C.purpleDark },
  ];

  techs.forEach((t, i) => {
    const x = 0.6 + (i % 3) * 5.2;
    const y = 4.0 + Math.floor(i / 3) * 3.3;
    sl.addShape(prs.ShapeType.roundRect, {
      x, y, w: 4.6, h: 2.8,
      fill: { color: t.col }, rectRadius: 0.2,
      line: { color: C.purpleLight, width: 1.5 },
    });
    sl.addText(t.icon, { x, y: y + 0.35, w: 4.6, h: 0.9, fontSize: 34, align: "center" });
    sl.addText(t.name, {
      x, y: y + 1.3, w: 4.6, h: 1.1,
      fontSize: 14, bold: true, color: C.white, align: "center",
    });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 6 ── SECTION 3  Next.js 14 적용
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 03", 0.5, 0.28);
  sl.addText("⚡  Next.js 14 App Router 적용", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 28, bold: true, color: C.white,
  });

  const cols = [
    {
      head: "📚  배운 것",
      color: C.purpleLight,
      items: [
        "App Router 기반 파일 시스템 라우팅",
        "Server Component vs Client Component 분리",
        "Route Groups으로 레이아웃 분리",
        "Server Actions & API Route Handlers",
        "next/image 최적화",
      ],
    },
    {
      head: "🔨  적용 사례",
      color: C.yellow,
      items: [
        "(user) / (owner) / (rider) 3개 Route Group",
        "'use client' 최소화 — 서버 컴포넌트 우선",
        "각 역할별 독립 레이아웃 + 하단 탭 분리",
        "/api/orders, /api/wallet 등 REST API 구현",
        "메뉴 이미지 Supabase Storage → 자동 최적화",
      ],
    },
    {
      head: "✅  결과",
      color: C.green,
      items: [
        "3개 역할(사용자/사장님/라이더) URL 완전 분리",
        "초기 로딩 50%↓ (서버 컴포넌트 활용)",
        "코드 충돌 없이 병렬 개발 가능한 구조",
        "타입 안전 API 14개 라우트 구축",
        "이미지 WebP 자동 변환, LCP 개선",
      ],
    },
  ];

  cols.forEach((col, i) => {
    const x = 0.4 + i * 5.3;
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: 1.5, w: 5.0, h: 8.8,
      fill: { color: C.purpleDark }, rectRadius: 0.2,
      line: { color: col.color, width: 2 },
    });
    sl.addText(col.head, {
      x: x + 0.2, y: 1.7, w: 4.6, h: 0.6,
      fontSize: 16, bold: true, color: col.color,
    });
    sl.addShape(prs.ShapeType.rect, {
      x: x + 0.2, y: 2.35, w: 4.6, h: 0.04, fill: { color: col.color },
    });
    col.items.forEach((item, j) => {
      sl.addText("•  " + item, {
        x: x + 0.25, y: 2.55 + j * 1.45, w: 4.6, h: 1.3,
        fontSize: 12, color: C.purplePale, wrap: true, valign: "top",
      });
    });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 7 ── SECTION 3  Supabase RLS + Realtime
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 03", 0.5, 0.28);
  sl.addText("🗄  Supabase — RLS 다중 역할 보안 + Realtime", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 26, bold: true, color: C.white,
  });

  // RLS 다이어그램
  sl.addText("Row Level Security (RLS) 역할별 접근 제어", {
    x: 0.4, y: 1.5, w: 9, h: 0.6, fontSize: 17, bold: true, color: C.yellow,
  });

  const roles = [
    { role: "👤 사용자",   rules: ["본인 주문만 조회", "본인 지갑만 접근", "전체 가맹점 조회 가능"] },
    { role: "🏪 사장님",   rules: ["자기 가게만 수정", "자기 가게 주문만 조회", "메뉴 CRUD 권한"] },
    { role: "🛵 라이더",   rules: ["수락한 배달만 접근", "위치 정보 업데이트", "배달 완료 처리"] },
  ];
  roles.forEach((r, i) => {
    const y = 2.3 + i * 2.1;
    sl.addShape(prs.ShapeType.roundRect, {
      x: 0.4, y, w: 8.6, h: 1.85,
      fill: { color: C.purpleDark }, rectRadius: 0.15, line: { color: C.purpleLight, width: 1 },
    });
    sl.addText(r.role, { x: 0.65, y: y + 0.18, w: 2.2, h: 0.55, fontSize: 14, bold: true, color: C.yellowLight });
    r.rules.forEach((rule, j) => {
      sl.addText("→  " + rule, {
        x: 2.7, y: y + 0.15 + j * 0.55, w: 6.1, h: 0.5,
        fontSize: 11.5, color: C.purplePale,
      });
    });
  });

  // Realtime 설명
  sl.addText("Supabase Realtime — 실시간 주문 추적", {
    x: 9.5, y: 1.5, w: 6.3, h: 0.6, fontSize: 17, bold: true, color: C.yellow,
  });
  const realtimeItems = [
    { ch: "order:{orderId}", desc: "주문 상태 실시간 변경\n사용자·사장님·라이더 동시 수신" },
    { ch: "store:{storeId}:orders", desc: "사장님 신규 주문 알림\n알림음 + 뱃지 업데이트" },
    { ch: "rider:{riderId}:location", desc: "라이더 GPS 실시간 위치\n배달 중 고객에게 노출" },
    { ch: "user:{userId}:notifications", desc: "개인 알림 수신\nFCM 연동 푸시 알림" },
  ];
  realtimeItems.forEach((item, i) => {
    sl.addShape(prs.ShapeType.roundRect, {
      x: 9.5, y: 2.25 + i * 1.72, w: 6.3, h: 1.55,
      fill: { color: C.purpleDark }, rectRadius: 0.15, line: { color: C.purpleMid, width: 1 },
    });
    sl.addText(item.ch, {
      x: 9.7, y: 2.4 + i * 1.72, w: 5.9, h: 0.45,
      fontSize: 11, bold: true, color: C.purpleLight, fontFace: "Courier New",
    });
    sl.addText(item.desc, {
      x: 9.7, y: 2.85 + i * 1.72, w: 5.9, h: 0.8,
      fontSize: 11, color: C.purplePale, wrap: true,
    });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 8 ── SECTION 3  PICK 토큰 + Pi SDK
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 03", 0.5, 0.28);
  sl.addText("💜  PICK 토큰 경제 + π  Pi SDK 결제 통합", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 26, bold: true, color: C.white,
  });

  // PICK 토큰 순환도
  sl.addText("PICK 토큰 생태계 순환", {
    x: 0.4, y: 1.55, w: 7.5, h: 0.6, fontSize: 18, bold: true, color: C.yellow,
  });

  const tokenFlow = [
    { icon: "🛒", label: "주문 결제", sub: "PICK으로 결제" },
    { icon: "⭐", label: "리뷰 보상", sub: "리뷰 작성 시 PICK 적립" },
    { icon: "🎁", label: "친구 초대", sub: "레퍼럴 50 PICK 보상" },
    { icon: "📊", label: "등급 상승", sub: "SEED→SPROUT→TREE→FOREST" },
  ];
  tokenFlow.forEach((tf, i) => {
    const x = 0.4 + (i % 2) * 3.8;
    const y = 2.35 + Math.floor(i / 2) * 2.6;
    sl.addShape(prs.ShapeType.roundRect, {
      x, y, w: 3.4, h: 2.25,
      fill: { color: C.purpleDark }, rectRadius: 0.2, line: { color: C.yellow, width: 1.5 },
    });
    sl.addText(tf.icon, { x, y: y + 0.22, w: 3.4, h: 0.65, fontSize: 26, align: "center" });
    sl.addText(tf.label, { x, y: y + 0.88, w: 3.4, h: 0.5, fontSize: 14, bold: true, color: C.yellowLight, align: "center" });
    sl.addText(tf.sub, { x, y: y + 1.38, w: 3.4, h: 0.65, fontSize: 11, color: C.purplePale, align: "center", wrap: true });
  });

  // PICK 등급
  const grades = [
    { g: "🌱 SEED",   c: "기본", r: "적립 1%",   color: C.green },
    { g: "🌿 SPROUT", c: "1,000 PICK",  r: "적립 1.5%", color: C.purpleLight },
    { g: "🌳 TREE",   c: "5,000 PICK",  r: "적립 2%",   color: C.yellow },
    { g: "🌲 FOREST", c: "20,000 PICK", r: "적립 3%+",  color: C.piGold },
  ];
  grades.forEach((gr, i) => {
    sl.addShape(prs.ShapeType.roundRect, {
      x: 0.4 + i * 1.9, y: 7.8, w: 1.7, h: 2.2,
      fill: { color: C.purpleDark }, rectRadius: 0.15, line: { color: gr.color, width: 2 },
    });
    sl.addText(gr.g,  { x: 0.4 + i * 1.9, y: 7.95, w: 1.7, h: 0.55, fontSize: 11, color: gr.color, align: "center", bold: true });
    sl.addText(gr.c,  { x: 0.4 + i * 1.9, y: 8.5,  w: 1.7, h: 0.45, fontSize: 10, color: C.textSub, align: "center" });
    sl.addText(gr.r,  { x: 0.4 + i * 1.9, y: 8.95, w: 1.7, h: 0.8,  fontSize: 13, bold: true, color: gr.color, align: "center" });
  });

  // Pi SDK 오른쪽
  sl.addText("π  Pi SDK 결제 통합", {
    x: 8.3, y: 1.55, w: 7.5, h: 0.6, fontSize: 18, bold: true, color: C.purpleLight,
  });

  const piSteps = [
    { n: "1", t: "Pi.init()", d: "sandbox 모드 초기화\nMainnet 전환 시 env 변수 하나만 변경" },
    { n: "2", t: "Pi.authenticate()", d: "payments scope 인증\n미완료 결제 자동 복구 처리" },
    { n: "3", t: "Pi.createPayment()", d: "결제 생성 + 콜백 등록\n/api/pi/approve 서버 승인" },
    { n: "4", t: "/api/pi/complete", d: "블록체인 txid 확인 후 완료 처리\n주문 상태 confirmed 업데이트" },
  ];
  piSteps.forEach((ps, i) => {
    sl.addShape(prs.ShapeType.roundRect, {
      x: 8.3, y: 2.35 + i * 1.88, w: 7.5, h: 1.65,
      fill: { color: C.purpleDark }, rectRadius: 0.15, line: { color: C.purpleLight, width: 1 },
    });
    sl.addShape(prs.ShapeType.ellipse, {
      x: 8.5, y: 2.5 + i * 1.88, w: 0.55, h: 0.55, fill: { color: C.purpleMid },
    });
    sl.addText(ps.n, { x: 8.5, y: 2.5 + i * 1.88, w: 0.55, h: 0.55, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle" });
    sl.addText(ps.t, { x: 9.2, y: 2.48 + i * 1.88, w: 5.5, h: 0.5, fontSize: 13, bold: true, color: C.yellow, fontFace: "Courier New" });
    sl.addText(ps.d, { x: 9.2, y: 2.98 + i * 1.88, w: 6.4, h: 0.9, fontSize: 11, color: C.purplePale, wrap: true });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 9 ── SECTION 4  트러블슈팅
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 04", 0.5, 0.28);
  sl.addText("개발 과정 & 트러블슈팅", {
    x: 2.8, y: 0.18, w: 12, h: 0.9, fontSize: 30, bold: true, color: C.white,
  });

  sl.addText("🔥  실제 부딪힌 문제 — 깊이 있게 들여다보기", {
    x: 0.5, y: 1.55, w: 15.5, h: 0.65, fontSize: 20, bold: true, color: C.yellow, align: "center",
  });

  // 케이스 1: RLS 다중 역할
  sl.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 2.4, w: 15.5, h: 4.1,
    fill: { color: C.purpleDark }, rectRadius: 0.2, line: { color: C.orange, width: 2 },
  });
  sl.addText("CASE 01  ·  Supabase RLS 다중 역할 설계 충돌", {
    x: 0.65, y: 2.58, w: 14, h: 0.6, fontSize: 17, bold: true, color: C.orange,
  });

  sl.addShape(prs.ShapeType.roundRect, {
    x: 0.65, y: 3.3, w: 4.5, h: 2.9,
    fill: { color: C.slate }, rectRadius: 0.12, line: { color: C.red, width: 1 },
  });
  sl.addText("😱  문제 상황", { x: 0.85, y: 3.45, w: 4.1, h: 0.45, fontSize: 13, bold: true, color: C.red });
  sl.addText("사용자·사장님·라이더가 같은 orders 테이블을 조회할 때 RLS 정책이 충돌. 사용자가 다른 사람 주문 데이터를 볼 수 있는 보안 취약점 발생.",
    { x: 0.85, y: 3.95, w: 4.1, h: 1.85, fontSize: 11, color: C.purplePale, wrap: true });

  sl.addShape(prs.ShapeType.roundRect, {
    x: 5.55, y: 3.3, w: 4.5, h: 2.9,
    fill: { color: C.slate }, rectRadius: 0.12, line: { color: C.yellow, width: 1 },
  });
  sl.addText("🔍  원인 분석", { x: 5.75, y: 3.45, w: 4.1, h: 0.45, fontSize: 13, bold: true, color: C.yellow });
  sl.addText("단일 SELECT 정책에서 역할 분기 없이 auth.uid() 비교만 수행. 라이더가 수락한 주문은 user_id가 라이더가 아니어서 조회 불가 문제도 동시 발생.",
    { x: 5.75, y: 3.95, w: 4.1, h: 1.85, fontSize: 11, color: C.purplePale, wrap: true });

  sl.addShape(prs.ShapeType.roundRect, {
    x: 10.45, y: 3.3, w: 5.2, h: 2.9,
    fill: { color: C.slate }, rectRadius: 0.12, line: { color: C.green, width: 1 },
  });
  sl.addText("✅  해결", { x: 10.65, y: 3.45, w: 4.8, h: 0.45, fontSize: 13, bold: true, color: C.green });
  sl.addText("역할별 분리 정책 3개 생성:\n① user: user_id = auth.uid()\n② owner: store의 owner_id = auth.uid()\n③ rider: rider_id = auth.uid()\n→ 각 역할이 자신의 범위만 접근",
    { x: 10.65, y: 3.95, w: 4.8, h: 1.85, fontSize: 11, color: C.purplePale, wrap: true });

  // 케이스 2: Zustand
  sl.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 6.8, w: 15.5, h: 3.6,
    fill: { color: C.purpleDark }, rectRadius: 0.2, line: { color: C.purpleLight, width: 2 },
  });
  sl.addText("CASE 02  ·  Zustand cartStore 무한 렌더링 & 장바구니 초기화 타이밍", {
    x: 0.65, y: 6.97, w: 14, h: 0.6, fontSize: 16, bold: true, color: C.purpleLight,
  });

  const c2 = [
    { head: "😱  문제",  col: C.red,    text: "장바구니 상태 변경 시 매 렌더마다 새 객체 생성 → 무한 useEffect 루프. Pi 결제 후 cart.clearCart() 타이밍 오류로 lastOrder가 빈값." },
    { head: "🔍  원인",  col: C.yellow, text: "selector에서 객체 리터럴 반환 → 참조 변경으로 리렌더 폭발. Pi checkout 페이지로 이동 전 clearCart()를 호출해 데이터 손실." },
    { head: "✅  해결",  col: C.green,  text: "개별 primitive selector로 분리 후 shallow 비교 적용. clearCart()를 결제 성공 콜백 이후로 이동, lastOrder 저장 후 호출." },
  ];
  c2.forEach((item, i) => {
    sl.addShape(prs.ShapeType.roundRect, {
      x: 0.65 + i * 5.2, y: 7.6, w: 4.9, h: 2.5,
      fill: { color: C.slate }, rectRadius: 0.12, line: { color: item.col, width: 1 },
    });
    sl.addText(item.head, { x: 0.85 + i * 5.2, y: 7.72, w: 4.5, h: 0.45, fontSize: 13, bold: true, color: item.col });
    sl.addText(item.text, { x: 0.85 + i * 5.2, y: 8.2, w: 4.5, h: 1.7, fontSize: 10.5, color: C.purplePale, wrap: true });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 10 ── SECTION 5  기대 효과 & 로드맵
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "SECTION 05", 0.5, 0.28);
  sl.addText("기대 효과 & 로드맵 — 교육 끝나도 계속 갑니다", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 26, bold: true, color: C.white,
  });

  // 정량 효과 4개
  const stats = [
    { emoji: "📉", val: "35% → 4%",   label: "가맹점 수수료\n절감 효과",    accent: C.green },
    { emoji: "👥", val: "3,500만",    label: "Pi Network\n잠재 사용자",     accent: C.purpleLight },
    { emoji: "💜", val: "100억 개",   label: "PICK 토큰\n총 발행 한도",     accent: C.yellow },
    { emoji: "🌏", val: "KaaS",       label: "타 생태계\n라이선스 확장",    accent: C.piGold },
  ];
  stats.forEach((s, i) => {
    statBox(sl, s.emoji, s.val, s.label, 0.4 + i * 4.0, 1.6, 3.6, s.accent);
  });

  // 로드맵 타임라인
  sl.addText("🗺  개발 로드맵", {
    x: 0.4, y: 4.1, w: 15.5, h: 0.6, fontSize: 18, bold: true, color: C.yellow,
  });

  const phases = [
    {
      phase: "Phase 1",
      period: "MVP (완료)",
      color: C.green,
      items: ["3역할 인증·온보딩", "가맹점 메뉴·주문", "PICK 토큰 지갑", "실시간 주문 추적", "라이더 배달 관리"],
    },
    {
      phase: "Phase 2",
      period: "안정화 (2026 Q3)",
      color: C.yellow,
      items: ["리뷰·평점 + PICK 보상", "PICK 등급 시스템", "라이더 실시간 지도", "FCM 푸시 알림", "쿠폰·프로모션"],
    },
    {
      phase: "Phase 3",
      period: "성장 (2026 Q4)",
      color: C.purpleLight,
      items: ["카카오페이 연동", "관리자 대시보드", "광고 노출 시스템", "다크모드 지원", "PWA 오프라인"],
    },
    {
      phase: "Phase 4",
      period: "Pi Mainnet 연동",
      color: C.piGold,
      items: ["Pi SDK 실서비스", "Pi 코인 실결제", "PICK ↔ Pi 전환", "KaaS 라이선스", "블록체인 정산"],
    },
  ];

  phases.forEach((ph, i) => {
    const x = 0.4 + i * 4.0;
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: 4.85, w: 3.65, h: 5.35,
      fill: { color: C.purpleDark }, rectRadius: 0.18,
      line: { color: ph.color, width: 2.5 },
    });
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: 4.85, w: 3.65, h: 0.9,
      fill: { color: ph.color }, rectRadius: 0.18,
    });
    sl.addText(ph.phase, { x, y: 4.9, w: 3.65, h: 0.42, fontSize: 14, bold: true, color: C.white, align: "center" });
    sl.addText(ph.period, { x, y: 5.32, w: 3.65, h: 0.35, fontSize: 10, color: C.white, align: "center" });
    ph.items.forEach((item, j) => {
      sl.addText("•  " + item, {
        x: x + 0.2, y: 5.95 + j * 0.82, w: 3.25, h: 0.72,
        fontSize: 11, color: C.purplePale, wrap: true,
      });
    });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 11 ── Day 19·20  관리자 & 운영 시스템 강화
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "DAY 19·20", 0.5, 0.28);
  sl.addText("2026-07-03 개발 현황 ① — 관리자 & 운영 시스템 강화", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 24, bold: true, color: C.white,
  });

  const features = [
    {
      icon: "📋", title: "라이더 서류 심사 플로우", color: C.purpleLight,
      items: [
        "신분증·차량등록증·보험증명서 업로드",
        "차량 유형별 요구 서류 자동 분기",
        "서류 변경 시 재심사 자동 트리거",
        "관리자 서류 이미지 뷰어 (in-page)",
      ],
    },
    {
      icon: "🔐", title: "3상태 승인 시스템", color: C.yellow,
      items: [
        "null = ⏳ 심사중 (황색 뱃지)",
        "true = ✅ 승인됨 (녹색 뱃지)",
        "false = ❌ 반려됨 (적색 뱃지)",
        "가게·라이더 동일 패턴 적용",
      ],
    },
    {
      icon: "🚫", title: "미승인 라이더 배달 차단", color: C.orange,
      items: [
        "온라인 전환 API 403 차단",
        "배달 가능 주문 목록 빈 배열 반환",
        "라이더 레이아웃 미승인 배너 표시",
        "관리자 승인 후 자동 활성화",
      ],
    },
    {
      icon: "📄", title: "사업자등록증 필수화", color: C.green,
      items: [
        "가게 등록 폼 파일 업로드 UI 추가",
        "업로드 완료 전 등록 버튼 비활성",
        "관리자 심사 카드에 이미지 표시",
        "Supabase Storage 저장 (public)",
      ],
    },
  ];

  features.forEach((feat, i) => {
    const x = 0.4 + i * 3.98;
    sl.addShape(prs.ShapeType.roundRect, {
      x, y: 1.55, w: 3.65, h: 7.5,
      fill: { color: C.purpleDark }, rectRadius: 0.2,
      line: { color: feat.color, width: 2 },
    });
    sl.addText(feat.icon, { x, y: 1.75, w: 3.65, h: 0.7, fontSize: 30, align: "center" });
    sl.addText(feat.title, {
      x: x + 0.15, y: 2.5, w: 3.35, h: 0.75,
      fontSize: 13, bold: true, color: feat.color, align: "center", wrap: true,
    });
    sl.addShape(prs.ShapeType.rect, { x: x + 0.2, y: 3.32, w: 3.25, h: 0.04, fill: { color: feat.color } });
    feat.items.forEach((item, j) => {
      sl.addText("▸  " + item, {
        x: x + 0.2, y: 3.5 + j * 1.2, w: 3.3, h: 1.05,
        fontSize: 11, color: C.purplePale, wrap: true,
      });
    });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 12 ── Day 19·20  배달 인프라 & UX 강화
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  addBgRect(sl, C.slate);
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.3, fill: { color: C.purpleDeep } });
  sectionBadge(sl, "DAY 19·20", 0.5, 0.28);
  sl.addText("2026-07-03 개발 현황 ② — 배달 인프라 & UX 강화", {
    x: 2.8, y: 0.18, w: 13, h: 0.9, fontSize: 24, bold: true, color: C.white,
  });

  // 왼쪽: 거리별 배달비 (큰 카드)
  sl.addShape(prs.ShapeType.roundRect, {
    x: 0.4, y: 1.55, w: 7.6, h: 8.0,
    fill: { color: C.purpleDark }, rectRadius: 0.2,
    line: { color: C.yellow, width: 2 },
  });
  sl.addText("🗺  거리별 배달비 구역 시스템", {
    x: 0.65, y: 1.78, w: 7.1, h: 0.6, fontSize: 17, bold: true, color: C.yellow,
  });
  sl.addShape(prs.ShapeType.rect, { x: 0.65, y: 2.42, w: 7.1, h: 0.04, fill: { color: C.yellow } });

  const zoneItems = [
    { icon: "🗄", t: "DB 설계",           d: "delivery_zones 테이블 (store_id, min_km, max_km, delivery_fee)" },
    { icon: "📡", t: "Haversine 거리 계산", d: "주문 시 매장↔배달지 직선 거리 계산 → 구역 자동 매칭" },
    { icon: "🔌", t: "API 구현",          d: "GET·PUT /api/stores/[id]/delivery-zones 엔드포인트" },
    { icon: "🏪", t: "사장님 설정 UI",    d: "가게 설정 > 거리별 배달비 섹션 (구역 추가·삭제·저장)" },
    { icon: "🛒", t: "주문 연동",         d: "구역 없으면 기본값, 있으면 거리 계산 후 배달비 자동 적용" },
    { icon: "🚫", t: "배달 불가 차단",    d: "최대 반경 초과 시 주문 생성 단계 API에서 즉시 차단" },
  ];
  zoneItems.forEach((it, i) => {
    sl.addText(it.icon + "  " + it.t, {
      x: 0.65, y: 2.6 + i * 1.12, w: 7.1, h: 0.45,
      fontSize: 12, bold: true, color: C.yellowLight,
    });
    sl.addText(it.d, {
      x: 0.85, y: 3.05 + i * 1.12, w: 6.9, h: 0.55,
      fontSize: 11, color: C.purplePale, wrap: true,
    });
  });

  // 오른쪽: 3개 소카드
  const rightCards = [
    {
      icon: "🛵", title: "차량 유형 확장", color: C.purpleLight,
      items: ["오토바이·자전거·킥보드·자동차(신규)", "차량은 오토바이와 동일 서류 3종 요구", "DB enum 제약 조건 정비"],
    },
    {
      icon: "🖼", title: "<dialog> 서류 뷰어", color: C.green,
      items: ["브라우저 top-layer 모달 — z-index 무관", "페이지 이탈 없이 전체화면 이미지 확인", "ESC / 화면 탭으로 닫기 지원"],
    },
    {
      icon: "📞", title: "주문 전화번호 검증", color: C.orange,
      items: ["전화번호 미등록 시 주문 API 차단", "장바구니 UI 인라인 입력창 자동 노출", "역할 전환 시 영업·위치 자동 비활성"],
    },
  ];

  rightCards.forEach((card, i) => {
    const y = 1.55 + i * 2.68;
    sl.addShape(prs.ShapeType.roundRect, {
      x: 8.35, y, w: 7.55, h: 2.42,
      fill: { color: C.purpleDark }, rectRadius: 0.18,
      line: { color: card.color, width: 1.5 },
    });
    sl.addText(card.icon + "  " + card.title, {
      x: 8.6, y: y + 0.2, w: 7.05, h: 0.5,
      fontSize: 14, bold: true, color: card.color,
    });
    sl.addShape(prs.ShapeType.rect, { x: 8.6, y: y + 0.74, w: 7.0, h: 0.03, fill: { color: card.color } });
    card.items.forEach((item, j) => {
      sl.addText("▸  " + item, {
        x: 8.65, y: y + 0.9 + j * 0.5, w: 7.0, h: 0.45,
        fontSize: 11, color: C.purplePale, wrap: true,
      });
    });
  });

  logoRow(sl);
}

// ══════════════════════════════════════════════════════════════
//  SLIDE 13 ── 클로징
// ══════════════════════════════════════════════════════════════
{
  const sl = prs.addSlide();
  sl.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.purpleDeep } });
  sl.addShape(prs.ShapeType.ellipse, { x: -2, y: -2, w: 10, h: 10, fill: { color: C.purple } });
  sl.addShape(prs.ShapeType.ellipse, { x: 10, y: 10, w: 12, h: 12, fill: { color: C.purpleDark } });

  sl.addImage({ path: LOGO_CRYPTON,  x: 0.8, y: 0.6, w: 2.4, h: 0.8, sizing: { type: "contain", w: 2.4, h: 0.8 } });
  sl.addImage({ path: LOGO_PICKPICK, x: 3.7, y: 0.5, w: 3.0, h: 1.0, sizing: { type: "contain", w: 3.0, h: 1.0 } });
  sl.addText("×", { x: 3.3, y: 0.52, w: 0.5, h: 0.9, fontSize: 28, color: C.yellow, bold: true, align: "center" });

  sl.addText("수수료 35% → 4%", {
    x: 0, y: 2.5, w: "100%", h: 1.3,
    fontSize: 60, bold: true, color: C.white, align: "center",
  });
  sl.addText("자영업자와 파이오니어가 함께 만드는 배달 생태계", {
    x: 0, y: 3.95, w: "100%", h: 0.8,
    fontSize: 22, color: C.purpleLight, align: "center",
  });

  divider(sl, 3, 5.0, 10, C.yellow);

  const kws = ["PICK PICK 배달앱", "Pi Network 연동", "PICK 토큰 경제", "KaaS 확장", "자영업자 상생"];
  kws.forEach((kw, i) => {
    const tx = 1.5 + i * 3.0;
    sl.addShape(prs.ShapeType.roundRect, {
      x: tx, y: 5.3, w: 2.7, h: 0.6, fill: { color: C.purpleDark }, rectRadius: 0.18,
      line: { color: C.purpleLight, width: 1 },
    });
    sl.addText(kw, { x: tx, y: 5.3, w: 2.7, h: 0.6, fontSize: 11, color: C.purpleLight, align: "center", valign: "middle" });
  });

  sl.addText("🙏  감사합니다", {
    x: 0, y: 7.0, w: "100%", h: 2.5,
    fontSize: 72, bold: true, color: C.yellowLight, align: "center",
  });

  sl.addText("pick-pick-delivery.vercel.app", {
    x: 0, y: 9.8, w: "100%", h: 0.7,
    fontSize: 18, color: C.purpleLight, align: "center", italic: true,
  });

  sl.addText("π", {
    x: 13.5, y: 13.5, w: 3, h: 3,
    fontSize: 140, color: C.purpleLight, bold: true, align: "center", transparency: 65,
  });
}

// ── 저장 ──────────────────────────────────────────────────────
prs.writeFile({ fileName: OUTPUT_PATH })
  .then(() => console.log("✅  PPT 생성 완료:", OUTPUT_PATH))
  .catch((e) => console.error("❌ 오류:", e));
