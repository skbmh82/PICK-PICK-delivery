import { supabase } from "./client";

export interface CreateOrderPayload {
  userId: string;
  storeId: string;
  items: { menuId: string; menuName: string; price: number; quantity: number }[];
  totalAmount: number;
  deliveryFee: number;
  pickUsed: number;
  pickReward: number;
  deliveryAddress: string;
}

export interface OrderRow {
  id: string;
  store_id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  pick_used: number;
  pick_reward: number;
  delivery_address: string;
  estimated_time: number;
  created_at: string;
  stores: { name: string } | null;
}

// 주문 생성
export async function createOrder(payload: CreateOrderPayload): Promise<string | null> {
  const totalPaid = payload.totalAmount + payload.deliveryFee - payload.pickUsed;

  // 1. orders 테이블 insert
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: payload.userId,
      store_id: payload.storeId,
      status: "pending",
      payment_method: "PICK",
      total_amount: totalPaid,
      delivery_fee: payload.deliveryFee,
      pick_used: payload.pickUsed,
      pick_reward: payload.pickReward,
      delivery_address: payload.deliveryAddress,
      estimated_time: 30,
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    console.error("createOrder error:", orderError?.message);
    return null;
  }

  const orderId = orderData.id as string;

  // 2. order_items 일괄 insert
  const orderItems = payload.items.map((item) => ({
    order_id: orderId,
    menu_id: item.menuId,
    menu_name: item.menuName,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("createOrderItems error:", itemsError.message);
  }

  // 3. 지갑 PICK 차감 및 적립 (RLS 허용 범위에서)
  if (payload.pickUsed > 0) {
    await supabase.rpc("deduct_pick", {
      p_user_id: payload.userId,
      p_amount: payload.pickUsed,
      p_order_id: orderId,
    }).then(({ error }) => {
      if (error) console.error("deduct_pick error:", error.message);
    });
  }

  return orderId;
}

// 내 주문 목록 조회
export async function fetchMyOrders(userId: string): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, store_id, status, total_amount, delivery_fee, pick_used, pick_reward, delivery_address, estimated_time, created_at, stores(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("fetchMyOrders error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as OrderRow[];
}
