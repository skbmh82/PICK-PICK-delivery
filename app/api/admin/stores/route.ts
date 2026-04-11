import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/admin/stores — 전체 가게 목록 (승인 대기 포함)
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: me } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const { data: stores, error } = await admin
    .from("stores")
    .select(`
      id, name, category, address, phone,
      is_open, is_approved, rating, review_count,
      delivery_fee, min_order_amount, delivery_time,
      pick_reward_rate, created_at,
      owner:owner_id ( id, name, email )
    `)
    .order("is_approved", { ascending: true })   // 미승인 먼저
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "가게 목록 조회에 실패했습니다" }, { status: 500 });
  }

  const result = (stores ?? []).map((s: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
    id:             s.id,
    name:           s.name,
    category:       s.category,
    address:        s.address,
    phone:          s.phone,
    isOpen:         s.is_open,
    isApproved:     s.is_approved,
    rating:         Number(s.rating),
    reviewCount:    s.review_count,
    deliveryFee:    Number(s.delivery_fee),
    minOrderAmount: Number(s.min_order_amount),
    deliveryTime:   s.delivery_time,
    pickRewardRate: Number(s.pick_reward_rate),
    createdAt:      s.created_at,
    owner: {
      id:    s.owner?.id,
      name:  s.owner?.name,
      email: s.owner?.email,
    },
  }));

  return NextResponse.json({ stores: result });
}
