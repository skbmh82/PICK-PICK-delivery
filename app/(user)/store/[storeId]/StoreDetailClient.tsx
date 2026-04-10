"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  ChevronRight,
  ShoppingBag,
  Flame,
} from "lucide-react";
import { CATEGORY_LABELS, type MockMenu, type MockStore } from "@/lib/mock/stores";
import { useCartStore } from "@/stores/cartStore";
import CartBottomSheet from "@/components/cart/CartBottomSheet";

/* ────────────── 메뉴 아이템 카드 ────────────── */
function MenuItemCard({ menu, onAdd }: { menu: MockMenu; onAdd: () => void }) {
  const cartItems = useCartStore((s) => s.items);
  const count = cartItems.find((i) => i.menuId === menu.id)?.quantity ?? 0;

  return (
    <div className="flex items-center gap-4 bg-white rounded-3xl border-2 border-pick-border px-4 py-4 shadow-sm">
      {/* 이모지 썸네일 */}
      <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-pick-bg border border-pick-border flex items-center justify-center">
        <span className="text-4xl">{menu.image}</span>
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {menu.isPopular && (
            <span className="flex items-center gap-0.5 text-xs font-black text-pick-yellow bg-pick-yellow-light/40 px-2 py-0.5 rounded-full">
              <Flame size={10} />
              인기
            </span>
          )}
          {!menu.isAvailable && (
            <span className="text-xs font-bold text-pick-text-sub bg-gray-100 px-2 py-0.5 rounded-full">
              품절
            </span>
          )}
        </div>
        <p className={`font-bold text-pick-text text-sm leading-snug ${!menu.isAvailable ? "opacity-40" : ""}`}>
          {menu.name}
        </p>
        <p className="text-xs text-pick-text-sub mt-0.5 leading-relaxed line-clamp-2">
          {menu.description}
        </p>
        <p className={`font-black text-pick-purple text-base mt-2 ${!menu.isAvailable ? "opacity-40" : ""}`}>
          {menu.price.toLocaleString()}원
        </p>
      </div>

      {/* 담기 버튼 / 수량 표시 */}
      {count > 0 ? (
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-pick-purple text-white flex items-center justify-center shadow-md font-black text-sm">
          {count}
        </span>
      ) : (
        <button
          disabled={!menu.isAvailable}
          onClick={onAdd}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-pick-purple text-white flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`${menu.name} 장바구니 담기`}
        >
          <span className="text-xl leading-none font-bold">+</span>
        </button>
      )}
    </div>
  );
}

/* ────────────── 메뉴 섹션 ────────────── */
function MenuSection({
  category,
  menus,
  onAdd,
}: {
  category: string;
  menus: MockMenu[];
  onAdd: (menu: MockMenu) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-black text-pick-text text-sm px-4 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-pick-purple rounded-full inline-block" />
        {category}
      </h3>
      <div className="px-4 flex flex-col gap-3">
        {menus.map((menu) => (
          <MenuItemCard key={menu.id} menu={menu} onAdd={() => onAdd(menu)} />
        ))}
      </div>
    </div>
  );
}

