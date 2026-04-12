"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone, Plus, Zap, BarChart2, Eye, MousePointer,
  CalendarDays, ChevronRight, CheckCircle2, Clock,
  XCircle, PauseCircle, PlayCircle, Wallet,
} from "lucide-react";

/* ─── 타입 ─── */
interface StoreAd {
  id: string;
  type: "top" | "banner";
  status: "pending" | "active" | "paused" | "expired" | "rejected";
  pick_budget: number;
  pick_spent: number;
  daily_budget: number;
  start_date: string;
  end_date: string;
  banner_title: string | null;
  banner_sub: string | null;
  banner_gradient: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
}

/* ─── 상수 ─── */
const GRADIENTS = [
  { label: "퍼플",    value: "from-pick-purple-dark via-pick-purple to-pick-purple-light" },
  { label: "오렌지",  value: "from-amber-600 via-orange-500 to-yellow-400" },
  { label: "그린",    value: "from-emerald-600 via-teal-500 to-cyan-400" },
  { label: "핑크",    value: "from-pink-600 via-rose-500 to-fuchsia-400" },
  { label: "블루",    value: "from-blue-700 via-blue-500 to-indigo-400" },
];

const STATUS_META: Record<StoreAd["status"], { label: string; color: string; Icon: React.ElementType }> = {
  pending:  { label: "심사중",   color: "text-amber-600 bg-amber-50 border-amber-200",   Icon: Clock },
  active:   { label: "진행중",   color: "text-green-600 bg-green-50 border-green-200",   Icon: CheckCircle2 },
  paused:   { label: "일시정지", color: "text-gray-500  bg-gray-50  border-gray-200",    Icon: PauseCircle },
  expired:  { label: "종료",     color: "text-gray-400  bg-gray-50  border-gray-200",    Icon: XCircle },
  rejected: { label: "반려",     color: "text-red-600   bg-red-50   border-red-200",     Icon: XCircle },
};

