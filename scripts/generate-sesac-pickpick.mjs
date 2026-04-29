import PptxGenJS from "pptxgenjs";

const prs = new PptxGenJS();
prs.layout = "LAYOUT_WIDE";

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
  blue:        "1D4ED8",
  bluePale:    "DBEAFE",
  blueLight:   "3B82F6",
  gray:        "F3F4F6",
  grayText:    "374151",
  sky:         "0EA5E9",
  skyPale:     "E0F2FE",
};

// ── 슬라이드 1 — 타이틀 ───────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.purpleDark };

  // 배경 장식 원
  s.addShape(prs.ShapeType.ellipse, { x: 9.5, y: -1.0, w: 3.5, h: 3.5, fill: { color: C.purple }, line: { color: C.purple } });
  s.addShape(prs.ShapeType.ellipse, { x: -1.0, y: 5.0, w: 2.8, h: 2.8, fill: { color: C.purple }, line: { color: C.purple } });
  s.addShape(prs.ShapeType.ellipse, { x: 0.5, y: -0.8, w: 1.5, h: 1.5, fill: { color: C.purpleLight }, line: { color: C.purpleLight } });

  // 이모지
  s.addText("🎓  →  🛵", { x: 1, y: 0.6, w: 11.6, h: 1.0, fontSize: 44, align: "center" });

  // 메인 타이틀
  s.addText("배운 것이 현실이 되다", {
    x: 1, y: 1.55, w: 11.6, h: 1.0,
    fontSize: 42, bold: true, color: C.white, align: "center", fontFace: "Arial",
  });

  // 서브타이틀
  s.addText("SESAC 도봉 수업 → PICK PICK 배달앱 개발", {
    x: 1, y: 2.55, w: 11.6, h: 0.6,
    fontSize: 22, color: C.yellowLight, align: "center", fontFace: "Arial",
  });

  // 구분선
  s.addShape(prs.ShapeType.rect, { x: 3.5, y: 3.25, w: 6.6, h: 0.04, fill: { color: C.purpleLight }, line: { color: C.purpleLight } });

  // 설명
  s.addText("수업에서 익힌 패턴들이 어떻게 실제 서비스로 이어졌는지 보여드립니다", {
    x: 1, y: 3.4, w: 11.6, h: 0.5,
    fontSize: 14, color: "C4B5FD", align: "center", italic: true,
  });

  // 하단 배지
  const badges = ["Zustand", "JWT / RBAC", "계층화 아키텍처", "ORM → DB 설계", "Axios 인터셉터", "SSE 스트리밍"];
  badges.forEach((b, i) => {
    s.addShape(prs.ShapeType.roundRect, {
      x: 0.4 + i * 2.05, y: 4.1, w: 1.9, h: 0.42,
      fill: { color: C.purple }, line: { color: C.purpleLight },
      rectRadius: 0.1,
    });
    s.addText(b, {
      x: 0.4 + i * 2.05, y: 4.1, w: 1.9, h: 0.42,
      fontSize: 10, bold: true, color: C.white, align: "center",
    });
  });

  // 날짜
  s.addText("2025", {
    x: 0.4, y: 5.0, w: 2, h: 0.3,
    fontSize: 11, color: "7C3AED", align: "left",
  });
}

// ── 슬라이드 2 — 목차 ────────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: C.purple }, line: { color: C.purple } });
  s.addText("📋  목차", { x: 0.4, y: 0.1, w: 6, h: 0.7, fontSize: 22, bold: true, color: C.white });

  const items = [
    { num: "01", title: "Zustand 상태관리", sub: "장바구니 & 인증 스토어", emoji: "🗃️", color: C.purple, pale: C.purplePale },
    { num: "02", title: "JWT + 역할 기반 인증", sub: "RBAC 미들웨어 (4역할)", emoji: "🔐", color: C.blue, pale: C.bluePale },
    { num: "03", title: "계층화 아키텍처", sub: "Router → Service → Repository", emoji: "🏗️", color: C.orange, pale: C.orangePale },
    { num: "04", title: "ORM 관계 설계", sub: "1:N / M:N → Supabase 스키마", emoji: "🗄️", color: C.green, pale: C.greenPale },
    { num: "05", title: "Axios 인터셉터", sub: "자동 인증 → Supabase Client", emoji: "🔗", color: "7C3AED", pale: "F3E8FF" },
    { num: "06", title: "SSE 스트리밍", sub: "AI Chat → 실시간 주문 알림", emoji: "⚡", color: C.sky, pale: C.skyPale },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 6.5;
    const y = 1.1 + row * 1.4;

    s.addShape(prs.ShapeType.roundRect, { x, y, w: 6.2, h: 1.2, fill: { color: C.white }, line: { color: item.pale, w: 2 }, rectRadius: 0.15 });
    s.addShape(prs.ShapeType.roundRect, { x: x + 0.15, y: y + 0.25, w: 0.7, h: 0.7, fill: { color: item.pale }, line: { color: item.pale }, rectRadius: 0.1 });
    s.addText(item.emoji, { x: x + 0.15, y: y + 0.22, w: 0.7, h: 0.7, fontSize: 20, align: "center" });
    s.addText(item.num, { x: x + 0.95, y: y + 0.12, w: 0.5, h: 0.35, fontSize: 11, bold: true, color: item.color });
    s.addText(item.title, { x: x + 0.95, y: y + 0.35, w: 5.0, h: 0.35, fontSize: 14, bold: true, color: C.textDark });
    s.addText(item.sub, { x: x + 0.95, y: y + 0.68, w: 5.0, h: 0.3, fontSize: 11, color: C.textSub });
  });

  s.addShape(prs.ShapeType.rect, { x: 0, y: 5.15, w: 13.33, h: 0.35, fill: { color: C.purplePale }, line: { color: C.purplePale } });
  s.addText("SESAC 도봉 풀스택 과정 → PICK PICK (유저·사장님·라이더 3역할 실시간 배달 플랫폼)", {
    x: 0.4, y: 5.17, w: 12.5, h: 0.3, fontSize: 11, color: C.purple, align: "center",
  });
}