/* ────────────── 메인 클라이언트 컴포넌트 ────────────── */
export default function StoreDetailClient({ store }: { store: MockStore }) {
  const [cartOpen, setCartOpen] = useState(false);
  const handleCartClose = useCallback(() => setCartOpen(false), []);
  const addItem    = useCartStore((s) => s.addItem);
  const cartItems  = useCartStore((s) => s.items);
  const cartStoreId = useCartStore((s) => s.storeId);
  const cartCount  = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const categoryInfo = CATEGORY_LABELS[store.category];

  // 메뉴를 카테고리별로 그룹화
  const menuGroups = store.menus.reduce<Record<string, MockMenu[]>>((acc, menu) => {
    if (!acc[menu.category]) acc[menu.category] = [];
    acc[menu.category].push(menu);
    return acc;
  }, {});

  const storeInfo = {
    storeId: store.id,
    storeName: store.name,
    storeEmoji: store.emoji,
    deliveryFee: store.deliveryFee,
    minOrderAmount: store.minOrderAmount,
    pickRewardRate: store.pickRewardRate,
  };

  const handleAddMenu = (menu: MockMenu) => {
    addItem(storeInfo, {
      menuId: menu.id,
      menuName: menu.name,
      price: menu.price,
      image: menu.image,
    });
  };

  // 다른 가게 담긴 경우 확인
  const isDifferentStore = cartStoreId && cartStoreId !== store.id && cartCount > 0;

  return (
    <div className="min-h-full pb-28">
      {/* 다른 가게 담김 경고 */}
      {isDifferentStore && (
        <div className="mx-4 mt-4 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-amber-700">
            ⚠️ 다른 가게 메뉴가 담겨 있어요. 추가 시 기존 장바구니가 초기화됩니다.
          </p>
        </div>
      )}

      {/* ── 헤더 배너 ── */}
      <div className="relative">
        <div className="h-52 bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light flex items-center justify-center">
          <span className="text-9xl drop-shadow-lg">{store.emoji}</span>
        </div>
        <Link
          href={`/home?category=${store.category}`}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-pick-purple-dark" />
        </Link>
      </div>

      {/* ── 가게 정보 카드 ── */}
      <div className="mx-4 -mt-6 bg-white rounded-3xl border-2 border-pick-border shadow-lg px-5 py-5 mb-5">
        <span className="text-xs font-bold text-pick-purple bg-pick-bg border border-pick-border px-3 py-1 rounded-full">
          {categoryInfo?.emoji} {categoryInfo?.label}
        </span>
        <h1 className="font-black text-pick-text text-xl mt-2 mb-3 leading-snug">
          {store.name}
        </h1>
        <div className="flex items-center gap-1.5 mb-4">
          <Star size={16} className="text-pick-yellow fill-pick-yellow" />
          <span className="font-black text-pick-text text-sm">{store.rating}</span>
          <span className="text-pick-text-sub text-xs">
            리뷰 {store.reviewCount.toLocaleString()}개
          </span>
          <ChevronRight size={14} className="text-pick-text-sub" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-pick-bg border border-pick-border rounded-full px-3.5 py-2">
            <Clock size={13} className="text-pick-purple" />
            <span className="text-xs font-semibold text-pick-text">{store.deliveryTime}분 예상</span>
          </div>
          <div className="flex items-center gap-1.5 bg-pick-bg border border-pick-border rounded-full px-3.5 py-2">
            <Bike size={13} className="text-pick-purple" />
            <span className="text-xs font-semibold text-pick-text">
              {store.deliveryFee === 0
                ? "무료배달"
                : `배달비 ${store.deliveryFee.toLocaleString()}원`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-pick-yellow-light/30 border border-pick-yellow-light rounded-full px-3.5 py-2">
            <span className="text-xs font-black text-pick-yellow-dark">
              +{store.pickRewardRate}% PICK 적립
            </span>
          </div>
        </div>
        <p className="text-xs text-pick-text-sub mt-3">
          최소 주문금액 {store.minOrderAmount.toLocaleString()}원
        </p>
      </div>

      {/* ── 메뉴 목록 ── */}
      <div className="mb-4">
        <h2 className="font-black text-pick-text text-base px-4 mb-5 flex items-center gap-2">
          <ShoppingBag size={18} className="text-pick-purple" />
          메뉴
        </h2>
        {Object.entries(menuGroups).map(([cat, menus]) => (
          <MenuSection key={cat} category={cat} menus={menus} onAdd={handleAddMenu} />
        ))}
      </div>

      {/* ── 하단 장바구니 버튼 (고정) ── */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-30">
        <button
          onClick={() => setCartOpen(true)}
          className={`w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform ${
            cartCount === 0 ? "opacity-50" : "opacity-100"
          }`}
          disabled={cartCount === 0}
        >
          <ShoppingBag size={20} />
          {cartCount > 0
            ? `장바구니 보기 (${cartCount}개)`
            : "메뉴를 담아보세요"}
        </button>
      </div>

      {/* ── 장바구니 바텀시트 ── */}
      {cartOpen && cartStoreId === store.id && (
        <CartBottomSheet onClose={handleCartClose} />
      )}
    </div>
  );
}
