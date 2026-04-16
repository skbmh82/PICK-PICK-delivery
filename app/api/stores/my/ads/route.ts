import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const CreateAdSchema = z.object({
  type:           z.enum(["top", "banner"]),
  pickBudget:     z.number().min(100, "최소 100 PICK 이상 설정해주세요"),
  dailyBudget:    z.number().min(10,  "일 예산은 최소 10 PICK 이상이어야 합니다"),
  startDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식: YYYY-MM-DD"),
  endDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식: YYYY-MM-DD"),
  // banner 타입 전용
  bannerTitle:    z.string().max(30).optional(),
  bannerSub:      z.string().max(60).optional(),
  bannerGradient: z.string().optional(),
});

/* ─── 내 가게 광고 목록 ─── */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabaseClient();

  // 내 가게 조회
  const ownerId = (await admin.from("users").select("id").eq("auth_id", user.id).single()).data?.id;
  const { data: storeListGet } = await admin
    .from("stores").select("id").eq("owner_id", ownerId)
    .order("created_at", { ascending: false }).limit(1);
  const store = storeListGet?.[0] ?? null;

  if (!store) return NextResponse.json({ error: "가게를 찾을 수 없습니다" }, { status: 404 });

  const { data: ads, error } = await admin
    .from("store_ads")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ads });
}

/* ─── 광고 신청 ─── */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateAdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { type, pickBudget, dailyBudget, startDate, endDate,
          bannerTitle, bannerSub, bannerGradient } = parsed.data;

  if (new Date(startDate) >= new Date(endDate)) {
    return NextResponse.json({ error: "종료일은 시작일 이후여야 합니다" }, { status: 400 });
  }

  const admin = getAdminSupabaseClient();

  // 사용자 + 가게 조회
  const { data: owner } = await admin.from("users").select("id").eq("auth_id", user.id).single();
  if (!owner) return NextResponse.json({ error: "사용자 없음" }, { status: 404 });

  const { data: storeList } = await admin.from("stores").select("id, is_approved").eq("owner_id", owner.id)
    .order("created_at", { ascending: false }).limit(1);
  const store = storeList?.[0] ?? null;
  if (!store) return NextResponse.json({ error: "가게를 찾을 수 없습니다" }, { status: 404 });
  if (!store.is_approved) {
    return NextResponse.json({ error: "승인된 가게만 광고를 신청할 수 있습니다" }, { status: 403 });
  }

  // 지갑 잔액 확인
  const { data: wallet } = await admin.from("wallets").select("pick_balance").eq("user_id", owner.id).single();
  if (!wallet || wallet.pick_balance < pickBudget) {
    return NextResponse.json({ error: "PICK 잔액이 부족합니다" }, { status: 400 });
  }

  // 광고 생성 + 지갑 차감 (트랜잭션)
  const { data: ad, error: adError } = await admin.from("store_ads").insert({
    store_id:        store.id,
    type,
    pick_budget:     pickBudget,
    daily_budget:    dailyBudget,
    start_date:      startDate,
    end_date:        endDate,
    banner_title:    bannerTitle ?? null,
    banner_sub:      bannerSub ?? null,
    banner_gradient: bannerGradient ?? null,
    status:          "pending",
  }).select().single();

  if (adError) return NextResponse.json({ error: adError.message }, { status: 500 });

  // PICK 예산 차감
  const newBalance = wallet.pick_balance - pickBudget;
  await admin.from("wallets").update({
    pick_balance: newBalance,
    updated_at: new Date().toISOString(),
  }).eq("user_id", owner.id);

  // 트랜잭션 기록
  await admin.from("wallet_transactions").insert({
    wallet_id: (await admin.from("wallets").select("id").eq("user_id", owner.id).single()).data?.id,
    type: "payment",
    amount: -pickBudget,
    balance_after: newBalance,
    description: `광고비 결제 (${type === "top" ? "상단 노출" : "배너 광고"} / ${startDate} ~ ${endDate})`,
  });

  return NextResponse.json({ ad }, { status: 201 });
}
