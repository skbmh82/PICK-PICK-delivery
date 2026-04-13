"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight } from "lucide-react";

export default function LocationBar() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/addresses")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.addresses?.length) return;
        const def = data.addresses.find((a: { isDefault: boolean; address: string }) => a.isDefault)
          ?? data.addresses[0];
        setAddress(def.address);
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
