"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight } from "lucide-react";

export default function LocationBar() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // 현재 쿠키에 저장된 좌표
    const prevLat = document.cookie.match(/pick-lat=([^;]+)/)?.[1] ?? null;
    const prevLng = document.cookie.match(/pick-lng=([^;]+)/)?.[1] ?? null;

    fetch("/api/users/addresses")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.addresses?.length) return;
        const def = data.addresses.find((a: { isDefault: boolean; address: string }) => a.isDefault)
          ?? data.addresses[0];
        setAddress(def.address);

        // 기본 주소 좌표를 쿠키에 저장 → 서버 컴포넌트에서 위치 기반 필터에 사용
        const lat = def.lat != null ? String(def.lat) : null;
        const lng = def.lng != null ? String(def.lng) : null;
        if (lat != null && lng != null) {
          const maxAge = 60 * 60 * 24; // 24시간
          document.cookie = `pick-lat=${lat}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `pick-lng=${lng}; path=/; max-age=${maxAge}; SameSite=Lax`;
          // 좌표가 바뀌었으면 서버 컴포넌트 재렌더링
          if (lat !== prevLat || lng !== prevLng) {
            router.refresh();
          }
        } else {
          // 좌표 없는 경우 쿠키 제거
          document.cookie = "pick-lat=; path=/; max-age=0";
          document.cookie = "pick-lng=; path=/; max-age=0";
        }
      })
      .catch(() => null);
  }, []);

  return (
    <button
      onClick={() => router.push("/my-pick?address=1")}
      className="flex items-center gap-1.5 px-5 py-2 w-full text-left"
    >
      <MapPin size={15} className="text-pick-purple flex-shrink-0" fill="#A855F7" fillOpacity={0.3} />
      <span className="text-pick-text text-sm font-semibold truncate">
        {address ?? "배달 주소를 설정해주세요"}
      </span>
      <ChevronRight size={14} className="text-pick-text-sub flex-shrink-0" />
    </button>
  );
}
