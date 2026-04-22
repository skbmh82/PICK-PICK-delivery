import { NextResponse } from "next/server";

const API_KEY = process.env.KOREAEXIM_API_KEY ?? "";

interface EximbankRate {
  result: number;
  cur_unit: string;
  deal_bas_r: string; // 매매기준율
  cur_nm: string;
}

// KST(UTC+9) 기준 날짜를 YYYYMMDD 형식으로 반환
function getDateString(daysAgo: number): string {
  const d = new Date();
  // KST = UTC + 9시간
  d.setTime(d.getTime() + 9 * 60 * 60 * 1000 - daysAgo * 24 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function GET() {
  const errors: string[] = [];

  if (!API_KEY) {
    errors.push("API key missing");
  } else {
    // 주말·공휴일엔 데이터 없음 → 최대 7일 전까지 재시도
    for (let i = 0; i <= 7; i++) {
      const searchdate = getDateString(i);
      const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${searchdate}&data=AP01`;

      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          errors.push(`HTTP ${res.status} for ${searchdate}`);
          continue;
        }

        const text = await res.text();
        let data: EximbankRate[];
        try {
          data = JSON.parse(text) as EximbankRate[];
        } catch {
          errors.push(`JSON parse error for ${searchdate}: ${text.slice(0, 100)}`);
          continue;
        }

        if (!Array.isArray(data) || data.length === 0) {
          errors.push(`Empty data for ${searchdate}`);
          continue;
        }

        const usd = data.find((r) => r.cur_unit === "USD");
        if (!usd || !usd.deal_bas_r) {
          errors.push(`No USD entry for ${searchdate}`);
          continue;
        }

        const rate = parseFloat(usd.deal_bas_r.replace(/,/g, ""));
        if (isNaN(rate)) {
          errors.push(`NaN rate for ${searchdate}: ${usd.deal_bas_r}`);
          continue;
        }

        return NextResponse.json({
          rate,
          date: `${searchdate.slice(0, 4)}-${searchdate.slice(4, 6)}-${searchdate.slice(6, 8)}`,
          source: "수출입은행",
        });
      } catch (e) {
        errors.push(`fetch error for ${searchdate}: ${String(e)}`);
        continue;
      }
    }
  }

  return NextResponse.json({ error: "환율 조회 실패", debug: errors }, { status: 503 });
}