// ── 슬라이드 3 — Zustand ──────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: C.purple }, line: { color: C.purple } });
  s.addText("🗃️  01  Zustand 상태관리", { x: 0.4, y: 0.12, w: 9, h: 0.65, fontSize: 22, bold: true, color: C.white });
  s.addShape(prs.ShapeType.roundRect, { x: 10.5, y: 0.12, w: 2.5, h: 0.62, fill: { color: C.purpleLight }, line: { color: C.purpleLight }, rectRadius: 0.1 });
  s.addText("장바구니 & 인증", { x: 10.5, y: 0.12, w: 2.5, h: 0.62, fontSize: 11, bold: true, color: C.white, align: "center" });

  // 화살표 라벨
  s.addText("SESAC 수업", { x: 0.4, y: 1.0, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.purple, align: "center" });
  s.addText("PICK PICK 적용", { x: 7.2, y: 1.0, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.green, align: "center" });

  // 왼쪽 코드 박스 (SESAC)
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 1.35, w: 5.9, h: 3.1, fill: { color: "1E1E2E" }, line: { color: C.purple, w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "// useCartStore.js\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "const ", options: { color: "C084FC", fontSize: 9 } },
    { text: "useCartStore ", options: { color: "60A5FA", fontSize: 9 } },
    { text: "= create((set) => ({\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  items: [],\n", options: { color: "34D399", fontSize: 9 } },
    { text: "  addItem: (product) => set((state) => {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    const existing = state.items\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      .find(i => i.id === product.id);\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    return {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      items: existing\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "        ? state.items.map(i =>\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "            i.id === product.id\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "            ? {...i, qty: i.qty+1} : i)\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "        : [...state.items, product]\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    };\n  })\n}));", options: { color: "E2E8F0", fontSize: 9 } },
  ], { x: 0.45, y: 1.42, w: 5.65, h: 3.0, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 화살표
  s.addShape(prs.ShapeType.rect, { x: 6.3, y: 2.75, w: 0.7, h: 0.06, fill: { color: C.yellow }, line: { color: C.yellow } });
  s.addText("→", { x: 6.25, y: 2.55, w: 0.8, h: 0.45, fontSize: 28, color: C.yellow, align: "center", bold: true });

  // 오른쪽 코드 박스 (PICK PICK)
  s.addShape(prs.ShapeType.roundRect, { x: 7.2, y: 1.35, w: 5.9, h: 3.1, fill: { color: "1E1E2E" }, line: { color: C.green, w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "// stores/cartStore.ts\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "const ", options: { color: "C084FC", fontSize: 9 } },
    { text: "useCartStore ", options: { color: "60A5FA", fontSize: 9 } },
    { text: "= create((set) => ({\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  items: [],\n", options: { color: "34D399", fontSize: 9 } },
    { text: "  addItem: (storeInfo, menu) =>\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    set((state) => {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    const existing = state.items\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      .find(i => i.menuId===menu.menuId);\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    return {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      items: existing\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "        ? state.items.map(i =>\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "            i.menuId===menu.menuId\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "            ? {...i, qty:i.qty+1} : i)\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "        : [...state.items,{...menu,qty:1}]\n    };\n  })\n}));", options: { color: "E2E8F0", fontSize: 9 } },
  ], { x: 7.35, y: 1.42, w: 5.65, h: 3.0, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 연결 포인트
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 4.55, w: 12.7, h: 0.6, fill: { color: C.purplePale }, line: { color: C.purple, w: 1 }, rectRadius: 0.1 });
  s.addText("💡  같은 가게 체크 → 수량 증가, 새 메뉴 → 추가 패턴이 동일. Zustand의 불변 업데이트 원칙을 수업에서 익혀 PICK PICK 장바구니에 그대로 적용.", {
    x: 0.5, y: 4.58, w: 12.3, h: 0.52, fontSize: 11, color: C.purple,
  });
}

// ── 슬라이드 4 — JWT + RBAC ──────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("🔐  02  JWT 인증 + 역할 기반 접근 제어", { x: 0.4, y: 0.12, w: 9, h: 0.65, fontSize: 22, bold: true, color: C.white });
  s.addShape(prs.ShapeType.roundRect, { x: 10.0, y: 0.12, w: 3.0, h: 0.62, fill: { color: "3B82F6" }, line: { color: "3B82F6" }, rectRadius: 0.1 });
  s.addText("RBAC 미들웨어", { x: 10.0, y: 0.12, w: 3.0, h: 0.62, fontSize: 11, bold: true, color: C.white, align: "center" });

  // 왼쪽 - SESAC
  s.addText("SESAC 수업", { x: 0.4, y: 1.0, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.blue, align: "center" });
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 1.35, w: 5.9, h: 2.8, fill: { color: "1E1E2E" }, line: { color: "3B82F6", w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "# auth_service.py (FastAPI)\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "def ", options: { color: "C084FC", fontSize: 9 } },
    { text: "login", options: { color: "60A5FA", fontSize: 9 } },
    { text: "(self, db, data):\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  user = user_repo.find_by_email(\n    db, data.email)\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  if ", options: { color: "C084FC", fontSize: 9 } },
    { text: "bcrypt.checkpw(pw, user.password):\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    token = jwt.encode({\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: '      "sub": user.id,\n', options: { color: "34D399", fontSize: 9 } },
    { text: '      "role": user.role\n', options: { color: "34D399", fontSize: 9 } },
    { text: "    }, SECRET_KEY)\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "    return token\n\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "# 역할 확인\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "if ", options: { color: "C084FC", fontSize: 9 } },
    { text: 'user.role != "admin":\n', options: { color: "E2E8F0", fontSize: 9 } },
    { text: '    raise ForbiddenError()', options: { color: "F87171", fontSize: 9 } },
  ], { x: 0.45, y: 1.42, w: 5.65, h: 2.7, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 화살표
  s.addText("→", { x: 6.25, y: 2.55, w: 0.8, h: 0.45, fontSize: 28, color: C.yellow, align: "center", bold: true });

  // 오른쪽 - PICK PICK
  s.addText("PICK PICK 적용", { x: 7.2, y: 1.0, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.green, align: "center" });
  s.addShape(prs.ShapeType.roundRect, { x: 7.2, y: 1.35, w: 5.9, h: 2.8, fill: { color: "1E1E2E" }, line: { color: C.green, w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "// middleware.ts (Next.js)\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "const ", options: { color: "C084FC", fontSize: 9 } },
    { text: "ROUTE_PERMISSIONS ", options: { color: "60A5FA", fontSize: 9 } },
    { text: "= {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  '/owner': ", options: { color: "34D399", fontSize: 9 } },
    { text: "['owner','admin'],\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "  '/rider': ", options: { color: "34D399", fontSize: 9 } },
    { text: "['rider','admin'],\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "  '/admin': ", options: { color: "34D399", fontSize: 9 } },
    { text: "['admin'],\n};\n\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "// 로그인 후 역할별 리다이렉트\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "if ", options: { color: "C084FC", fontSize: 9 } },
    { text: "(role === 'admin')\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  router.replace('/admin/dashboard');\n", options: { color: "34D399", fontSize: 9 } },
    { text: "else if ", options: { color: "C084FC", fontSize: 9 } },
    { text: "(role === 'owner')\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  router.replace('/owner/dashboard');\n", options: { color: "34D399", fontSize: 9 } },
    { text: "else if ", options: { color: "C084FC", fontSize: 9 } },
    { text: "(role === 'rider')\n  router.replace('/rider/...');", options: { color: "E2E8F0", fontSize: 9 } },
  ], { x: 7.35, y: 1.42, w: 5.65, h: 2.7, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 4역할 배지
  const roles = ["👤 user", "🏪 owner", "🛵 rider", "⚙️ admin"];
  const rColors = [C.green, C.orange, C.sky, C.purple];
  roles.forEach((r, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 0.3 + i * 3.15, y: 4.25, w: 2.9, h: 0.5, fill: { color: rColors[i] }, line: { color: rColors[i] }, rectRadius: 0.1 });
    s.addText(r, { x: 0.3 + i * 3.15, y: 4.25, w: 2.9, h: 0.5, fontSize: 14, bold: true, color: C.white, align: "center" });
  });

  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 4.85, w: 12.7, h: 0.45, fill: { color: C.bluePale }, line: { color: C.blue, w: 1 }, rectRadius: 0.1 });
  s.addText("💡  수업의 JWT role 개념 → PICK PICK에서 4역할(user/owner/rider/admin) + Next.js 미들웨어 + httpOnly 쿠키 3단 보안으로 발전", {
    x: 0.5, y: 4.87, w: 12.3, h: 0.4, fontSize: 11, color: C.blue,
  });
}

// ── 슬라이드 5 — 계층화 아키텍처 ───────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: C.orange }, line: { color: C.orange } });
  s.addText("🏗️  03  계층화 아키텍처", { x: 0.4, y: 0.12, w: 9, h: 0.65, fontSize: 22, bold: true, color: C.white });
  s.addShape(prs.ShapeType.roundRect, { x: 9.8, y: 0.12, w: 3.2, h: 0.62, fill: { color: "F97316" }, line: { color: "F97316" }, rectRadius: 0.1 });
  s.addText("Router→Service→Repo", { x: 9.8, y: 0.12, w: 3.2, h: 0.62, fontSize: 10, bold: true, color: C.white, align: "center" });

  // SESAC 진화 흐름
  s.addText("SESAC 수업 — 4단계 진화", { x: 0.4, y: 1.0, w: 12.5, h: 0.35, fontSize: 13, bold: true, color: C.orange });

  const stages = [
    { name: "mysite\n(기본)", desc: "단일 파일\nCRUD", color: "FED7AA" },
    { name: "mysite2\n(Pydantic)", desc: "스키마\n분리", color: "FDBA74" },
    { name: "mysite3\n(Repository)", desc: "DB 계층\n분리", color: "FB923C" },
    { name: "mysite4\n(완전 레이어)", desc: "프로덕션\n레벨", color: "EA580C" },
  ];

  stages.forEach((st, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 0.3 + i * 3.1, y: 1.4, w: 2.8, h: 1.0, fill: { color: st.color }, line: { color: st.color }, rectRadius: 0.12 });
    s.addText(st.name, { x: 0.3 + i * 3.1, y: 1.4, w: 2.8, h: 0.55, fontSize: 11, bold: true, color: C.textDark, align: "center" });
    s.addText(st.desc, { x: 0.3 + i * 3.1, y: 1.9, w: 2.8, h: 0.45, fontSize: 10, color: C.textDark, align: "center" });
    if (i < 3) s.addText("→", { x: 3.15 + i * 3.1, y: 1.65, w: 0.2, h: 0.4, fontSize: 18, color: C.orange, align: "center", bold: true });
  });

  // mysite4 상세
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 2.55, w: 5.9, h: 2.6, fill: { color: C.white }, line: { color: C.orange, w: 2 }, rectRadius: 0.15 });
  s.addText("mysite4 구조", { x: 0.5, y: 2.65, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.orange });
  const layers = [
    { name: "routers/", desc: "API 엔드포인트", color: "FED7AA" },
    { name: "services/", desc: "비즈니스 로직", color: "FDBA74" },
    { name: "repositories/", desc: "데이터 접근", color: "FB923C" },
    { name: "schemas/", desc: "요청/응답 검증 (Pydantic)", color: "FCA5A5" },
  ];
  layers.forEach((l, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 0.5, y: 3.05 + i * 0.48, w: 5.5, h: 0.38, fill: { color: l.color }, line: { color: l.color }, rectRadius: 0.08 });
    s.addText(`${l.name}  →  ${l.desc}`, { x: 0.65, y: 3.05 + i * 0.48, w: 5.3, h: 0.38, fontSize: 11, bold: i === 0, color: C.textDark });
  });

  // 화살표
  s.addText("→", { x: 6.3, y: 3.4, w: 0.7, h: 0.5, fontSize: 28, color: C.yellow, align: "center", bold: true });

  // PICK PICK 적용
  s.addShape(prs.ShapeType.roundRect, { x: 7.1, y: 2.55, w: 5.9, h: 2.6, fill: { color: C.white }, line: { color: C.green, w: 2 }, rectRadius: 0.15 });
  s.addText("PICK PICK API Route 구조", { x: 7.3, y: 2.65, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.green });
  const ppLayers = [
    { name: "app/api/orders/route.ts", desc: "엔드포인트", color: "BBF7D0" },
    { name: "Zod 스키마 검증", desc: "= Pydantic", color: "A7F3D0" },
    { name: "권한체크 → 비즈니스 로직", desc: "= Service", color: "6EE7B7" },
    { name: "admin Supabase client", desc: "= Repository", color: "34D399" },
  ];
  ppLayers.forEach((l, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 7.3, y: 3.05 + i * 0.48, w: 5.5, h: 0.38, fill: { color: l.color }, line: { color: l.color }, rectRadius: 0.08 });
    s.addText(`${l.name}  (${l.desc})`, { x: 7.45, y: 3.05 + i * 0.48, w: 5.3, h: 0.38, fontSize: 10, color: C.grayText });
  });

  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 5.2, w: 12.7, h: 0.4, fill: { color: C.orangePale }, line: { color: C.orange, w: 1 }, rectRadius: 0.08 });
  s.addText("💡  mysite1→4 리팩토링 과정에서 '왜 관심사를 분리하는가'를 체득 → PICK PICK API에서 검증→권한→DB→알림 순서로 동일하게 적용", {
    x: 0.5, y: 5.22, w: 12.3, h: 0.36, fontSize: 11, color: C.orange,
  });
}

