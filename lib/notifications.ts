import { getAdminSupabaseClient } from "@/lib/supabase/admin";

interface CreateNotificationParams {
  userId:  string;
  type:    "order_update" | "reward" | "promotion" | "transfer" | "system";
  title:   string;
  body?:   string;
  data?:   Record<string, unknown>;
}

// 알림 단건 생성 (서버 사이드 전용)
export async function createNotification(params: CreateNotificationParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { error } = await admin.from("notifications").insert({
    user_id:    params.userId,
    type:       params.type,
    title:      params.title,
    body:       params.body ?? null,
    data:       params.data ?? {},
    is_read:    false,
    created_at: new Date().toISOString(),
  });
  if (error) console.error("createNotification 오류:", error.message);
}

// 주문 상태별 사용자 알림 메시지
export const ORDER_STATUS_NOTIFICATION: Record<string, { title: string; body: string }> = {
  confirmed:  { title: "주문이 수락됐어요! ✅",        body: "사장님이 주문을 확인하고 조리를 시작했어요."  },
  preparing:  { title: "조리가 시작됐어요! 🍳",        body: "맛있게 준비하고 있어요. 잠시만 기다려주세요." },
  ready:      { title: "조리 완료! 라이더 기다리는 중 📦", body: "음식이 완성됐어요. 라이더가 곧 픽업할 거예요." },
  picked_up:  { title: "라이더가 픽업했어요! 🛵",       body: "라이더가 음식을 픽업하고 이동 중이에요."       },
  delivering: { title: "배달 중이에요! 🚀",             body: "라이더가 지금 배달하고 있어요. 곧 도착해요!"   },
  delivered:  { title: "배달 완료! 🎉",                 body: "음식이 도착했어요. 맛있게 드세요! 리뷰를 남겨보세요." },
  cancelled:  { title: "주문이 취소됐어요 ❌",           body: "주문이 취소 처리됐습니다."                   },
  refunded:   { title: "환불이 완료됐어요 💸",           body: "PICK 토큰이 지갑으로 반환됐습니다."           },
};
