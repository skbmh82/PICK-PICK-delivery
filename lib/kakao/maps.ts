/**
 * 카카오맵 관련 유틸리티
 * - 내비게이션 URL 생성 (API 키 불필요)
 * - 지도 SDK 로더 (NEXT_PUBLIC_KAKAO_MAP_KEY 필요)
 */

/** 카카오맵 앱 딥링크 → 웹 폴백 순서로 내비게이션 열기 */
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
    // 웹 URL (항상 새 탭에서 열림)
    const webUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
    window.open(webUrl, "_blank");

    // 앱 딥링크 (카카오맵 설치된 경우 — 숨겨진 a 태그로 시도, 앱이동시켜도 현재 페이지 유지)
    try {
      const a = document.createElement("a");
      a.href = `kakaomap://look?p=${lat},${lng}`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 1000);
    } catch { /* 무시 */ }
  } else if (address) {
    const webUrl = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
    window.open(webUrl, "_blank");
  }
}

/** 픽업지(가게)→배달지 경로 안내 URL */
export function openKakaoRoute({
  pickupName, pickupLat, pickupLng,
  destName,   destLat,   destLng,
}: {
  pickupName: string; pickupLat: number; pickupLng: number;
  destName:   string; destLat:   number; destLng:   number;
}) {
  // 웹 URL (항상 새 탭)
  const webUrl =
    `https://map.kakao.com/link/from/${encodeURIComponent(pickupName)},${pickupLat},${pickupLng}/to/${encodeURIComponent(destName)},${destLat},${destLng}`;
  window.open(webUrl, "_blank");

  // 앱 딥링크 시도 (현재 페이지 유지)
  try {
    const a = document.createElement("a");
    a.href = `kakaomap://route?sp=${pickupLat},${pickupLng}&ep=${destLat},${destLng}&by=CAR`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 1000);
  } catch { /* 무시 */ }
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