// ── 슬라이드 6 — ORM → DB 설계 ───────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: C.green }, line: { color: C.green } });
  s.addText("🗄️  04  ORM 관계 설계 → DB 스키마", { x: 0.4, y: 0.12, w: 9, h: 0.65, fontSize: 22, bold: true, color: C.white });

  // SESAC ORM 관계
  s.addText("SESAC — SQLAlchemy 관계", { x: 0.4, y: 1.0, w: 5.8, h: 0.35, fontSize: 13, bold: true, color: C.green });
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 1.35, w: 5.9, h: 2.65, fill: { color: "1E1E2E" }, line: { color: C.green, w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "# mysite4/models\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "class ", options: { color: "C084FC", fontSize: 9 } },
    { text: "Post", options: { color: "60A5FA", fontSize: 9 } },
    { text: "(Base):\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  user_id = Column(Integer,\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    ForeignKey('users.id'))   # 1:N\n", options: { color: "34D399", fontSize: 9 } },
    { text: "  comments = relationship(\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "    'Comment', back_populates='post')\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  tags = relationship(        # M:N\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "    'Tag', secondary='post_tags')\n\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "# N+1 최적화\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "db.get(Post, id, options=[\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  selectinload(Post.comments),\n", options: { color: "34D399", fontSize: 9 } },
    { text: "  joinedload(PostTag.tag)\n])", options: { color: "34D399", fontSize: 9 } },
  ], { x: 0.45, y: 1.42, w: 5.65, h: 2.55, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 화살표
  s.addText("→", { x: 6.25, y: 2.6, w: 0.8, h: 0.45, fontSize: 28, color: C.yellow, align: "center", bold: true });

  // PICK PICK DB 관계도
  s.addText("PICK PICK — Supabase 스키마", { x: 7.1, y: 1.0, w: 5.9, h: 0.35, fontSize: 13, bold: true, color: C.green });
  s.addShape(prs.ShapeType.roundRect, { x: 7.1, y: 1.35, w: 5.9, h: 2.65, fill: { color: C.white }, line: { color: C.green, w: 2 }, rectRadius: 0.15 });

  const relations = [
    { text: "users (1) ──→ (1)  wallets", color: C.blue },
    { text: "users (1) ──→ (N)  orders", color: C.green },
    { text: "stores (1) ──→ (N)  menus", color: C.orange },
    { text: "orders (1) ──→ (N)  order_items", color: C.purple },
    { text: "menus (1) ──→ (N)  menu_option_groups", color: "7C3AED" },
    { text: "  └→ (N)  menu_options   (M:N)", color: "7C3AED" },
  ];
  relations.forEach((r, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 7.25, y: 1.52 + i * 0.4, w: 5.6, h: 0.32, fill: { color: C.bgMain }, line: { color: "E5E7EB" }, rectRadius: 0.06 });
    s.addText(r.text, { x: 7.4, y: 1.53 + i * 0.4, w: 5.3, h: 0.28, fontSize: 10.5, color: r.color, fontFace: "Courier New" });
  });

  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 4.1, w: 12.7, h: 0.45, fill: { color: C.greenPale }, line: { color: C.green, w: 1 }, rectRadius: 0.08 });
  s.addText("💡  SQLAlchemy의 1:N · M:N 관계와 JOIN 최적화 개념을 익혀 PICK PICK 주문-메뉴-옵션-가게 복잡한 관계 설계에 동일하게 적용", {
    x: 0.5, y: 4.12, w: 12.3, h: 0.4, fontSize: 11, color: C.green,
  });

  // Alembic → 마이그레이션
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 4.65, w: 12.7, h: 0.75, fill: { color: C.white }, line: { color: "D1FAE5", w: 2 }, rectRadius: 0.1 });
  s.addText("📦  Alembic 마이그레이션 학습", { x: 0.5, y: 4.72, w: 4, h: 0.3, fontSize: 11, bold: true, color: C.green });
  s.addText("→  Supabase MCP로 직접 SQL 마이그레이션 실행 (코드로 DB 변경 관리)", { x: 0.5, y: 5.0, w: 12.3, h: 0.28, fontSize: 11, color: C.textSub });
}

