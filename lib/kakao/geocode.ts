/**
 * Kakao Local API — 주소 → 좌표 변환 (서버 사이드 전용)
 * 필요 환경변수: KAKAO_REST_API_KEY
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord
 */

interface KakaoAddressResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(address: string): Promise<KakaoAddressResult | null> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return null;

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}&size=1`;
    const res  = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache:   "no-store",
    });
    if (!res.ok) return null;

    const json = await res.json() as {
      documents: {
        x: string; // lng
        y: string; // lat
        road_address: { x: string; y: string } | null;
        address:      { x: string; y: string } | null;
      }[];
    };

    const doc = json.documents?.[0];
    if (!doc) return null;

    const coord = doc.road_address ?? doc.address;
    if (!coord) return null;

    return {
      lat: parseFloat(coord.y),
      lng: parseFloat(coord.x),
    };
  } catch {
    return null;
  }
}
