"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Coins, RefreshCw, Search, X, Check, ChevronDown } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  pickBalance: number;
  totalEarned: number;
  hasWallet: boolean;
}

// ── 역할 뱃지 ──────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  user:  { label: "사용자", color: "text-blue-600",   bg: "bg-blue-50" },
  owner: { label: "사장님", color: "text-amber-600",  bg: "bg-amber-50" },
  rider: { label: "라이더", color: "text-green-600",  bg: "bg-green-50" },
  admin: { label: "관리자", color: "text-pick-purple", bg: "bg-pick-bg" },
};

// ── PICK 지급 모달 ─────────────────────────────────────
const GRANT_PRESETS = [100, 500, 1000, 5000, 10000, 50000];

function GrantModal({
  user,
  onClose,
  onGranted,
}: {
  user: UserRow;
  onClose: () => void;
  onGranted: () => void;
}) {
  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);

  const handleGrant = async () => {
    const num = parseInt(amount, 10);
    if (isNaN(num) || num < 1) return setError("1 PICK 이상 입력해주세요");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/wallet/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: user.id,
          amount: num,
          description: description || undefined,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { onGranted(); onClose(); }, 800);
      } else {
        const err = await res.json().catch(() => ({}));
        setError((err.error as string) ?? "지급에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <div>
            <h2 className="font-black text-pick-text text-lg">PICK 지급 💜</h2>
            <p className="text-xs text-pick-text-sub mt-0.5">{user.name} ({user.email})</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* 현재 잔액 */}
          <div className="bg-pick-bg rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-pick-text-sub font-medium">현재 잔액</span>
            <span className="font-black text-pick-purple">{user.pickBalance.toLocaleString()} PICK</span>
          </div>
          {/* 금액 입력 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">지급 금액 (PICK)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="지급할 PICK 수량 입력"
              min="1"
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
            />
          </div>
          {/* 프리셋 */}
          <div className="grid grid-cols-3 gap-2">
            {GRANT_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  amount === String(p)
                    ? "bg-pick-purple text-white"
                    : "bg-pick-bg border border-pick-border text-pick-text"
                }`}
              >
                {p.toLocaleString()}P
              </button>
            ))}
          </div>
          {/* 메모 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">메모 (선택)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이벤트 보상, 오류 보상 등"
              maxLength={100}
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
            />
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
        </div>
        <div className="px-5 pb-8 pt-1 border-t border-pick-border">
          <button
            onClick={() => void handleGrant()}
            disabled={loading || !amount || success}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {success ? (
              <><Check size={18} /> 지급 완료!</>
            ) : loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <><Coins size={18} /> {amount ? `${parseInt(amount || "0").toLocaleString()} PICK 지급` : "지급하기"}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ── 유저 카드 ──────────────────────────────────────────
function UserCard({ user, onGrant }: { user: UserRow; onGrant: (u: UserRow) => void }) {
  const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.user;
  return (
    <div className="bg-white rounded-3xl border-2 border-pick-border px-4 py-4 shadow-sm flex items-center gap-3">
      {/* 아바타 */}
      <div className="w-11 h-11 rounded-full bg-pick-bg border-2 border-pick-border flex items-center justify-center flex-shrink-0 font-black text-pick-purple text-base">
        {user.name.charAt(0)}
      </div>
      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-pick-text text-sm truncate">{user.name}</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          {!user.hasWallet && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
              지갑없음
            </span>
          )}
        </div>
        <p className="text-xs text-pick-text-sub truncate">{user.email}</p>
        <p className="text-xs font-bold text-pick-purple mt-0.5">
          {user.pickBalance.toLocaleString()} PICK
          <span className="text-[10px] font-normal text-pick-text-sub ml-1">
            (누적 {user.totalEarned.toLocaleString()})
          </span>
        </p>
      </div>
      {/* 지급 버튼 */}
      <button
        onClick={() => onGrant(user)}
        disabled={!user.hasWallet}
        className="flex-shrink-0 bg-pick-purple text-white text-xs font-black px-3 py-2 rounded-full active:scale-90 transition-transform disabled:opacity-30"
      >
        지급
      </button>
    </div>
  );
}

// ── 로딩 스켈레톤 ──────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[0,1,2,3,4].map((i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-3xl" />
      ))}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function AdminDashboardPage() {
  const [users,       setUsers]       = useState<UserRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("all");
  const [grantTarget, setGrantTarget] = useState<UserRow | null>(null);
  const [showFilter,  setShowFilter]  = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401 || res.status === 403) {
        setError("관리자 권한이 필요합니다");
        return;
      }
      if (res.ok) setUsers(await res.json().then((d: { users: UserRow[] }) => d.users));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // 검색 + 역할 필터
  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.name.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // 통계
  const totalPick  = users.reduce((s, u) => s + u.pickBalance, 0);
  const userCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-5xl">🚫</span>
        <p className="font-bold text-pick-text text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-pick-border px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">관리자 대시보드 🛡️</h1>
          <p className="text-xs text-pick-text-sub mt-0.5">전체 {users.length}명</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-pick-purple to-pick-purple-light rounded-3xl p-4 text-white">
          <p className="text-xs text-white/70 mb-1">전체 PICK 유통</p>
          <p className="font-black text-xl">{totalPick.toLocaleString()}</p>
          <p className="text-xs text-white/70">PICK</p>
        </div>
        <div className="bg-white rounded-3xl border-2 border-pick-border p-4 flex flex-col gap-1.5">
          {(["user","owner","rider","admin"] as const).map((r) => {
            const c = ROLE_CONFIG[r];
            return (
              <div key={r} className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${c.color}`}>{c.label}</span>
                <span className="text-xs font-black text-pick-text">{userCounts[r] ?? 0}명</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 검색 + 필터 */}
      <div className="px-4 mb-4 flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pick-text-sub" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일 검색"
            className="w-full pl-9 pr-4 py-2.5 rounded-full border-2 border-pick-border text-sm text-pick-text focus:outline-none focus:border-pick-purple bg-white"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border-2 border-pick-border bg-white text-sm font-bold text-pick-text"
          >
            {roleFilter === "all" ? "전체" : ROLE_CONFIG[roleFilter]?.label}
            <ChevronDown size={14} />
          </button>
          {showFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
              <div className="absolute right-0 top-12 z-20 bg-white rounded-2xl border-2 border-pick-border shadow-lg overflow-hidden min-w-[100px]">
                {["all","user","owner","rider","admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRoleFilter(r); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                      roleFilter === r ? "bg-pick-bg text-pick-purple" : "text-pick-text hover:bg-pick-bg"
                    }`}
                  >
                    {r === "all" ? "전체" : ROLE_CONFIG[r]?.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 유저 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub">
            <Users size={36} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {search ? "검색 결과가 없어요" : "등록된 유저가 없어요"}
            </p>
          </div>
        ) : (
          filtered.map((u) => (
            <UserCard key={u.id} user={u} onGrant={setGrantTarget} />
          ))
        )}
      </div>

      {/* PICK 지급 모달 */}
      {grantTarget && (
        <GrantModal
          user={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={fetchUsers}
        />
      )}
    </div>
  );
}
