"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star, Bike, Clock, ShoppingBag } from "lucide-react";

export type SortKey = "rating" | "delivery_fee" | "min_order" | "delivery_time";

const SORT_OPTIONS: { key: SortKey; label: string; Icon: React.ElementType }[] = [
  { key: "rating",        label: "평점순",      Icon: Star },
  { key: "delivery_fee",  label: "배달비 낮은순", Icon: Bike },
  { key: "min_order",     label: "최소주문 낮은순", Icon: ShoppingBag },
  { key: "delivery_time", label: "빠른배달순",   Icon: Clock },
];

export default function FilterSortBar({ currentSort }: { currentSort: SortKey }) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        <SlidersHorizontal size={14} className="text-pick-text-sub flex-shrink-0" />
        {SORT_OPTIONS.map(({ key, label, Icon }) => {
          const active = currentSort === key;
          return (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all active:scale-95 ${
                active
                  ? "bg-pick-purple text-white border-pick-purple shadow-sm"
                  : "bg-white dark:bg-pick-card text-pick-text-sub border-pick-border"
              }`}
            >
              <Icon size={11} className={active ? "text-white" : "text-pick-text-sub"} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
