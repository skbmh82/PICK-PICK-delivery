"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

type Phase = "loading" | "checkin" | "flash" | "search";

/**
 * 홈 최상단(검색바 자리) 출석 게이트.
 * 미출석이면 검색바 대신 '오늘 출석' 탭이 먼저 뜨고,
 * 탭하면 '출석 완료'가 잠깐 뜬 뒤 검색바(children)로 전환된다.
 * 이미 출석했거나 비로그인/메인홈이 아니면 곧바로 children(검색바)만 렌더.
 */
export default function CheckinBanner({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [phase,         setPhase]         = useState<Phase>(enabled ? "loading" : "search");
  const [streak,        setStreak]        = useState(0);
  const [activityBonus, setActivityBonus] = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [reward,        setReward]        = useState(0);

  useEffect(() => {
    if (!enabled) { setPhase("search"); return; }
    let cancelled = false;
    fetch("/api/wallet/checkin")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (cancelled) return;
        if (d.checkedToday) { setPhase("search"); return; }   // 이미 출석 → 바로 검색
        setStreak(d.streak ?? 0);
        setActivityBonus(d.activityBonus ?? 0);
        setPhase("checkin");
      })
      .catch(() => { if (!cancelled) setPhase("search"); });    // 비로그인 등 → 검색
    return () => { cancelled = true; };
  }, [enabled]);

  const todayReward = 50 + activityBonus;

  const handleCheckin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/checkin", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setReward(d.totalReward ?? todayReward);
        setPhase("flash");
        setTimeout(() => setPhase("search"), 1600);   // '완료' 잠깐 → 검색 전환
      } else {
        setPhase("search");
      }
    } catch {
      setPhase("search");
    } finally {
      setLoading(false);
    }
  };

  if (phase === "search") return <>{children}</>;

  if (phase === "loading") {
    return <div className="mx-4 mt-3 h-12 rounded-full bg-pick-border/30 animate-pulse" />;
  }

  if (phase === "flash") {
    return (
      <div className="mx-4 mt-3 h-12 rounded-full bg-gradient-to-r from-pick-purple to-pick-purple-light flex items-center justify-center shadow-md">
        <span className="text-white font-black text-sm">🎉 출석 완료! +{reward.toLocaleString()} PICK</span>
      </div>
    );
  }

  // ── 미출석: 검색바 자리에 출석 탭 ──
  return (
    <div className="mx-4 mt-3">
      <button
        onClick={() => void handleCheckin()}
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-pick-purple to-pick-purple-light px-4 py-3 flex items-center justify-between shadow-md active:scale-[0.98] transition-transform disabled:opacity-70"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Gift size={18} className="text-white flex-shrink-0" />
          <span className="text-white font-black text-sm truncate">
            오늘 출석하고 <span className="text-pick-yellow-light">+{todayReward} PICK</span>
            {streak > 0 && <span className="text-white/80 font-bold"> · {streak}일 연속 🔥</span>}
          </span>
        </span>
        <span className="flex-shrink-0 text-xs font-black text-pick-purple bg-white rounded-full px-3.5 py-1.5">
          {loading ? "…" : "출석"}
        </span>
      </button>
      <button
        onClick={() => setPhase("search")}
        className="w-full text-center text-[11px] text-pick-text-sub mt-1.5"
      >
        나중에 할게요
      </button>
    </div>
  );
}
