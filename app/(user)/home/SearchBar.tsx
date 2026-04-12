"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Clock, Flame, ChevronRight } from "lucide-react";

const STORAGE_KEY = "pick-recent-searches";
const MAX_RECENT  = 8;

const POPULAR_KEYWORDS = ["치킨", "피자", "족발", "마라탕", "초밥", "떡볶이", "버거", "도시락"];

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveRecent(keyword: string) {
  const list = [keyword, ...loadRecent().filter((k) => k !== keyword)].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function removeRecent(keyword: string) {
  const list = loadRecent().filter((k) => k !== keyword);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function clearRecent() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function SearchBar() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [query,    setQuery]    = useState(searchParams.get("search") ?? "");
  const [focused,  setFocused]  = useState(false);
  const [recent,   setRecent]   = useState<string[]>([]);
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // URL 파라미터 변경 시 동기화
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  // 포커스 시 최근 검색어 로드
  useEffect(() => {
    if (focused) setRecent(loadRecent());
  }, [focused]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    setQuery(trimmed);
    setFocused(false);
    router.push(`/home?search=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      go(trimmed);
    } else {
      setFocused(false);
      router.push("/home");
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    removeRecent(keyword);
    setRecent(loadRecent());
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecent();
    setRecent([]);
  };

  const showDropdown = focused && query.trim() === "";
  const hasRecent    = recent.length > 0;

  return (
    <div ref={wrapperRef} className="px-4 pt-4 pb-3 relative z-30">
      <form onSubmit={handleSubmit}>
        <div className={`flex items-center gap-3 bg-white dark:bg-pick-card rounded-full px-5 py-3.5 border-2 shadow-sm transition-colors ${
          focused ? "border-pick-purple shadow-pick-purple/10" : "border-pick-border"
        }`}>
          <Search size={18} className="text-pick-purple flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="가게명 또는 메뉴명으로 검색"
            className="flex-1 text-sm text-pick-text bg-transparent outline-none placeholder:text-pick-text-sub"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 rounded-full bg-pick-text-sub/20 flex items-center justify-center flex-shrink-0"
            >
              <X size={12} className="text-pick-text-sub" />
            </button>
          )}
        </div>
      </form>

      {/* ── 드롭다운 ── */}
      {showDropdown && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-xl overflow-hidden">
          {/* 최근 검색어 */}
          {hasRecent && (
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-pick-text-sub flex items-center gap-1.5">
                  <Clock size={12} />
                  최근 검색
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] text-pick-text-sub underline underline-offset-2"
                >
                  전체 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((kw) => (
                  <div
                    key={kw}
                    onClick={() => go(kw)}
                    className="flex items-center gap-1.5 bg-pick-bg border border-pick-border rounded-full pl-3 pr-2 py-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <span className="text-xs font-semibold text-pick-text">{kw}</span>
                    <button
                      onClick={(e) => handleRemoveRecent(e, kw)}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-pick-text-sub/20"
                    >
                      <X size={9} className="text-pick-text-sub" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 구분선 */}
          {hasRecent && <div className="h-px bg-pick-border mx-4 my-2" />}

          {/* 인기 검색어 */}
          <div className="px-4 pb-4 pt-2">
            <p className="text-xs font-black text-pick-text-sub flex items-center gap-1.5 mb-2">
              <Flame size={12} className="text-orange-500" />
              인기 검색어
            </p>
            <div className="grid grid-cols-2 gap-1">
              {POPULAR_KEYWORDS.map((kw, i) => (
                <button
                  key={kw}
                  onClick={() => go(kw)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-pick-bg active:scale-95 transition-all text-left"
                >
                  <span className="text-[10px] font-black text-pick-purple-light w-4 text-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-pick-text flex-1">{kw}</span>
                  <ChevronRight size={12} className="text-pick-text-sub flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
