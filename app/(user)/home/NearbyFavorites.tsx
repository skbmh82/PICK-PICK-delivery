"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Star, Bike, MapPin } from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

interface FavStore {
  storeId:      string;
  name:         string;
  category:     string;
  rating:       number;
  deliveryFee:  number;
  deliveryTime: number;
  isOpen:       boolean;
  lat:          number | null;
  lng:          number | null;
  distanceKm?:  number;
}

interface Address {
  id:        string;
  label:     string;
  address:   string;
  isDefault: boolean;
  lat:       number | null;
  lng:       number | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MAX_DISTANCE_KM = 5;

export default function NearbyFavorites() {
  const [stores,      setStores]      = useState<FavStore[]>([]);
  const [addressLabel, setAddressLabel] = useState<string>("");
  const [ready,       setReady]       = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [addrRes, favRes] = await Promise.all([
          fetch("/api/users/addresses"),
          fetch("/api/users/favorites"),
        ]);
        if (!addrRes.ok || !favRes.ok) return;

        const addrData: { addresses: Address[] } = await addrRes.json();
        const favData:  { favorites: FavStore[] } = await favRes.json();

        if (cancelled) return;

        // 기본 주소(또는 첫 번째 주소) 좌표 가져오기
        const addresses: Address[] = addrData.addresses ?? [];
        const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

        if (!defaultAddr?.lat || !defaultAddr?.lng) {
          // 좌표 없으면 섹션 숨김
          setReady(true);
          return;
        }

        const { lat: aLat, lng: aLng, label, address } = defaultAddr;
        setAddressLabel(label ? `${label} (${address.slice(0, 12)}…)` : address.slice(0, 20));

        // 5km 이내 즐겨찾기 필터 + 거리 계산
        const nearby = (favData.favorites ?? [])
          .filter((s): s is FavStore & { lat: number; lng: number } =>
            s.lat != null && s.lng != null
          )
          .map((s) => ({
            ...s,
            distanceKm: haversineKm(aLat, aLng, s.lat, s.lng),
          }))
          .filter((s) => s.distanceKm <= MAX_DISTANCE_KM)
          .sort((a, b) => a.distanceKm - b.distanceKm);

        setStores(nearby);
      } catch {
        // 조용히 무시
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  // 로딩 중이거나 근처 즐겨찾기 없으면 렌더링 안함
  if (!ready || stores.length === 0) return null;

  return (
    <section className="px-4 py-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart size={15} className="text-red-400 fill-red-400" />
          <h2 className="font-black text-pick-text text-base">이 주소 근처 즐겨찾기</h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-pick-text-sub bg-pick-bg px-2.5 py-1 rounded-full border border-pick-border">
          <MapPin size={9} className="text-pick-purple" />
          <span className="font-semibold truncate max-w-[100px]">{addressLabel}</span>
        </div>
      </div>

      {/* 가로 스크롤 카드 */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {stores.map((store) => {
          const emoji = getCategoryEmoji(store.category);
          const dist  = store.distanceKm! < 1
            ? `${Math.round(store.distanceKm! * 1000)}m`
            : `${store.distanceKm!.toFixed(1)}km`;

          return (
            <Link
              key={store.storeId}
              href={`/store/${store.storeId}`}
              className="flex-shrink-0 w-44 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm active:scale-95 transition-transform overflow-hidden relative"
            >
              {/* 마감 오버레이 */}
              {!store.isOpen && (
                <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center rounded-3xl">
                  <span className="text-white text-xs font-black bg-black/60 px-3 py-1.5 rounded-full">마감</span>
                </div>
              )}
              <div className="h-24 bg-gradient-to-br from-pick-bg to-pick-border flex items-center justify-center">
                <span className="text-5xl">{emoji}</span>
              </div>
              <div className="px-3 pt-2 pb-3">
                <p className="font-black text-pick-text text-xs leading-snug truncate mb-1">
                  {store.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-pick-text-sub mb-1">
                  <Star size={9} className="text-pick-yellow fill-pick-yellow flex-shrink-0" />
                  <span className="font-bold text-pick-text">{store.rating.toFixed(1)}</span>
                  <span className="mx-0.5">·</span>
                  <Bike size={9} className="flex-shrink-0" />
                  <span>
                    {store.deliveryFee === 0
                      ? <span className="text-green-600 font-bold">무료</span>
                      : `${store.deliveryFee.toLocaleString()}원`}
                  </span>
                </div>
                {/* 거리 뱃지 */}
                <div className="flex items-center gap-1 text-[10px] text-pick-purple font-bold">
                  <MapPin size={9} />
                  <span>{dist}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
