import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_KOREAEXIM_API_KEY ?? "";

interface EximbankRate {
  result: number;
  cur_unit: string;
  deal_bas_r: string; // 매매기준율
  cur_nm: string;
}

// 영업일 기준 최근 날짜를 YYYYMMDD 형식으로 반환 (최대 7일 전까지 시도)
function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key missing" }, { status: 500 });
  }

  // 주말·공휴일엔 데이터 없음 → 최대 7일 전까지 재시도
  for (let i = 0; i <= 7; i++) {
    const searchdate = getDateString(i);
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;

    try {
      const res = await fetch(url, { next: { revalidate: 3600 } }); // 1시간 캐시
      if (!res.ok) continue;

      const data = await res.json() as EximbankRate[];
      if (!Array.isArray(data) || data.length === 0) continue;

      const usd = data.find((r) => r.cur_unit === "USD");
      if (!usd || !usd.deal_bas_r) continue;

      // 콤마 제거 후 숫자 변환
      const rate = parseFloat(usd.deal_bas_r.replace(/,/g, ""));
      if (isNaN(rate)) continue;

      return NextResponse.json({
        rate,
        date: `${searchdate.slice(0, 4)}-${searchdate.slice(4, 6)}-${searchdate.slice(6, 8)}`,
        source: "한국수출입은행",
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "환율 조회 실패" }, { status: 503 });
}
