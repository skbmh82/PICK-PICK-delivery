"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Gift } from "lucide-react";

interface CheckinState {
  checkedToday: boolean;
  streak:       number;
  activityBonus: number;
}

/**
 * 홈 상단 출석 넛지 배너 — 원탭 출석으로 활성화율 끌어올리기.
 * - 미출석: '오늘 출석하고 +N PICK' 버튼 → 그 자리에서 체크인
 * - 완료:   '출석 완료 · N일 연속' 표시
 * - 비로그인/조회 실패: 렌더 안 함
 */
export default function CheckinBanner() {
  const [state,   setState]   = useState<CheckinState | null>(null);
  const [hidden,  setHidden]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [reward,  setReward]  = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/wallet/checkin")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (cancelled) return;
        setState({
          checkedToday:  !!d.checkedToday,
          streak:        d.streak ?? 0,
          activityBonus: d.activityBonus ?? 0,
        });
      })
      .catch(() => { if (!cancelled) setHidden(true); }); // 비로그인 등 → 숨김
    return () => { cancelled = true; };
  }, []);

  if (hidden || !state) return null;

  const todayReward = 50 + state.activityBonus;

  const handleCheckin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/checkin", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setReward(d.totalReward ?? todayReward);
        setState((s) => (s ? { ...s, checkedToday: true, streak: d.streak ?? s.streak } : s));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── 출석 완료 상태 ──
  if (state.checkedToday) {
    return (
      <div className="mx-4 mt-3 rounded-3xl bg-gradient-to-r from-pick-purple to-pick-purple-light px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">✅</span>
          <div className="min-w-0">
            <p className="text-white font-black text-sm leading-tight">
              오늘 출석 완료!{reward ? ` +${reward.toLocaleString()} PICK` : ""}
            </p>
            <p className="text-white/80 text-[11px] flex items-center gap-1">
              <Flame size={11} /> {state.streak}일 연속 · 내일도 잊지 마세요
            </p>
          </div>
        </div>
        <Link href="/wallet" className="flex-shrink-0 text-[11px] font-black text-white/90 bg-white/15 rounded-full px-3 py-1.5">
          지갑
        </Link>
      </div>
    );
  }

  // ── 미출석 상태 (원탭 체크인) ──
  return (
    <button
      onClick={() => void handleCheckin()}
      disabled={loading}
      className="mx-4 mt-3 w-[calc(100%-2rem)] rounded-3xl bg-gradient-to-r from-pick-purple to-pick-purple-light px-4 py-3.5 flex items-center justify-between shadow-md active:scale-[0.98] transition-transform disabled:opacity-70"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Gift size={20} className="text-white" />
        </span>
        <div className="text-left min-w-0">
          <p className="text-white font-black text-sm leading-tight">
            오늘 출석하고 <span className="text-pick-yellow-light">+{todayReward} PICK</span> 받기
          </p>
          <p className="text-white/80 text-[11px]">
            {state.streak > 0 ? `${state.streak}일 연속 중 🔥 · ` : ""}7일 연속 시 +100 보너스
          </p>
        </div>
      </div>
      <span className="flex-shrink-0 text-xs font-black text-pick-purple bg-white rounded-full px-3.5 py-2">
        {loading ? "…" : "출석"}
      </span>
    </button>
  );
}