// ── 슬라이드 7 — Axios 인터셉터 ───────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: "7C3AED" }, line: { color: "7C3AED" } });
  s.addText("🔗  05  Axios 인터셉터 → Supabase Client 전략", { x: 0.4, y: 0.12, w: 10, h: 0.65, fontSize: 22, bold: true, color: C.white });

  s.addText("SESAC 수업", { x: 0.4, y: 1.0, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: "7C3AED", align: "center" });
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 1.35, w: 5.9, h: 2.4, fill: { color: "1E1E2E" }, line: { color: "7C3AED", w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "// api.js\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "const ", options: { color: "C084FC", fontSize: 9 } },
    { text: "api ", options: { color: "60A5FA", fontSize: 9 } },
    { text: "= axios.create({\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  baseURL: ", options: { color: "E2E8F0", fontSize: 9 } },
    { text: '"http://localhost:8000"\n});\n\n', options: { color: "34D399", fontSize: 9 } },
    { text: "// 모든 요청에 자동 토큰 첨부\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "api.interceptors.request.use(\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "  (config) => {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    const token = localStorage\n      .getItem('token');\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    if ", options: { color: "C084FC", fontSize: 9 } },
    { text: "(token) {\n      config.headers\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "        .Authorization = `Bearer ${token}`;\n    }\n    return config;\n  });", options: { color: "E2E8F0", fontSize: 9 } },
  ], { x: 0.45, y: 1.42, w: 5.65, h: 2.3, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 화살표
  s.addText("→", { x: 6.25, y: 2.4, w: 0.8, h: 0.45, fontSize: 28, color: C.yellow, align: "center", bold: true });

  // PICK PICK - 3종 클라이언트
  s.addText("PICK PICK 적용 — 3종 Client 전략", { x: 7.1, y: 1.0, w: 5.9, h: 0.35, fontSize: 13, bold: true, color: C.green, align: "center" });
  const clients = [
    { file: "lib/supabase/client.ts", desc: "클라이언트 컴포넌트용\n브라우저 세션 자동 첨부", color: C.green, pale: C.greenPale },
    { file: "lib/supabase/server.ts", desc: "서버 컴포넌트 / SSR용\n쿠키에서 세션 읽기", color: C.blue, pale: C.bluePale },
    { file: "lib/supabase/admin.ts", desc: "API Route 전용\nService Role Key (최고 권한)", color: C.orange, pale: C.orangePale },
  ];
  clients.forEach((c, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 7.1, y: 1.35 + i * 0.85, w: 5.9, h: 0.75, fill: { color: c.pale }, line: { color: c.color, w: 1.5 }, rectRadius: 0.1 });
    s.addText(c.file, { x: 7.25, y: 1.4 + i * 0.85, w: 5.6, h: 0.28, fontSize: 10.5, bold: true, color: c.color, fontFace: "Courier New" });
    s.addText(c.desc, { x: 7.25, y: 1.66 + i * 0.85, w: 5.6, h: 0.35, fontSize: 10, color: C.grayText });
  });

  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 4.65, w: 12.7, h: 0.6, fill: { color: "F3E8FF" }, line: { color: "7C3AED", w: 1 }, rectRadius: 0.1 });
  s.addText("💡  '모든 요청에 자동 인증 첨부'라는 인터셉터 개념 → PICK PICK에서 상황(브라우저/서버/어드민)에 맞는 3종 클라이언트로 진화. 보안과 성능을 동시에 확보.", {
    x: 0.5, y: 4.68, w: 12.3, h: 0.54, fontSize: 11, color: "7C3AED",
  });
}

