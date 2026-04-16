"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Star, Bike } from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

interface StoreSnap {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  rating: number;
  delivery_fee: number;
  is_open: boolean;
}

export default function RecentlyViewedStores() {
  const [stores, setStores] = useState<StoreSnap[]>([]);

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("pickpick_recent_stores") ?? "[]");
      if (ids.length === 0) return;

      fetch(`/api/stores/recent?ids=${ids.slice(0, 6).join(",")}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data?.stores) return;
          // localStorage 순서대로 정렬
          const ordered = ids
            .map((id) => data.stores.find((s: StoreSnap) => s.id === id))
            .filter(Boolean) as StoreSnap[];
          setStores(ordered);
        })
        .catch(() => null);
    } catch {}
  }, []);

  if (stores.length === 0) return null;

  return (
    <section className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={15} className="text-pick-purple fill-pick-purple/20" />
        <h2 className="font-black text-pick-text text-base">최근 본 가게</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/store/${store.id}`}
            className="flex-shrink-0 w-36 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm active:scale-95 transition-transform overflow-hidden"
          >
            <div className="h-20 bg-gradient-to-br from-pick-bg to-pick-border flex items-center justify-center relative">
              {store.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{getCategoryEmoji(store.category)}</span>
              )}
              {!store.is_open && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-3xl">
                  <span className="text-white text-[10px] font-black">마감</span>
                </div>
              )}
            </div>
            <div className="px-2.5 pt-2 pb-2.5">
              <p className="font-black text-pick-text text-xs leading-snug truncate mb-1">{store.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-pick-text-sub">
                <Star size={9} className="text-pick-yellow fill-pick-yellow flex-shrink-0" />
                <span className="font-bold text-pick-text">{store.rating}</span>
                <span className="mx-0.5">·</span>
                <Bike size={9} className="flex-shrink-0" />
                <span>
                  {store.delivery_fee === 0
                    ? <span className="text-green-600 font-bold">무료</span>
                    : `${store.delivery_fee.toLocaleString()}원`}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
