"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Flame,
  Heart,
  MessageSquare,
  X,
  Check,
  MapPin,
  Phone,
  AlertCircle,
} from "lucide-react";
import { CATEGORY_META } from "@/lib/utils/categoryEmoji";
import { useCartStore, type SelectedOption } from "@/stores/cartStore";
import CartBottomSheet from "@/components/cart/CartBottomSheet";

const KakaoMap = dynamic(() => import("@/components/shared/KakaoMap"), { ssr: false });

// ── 영업시간 타입 ──────────────────────────────────────
export interface TodayHours {
  openTime:         string;  // "09:00"
  closeTime:        string;  // "22:00"
  isClosed:         boolean;
  isCurrentlyOpen:  boolean;
}

// ── 주간 영업시간 타입 ─────────────────────────────────
export interface WeeklyHour {
  dayOfWeek: number;  // 0=일, 1=월 ... 6=토
  openTime:  string;
  closeTime: string;
  isClosed:  boolean;
}

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
  image:        string;       // 이모지 (imageUrl 없을 때 fallback)
  imageUrl?:    string | null; // 실사 이미지 URL
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
  imageUrls?: string[];
  ownerReply?: string | null;
  ownerRepliedAt?: string | null;
}

export interface StoreDetail {
  id: string;
  name: string;
  category: string;
  emoji: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  deliveryFee: number;
  minOrderAmount: number;
  tags: string[];
  menus: MenuItem[];
  description: string | null;
  notice: string | null;
  // 위치 정보
  address: string;
  phone: string | null;
  lat: number;
  lng: number;
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
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-pick-bg border border-pick-border flex items-center justify-center overflow-hidden">
                {menu.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{menu.image}</span>
                )}
              </div>
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
      {/* 썸네일 (실사 이미지 or 이모지) */}
      <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-pick-bg border border-pick-border flex items-center justify-center overflow-hidden">
        {menu.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">{menu.image}</span>
        )}
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

/* ────────────── 리뷰 카드 ────────────── */
function ReviewCard({ r }: { r: ReviewItem }) {
  return (
    <div className="px-4 py-4">
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
      {r.imageUrls && r.imageUrls.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {r.imageUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`리뷰 사진 ${i + 1}`}
              className="w-20 h-20 rounded-2xl object-cover border border-pick-border"
            />
          ))}
        </div>
      )}
      {r.ownerReply && (
        <div className="mt-2.5 bg-pick-bg border border-pick-border rounded-2xl px-3 py-2.5">
          <p className="text-[10px] font-black text-pick-purple mb-1">🏪 사장님 답글</p>
          <p className="text-xs text-pick-text leading-relaxed">{r.ownerReply}</p>
        </div>
      )}
    </div>
  );
}

