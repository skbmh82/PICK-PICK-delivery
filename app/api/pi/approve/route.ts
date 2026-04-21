import { NextRequest, NextResponse } from "next/server";

const PI_API_KEY = process.env.PI_API_KEY ?? "";
const PI_API_BASE = "https://api.minepi.com";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json() as { paymentId: string };
    if (!paymentId) return NextResponse.json({ error: "paymentId 필요" }, { status: 400 });

    const res = await fetch(`${PI_API_BASE}/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${PI_API_KEY}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json() as unknown;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
