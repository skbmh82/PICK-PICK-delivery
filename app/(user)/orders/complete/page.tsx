"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Bike, Clock, MapPin, ClipboardList, Home } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";

export default function OrderCompletePage() {
  const router = useRouter();
  const { lastOrder, clearLastOrder } = useOrderStore();

  // 주문 정보 없으면 홈으로
  useEffect(() => {
    if (!lastOrder) {
      router.replace("/home");
    }
  }, [lastOrder, router]);

  if (!lastOrder) return null;

  return (
    <div className="min-h-full px-4 py-8 flex flex-col items-center">
      {/* 완료 애니메이션 */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle size={52} className="text-green-500" strokeWidth={2} />
        </div>
        <h1 className="font-black text-pick-text text-2xl mb-1">주문 완료! 🎉</h1>
        <p className="text-pick-text-sub text-sm">
          맛있는 음식이 곧 배달돼요!
        </p>
      </div>

      {/* 주문 요약 카드 */}
      <div className="w-full bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm p-5 mb-4">
        {/* 가게명 */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-pick-border">
          <span className="text-4xl">{lastOrder.storeEmoji}</span>
          <div>
            <p className="font-black text-pick-text">{lastOrder.storeName}</p>
            <p className="text-xs text-pick-text-sub">{lastOrder.placedAt} 주문</p>
          </div>
        </div>

        {/* 주문 아이템 */}
        <div className="flex flex-col gap-2 mb-4">
          {lastOrder.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-pick-text">
                {item.menuName}
                <span className="text-pick-text-sub ml-1">x{item.quantity}</span>
              </span>
              <span className="font-bold text-pick-text">
                {(item.price * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>

        {/* 금액 요약 */}
        <div className="bg-pick-bg rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-pick-text-sub">
            <span>메뉴 합계</span>
            <span>{lastOrder.itemsAmount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-xs text-pick-text-sub">
            <span>배달비</span>
            <span>
              {lastOrder.deliveryFee === 0
                ? "무료"
                : `+${lastOrder.deliveryFee.toLocaleString()}원`}
            </span>
          </div>
          {lastOrder.pickUsed > 0 && (
            <div className="flex justify-between text-xs text-pick-purple font-medium">
              <span>PICK 할인</span>
              <span>-{lastOrder.pickUsed.toLocaleString()}원</span>
            </div>
          )}
          <div className="flex justify-between font-black text-pick-text pt-2 border-t border-pick-border">
            <span>최종 결제</span>
            <span>{lastOrder.totalPaid.toLocaleString()}원</span>
          </div>
        </div>

        {/* PICK 적립 */}
        {lastOrder.pickReward > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 bg-pick-purple/5 border border-pick-border rounded-2xl py-2.5">
            <span className="text-sm">✨</span>
            <span className="text-sm font-black text-pick-purple">
              +{lastOrder.pickReward} PICK 적립 완료!
            </span>
          </div>
        )}
      </div>

      {/* 배달 정보 */}
      <div className="w-full bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm px-5 py-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pick-bg flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-pick-purple" />
            </div>
            <div>
              <p className="text-xs text-pick-text-sub">예상 배달 시간</p>
              <p className="font-bold text-pick-text text-sm">
                약 {lastOrder.estimatedMinutes}분 🛵
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pick-bg flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-pick-purple" />
            </div>
            <div>
              <p className="text-xs text-pick-text-sub">배달 주소</p>
              <p className="font-bold text-pick-text text-sm">{lastOrder.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pick-bg flex items-center justify-center flex-shrink-0">
              <Bike size={16} className="text-pick-purple" />
            </div>
            <div>
              <p className="text-xs text-pick-text-sub">주문번호</p>
              <p className="font-bold text-pick-text text-sm font-mono">{lastOrder.orderId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href="/orders"
          className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <ClipboardList size={20} />
          주문 현황 보기
        </Link>
        <Link
          href="/home"
          onClick={clearLastOrder}
          className="w-full bg-white text-pick-purple font-black py-4 rounded-full border-2 border-pick-border flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Home size={20} />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
