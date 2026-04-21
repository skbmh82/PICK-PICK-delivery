/**
 * 카카오맵 관련 유틸리티
 * - 내비게이션 URL 생성 (API 키 불필요)
 * - 지도 SDK 로더 (NEXT_PUBLIC_KAKAO_MAP_KEY 필요)
 */

/** a 태그로 새 탭 열기 — window.open() 대신 사용 (모바일 팝업 차단 우회) */
function openLink(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}

/** 카카오맵 내비게이션 열기 */
export function openKakaoNavi({
  name,
  lat,
  lng,
  address,
}: {
  name: string;
  lat?: number | null;
  lng?: number | null;
  address?: string;
}) {
  if (lat && lng) {
    openLink(`https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`);
  } else if (address) {
    openLink(`https://map.kakao.com/link/search/${encodeURIComponent(address)}`);
  }
}

/** 픽업지(가게)→배달지 경로 안내 */
export function openKakaoRoute({
  pickupName, pickupLat, pickupLng,
  destName,   destLat,   destLng,
}: {
  pickupName: string; pickupLat: number; pickupLng: number;
  destName:   string; destLat:   number; destLng:   number;
}) {
  openLink(
    `https://map.kakao.com/link/from/${encodeURIComponent(pickupName)},${pickupLat},${pickupLng}/to/${encodeURIComponent(destName)},${destLat},${destLng}`
  );
}

/** 카카오맵 SDK 스크립트 동적 로드 */
export function loadKakaoMapSdk(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) return Promise.reject(new Error("KAKAO_MAP_KEY not set"));

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));

    const win = window as Window & {
      kakao?: { maps?: { load?: (cb: () => void) => void } };
    };

    if (win.kakao?.maps?.load) {
      win.kakao.maps.load(resolve);
      return;
    }

    const existing = document.getElementById("kakao-map-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.id  = "kakao-map-sdk";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    script.onload = () => {
      win.kakao?.maps?.load?.(() => resolve());
    };
    script.onerror = () => reject(new Error("Kakao Maps SDK load failed"));
    document.head.appendChild(script);
  });
}
