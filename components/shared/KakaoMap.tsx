"use client";

import { useEffect, useRef } from "react";

// Kakao SDK 타입 (전역 window 확장)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

interface KakaoMapProps {
  lat: number;
  lng: number;
  /** 마커 위에 표시할 라벨 */
  label?: string;
  /** 추가 마커 (라이더 위치 등) */
  riderLat?: number;
  riderLng?: number;
  className?: string;
}

export default function KakaoMap({
  lat,
  lng,
  label,
  riderLat,
  riderLng,
  className = "",
}: KakaoMapProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef        = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riderMarker   = useRef<any>(null);
  const apiKey        = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  // 최초 지도 초기화
  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    const init = () => {
      if (!window.kakao?.maps || !containerRef.current) return;
      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: 4,
        });
        mapRef.current = map;

        // 가게 / 목적지 마커
        const marker = new window.kakao.maps.Marker({ position: center, map });

        if (label) {
          const info = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:4px 10px;font-size:12px;font-weight:bold;white-space:nowrap;">${label}</div>`,
            removable: false,
          });
          info.open(map, marker);
        }
      });
    };

    if (window.kakao?.maps) {
      init();
      return;
    }

    // SDK 동적 로드
    if (!document.getElementById("kakao-map-sdk")) {
      const script = document.createElement("script");
      script.id    = "kakao-map-sdk";
      script.src   = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      // 이미 스크립트 태그는 있지만 아직 로드 안 된 경우
      const existing = document.getElementById("kakao-map-sdk") as HTMLScriptElement;
      existing.addEventListener("load", init, { once: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);  // 최초 1회만

  // 라이더 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || riderLat == null || riderLng == null) return;
    if (!window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const pos = new window.kakao.maps.LatLng(riderLat, riderLng);

      if (!riderMarker.current) {
        // 라이더 마커 최초 생성 (다른 색 이미지 사용)
        const image = new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new window.kakao.maps.Size(24, 35)
        );
        riderMarker.current = new window.kakao.maps.Marker({
          position: pos,
          image,
          map: mapRef.current,
          title: "라이더",
        });
      } else {
        riderMarker.current.setPosition(pos);
      }

      // 두 마커가 모두 보이도록 범위 조정
      const bounds = new window.kakao.maps.LatLngBounds();
      bounds.extend(new window.kakao.maps.LatLng(lat, lng));
      bounds.extend(pos);
      mapRef.current.setBounds(bounds, 60);
    });
  }, [riderLat, riderLng, lat, lng]);

  if (!apiKey) {
    // API 키 없으면 주소 텍스트만 노출
    return null;
  }

  return <div ref={containerRef} className={`${className}`} />;
}
