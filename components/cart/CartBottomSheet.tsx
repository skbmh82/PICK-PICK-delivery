"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Minus, Plus, ShoppingBag, Bike, Coins } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import { fetchMyPickBalance } from "@/lib/supabase/wallet";
import { createOrder } from "@/lib/supabase/orders";

interface Props {
  onClose: () => void;
}

export default function CartBottomSheet({ onClose }: Props) {
  const router = useRouter();
  const cart = useCartStore();
  const setLastOrder = useOrderStore((s) => s.setLastOrder);
  const user = useAuthStore((s) => s.user);

  const [pickBalance, setPickBalance] = useState(0);
  const [usePick, setUsePick] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // 실제 PICK 잔액 로드
  useEffect(() => {
    if (!user) return;
    fetchMyPickBalance(user.id).then(setPickBalance);
  }, [user]);

  const itemsAmount = cart.itemsAmount();
  const maxPickUsable = Math.min(pickBalance, Math.floor(itemsAmount * 0.5));
  const pickDiscount = usePick ? maxPickUsable : 0;
  const totalPaid = itemsAmount + cart.deliveryFee - pickDiscount;
  const pickReward = Math.floor(totalPaid * (cart.pickRewardRate / 100));

  const isBelowMin = itemsAmount < cart.minOrderAmount;

  const handleOrder = async () => {
    if (isBelowMin || isOrdering) return;
    setIsOrdering(true);

    const now = new Date();
    const placedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let orderId = `ORD-${Date.now()}`;

    // 로그인된 경우 Supabase에 실주문 저장
    if (user) {
      const realOrderId = await createOrder({
        userId: user.id,
        storeId: cart.storeId,
        items: cart.items.map((i) => ({
          menuId: i.menuId,
          menuName: i.menuName,
          price: i.price,
          quantity: i.quantity,
        })),
        totalAmount: itemsAmount,
        deliveryFee: cart.deliveryFee,
        pickUsed: pickDiscount,
        pickReward,
        deliveryAddress: "서울 강남구 역삼동 123-45",
      });
      if (realOrderId) orderId = realOrderId;
    }

    setLastOrder({
      orderId,
      storeName: cart.storeName,
      storeEmoji: cart.storeEmoji,
      items: cart.items.map((i) => ({
        menuName: i.menuName,
        quantity: i.quantity,
        price: i.price,
      })),
      itemsAmount,
      deliveryFee: cart.deliveryFee,
      pickUsed: pickDiscount,
      pickReward,
      totalPaid,
      deliveryAddress: "서울 강남구 역삼동 123-45",
      estimatedMinutes: 30,
      placedAt,
    });

    cart.clearCart();
    router.push("/orders/complete");
  };

  return (
    <>
      {/* 딤드 배경 */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85dvh] flex flex-col">
        {/* 핸들 + 헤더 */}
        <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-pick-border">
          <div className="w-10 h-1 bg-pick-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-pick-purple" />
              <h2 className="font-black text-pick-text text-lg">장바구니</h2>
              <span className="text-sm font-bold text-pick-purple bg-pick-bg px-2.5 py-0.5 rounded-full border border-pick-border">
                {cart.totalCount()}개
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg hover:bg-pick-border transition-colors"
            >
              <X size={16} className="text-pick-text-sub" />
            </button>
          </div>
          <p className="text-xs text-pick-text-sub mt-1 font-medium">
            {cart.storeEmoji} {cart.storeName}
          </p>
        </div>

        {/* 아이템 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <div
                key={item.menuId}
                className="flex items-center gap-3 bg-pick-bg rounded-2xl px-4 py-3 border border-pick-border"
              >
                <span className="text-3xl flex-shrink-0">{item.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-pick-text text-sm truncate">{item.menuName}</p>
                  <p className="font-black text-pick-purple text-sm mt-0.5">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => cart.updateQuantity(item.menuId, -1)}
                    className="w-7 h-7 rounded-full bg-white border-2 border-pick-border flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus size={12} className="text-pick-purple" />
                  </button>
                  <span className="w-5 text-center font-black text-pick-text text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cart.updateQuantity(item.menuId, 1)}
                    className="w-7 h-7 rounded-full bg-pick-purple flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus size={12} className="text-white" />
                  </button>
                  <button
                    onClick={() => cart.removeItem(item.menuId)}
                    className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center active:scale-90 transition-transform ml-1"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PICK 토큰 사용 */}
          <div className="mt-4 bg-pick-bg rounded-2xl border-2 border-pick-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-pick-purple" />
                <div>
                  <p className="text-sm font-bold text-pick-text">PICK 토큰 사용</p>
                  <p className="text-xs text-pick-text-sub">
                    보유 {pickBalance.toLocaleString()} PICK · 최대 {maxPickUsable.toLocaleString()}원 할인
                  </p>
                </div>
              </div>
              <button
                disabled={pickBalance === 0}
                onClick={() => setUsePick((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  usePick ? "bg-pick-purple" : "bg-gray-200"
                } disabled:opacity-40`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    usePick ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {usePick && (
              <p className="text-xs font-black text-pick-purple mt-2">
                -{maxPickUsable.toLocaleString()}원 할인 적용 💜
              </p>
            )}
          </div>
        </div>

        {/* 결제 요약 + 주문 버튼 */}
        <div className="flex-shrink-0 px-4 pt-3 pb-6 border-t border-pick-border bg-white">
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-pick-text-sub">메뉴 합계</span>
              <span className="font-bold text-pick-text">{itemsAmount.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-pick-text-sub flex items-center gap-1">
                <Bike size={13} />배달비
              </span>
              <span className="font-bold text-pick-text">
                {cart.deliveryFee === 0
                  ? <span className="text-green-600">무료</span>
                  : `+${cart.deliveryFee.toLocaleString()}원`}
              </span>
            </div>
            {usePick && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-pick-purple font-medium">PICK 할인</span>
                <span className="font-bold text-pick-purple">-{pickDiscount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-dashed border-pick-border pt-2 mt-1">
              <span className="font-black text-pick-text">최종 결제</span>
              <span className="font-black text-pick-text text-lg">{totalPaid.toLocaleString()}원</span>
            </div>
            <p className="text-xs text-pick-text-sub text-right">
              주문 후 {pickReward} PICK 적립 예정 ✨
            </p>
          </div>

          {isBelowMin && (
            <p className="text-xs text-red-500 font-bold text-center mb-2">
              최소 주문금액 {cart.minOrderAmount.toLocaleString()}원까지{" "}
              {(cart.minOrderAmount - itemsAmount).toLocaleString()}원 더 담아야 해요
            </p>
          )}

          {!user && (
            <p className="text-xs text-amber-600 font-bold text-center mb-2">
              ⚠️ 로그인 후 주문하면 PICK이 적립됩니다
            </p>
          )}

          <button
            onClick={() => void handleOrder()}
            disabled={isBelowMin || isOrdering}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOrdering ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                주문 중...
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                {totalPaid.toLocaleString()}원 주문하기
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