// ── 슬라이드 8 — SSE 스트리밍 ─────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.bgMain };

  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: C.sky }, line: { color: C.sky } });
  s.addText("⚡  06  SSE 스트리밍 → 실시간 주문 알림", { x: 0.4, y: 0.12, w: 10, h: 0.65, fontSize: 22, bold: true, color: C.white });

  s.addText("SESAC — AI Chat 스트리밍", { x: 0.4, y: 1.0, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.sky, align: "center" });
  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 1.35, w: 5.9, h: 2.7, fill: { color: "1E1E2E" }, line: { color: C.sky, w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "// AiChat.jsx — SSE 스트리밍\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "const ", options: { color: "C084FC", fontSize: 9 } },
    { text: "reader ", options: { color: "60A5FA", fontSize: 9 } },
    { text: "= response.body.getReader();\n\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "while ", options: { color: "C084FC", fontSize: 9 } },
    { text: "(true) {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  const { done, value } = \n    await reader.read();\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  if ", options: { color: "C084FC", fontSize: 9 } },
    { text: "(done) break;\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "  // 청크 단위 실시간 처리\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "  setMessages(prev =>\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "    prev.map((msg, i) =>\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      i === prev.length-1\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      ? {...msg, content:\n          msg.content+data}\n", options: { color: "34D399", fontSize: 9 } },
    { text: "      : msg\n  ));\n}", options: { color: "E2E8F0", fontSize: 9 } },
  ], { x: 0.45, y: 1.42, w: 5.65, h: 2.6, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 화살표
  s.addText("→", { x: 6.25, y: 2.55, w: 0.8, h: 0.45, fontSize: 28, color: C.yellow, align: "center", bold: true });

  // PICK PICK Realtime
  s.addText("PICK PICK — Supabase Realtime", { x: 7.1, y: 1.0, w: 5.9, h: 0.35, fontSize: 13, bold: true, color: C.green, align: "center" });
  s.addShape(prs.ShapeType.roundRect, { x: 7.1, y: 1.35, w: 5.9, h: 2.7, fill: { color: "1E1E2E" }, line: { color: C.green, w: 2 }, rectRadius: 0.15 });
  s.addText([
    { text: "// hooks/useRealtime.ts\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "supabase\n", options: { color: "60A5FA", fontSize: 9 } },
    { text: "  .channel(`order:${orderId}`)\n", options: { color: "FCD34D", fontSize: 9 } },
    { text: "  .on(\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: '    "postgres_changes",\n', options: { color: "34D399", fontSize: 9 } },
    { text: '    { event: "UPDATE",\n      table: "orders" },\n', options: { color: "E2E8F0", fontSize: 9 } },
    { text: "    (payload) => {\n", options: { color: "E2E8F0", fontSize: 9 } },
    { text: "      // 실시간 상태 업데이트\n", options: { color: "6B7280", fontSize: 9 } },
    { text: "      setStatus(\n        payload.new.status);\n    }\n", options: { color: "34D399", fontSize: 9 } },
    { text: "  )\n  .subscribe();", options: { color: "E2E8F0", fontSize: 9 } },
  ], { x: 7.25, y: 1.42, w: 5.65, h: 2.6, fontFace: "Courier New", paraSpaceAfter: 1 });

  // 실시간 구독 대상
  const channels = ["주문 상태 변경 (유저·사장님·라이더)", "새 주문 알림 (사장님)", "라이더 실시간 위치 (배달 중 유저)", "배달 요청 알림 (주변 라이더)"];
  channels.forEach((ch, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 4.2 + i * 0.28, w: 12.7, h: 0.24, fill: { color: C.skyPale }, line: { color: C.sky }, rectRadius: 0.05 });
    s.addText(`⚡  ${ch}`, { x: 0.5, y: 4.21 + i * 0.28, w: 12.3, h: 0.22, fontSize: 10, color: C.sky });
  });

  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 5.38, w: 12.7, h: 0.22, fill: { color: C.skyPale }, line: { color: C.sky, w: 1 }, rectRadius: 0.05 });
  s.addText("💡  스트리밍으로 실시간 데이터를 수신하는 패턴 → SSE → WebSocket(Supabase Realtime)으로 진화. 3역할이 동시에 같은 주문을 실시간으로 추적", {
    x: 0.5, y: 5.39, w: 12.3, h: 0.2, fontSize: 9.5, color: C.sky,
  });
}

