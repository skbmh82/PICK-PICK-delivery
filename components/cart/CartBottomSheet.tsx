"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Minus, Plus, ShoppingBag, Bike, Coins, MapPin, ChevronRight, Home, Briefcase, Check, Ticket, ChevronDown, CreditCard, Package } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import { fetchMyPickBalance } from "@/lib/supabase/wallet";

interface Props { onClose: () => void }

interface AvailableCoupon {
  userCouponId: string;
  coupon: {
    id: string;
    title: string;
    type: "fixed_pick" | "pick_rate" | "free_delivery";
    value: number;
    minOrder: number;
    storeId: string | null;
    expiresAt: string | null;
  };
}

interface UserAddress {
  id:        string;
  label:     string;
  address:   string;
  detail:    string;
  isDefault: boolean;
  lat?:      number | null;
  lng?:      number | null;
}

const LABEL_ICON: Record<string, React.ReactNode> = {
  "집":   <Home size={12} />,
  "회사": <Briefcase size={12} />,
  "기타": <MapPin size={12} />,
};

// ── 주소 선택 패널 ─────────────────────────────────────
function openDaumPostcode(onDone: (addr: string) => void) {
  const load = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window as any).daum.Postcode({
      oncomplete: (data: { roadAddress: string; jibunAddress: string }) =>
        onDone(data.roadAddress || data.jibunAddress),
    }).open();
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).daum?.Postcode) {
    load();
  } else {
    const s = document.createElement("script");
    s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.onload = load;
    document.head.appendChild(s);
  }
}

