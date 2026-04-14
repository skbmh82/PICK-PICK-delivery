import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/stores/my/stats — 오늘 요약 + 주간 매출
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store } = await (admin as any)
    .from("stores")
    .select("id, name")
    .eq("owner_id", profile.id)
    .single();

  if (!store) {
    return NextResponse.json({
      storeName: null,
      today: { newOrders: 0, inProgress: 0, completed: 0, cancelled: 0, totalRevenue: 0, pickEarned: 0 },
      weekly: [],
      pendingOrders: [],
    });
  }

  // 오늘 시작 시각 (KST → UTC)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // 오늘 주문 전체
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: todayOrders } = await (admin as any)
    .from("orders")
    .select("id, status, total_amount, pick_reward, created_at, users(id, name, phone), order_items(id, menu_name, price, quantity)")
    .eq("store_id", store.id)
    .gte("created_at", todayStart)
    .order("created_at", { ascending: false });

  const orders = todayOrders ?? [];

  const doneStatuses    = ["delivered"];
  const cancelStatuses  = ["cancelled", "refunded"];
  const inProgressStatuses = ["preparing", "ready", "picked_up", "delivering"];

  // confirmed = 결제 완료, 사장님 조리 시작 대기 (PICK 즉시 확정 + TOSS 결제 완료 후)
  const newOrders    = orders.filter((o: { status: string }) => o.status === "confirmed").length;
  const inProgress   = orders.filter((o: { status: string }) => inProgressStatuses.includes(o.status)).length;
  const completed    = orders.filter((o: { status: string }) => doneStatuses.includes(o.status)).length;
  const cancelled    = orders.filter((o: { status: string }) => cancelStatuses.includes(o.status)).length;
  const totalRevenue = orders
    .filter((o: { status: string }) => doneStatuses.includes(o.status))
    .reduce((sum: number, o: { total_amount: number }) => sum + Number(o.total_amount), 0);
  const pickEarned   = orders
    .filter((o: { status: string }) => doneStatuses.includes(o.status))
    .reduce((sum: number, o: { pick_reward: number }) => sum + Number(o.pick_reward ?? 0), 0);

  // 신규 주문 목록 (confirmed — 결제 완료, 사장님 수락 대기)
  const pendingOrders = orders
    .filter((o: { status: string }) => o.status === "confirmed")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((o: any) => ({
      id: o.id,
      customerName: o.users?.name ?? "고객",
      phone: o.users?.phone ?? null,
      totalAmount: Number(o.total_amount),
      items: (o.order_items ?? []).map((i: { menu_name: string; quantity: number }) => ({
        name: i.menu_name,
        quantity: i.quantity,
      })),
      createdAt: new Date(o.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    }));

  // 주간 매출 (오늘 포함 7일)
  const weekly: { day: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const start = d.toISOString();
    const end   = new Date(d.getTime() + 86400000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dayOrders } = await (admin as any)
      .from("orders")
      .select("total_amount, status")
      .eq("store_id", store.id)
      .eq("status", "delivered")
      .gte("created_at", start)
      .lt("created_at", end);

    const dayRevenue = (dayOrders ?? []).reduce(
      (sum: number, o: { total_amount: number }) => sum + Number(o.total_amount),
      0
    );

    const dayLabel = i === 0 ? "오늘" : ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    weekly.push({ day: dayLabel, amount: dayRevenue });
  }

  return NextResponse.json({
    storeName: store.name,
    today: { newOrders, inProgress, completed, cancelled, totalRevenue, pickEarned },
    weekly,
    pendingOrders,
  });
}