// ── 슬라이드 9 — 종합 연결도 ─────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.purpleDark };

  s.addText("📊  종합 연결도", { x: 0.4, y: 0.15, w: 12.5, h: 0.65, fontSize: 26, bold: true, color: C.white, align: "center" });

  const rows = [
    { sesac: "Zustand useCartStore",         arrow: "→", pick: "cartStore (배달 장바구니)", color: C.purpleLight },
    { sesac: "Zustand useAuthStore",          arrow: "→", pick: "authStore (로그인 상태 관리)", color: C.purpleLight },
    { sesac: "JWT role 기반 라우팅",          arrow: "→", pick: "RBAC 미들웨어 (4역할 분기)", color: "60A5FA" },
    { sesac: "mysite4 Router→Service→Repo",  arrow: "→", pick: "API Route 계층 구조", color: "FB923C" },
    { sesac: "SQLAlchemy 1:N / M:N 관계",    arrow: "→", pick: "Supabase DB 스키마 설계", color: "34D399" },
    { sesac: "Pydantic 요청 검증",           arrow: "→", pick: "Zod 스키마 검증", color: "34D399" },
    { sesac: "Axios 인터셉터",               arrow: "→", pick: "Supabase Client 3종 전략", color: "C084FC" },
    { sesac: "SSE 스트리밍 AI Chat",         arrow: "→", pick: "Supabase Realtime (주문 실시간)", color: "38BDF8" },
    { sesac: ".env 환경변수 관리",           arrow: "→", pick: ".env.local + Vercel 환경변수", color: C.yellowLight },
    { sesac: "Tailwind CSS",                 arrow: "→", pick: "Tailwind + 픽픽 커스텀 테마", color: C.yellowLight },
  ];

  rows.forEach((r, i) => {
    const y = 0.92 + i * 0.44;
    s.addShape(prs.ShapeType.roundRect, { x: 0.3, y, w: 4.8, h: 0.36, fill: { color: C.purple }, line: { color: r.color, w: 1 }, rectRadius: 0.08 });
    s.addText(r.sesac, { x: 0.45, y, w: 4.65, h: 0.36, fontSize: 10.5, color: C.white, fontFace: "Courier New" });
    s.addText("→", { x: 5.2, y, w: 0.5, h: 0.36, fontSize: 16, color: r.color, align: "center", bold: true });
    s.addShape(prs.ShapeType.roundRect, { x: 5.8, y, w: 7.0, h: 0.36, fill: { color: "2D1B69" }, line: { color: r.color, w: 1 }, rectRadius: 0.08 });
    s.addText(r.pick, { x: 5.95, y, w: 6.8, h: 0.36, fontSize: 10.5, color: r.color });
  });

  s.addShape(prs.ShapeType.roundRect, { x: 0.3, y: 5.2, w: 12.7, h: 0.35, fill: { color: C.yellow }, line: { color: C.yellow }, rectRadius: 0.08 });
  s.addText("수업에서 배운 10가지 패턴이 실제 서비스 PICK PICK의 핵심 뼈대가 되었습니다", {
    x: 0.4, y: 5.22, w: 12.5, h: 0.3, fontSize: 12, bold: true, color: C.textDark, align: "center",
  });
}

