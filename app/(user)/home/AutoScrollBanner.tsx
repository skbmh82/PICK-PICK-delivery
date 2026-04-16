"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface BannerItem {
  id:       string;
  gradient: string;
  badge:    string;
  badgeBg:  string;
  title:    string;
  sub:      string;
  href:     string;
}

const AUTO_SCROLL_MS = 3200; // 3.2초마다 자동 슬라이드

export default function AutoScrollBanner({ items }: { items: BannerItem[] }) {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const isPaused   = useRef(false);
  const total      = items.length;

  // 특정 인덱스로 부드럽게 스크롤
  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.78 + 12; // 78vw + gap
    el.scrollTo({ left: cardWidth * idx, behavior: "smooth" });
    setCurrent(idx);
  };

  // 스크롤 위치에서 현재 인덱스 계산
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.78 + 12;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setCurrent(Math.min(idx, total - 1));
  };

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused.current) return;
      setCurrent((prev) => {
        const next = (prev + 1) % total;
        const el = scrollRef.current;
        if (el) {
          const cardWidth = el.clientWidth * 0.78 + 12;
          el.scrollTo({ left: cardWidth * next, behavior: "smooth" });
        }
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <div className="pt-2 pb-1">
      {/* 슬라이드 컨테이너 */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
        onTouchStart={() => { isPaused.current = true; }}
        onTouchEnd={() => { isPaused.current = false; }}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory px-4"
      >
        {items.map((b, i) => (
          <Link
            key={b.id}
            href={b.href}
            onClick={() => scrollTo(i)}
            className={`flex-shrink-0 w-[78vw] max-w-[320px] snap-start bg-gradient-to-r ${b.gradient} rounded-3xl p-5 text-white shadow-lg active:scale-95 transition-transform`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${b.badgeBg}`}>
                {b.badge}
              </span>
              {/* 인디케이터 (현재 슬라이드 표시) */}
              <span className="text-[10px] text-white/60 font-semibold">
                {i + 1} / {total}
              </span>
            </div>
            <p className="font-black text-base leading-snug mb-1">{b.title}</p>
            <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">{b.sub}</p>
          </Link>
        ))}
      </div>

      {/* 하단 점 인디케이터 */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 h-1.5 bg-pick-purple"
                : "w-1.5 h-1.5 bg-pick-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
