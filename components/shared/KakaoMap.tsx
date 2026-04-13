"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

interface KakaoMapProps {
  lat: number;
  lng: number;
  label?: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef       = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riderMarker  = useRef<any>(null);
  const apiKey       = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    const drawMap = () => {
      if (!containerRef.current) return;
      window.kakao.maps.load(() => {
        if (!containerRef.current) return;
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map    = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: 4,
        });
        mapRef.current = map;

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

    // 이미 SDK 로드 완료된 경우
    if (window.kakao?.maps) {
      drawMap();
      return;
    }

    const SCRIPT_ID = "kakao-map-sdk";
    const existing  = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      // 스크립트 태그는 있지만 아직 로딩 중인 경우
      existing.addEventListener("load", drawMap, { once: true });
    } else {
      // 처음 로드
      const script   = document.createElement("script");
      script.id      = SCRIPT_ID;
      script.src     = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
      script.async   = true;
      script.onload  = drawMap;
      script.onerror = () => console.error("Kakao Maps SDK 로드 실패 — API 키 또는 도메인 등록을 확인하세요");
      document.head.appendChild(script);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, lat, lng]);

  // 라이더 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || riderLat == null || riderLng == null) return;
    if (!window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const pos = new window.kakao.maps.LatLng(riderLat, riderLng);
      if (!riderMarker.current) {
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

      const bounds = new window.kakao.maps.LatLngBounds();
      bounds.extend(new window.kakao.maps.LatLng(lat, lng));
      bounds.extend(pos);
      mapRef.current.setBounds(bounds, 60);
    });
  }, [riderLat, riderLng, lat, lng]);

  if (!apiKey) return null;

  return <div ref={containerRef} className={className} />;
}