// ── 슬라이드 10 — 마무리 ───────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: C.purpleDark };

  s.addShape(prs.ShapeType.ellipse, { x: 9.0, y: -1.0, w: 4.0, h: 4.0, fill: { color: C.purple }, line: { color: C.purple } });
  s.addShape(prs.ShapeType.ellipse, { x: -1.2, y: 4.2, w: 3.0, h: 3.0, fill: { color: C.purple }, line: { color: C.purple } });

  s.addText("🎓  →  🛵", { x: 1, y: 0.7, w: 11.6, h: 0.9, fontSize: 42, align: "center" });

  s.addText("작은 Todo 앱에서", { x: 1, y: 1.6, w: 11.6, h: 0.6, fontSize: 26, color: C.yellowLight, align: "center" });
  s.addText("실시간 배달 플랫폼까지", { x: 1, y: 2.15, w: 11.6, h: 0.6, fontSize: 32, bold: true, color: C.white, align: "center" });

  s.addShape(prs.ShapeType.rect, { x: 3.5, y: 2.85, w: 6.6, h: 0.04, fill: { color: C.purpleLight }, line: { color: C.purpleLight } });

  s.addText("SESAC 도봉에서 익힌 패턴들이\n실제 서비스 개발의 언어가 되었습니다", {
    x: 1, y: 3.0, w: 11.6, h: 0.9,
    fontSize: 16, color: "C4B5FD", align: "center", italic: true,
  });

  const stats = [
    { label: "연결된 패턴", value: "10", unit: "개" },
    { label: "베타 가입자", value: "19", unit: "명" },
    { label: "지원 역할", value: "4", unit: "개" },
    { label: "실시간 채널", value: "4", unit: "개" },
  ];
  stats.forEach((st, i) => {
    s.addShape(prs.ShapeType.roundRect, { x: 0.4 + i * 3.1, y: 4.1, w: 2.8, h: 0.95, fill: { color: C.purple }, line: { color: C.purpleLight, w: 1 }, rectRadius: 0.12 });
    s.addText(st.value + st.unit, { x: 0.4 + i * 3.1, y: 4.1, w: 2.8, h: 0.55, fontSize: 26, bold: true, color: C.yellowLight, align: "center" });
    s.addText(st.label, { x: 0.4 + i * 3.1, y: 4.6, w: 2.8, h: 0.38, fontSize: 11, color: "C4B5FD", align: "center" });
  });

  s.addText("PICK PICK — 파이 생태계 배달 플랫폼", {
    x: 1, y: 5.15, w: 11.6, h: 0.3, fontSize: 12, color: "7C3AED", align: "center",
  });
}

// ── 파일 저장 ─────────────────────────────────────────
const outPath = "public/sesac-pickpick-scenario.pptx";
await prs.writeFile({ fileName: outPath });
console.log(`✅  PPT 생성 완료: ${outPath}`);