/* ────────────── 주간 영업시간 ────────────── */
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function WeeklyHoursSection({
  weeklyHours,
  todayDow,
}: {
  weeklyHours: WeeklyHour[];
  todayDow:    number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (weeklyHours.length === 0) return null;

  return (
    <div className="mx-4 mb-5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border px-4 py-3.5 shadow-sm active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-pick-purple" />
          <span className="font-black text-pick-text text-sm">주간 영업시간</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-pick-text-sub transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-1 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm">
          {weeklyHours.map((h) => {
            const isToday = h.dayOfWeek === todayDow;
            return (
              <div
                key={h.dayOfWeek}
                className={`flex items-center justify-between px-5 py-3 border-b border-pick-border last:border-0 ${
                  isToday ? "bg-pick-purple/5" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black w-5 text-center ${isToday ? "text-pick-purple" : "text-pick-text"}`}>
                    {DAY_NAMES[h.dayOfWeek]}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-black bg-pick-purple text-white px-1.5 py-0.5 rounded-full">
                      오늘
                    </span>
                  )}
                </div>
                {h.isClosed ? (
                  <span className="text-xs font-bold text-pick-text-sub">휴무</span>
                ) : (
                  <span className={`text-xs font-bold ${isToday ? "text-pick-purple" : "text-pick-text"}`}>
                    {h.openTime.slice(0, 5)} ~ {h.closeTime.slice(0, 5)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────── 메인 클라이언트 컴포넌트 ────────────── */
/* ────────────── 리뷰 섹션 ────────────── */
function ReviewSection({
  storeId,
  initialReviews,
  rating,
  reviewCount,
}: {
  storeId: string;
  initialReviews: ReviewItem[];
  rating: number;
  reviewCount: number;
}) {
  const [reviews,     setReviews]     = useState<ReviewItem[]>(initialReviews);
  const [hasMore,     setHasMore]     = useState(initialReviews.length === 10);
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(initialReviews.length);

  // initialReviews prop 변경 시 동기화
  useEffect(() => {
    setReviews(initialReviews);
    offsetRef.current = initialReviews.length;
    setHasMore(initialReviews.length === 10);
  }, [initialReviews]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/reviews/store/${storeId}?offset=${offsetRef.current}&limit=10`);
      if (!res.ok) return;
      const { reviews: more, hasMore: more2 } = await res.json() as { reviews: ReviewItem[]; hasMore: boolean };
      setReviews((prev) => [...prev, ...more]);
      offsetRef.current += more.length;
      setHasMore(more2);
    } finally {
      setLoadingMore(false);
    }
  };

  if (reviews.length === 0) return (
    <div id="review-section" className="mx-4 mb-6">
      <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm px-5 py-10 flex flex-col items-center gap-3">
        <span className="text-4xl">📭</span>
        <p className="font-black text-pick-text-sub text-sm">아직 리뷰가 없어요</p>
        <p className="text-xs text-pick-text-sub">첫 번째 리뷰를 남겨보세요!</p>
      </div>
    </div>
  );

  return (
    <div id="review-section" className="mx-4 mb-6">
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
        {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
      </div>
      {hasMore && (
        <button
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="mt-3 w-full py-3 rounded-full border-2 border-pick-border text-pick-text-sub text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 bg-white dark:bg-pick-card"
        >
          {loadingMore
            ? <span className="w-4 h-4 border-2 border-pick-border border-t-pick-purple rounded-full animate-spin" />
            : "리뷰 더 보기 ▼"}
        </button>
      )}
    </div>
  );
}

export default function StoreDetailClient({
  store,
  isFavorited: initialFavorited = false,
  reviews = [],
  todayHours = null,
  weeklyHours = null,
  initialTab = "menu",
}: {
  store: StoreDetail;
  isFavorited?: boolean;
  reviews?: ReviewItem[];
  todayHours?: TodayHours | null;
  weeklyHours?: WeeklyHour[] | null;
  initialTab?: "menu" | "review" | "info";
}) {
  const [cartOpen,      setCartOpen]      = useState(false);
  const [favorited,     setFavorited]     = useState(initialFavorited);
  const [favLoading,    setFavLoading]    = useState(false);
  const [optionTarget,  setOptionTarget]  = useState<MenuItem | null>(null);
  const [activeTab,     setActiveTab]     = useState<"menu" | "review" | "info">(initialTab);
  const todayDow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).getDay();

  // 최근 본 가게 저장
  useEffect(() => {
    try {
      const key = "pickpick_recent_stores";
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
      const updated = [store.id, ...saved.filter((id) => id !== store.id)].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }, [store.id]);
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
    pickRewardRate: 0,
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
        <div className="h-52 bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light flex items-center justify-center overflow-hidden">
          {store.bannerUrl ?? store.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(store.bannerUrl ?? store.imageUrl)!}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-9xl drop-shadow-lg">{store.emoji}</span>
          )}
          {/* 이미지 위에 반투명 오버레이 (텍스트 가독성) */}
          {(store.bannerUrl ?? store.imageUrl) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          )}
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
        <button
          className="flex items-center gap-1.5 mb-4 active:opacity-70 transition-opacity"
          onClick={() => setActiveTab("review")}
        >
          <Star size={16} className="text-pick-yellow fill-pick-yellow" />
          <span className="font-black text-pick-text text-sm">{store.rating}</span>
          <span className="text-pick-text-sub text-xs">
            리뷰 {store.reviewCount.toLocaleString()}개
          </span>
          <ChevronRight size={14} className="text-pick-text-sub" />
        </button>
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
        </div>
        <p className="text-xs text-pick-text-sub mt-3">
          최소 주문금액 {store.minOrderAmount.toLocaleString()}원
        </p>
      </div>

      {/* ── 탭바 ── */}
      <div className="sticky top-0 z-20 bg-white border-b-2 border-pick-border flex mb-1">
        {(["menu", "review", "info"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-black transition-colors ${
              activeTab === tab
                ? "text-pick-purple border-b-2 border-pick-purple -mb-[2px]"
                : "text-pick-text-sub"
            }`}
          >
            {tab === "menu" ? "메뉴" : tab === "review" ? "리뷰" : "정보"}
          </button>
        ))}
      </div>

      {/* ── 정보 탭 ── */}
      {activeTab === "info" && <>
      {/* ── 영업 상태 / 영업시간 ── */}
      {todayHours && (
        <div className={`mx-4 mb-5 rounded-3xl border-2 px-4 py-3.5 flex items-center gap-3 ${
          todayHours.isClosed
            ? "bg-gray-50 border-gray-200"
            : todayHours.isCurrentlyOpen
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
        }`}>
          <span className={`w-9 h-9 flex items-center justify-center rounded-2xl flex-shrink-0 ${
            todayHours.isClosed
              ? "bg-gray-100"
              : todayHours.isCurrentlyOpen
                ? "bg-green-100"
                : "bg-amber-100"
          }`}>
            {todayHours.isClosed || !todayHours.isCurrentlyOpen
              ? <AlertCircle size={18} className={todayHours.isClosed ? "text-gray-400" : "text-amber-600"} />
              : <Clock size={18} className="text-green-600" />
            }
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black ${
              todayHours.isClosed
                ? "text-gray-500"
                : todayHours.isCurrentlyOpen
                  ? "text-green-700"
                  : "text-amber-700"
            }`}>
              {todayHours.isClosed
                ? "오늘 휴무예요"
                : todayHours.isCurrentlyOpen
                  ? "영업 중"
                  : "영업 준비 중 / 마감"
              }
            </p>
            {!todayHours.isClosed && (
              <p className="text-xs text-pick-text-sub mt-0.5">
                오늘 {todayHours.openTime} ~ {todayHours.closeTime}
              </p>
            )}
          </div>
          {(todayHours.isClosed || !todayHours.isCurrentlyOpen) && (
            <span className="flex-shrink-0 text-[10px] font-black bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
              주문 불가
            </span>
          )}
        </div>
      )}

      {/* ── 공지사항 ── */}
      {store.notice && (
        <div className="mx-4 mb-5 bg-amber-50 border-2 border-amber-200 rounded-3xl px-4 py-4">
          <h3 className="font-black text-amber-800 text-sm flex items-center gap-2 mb-2">
            📢 공지사항
          </h3>
          <p className="text-xs text-amber-700 leading-relaxed whitespace-pre-wrap">{store.notice}</p>
        </div>
      )}

      {/* ── 가게 소개 ── */}
      {store.description && (
        <div className="mx-4 mb-5 bg-white border-2 border-pick-border rounded-3xl px-4 py-4">
          <h3 className="font-black text-pick-text text-sm flex items-center gap-2 mb-2">
            🏪 가게 소개
          </h3>
          <p className="text-xs text-pick-text-sub leading-relaxed whitespace-pre-wrap">{store.description}</p>
        </div>
      )}

      {/* ── 주간 영업시간 ── */}
      {weeklyHours && weeklyHours.length > 0 && (
        <WeeklyHoursSection weeklyHours={weeklyHours} todayDow={todayDow} />
      )}

      {/* ── 가게 위치 ── */}
      <div className="mx-4 mb-5 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <h3 className="font-black text-pick-text text-sm flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-pick-purple" />
            가게 위치
          </h3>
          <p className="text-xs text-pick-text-sub mb-2 leading-relaxed">{store.address}</p>
          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              className="flex items-center gap-1.5 text-xs font-bold text-pick-purple"
            >
              <Phone size={12} />
              {store.phone}
            </a>
          )}
        </div>
        {store.lat !== 0 && store.lng !== 0 && (
          <KakaoMap
            lat={store.lat}
            lng={store.lng}
            label={store.name}
            className="w-full h-44"
          />
        )}
      </div>
      </>}

      {/* ── 메뉴 탭 ── */}
      {activeTab === "menu" && (
        <div className="mb-4">
          <h2 className="font-black text-pick-text text-base px-4 mb-5 flex items-center gap-2">
            <ShoppingBag size={18} className="text-pick-purple" />
            메뉴
          </h2>
          {Object.entries(menuGroups).map(([cat, menus]) => (
            <MenuSection key={cat} category={cat} menus={menus} onAdd={handleAddMenu} />
          ))}
        </div>
      )}

      {/* ── 리뷰 탭 ── */}
      {activeTab === "review" && (
        <ReviewSection storeId={store.id} initialReviews={reviews} rating={store.rating} reviewCount={store.reviewCount} />
      )}

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