/* ─── 광고 카드 ─── */
function AdCard({ ad, onToggle }: { ad: StoreAd; onToggle: (id: string, status: "active" | "paused") => void }) {
  const meta   = STATUS_META[ad.status];
  const MetaIcon = meta.Icon;
  const used   = ad.pick_budget > 0 ? (ad.pick_spent / ad.pick_budget) * 100 : 0;
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(ad.end_date).getTime() - Date.now()) / 86400000
  ));

  return (
    <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
            ad.type === "top" ? "bg-pick-purple/10" : "bg-amber-100"
          }`}>
            {ad.type === "top"
              ? <Zap size={18} className="text-pick-purple" />
              : <Megaphone size={18} className="text-amber-600" />
            }
          </div>
          <div>
            <p className="font-black text-pick-text text-sm">
              {ad.type === "top" ? "상단 노출 광고" : "배너 광고"}
            </p>
            <p className="text-xs text-pick-text-sub mt-0.5">
              {ad.start_date} ~ {ad.end_date}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
          <MetaIcon size={12} />
          {meta.label}
        </span>
      </div>

      {/* 배너 미리보기 */}
      {ad.type === "banner" && ad.banner_title && (
        <div className={`mx-4 mb-3 bg-gradient-to-r ${ad.banner_gradient ?? "from-pick-purple-dark to-pick-purple"} rounded-2xl px-4 py-3`}>
          <p className="text-white font-black text-sm">{ad.banner_title}</p>
          {ad.banner_sub && <p className="text-white/80 text-xs mt-0.5">{ad.banner_sub}</p>}
        </div>
      )}

      {/* 예산 게이지 */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-pick-text-sub font-medium">PICK 예산 사용</span>
          <span className="text-xs font-black text-pick-purple">
            {ad.pick_spent.toLocaleString()} / {ad.pick_budget.toLocaleString()} PICK
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pick-purple to-pick-purple-light rounded-full transition-all duration-500"
            style={{ width: `${Math.min(used, 100)}%` }}
          />
        </div>
      </div>

      {/* 통계 */}
      <div className="mx-4 mb-3 bg-pick-bg rounded-2xl px-4 py-3 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center">
          <Eye size={14} className="text-pick-text-sub mb-1" />
          <span className="text-sm font-black text-pick-text">{ad.impression_count.toLocaleString()}</span>
          <span className="text-[10px] text-pick-text-sub">노출</span>
        </div>
        <div className="flex flex-col items-center border-x border-pick-border">
          <MousePointer size={14} className="text-pick-text-sub mb-1" />
          <span className="text-sm font-black text-pick-text">{ad.click_count.toLocaleString()}</span>
          <span className="text-[10px] text-pick-text-sub">클릭</span>
        </div>
        <div className="flex flex-col items-center">
          <CalendarDays size={14} className="text-pick-text-sub mb-1" />
          <span className="text-sm font-black text-pick-text">{daysLeft}</span>
          <span className="text-[10px] text-pick-text-sub">일 남음</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      {(ad.status === "active" || ad.status === "paused") && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onToggle(ad.id, ad.status === "active" ? "paused" : "active")}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
              ad.status === "active"
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-pick-purple/10 text-pick-purple hover:bg-pick-purple/20"
            }`}
          >
            {ad.status === "active"
              ? <><PauseCircle size={16} /> 일시정지</>
              : <><PlayCircle  size={16} /> 재개하기</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── 광고 신청 폼 ─── */
function NewAdForm({ onSubmit, onClose, walletBalance }: {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  walletBalance: number;
}) {
  const [type, setType]         = useState<"top" | "banner">("top");
  const [budget, setBudget]     = useState("");
  const [daily, setDaily]       = useState("");
  const [start, setStart]       = useState("");
  const [end, setEnd]           = useState("");
  const [title, setTitle]       = useState("");
  const [sub, setSub]           = useState("");
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        type,
        pickBudget:     Number(budget),
        dailyBudget:    Number(daily),
        startDate:      start,
        endDate:        end,
        bannerTitle:    type === "banner" ? title : undefined,
        bannerSub:      type === "banner" ? sub   : undefined,
        bannerGradient: type === "banner" ? gradient : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-black text-pick-text mb-1">광고 신청</h2>
        <p className="text-xs text-pick-text-sub mb-5">
          현재 잔액: <span className="font-black text-pick-purple">{walletBalance.toLocaleString()} PICK</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 광고 타입 */}
          <div>
            <label className="text-sm font-bold text-pick-text mb-2 block">광고 타입</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "top",    label: "상단 노출", emoji: "⚡", desc: "카테고리·검색 결과 최상단 고정" },
                { id: "banner", label: "배너 광고",  emoji: "📢", desc: "홈 화면 배너 슬라이드 노출" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as "top" | "banner")}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                    type === t.id
                      ? "border-pick-purple bg-pick-purple/5"
                      : "border-pick-border bg-white"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className={`text-sm font-black ${type === t.id ? "text-pick-purple" : "text-pick-text"}`}>
                    {t.label}
                  </span>
                  <span className="text-[10px] text-pick-text-sub text-center leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 배너 타입이면 문구 입력 */}
          {type === "banner" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-bold text-pick-text mb-1.5 block">배너 제목</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 오늘만 배달비 무료! 🎉"
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-pick-border text-sm focus:border-pick-purple outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-pick-text mb-1.5 block">배너 부제목</label>
                <input
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                  placeholder="예: 지금 주문하고 PICK 2배 적립"
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-pick-border text-sm focus:border-pick-purple outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-pick-text mb-2 block">배너 색상</label>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGradient(g.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
                        gradient === g.value ? "border-pick-purple" : "border-transparent"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${g.value}`} />
                      {g.label}
                    </button>
                  ))}
                </div>
                {/* 미리보기 */}
                {title && (
                  <div className={`mt-3 bg-gradient-to-r ${gradient} rounded-2xl px-4 py-3`}>
                    <p className="text-white font-black text-sm">{title}</p>
                    {sub && <p className="text-white/80 text-xs mt-0.5">{sub}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 예산 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-pick-text mb-1.5 block">총 예산 (PICK)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="예: 1000"
                min={100}
                className="w-full px-4 py-3 rounded-2xl border-2 border-pick-border text-sm focus:border-pick-purple outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-pick-text mb-1.5 block">일 한도 (PICK)</label>
              <input
                type="number"
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                placeholder="예: 100"
                min={10}
                className="w-full px-4 py-3 rounded-2xl border-2 border-pick-border text-sm focus:border-pick-purple outline-none"
              />
            </div>
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-pick-text mb-1.5 block">시작일</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                min={today}
                className="w-full px-4 py-3 rounded-2xl border-2 border-pick-border text-sm focus:border-pick-purple outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-pick-text mb-1.5 block">종료일</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start || today}
                className="w-full px-4 py-3 rounded-2xl border-2 border-pick-border text-sm focus:border-pick-purple outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !budget || !daily || !start || !end}
            className="w-full py-4 bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black rounded-full text-sm shadow-lg disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? "신청 중..." : `${Number(budget).toLocaleString()} PICK 결제하고 광고 신청`}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── 메인 페이지 ─── */
export default function OwnerAdsPage() {
  const [ads, setAds]               = useState<StoreAd[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [walletBalance, setWallet]  = useState(0);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const [adsRes, walletRes] = await Promise.all([
        fetch("/api/stores/my/ads"),
        fetch("/api/wallet/balance"),
      ]);
      const adsData    = await adsRes.json();
      const walletData = await walletRes.json();
      setAds(adsData.ads ?? []);
      setWallet(walletData.balance ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  async function handleCreate(data: Record<string, unknown>) {
    const res = await fetch("/api/stores/my/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchAds();
  }

  async function handleToggle(id: string, newStatus: "active" | "paused") {
    await fetch(`/api/stores/my/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchAds();
  }

  const active  = ads.filter((a) => a.status === "active");
  const pending = ads.filter((a) => a.status === "pending");
  const others  = ads.filter((a) => !["active", "pending"].includes(a.status));

  const totalSpent      = ads.reduce((s, a) => s + a.pick_spent, 0);
  const totalImpression = ads.reduce((s, a) => s + a.impression_count, 0);
  const totalClick      = ads.reduce((s, a) => s + a.click_count, 0);

  return (
    <div className="min-h-screen bg-pick-bg pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-400 px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white font-black text-xl">📢 광고 관리</h1>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
            <Wallet size={14} className="text-white" />
            <span className="text-white text-xs font-black">{walletBalance.toLocaleString()} PICK</span>
          </div>
        </div>
        <p className="text-white/80 text-xs">내 가게를 더 많은 고객에게 노출시키세요</p>
      </div>

      {/* 요약 통계 */}
      <div className="px-4 -mt-5 mb-5">
        <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm grid grid-cols-3 divide-x divide-pick-border">
          {[
            { label: "총 지출",   value: `${totalSpent.toLocaleString()} P`, Icon: Wallet,       color: "text-pick-purple" },
            { label: "총 노출",   value: totalImpression.toLocaleString(),   Icon: Eye,          color: "text-blue-500" },
            { label: "총 클릭",   value: totalClick.toLocaleString(),         Icon: MousePointer, color: "text-green-500" },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-1">
              <Icon size={16} className={color} />
              <span className={`text-sm font-black ${color}`}>{value}</span>
              <span className="text-[10px] text-pick-text-sub">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5">
        {/* 광고 신청 버튼 */}
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-between bg-gradient-to-r from-pick-purple to-pick-purple-light text-white px-5 py-4 rounded-3xl shadow-lg active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-black text-sm">새 광고 신청</p>
              <p className="text-white/80 text-xs">상단 노출 · 배너 광고</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/80" />
        </button>

        {/* 안내 카드 */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} className="text-amber-600" />
            <p className="text-sm font-black text-amber-800">광고 타입 안내</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <p className="text-xs font-bold text-amber-800">상단 노출 광고</p>
                <p className="text-xs text-amber-700/80">카테고리·검색 결과 최상단에 SPONSORED 뱃지와 함께 고정 노출</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">📢</span>
              <div>
                <p className="text-xs font-bold text-amber-800">배너 광고</p>
                <p className="text-xs text-amber-700/80">홈 화면 배너 슬라이드에 내 가게 맞춤 문구로 노출</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[0,1].map((i) => (
              <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-pick-text-sub">
            <Megaphone size={48} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">진행 중인 광고가 없어요</p>
            <p className="text-xs mt-1 opacity-70">광고를 신청하고 매출을 올려보세요!</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-black text-pick-text mb-3 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-500" /> 진행 중 ({active.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {active.map((ad) => <AdCard key={ad.id} ad={ad} onToggle={handleToggle} />)}
                </div>
              </section>
            )}
            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-black text-pick-text mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-amber-500" /> 심사 중 ({pending.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {pending.map((ad) => <AdCard key={ad.id} ad={ad} onToggle={handleToggle} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="text-sm font-black text-pick-text mb-3 flex items-center gap-2">
                  <XCircle size={15} className="text-gray-400" /> 종료된 광고
                </h2>
                <div className="flex flex-col gap-3 opacity-60">
                  {others.map((ad) => <AdCard key={ad.id} ad={ad} onToggle={handleToggle} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showForm && (
        <NewAdForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          walletBalance={walletBalance}
        />
      )}
    </div>
  );
}
