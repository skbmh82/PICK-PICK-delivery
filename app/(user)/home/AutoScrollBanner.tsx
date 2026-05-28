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

const AUTO_SCROLL_MS = 3200;

export default function AutoScrollBanner({ items }: { items: BannerItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const isPaused  = useRef(false);
  const total     = items.length;

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
    setCurrent(idx);
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrent(Math.min(idx, total - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused.current) return;
      setCurrent((prev) => {
        const next = (prev + 1) % total;
        const el = scrollRef.current;
        if (el) el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <div className="pt-2 pb-1">
      {/* 외부 패딩 래퍼 */}
      <div className="px-4">
        {/* 슬라이드 컨테이너 — 패딩 없이 전체 너비로 snap */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          onMouseEnter={() => { isPaused.current = true; }}
          onMouseLeave={() => { isPaused.current = false; }}
          onTouchStart={() => { isPaused.current = true; }}
          onTouchEnd={() => { isPaused.current = false; }}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory rounded-3xl"
        >
          {items.map((b, i) => (
            <Link
              key={b.id}
              href={b.href}
              onClick={() => scrollTo(i)}
              className={`relative flex-shrink-0 w-full snap-start overflow-hidden bg-gradient-to-r ${b.gradient} active:opacity-90 transition-opacity`}
            >
              {/* 밝기 조절 오버레이 */}
              <div className="absolute inset-0 bg-white/20" />
              <div className="relative px-6 py-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full ${b.badgeBg}`}>
                    {b.badge}
                  </span>
                  <span className="text-[11px] text-white/60 font-semibold">
                    {i + 1} / {total}
                  </span>
                </div>
                <p className="font-black text-lg leading-snug mb-1.5 text-white">{b.title}</p>
                <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line">{b.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 하단 점 인디케이터 */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
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
