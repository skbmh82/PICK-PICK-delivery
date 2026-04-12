"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  // URL의 search 파라미터 변경 시 동기화
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/home?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/home");
    }
  };

  const handleClear = () => {
    setQuery("");
    router.push("/home");
  };

  return (
    <div className="px-4 pt-4 pb-3">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 bg-white dark:bg-pick-card rounded-full px-5 py-3.5 border-2 border-pick-border shadow-sm focus-within:border-pick-purple transition-colors">
          <Search size={18} className="text-pick-purple flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="가게명을 검색해보세요"
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
    </div>
  );
}
