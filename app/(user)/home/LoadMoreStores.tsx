"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Clock, Bike } from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

interface StoreRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string;
  image_url?: string | null;
  rating: number;
  review_count: number;
  delivery_time: number;
  delivery_fee: number;
  min_order_amount: number;
  is_open: boolean;
}

function StoreCard({ store }: { store: StoreRow }) {
  const emoji = getCategoryEmoji(store.category);
  return (
    <Link
      href={`/store/${store.id}`}
      className="block bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm active:scale-95 transition-transform duration-150 overflow-hidden"
    >
      <div className="h-32 bg-gradient-to-br from-pick-bg to-pick-border/30 flex items-center justify-center relative">
        {store.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl">{emoji}</span>
        )}
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-black text-pick-text text-base leading-snug flex-1">{store.name}</h3>
        </div>
        {store.description && (
          <p className="text-xs text-pick-text-sub mb-2 line-clamp-1">{store.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-pick-text-sub">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-pick-yellow fill-pick-yellow" />
            <span className="font-bold text-pick-text">{store.rating}</span>
            <span>({store.review_count})</span>
          </span>
          <span className="w-0.5 h-3 bg-pick-border" />
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {store.delivery_time}분
          </span>
          <span className="w-0.5 h-3 bg-pick-border" />
          <span className="flex items-center gap-1">
            <Bike size={12} />
            {store.delivery_fee === 0
              ? <span className="font-bold text-green-600">무료배달</span>
              : `${store.delivery_fee.toLocaleString()}원`}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LoadMoreStores({
  category,
  sort,
  initialOffset,
  initialHasMore,
  openOnly = false,
  lat,
  lng,
}: {
  category: string;
  sort: string;
  initialOffset: number;
  initialHasMore: boolean;
  openOnly?: boolean;
  lat?: number | null;
  lng?: number | null;
}) {
  const [stores,   setStores]   = useState<StoreRow[]>([]);
  const [hasMore,  setHasMore]  = useState(initialHasMore);
  const [loading,  setLoading]  = useState(false);
  const [offset,   setOffset]   = useState(initialOffset);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, sort, offset: String(offset), limit: "12" });
      if (openOnly) params.set("open", "1");
      if (lat != null) params.set("lat", String(lat));
      if (lng != null) params.set("lng", String(lng));
      const res    = await fetch(`/api/stores?${params.toString()}`);
      if (!res.ok) return;
      const { stores: more, hasMore: more2 } = await res.json() as { stores: StoreRow[]; hasMore: boolean };
      setStores((prev) => [...prev, ...more]);
      setOffset((prev) => prev + more.length);
      setHasMore(more2);
    } finally {
      setLoading(false);
    }
  };

  if (stores.length === 0 && !initialHasMore) return null;

  return (
    <>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
      {hasMore && (
        <button
          onClick={() => void loadMore()}
          disabled={loading}
          className="w-full py-3.5 rounded-full border-2 border-pick-border bg-white dark:bg-pick-card text-pick-text-sub text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-pick-border border-t-pick-purple rounded-full animate-spin" />
            : "가게 더 보기 ▼"}
        </button>
      )}
    </>
  );
}
