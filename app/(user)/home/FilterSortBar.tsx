"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Star, Bike, Clock, ShoppingBag, Store } from "lucide-react";

export type SortKey = "rating" | "delivery_fee" | "min_order" | "delivery_time";

const SORT_OPTIONS: { key: SortKey; label: string; Icon: React.ElementType }[] = [
  { key: "rating",        label: "평점순",         Icon: Star },
  { key: "delivery_fee",  label: "배달비 낮은순",   Icon: Bike },
  { key: "min_order",     label: "최소주문 낮은순",  Icon: ShoppingBag },
  { key: "delivery_time", label: "빠른배달순",      Icon: Clock },
];

export default function FilterSortBar({ currentSort }: { currentSort: SortKey }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const openOnly     = searchParams.get("open") === "1";

  const handleSort = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleOpen = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (openOnly) params.delete("open");
    else params.set("open", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const scrollInto = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="relative mb-3">
      {/* 오른쪽 끝 fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
        style={{ background: "linear-gradient(to left, white, transparent)" }} />

      {/* 가로 스크롤 컨테이너 */}
      <div className="flex gap-2 px-4 pb-0.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {/* 영업중 필터 */}
        <button
          onClick={(e) => { scrollInto(e); toggleOpen(); }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all active:scale-95 ${
            openOnly
              ? "bg-green-500 text-white border-green-500 shadow-sm"
              : "bg-white text-pick-text-sub border-pick-border"
          }`}
        >
          <Store size={11} className={openOnly ? "text-white" : "text-pick-text-sub"} />
          영업중
        </button>

        {SORT_OPTIONS.map(({ key, label, Icon }) => {
          const active = currentSort === key;
          return (
            <button
              key={key}
              onClick={(e) => { scrollInto(e); handleSort(key); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all active:scale-95 ${
                active
                  ? "bg-pick-purple text-white border-pick-purple shadow-sm"
                  : "bg-white text-pick-text-sub border-pick-border"
              }`}
            >
              <Icon size={11} className={active ? "text-white" : "text-pick-text-sub"} />
              {label}
            </button>
          );
        })}

        {/* 스크롤 끝 여백 */}
        <div className="flex-shrink-0 w-6" />
      </div>
    </div>
  );
}

