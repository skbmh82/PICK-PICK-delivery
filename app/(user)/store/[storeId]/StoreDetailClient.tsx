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
  Heart,
  MessageSquare,
  X,
  Check,
} from "lucide-react";
import { CATEGORY_META } from "@/lib/utils/categoryEmoji";
import { useCartStore, type SelectedOption } from "@/stores/cartStore";
import CartBottomSheet from "@/components/cart/CartBottomSheet";

// ── 가게 상세용 타입 ───────────────────────────────────
export interface MenuOption {
  id:         string;
  name:       string;
  extraPrice: number;
}

export interface OptionGroup {
  id:         string;
  name:       string;
  isRequired: boolean;
  maxSelect:  number;
  options:    MenuOption[];
}

export interface MenuItem {
  id:           string;
  name:         string;
  description:  string;
  price:        number;
  image:        string;       // 이모지
  isPopular?:   boolean;
  isAvailable?: boolean;
  category:     string;
  optionGroups?: OptionGroup[];
}

export interface ReviewItem {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  userName: string;
}

export interface StoreDetail {
  id: string;
  name: string;
  category: string;
  emoji: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  deliveryFee: number;
  minOrderAmount: number;
  pickRewardRate: number;
  tags: string[];
  menus: MenuItem[];
}

/* ────────────── 옵션 선택 모달 ────────────── */
function OptionSelectModal({
  menu,
  onConfirm,
  onClose,
}: {
  menu:      MenuItem;
  onConfirm: (options: SelectedOption[]) => void;
  onClose:   () => void;
}) {
  // groupId → Set of selected optionIds
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});

  const groups = menu.optionGroups ?? [];

  const toggle = (group: OptionGroup, optionId: string) => {
    setSelected((prev) => {
      const cur = new Set(prev[group.id] ?? []);
      if (cur.has(optionId)) {
        cur.delete(optionId);
      } else {
        if (group.maxSelect === 1) {
          cur.clear();
        } else if (cur.size >= group.maxSelect) {
          // maxSelect 초과 시 가장 오래된 항목 제거
          const [first] = cur;
          cur.delete(first);
        }
        cur.add(optionId);
      }
      return { ...prev, [group.id]: cur };
    });
  };

  const allRequiredSelected = groups
    .filter((g) => g.isRequired)
    .every((g) => (selected[g.id]?.size ?? 0) > 0);

  const extraTotal = groups.reduce((sum, g) => {
    const opts = g.options.filter((o) => selected[g.id]?.has(o.id));
    return sum + opts.reduce((s, o) => s + o.extraPrice, 0);
  }, 0);

  const handleConfirm = () => {
    const flat: SelectedOption[] = [];
    for (const g of groups) {
      for (const o of g.options) {
        if (selected[g.id]?.has(o.id)) {
          flat.push({ groupId: g.id, groupName: g.name, optionId: o.id, optionName: o.name, extraPrice: o.extraPrice });
        }
      }
    }
    onConfirm(flat);
    onClose();
  };

  const totalPrice = menu.price + extraTotal;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[65] backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[70] bg-white dark:bg-pick-card rounded-t-3xl shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden">
        {/* 핸들 + 헤더 */}
        <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-pick-border">
          <div className="w-10 h-1 bg-pick-border rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-4xl flex-shrink-0">{menu.image}</span>
              <div className="min-w-0">
                <p className="font-black text-pick-text text-base leading-snug truncate">{menu.name}</p>
                <p className="text-xs text-pick-text-sub mt-0.5">{menu.price.toLocaleString()}원~</p>
              </div>
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg hover:bg-pick-border transition-colors">
              <X size={16} className="text-pick-text-sub" />
            </button>
          </div>
        </div>

        {/* 스크롤 옵션 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-black text-pick-text text-sm">{group.name}</p>
                {group.isRequired ? (
                  <span className="text-[10px] font-black text-white bg-pick-purple px-2 py-0.5 rounded-full">필수</span>
                ) : (
                  <span className="text-[10px] font-bold text-pick-text-sub bg-pick-bg border border-pick-border px-2 py-0.5 rounded-full">선택</span>
                )}
                {group.maxSelect > 1 && (
                  <span className="text-[10px] text-pick-text-sub ml-auto">최대 {group.maxSelect}개</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {group.options.map((opt) => {
                  const isChosen = selected[group.id]?.has(opt.id) ?? false;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggle(group, opt.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl border-2 transition-all ${
                        isChosen
                          ? "border-pick-purple bg-pick-bg"
                          : "border-pick-border bg-white"
                      }`}
                    >
                      <span className={`text-sm font-bold ${isChosen ? "text-pick-purple" : "text-pick-text"}`}>
                        {opt.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {opt.extraPrice > 0 && (
                          <span className={`text-xs font-bold ${isChosen ? "text-pick-purple" : "text-pick-text-sub"}`}>
                            +{opt.extraPrice.toLocaleString()}원
                          </span>
                        )}
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isChosen ? "border-pick-purple bg-pick-purple" : "border-pick-border bg-white"
                        }`}>
                          {isChosen && <Check size={11} className="text-white" strokeWidth={3} />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 담기 버튼 */}
        <div className="flex-shrink-0 px-4 pt-3 pb-6 border-t border-pick-border bg-white">
          <button
            onClick={handleConfirm}
            disabled={!allRequiredSelected}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            {totalPrice.toLocaleString()}원 담기
          </button>
          {!allRequiredSelected && (
            <p className="text-xs text-red-500 font-bold text-center mt-2">
              필수 옵션을 선택해주세요
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ────────────── 메뉴 아이템 카드 ────────────── */
function MenuItemCard({ menu, onAdd }: { menu: MenuItem; onAdd: () => void }) {
  const cartItems = useCartStore((s) => s.items);
  const count = cartItems.find((i) => i.menuId === menu.id)?.quantity ?? 0;

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border px-4 py-4 shadow-sm">
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
  menus: MenuItem[];
  onAdd: (menu: MenuItem) => void;
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
/* ────────────── 리뷰 섹션 ────────────── */
function ReviewSection({ reviews, rating, reviewCount }: { reviews: ReviewItem[]; rating: number; reviewCount: number }) {
  if (reviews.length === 0) return null;

  return (
    <div className="mx-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={16} className="text-pick-purple" />
        <h2 className="font-black text-pick-text text-base">리뷰</h2>
        <span className="flex items-center gap-1 ml-1">
          <Star size={13} className="text-pick-yellow fill-pick-yellow" />
          <span className="font-black text-pick-text text-sm">{rating}</span>
          <span className="text-pick-text-sub text-xs">({reviewCount})</span>
        </span>
      </div>
      <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        {reviews.map((r) => (
          <div key={r.id} className="px-4 py-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-pick-text text-sm">{r.userName}</span>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={11}
                      className={s <= r.rating ? "text-pick-yellow fill-pick-yellow" : "text-gray-200 fill-gray-200"} />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-pick-text-sub">
                {new Date(r.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              </span>
            </div>
            {r.content && (
              <p className="text-sm text-pick-text-sub leading-relaxed">{r.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoreDetailClient({
  store,
  isFavorited: initialFavorited = false,
  reviews = [],
}: {
  store: StoreDetail;
  isFavorited?: boolean;
  reviews?: ReviewItem[];
}) {
  const [cartOpen,      setCartOpen]      = useState(false);
  const [favorited,     setFavorited]     = useState(initialFavorited);
  const [favLoading,    setFavLoading]    = useState(false);
  const [optionTarget,  setOptionTarget]  = useState<MenuItem | null>(null);
  const handleCartClose = useCallback(() => setCartOpen(false), []);
  const addItem     = useCartStore((s) => s.addItem);
  const cartItems   = useCartStore((s) => s.items);
  const cartStoreId = useCartStore((s) => s.storeId);
  const cartCount   = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const categoryInfo = CATEGORY_META[store.category];

  // 메뉴를 카테고리별로 그룹화
  const menuGroups = store.menus.reduce<Record<string, MenuItem[]>>((acc, menu) => {
    if (!acc[menu.category]) acc[menu.category] = [];
    acc[menu.category].push(menu);
    return acc;
  }, {});

  const storeInfo = {
    storeId:        store.id,
    storeName:      store.name,
    storeEmoji:     store.emoji,
    deliveryFee:    store.deliveryFee,
    minOrderAmount: store.minOrderAmount,
    pickRewardRate: store.pickRewardRate,
  };

  const handleAddMenu = (menu: MenuItem) => {
    if (menu.optionGroups && menu.optionGroups.length > 0) {
      setOptionTarget(menu);
    } else {
      addItem(storeInfo, { menuId: menu.id, menuName: menu.name, price: menu.price, image: menu.image });
    }
  };

  const handleOptionConfirm = (options: SelectedOption[]) => {
    if (!optionTarget) return;
    const extraPrice = options.reduce((s, o) => s + o.extraPrice, 0);
    addItem(storeInfo, {
      menuId:   optionTarget.id,
      menuName: optionTarget.name,
      price:    optionTarget.price + extraPrice,
      image:    optionTarget.image,
      options,
    });
  };

  const handleFavoriteToggle = async () => {
    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await fetch(`/api/favorites/${store.id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json() as { isFavorited: boolean };
        setFavorited(data.isFavorited);
      } else if (res.status === 401) {
        alert("로그인 후 즐겨찾기를 이용할 수 있어요 💜");
      }
    } finally {
      setFavLoading(false);
    }
  };

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
        {/* 뒤로가기 */}
        <Link
          href={`/home?category=${store.category}`}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-pick-purple-dark" />
        </Link>
        {/* 즐겨찾기 */}
        <button
          onClick={() => void handleFavoriteToggle()}
          disabled={favLoading}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm active:scale-90 transition-transform disabled:opacity-60"
          aria-label="즐겨찾기"
        >
          <Heart
            size={20}
            className={favorited ? "text-red-500 fill-red-500" : "text-pick-text-sub"}
          />
        </button>
      </div>

      {/* ── 가게 정보 카드 ── */}
      <div className="mx-4 -mt-6 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-lg px-5 py-5 mb-5">
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

      {/* ── 리뷰 목록 ── */}
      <ReviewSection reviews={reviews} rating={store.rating} reviewCount={store.reviewCount} />

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

      {/* ── 옵션 선택 모달 ── */}
      {optionTarget && (
        <OptionSelectModal
          menu={optionTarget}
          onConfirm={handleOptionConfirm}
          onClose={() => setOptionTarget(null)}
        />
      )}
    </div>
  );
}