function AddressPicker({
  addresses,
  selectedId,
  manualAddr,
  onSelect,
  onManualChange,
  onClose,
  onSearchAddress,
}: {
  addresses:       UserAddress[];
  selectedId:      string | null;
  manualAddr:      string;
  onSelect:        (addr: UserAddress) => void;
  onManualChange:  (v: string) => void;
  onClose:         () => void;
  onSearchAddress: () => void;
}) {
  return (
    <div className="bg-pick-bg border-t-2 border-pick-border px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black text-pick-text">배달 주소 선택</p>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-pick-border">
          <X size={11} className="text-pick-text-sub" />
        </button>
      </div>
      <div className="flex flex-col gap-1.5 mb-2">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            onClick={() => { onSelect(addr); onClose(); }}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl border-2 text-left transition-all ${
              selectedId === addr.id
                ? "border-pick-purple bg-white"
                : "border-pick-border bg-white"
            }`}
          >
            <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
              addr.isDefault ? "bg-pick-purple text-white" : "bg-pick-bg text-pick-text-sub border border-pick-border"
            }`}>
              {LABEL_ICON[addr.label]}
              {addr.label}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-pick-text truncate">{addr.address}</p>
              {addr.detail && <p className="text-[10px] text-pick-text-sub truncate">{addr.detail}</p>}
            </div>
            {selectedId === addr.id && <Check size={14} className="text-pick-purple flex-shrink-0" />}
          </button>
        ))}
      </div>
      {/* 직접 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualAddr}
          onChange={(e) => onManualChange(e.target.value)}
          placeholder="직접 입력 (도로명 또는 지번)"
          className="flex-1 border-2 border-pick-border rounded-2xl px-3 py-2 text-xs text-pick-text focus:outline-none focus:border-pick-purple bg-white"
        />
        <button
          type="button"
          onClick={onSearchAddress}
          className="flex-shrink-0 px-3 py-2 rounded-2xl bg-pick-purple text-white text-xs font-black active:scale-95 transition-transform"
        >
          검색
        </button>
      </div>
    </div>
  );
}

export default function CartBottomSheet({ onClose }: Props) {
  const router       = useRouter();
  const cart         = useCartStore();
  const setLastOrder = useOrderStore((s) => s.setLastOrder);
  const user         = useAuthStore((s) => s.user);

  const [pickBalance,    setPickBalance]    = useState(0);
  const [usePick,        setUsePick]        = useState(false);
  const [isOrdering,     setIsOrdering]     = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState<"PICK" | "TOSS">("PICK");
  const [orderType,      setOrderType]      = useState<"delivery" | "takeout">("delivery");

  // 배달 주소
  const [addresses,      setAddresses]      = useState<UserAddress[]>([]);
  const [selectedAddr,   setSelectedAddr]   = useState<UserAddress | null>(null);
  const [manualAddr,     setManualAddr]     = useState("");
  const [showPicker,     setShowPicker]     = useState(false);

  // 배달 메모
  const [note, setNote] = useState("");

  // 쿠폰
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [selectedCoupon,   setSelectedCoupon]   = useState<AvailableCoupon | null>(null);
  const [showCouponPicker, setShowCouponPicker] = useState(false);

  // PICK 잔액
  useEffect(() => {
    if (!user) return;
    fetchMyPickBalance(user.id).then(setPickBalance);
  }, [user]);

  // 배달 주소 fetch
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/users/addresses");
      if (res.ok) {
        const { addresses: rows } = await res.json() as { addresses: UserAddress[] };
        setAddresses(rows ?? []);
        const def = rows?.find((a) => a.isDefault) ?? rows?.[0];
        if (def) setSelectedAddr(def);
      }
    } catch { /* 비로그인 등 */ }
  }, [user]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  // 쿠폰 fetch
  useEffect(() => {
    if (!user) return;
    fetch("/api/coupons").then(async (res) => {
      if (!res.ok) return;
      const json = await res.json();
      // 사용가능 쿠폰만, 현재 가게에 적용 가능한 것만 필터
      const filtered = (json.coupons ?? []).filter((c: { isUsed: boolean; coupon: { isExpired: boolean; storeId: string | null; minOrder: number } }) =>
        !c.isUsed &&
        !c.coupon.isExpired &&
        (c.coupon.storeId === null || c.coupon.storeId === cart.storeId)
      );
      setAvailableCoupons(filtered);
    });
  }, [user, cart.storeId]);

  // 장바구니가 비면 자동 닫기
  useEffect(() => {
    if (cart.items.length === 0) onClose();
  }, [cart.items.length, onClose]);

  const itemsAmount   = cart.itemsAmount();
  const maxPickUsable = Math.min(pickBalance, Math.floor(itemsAmount * 0.5));
  const pickDiscount  = usePick ? maxPickUsable : 0;

  // 쿠폰 적용
  const couponFreeDelivery = selectedCoupon?.coupon.type === "free_delivery";
  const couponPickRate     = selectedCoupon?.coupon.type === "pick_rate"     ? selectedCoupon.coupon.value : 0;
  const couponFixedPick    = selectedCoupon?.coupon.type === "fixed_pick"    ? selectedCoupon.coupon.value : 0;
  const effectiveDeliveryFee = (couponFreeDelivery || orderType === "takeout") ? 0 : cart.deliveryFee;
  const isCouponApplicable = !selectedCoupon || itemsAmount >= selectedCoupon.coupon.minOrder;

  const totalPaid     = itemsAmount + effectiveDeliveryFee - pickDiscount;
  const baseReward    = Math.floor(totalPaid * (cart.pickRewardRate / 100));
  const extraReward   = Math.floor(baseReward * couponPickRate / 100);
  const pickReward    = baseReward + extraReward + couponFixedPick;
  const isBelowMin    = itemsAmount < cart.minOrderAmount;

  const deliveryAddressText = selectedAddr
    ? [selectedAddr.address, selectedAddr.detail].filter(Boolean).join(" ")
    : manualAddr.trim();

  const handleOrder = async () => {
    if (isBelowMin || isOrdering) return;
    if (orderType === "delivery" && !deliveryAddressText) {
      setShowPicker(true);
      return;
    }
    setIsOrdering(true);

    const now      = new Date();
    const placedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let orderId    = `ORD-${Date.now()}`;

    if (user) {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId:         cart.storeId,
          items:           cart.items.map((i) => ({
            menuId:   i.menuId,
            menuName: i.menuName,
            price:    i.price,
            quantity: i.quantity,
            options:  i.options ?? [],
          })),
          totalAmount:     itemsAmount,
          deliveryFee:     effectiveDeliveryFee,
          pickUsed:        paymentMethod === "PICK" ? pickDiscount : 0,
          userCouponId:    selectedCoupon?.userCouponId ?? undefined,
          deliveryAddress: orderType === "takeout" ? "포장 주문" : deliveryAddressText,
          deliveryLat:     orderType === "takeout" ? undefined : (selectedAddr?.lat ?? undefined),
          deliveryLng:     orderType === "takeout" ? undefined : (selectedAddr?.lng ?? undefined),
          deliveryNote:    note.trim() || undefined,
          paymentMethod,
          orderType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orderId) orderId = data.orderId;

        // 카드/간편결제 → Toss 결제 페이지로 이동
        if (paymentMethod === "TOSS" && data.tossOrderId) {
          const orderName = `${cart.storeName} ${cart.items[0]?.menuName ?? "주문"}${cart.items.length > 1 ? ` 외 ${cart.items.length - 1}개` : ""}`;
          const params = new URLSearchParams({
            orderId:     data.orderId,
            tossOrderId: data.tossOrderId,
            amount:      String(totalPaid),
            orderName,
          });
          cart.clearCart();
          router.push(`/checkout?${params.toString()}`);
          return;
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "주문 생성에 실패했습니다");
        setIsOrdering(false);
        return;
      }
    }

    setLastOrder({
      orderId,
      storeName:        cart.storeName,
      storeEmoji:       cart.storeEmoji,
      items:            cart.items.map((i) => ({
        menuName: i.menuName,
        quantity: i.quantity,
        price:    i.price,
      })),
      itemsAmount,
      deliveryFee:      effectiveDeliveryFee,
      pickUsed:         pickDiscount,
      pickReward,
      totalPaid,
      deliveryAddress:  deliveryAddressText,
      estimatedMinutes: 30,
      placedAt,
    });

    cart.clearCart();
    router.push("/orders/complete");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55] backdrop-blur-[1px]" onClick={onClose} />

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white dark:bg-pick-card rounded-t-3xl shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden">
        {/* 헤더 */}
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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg hover:bg-pick-border transition-colors">
              <X size={16} className="text-pick-text-sub" />
            </button>
          </div>
          <p className="text-xs text-pick-text-sub mt-1 font-medium">{cart.storeEmoji} {cart.storeName}</p>
        </div>

        {/* 배달 / 포장 토글 */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-pick-border">
          <div className="flex gap-2 bg-pick-bg rounded-2xl p-1">
            <button
              onClick={() => setOrderType("delivery")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                orderType === "delivery"
                  ? "bg-pick-purple text-white shadow-sm"
                  : "text-pick-text-sub"
              }`}
            >
              <Bike size={14} />
              배달
            </button>
            <button
              onClick={() => setOrderType("takeout")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                orderType === "takeout"
                  ? "bg-pick-purple text-white shadow-sm"
                  : "text-pick-text-sub"
              }`}
            >
              <Package size={14} />
              포장
            </button>
          </div>
          {orderType === "takeout" && (
            <p className="text-xs text-pick-text-sub mt-2 text-center">
              🏃 포장 주문 시 배달비 무료 · 가게 방문 후 수령
            </p>
          )}
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* 아이템 목록 */}
          <div className="px-4 py-3 flex flex-col gap-3">
            {cart.items.map((item) => (
              <div key={item.menuId} className="flex items-center gap-3 bg-pick-bg rounded-2xl px-4 py-3 border border-pick-border">
                <span className="text-3xl flex-shrink-0">{item.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-pick-text text-sm truncate">{item.menuName}</p>
                  {item.options && item.options.length > 0 && (
                    <p className="text-[10px] text-pick-text-sub mt-0.5 truncate">
                      {item.options.map((o) => o.optionName).join(", ")}
                    </p>
                  )}
                  <p className="font-black text-pick-purple text-sm mt-0.5">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => cart.updateQuantity(item.menuId, -1)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-pick-card border-2 border-pick-border flex items-center justify-center active:scale-90 transition-transform">
                    <Minus size={12} className="text-pick-purple" />
                  </button>
                  <span className="w-5 text-center font-black text-pick-text text-sm">{item.quantity}</span>
                  <button onClick={() => cart.updateQuantity(item.menuId, 1)}
                    className="w-7 h-7 rounded-full bg-pick-purple flex items-center justify-center active:scale-90 transition-transform">
                    <Plus size={12} className="text-white" />
                  </button>
                  <button onClick={() => cart.removeItem(item.menuId)}
                    className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center active:scale-90 transition-transform ml-1">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 배달 주소 (배달 주문일 때만) */}
          {orderType === "delivery" && (
            <>
              <div className="px-4 pb-3">
                <div className="bg-pick-bg rounded-2xl border-2 border-pick-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={15} className="text-pick-purple flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-pick-text">배달 주소</p>
                        {deliveryAddressText ? (
                          <p className="text-xs text-pick-text-sub mt-0.5 truncate max-w-[200px]">
                            {deliveryAddressText}
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 font-bold mt-0.5">주소를 선택해주세요</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPicker((v) => !v)}
                      className="flex items-center gap-0.5 text-xs font-bold text-pick-purple flex-shrink-0"
                    >
                      변경 <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 주소 선택 패널 */}
              {showPicker && (
                <AddressPicker
                  addresses={addresses}
                  selectedId={selectedAddr?.id ?? null}
                  manualAddr={manualAddr}
                  onSelect={(addr) => { setSelectedAddr(addr); setManualAddr(""); }}
                  onManualChange={(v) => { setManualAddr(v); setSelectedAddr(null); }}
                  onClose={() => setShowPicker(false)}
                  onSearchAddress={() => openDaumPostcode((addr) => { setManualAddr(addr); setSelectedAddr(null); })}
                />
              )}
            </>
          )}

          {/* 배달 메모 */}
          <div className="px-4 pb-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={orderType === "takeout" ? "요청사항 (예: 소스 많이 주세요)" : "배달 메모 (예: 문 앞에 놔주세요)"}
              maxLength={100}
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-2.5 text-xs text-pick-text focus:outline-none focus:border-pick-purple bg-white"
            />
          </div>

          {/* 쿠폰 선택 */}
          {user && (
            <div className="mx-4 mb-3">
              <button
                onClick={() => setShowCouponPicker((v) => !v)}
                className="w-full flex items-center justify-between bg-pick-bg rounded-2xl border-2 border-pick-border px-4 py-3 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-pick-purple" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-pick-text">쿠폰 적용</p>
                    {selectedCoupon ? (
                      <p className="text-xs text-pick-purple font-bold mt-0.5">{selectedCoupon.coupon.title} 적용 중 ✓</p>
                    ) : (
                      <p className="text-xs text-pick-text-sub mt-0.5">
                        {availableCoupons.length > 0
                          ? `사용 가능 ${availableCoupons.length}장`
                          : "사용 가능한 쿠폰 없음"}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown size={15} className={`text-pick-text-sub transition-transform ${showCouponPicker ? "rotate-180" : ""}`} />
              </button>

              {showCouponPicker && (
                <div className="mt-1 bg-white dark:bg-pick-card border-2 border-pick-border rounded-2xl overflow-hidden">
                  {/* 쿠폰 없음 옵션 */}
                  <button
                    onClick={() => { setSelectedCoupon(null); setShowCouponPicker(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b border-pick-border text-sm transition-colors ${
                      !selectedCoupon ? "bg-pick-bg" : "hover:bg-pick-bg"
                    }`}
                  >
                    <span className="text-pick-text-sub font-medium">쿠폰 사용 안 함</span>
                    {!selectedCoupon && <Check size={14} className="text-pick-purple" />}
                  </button>
                  {availableCoupons.length === 0 && (
                    <p className="px-4 py-4 text-xs text-pick-text-sub text-center">사용 가능한 쿠폰이 없어요</p>
                  )}
                  {availableCoupons.map((c) => {
                    const tooLow = itemsAmount < c.coupon.minOrder;
                    return (
                      <button
                        key={c.userCouponId}
                        disabled={tooLow}
                        onClick={() => { setSelectedCoupon(c); setShowCouponPicker(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 border-b border-pick-border last:border-0 transition-colors disabled:opacity-40 ${
                          selectedCoupon?.userCouponId === c.userCouponId
                            ? "bg-pick-purple/5"
                            : "hover:bg-pick-bg"
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold text-pick-text">{c.coupon.title}</p>
                          <p className="text-xs text-pick-purple-light font-bold mt-0.5">
                            {c.coupon.type === "fixed_pick"    && `${c.coupon.value.toLocaleString()} PICK 지급`}
                            {c.coupon.type === "pick_rate"     && `PICK ${c.coupon.value}% 추가 적립`}
                            {c.coupon.type === "free_delivery" && "배달비 무료"}
                          </p>
                          {tooLow && (
                            <p className="text-[10px] text-red-400 mt-0.5">
                              최소주문 {c.coupon.minOrder.toLocaleString()}원 이상 필요
                            </p>
                          )}
                        </div>
                        {selectedCoupon?.userCouponId === c.userCouponId && (
                          <Check size={14} className="text-pick-purple flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 결제 수단 선택 */}
          <div className="mx-4 mb-3">
            <p className="text-xs font-black text-pick-text mb-2 px-1">결제 수단</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "PICK",  label: "PICK 토큰",   emoji: "🪙", sub: "잔액으로 결제" },
                { id: "TOSS",  label: "카드·간편결제", emoji: "💳", sub: "카카오페이·토스페이 등" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as "PICK" | "TOSS")}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === m.id
                      ? "border-pick-purple bg-pick-purple/5"
                      : "border-pick-border bg-white"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{m.emoji}</span>
                  <div>
                    <p className={`text-xs font-black leading-tight ${paymentMethod === m.id ? "text-pick-purple" : "text-pick-text"}`}>
                      {m.label}
                    </p>
                    <p className="text-[10px] text-pick-text-sub leading-tight mt-0.5">{m.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PICK 토큰 사용 (PICK 결제일 때만) */}
          {paymentMethod === "PICK" && (
          <div className="mx-4 mb-4 bg-pick-bg rounded-2xl border-2 border-pick-border px-4 py-3">
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
                className={`relative w-12 h-6 rounded-full transition-all ${usePick ? "bg-pick-purple" : "bg-gray-200"} disabled:opacity-40`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${usePick ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
            {usePick && (
              <p className="text-xs font-black text-pick-purple mt-2">
                -{maxPickUsable.toLocaleString()}원 할인 적용 💜
              </p>
            )}
          </div>
          )}
        </div>

        {/* 결제 요약 + 주문 버튼 */}
        <div className="flex-shrink-0 px-4 pt-3 pb-6 border-t border-pick-border bg-white">
          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-pick-text-sub">메뉴 합계</span>
              <span className="font-bold text-pick-text">{itemsAmount.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-pick-text-sub flex items-center gap-1"><Bike size={13} />배달비</span>
              <span className="font-bold text-pick-text">
                {effectiveDeliveryFee === 0
                  ? <span className="text-green-600">{couponFreeDelivery ? "무료 (쿠폰)" : "무료"}</span>
                  : `+${effectiveDeliveryFee.toLocaleString()}원`}
              </span>
            </div>
            {selectedCoupon && isCouponApplicable && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-pick-purple font-medium flex items-center gap-1">
                  <Ticket size={12} />쿠폰 혜택
                </span>
                <span className="font-bold text-pick-purple text-xs">
                  {selectedCoupon.coupon.type === "free_delivery" && "배달비 무료"}
                  {selectedCoupon.coupon.type === "fixed_pick"    && `+${selectedCoupon.coupon.value.toLocaleString()} PICK`}
                  {selectedCoupon.coupon.type === "pick_rate"     && `적립 +${selectedCoupon.coupon.value}%`}
                </span>
              </div>
            )}
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
              주문 후 {pickReward.toLocaleString()} PICK 적립 예정 ✨
              {(extraReward > 0 || couponFixedPick > 0) && (
                <span className="text-pick-purple font-bold"> (쿠폰 포함)</span>
              )}
            </p>
          </div>

          {isBelowMin && (
            <p className="text-xs text-red-500 font-bold text-center mb-2">
              최소 주문금액 {cart.minOrderAmount.toLocaleString()}원까지{" "}
              {(cart.minOrderAmount - itemsAmount).toLocaleString()}원 더 담아야 해요
            </p>
          )}
          {selectedCoupon && !isCouponApplicable && (
            <p className="text-xs text-amber-600 font-bold text-center mb-2">
              ⚠️ 쿠폰 최소주문금액({selectedCoupon.coupon.minOrder.toLocaleString()}원) 미달 — 쿠폰이 적용되지 않아요
            </p>
          )}
          {!user && (
            <p className="text-xs text-amber-600 font-bold text-center mb-2">
              ⚠️ 로그인 후 주문하면 PICK이 적립됩니다
            </p>
          )}
          {orderType === "delivery" && !deliveryAddressText && (
            <p className="text-xs text-red-500 font-bold text-center mb-2">
              📍 배달 주소를 입력해주세요
            </p>
          )}

          <button
            onClick={() => void handleOrder()}
            disabled={isBelowMin || isOrdering}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOrdering ? (
              <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />주문 중...</>
            ) : paymentMethod === "TOSS" ? (
              <><CreditCard size={18} />{totalPaid.toLocaleString()}원 {orderType === "takeout" ? "포장" : "카드"} 결제</>
            ) : (
              <><ShoppingBag size={18} />{totalPaid.toLocaleString()}원 {orderType === "takeout" ? "포장" : "PICK"} 결제</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
