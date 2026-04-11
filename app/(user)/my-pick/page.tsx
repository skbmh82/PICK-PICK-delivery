"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  User, MapPin, Heart, Star, Gift, Bell, HelpCircle, LogOut,
  ChevronRight, Store, Bike, LayoutDashboard, ClipboardList,
  TrendingUp, Navigation, Wallet, RefreshCw, Pencil, X, Check,
  Copy, Share2,
} from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

// ── 타입 ──────────────────────────────────────────────
interface Grade    { label: string; earned: number; nextThreshold: number }
interface Favorite { storeId: string; name: string; category: string; rating: number; deliveryFee: number; deliveryTime: number }
interface Review   { id: string; rating: number; content: string; createdAt: string; storeName: string }
interface MeData {
  profile:   { name: string; email: string; phone: string | null; addressMain: string | null };
  grade:     Grade;
  wallet:    { pickBalance: number; totalEarned: number };
  favorites: Favorite[];
  reviews:   Review[];
}

// ── 역할별 바로가기 배너 ────────────────────────────────
function OwnerBanner() {
  return (
    <div className="px-4 mb-4">
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/20">
            <Store size={20} className="text-white" />
          </span>
          <div>
            <p className="font-black text-base leading-tight">사장님 전용 메뉴 🏪</p>
            <p className="text-xs text-white/80">가게를 관리하고 매출을 확인하세요</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: "/owner/dashboard", icon: <LayoutDashboard size={20} />, label: "대시보드" },
            { href: "/owner/orders",    icon: <ClipboardList size={20} />,   label: "주문관리" },
            { href: "/owner/settlement",icon: <TrendingUp size={20} />,      label: "정산/매출" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1.5 bg-white/20 active:scale-95 transition-all rounded-2xl py-3">
              {item.icon}
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiderBanner() {
  return (
    <div className="px-4 mb-4">
      <div className="bg-gradient-to-r from-sky-500 to-blue-500 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/20">
            <Bike size={20} className="text-white" />
          </span>
          <div>
            <p className="font-black text-base leading-tight">라이더 전용 메뉴 🛵</p>
            <p className="text-xs text-white/80">배달 현황과 수익을 확인하세요</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: "/rider/dashboard", icon: <Navigation size={20} />, label: "배달현황" },
            { href: "/rider/delivery",  icon: <Bike size={20} />,       label: "배달하기" },
            { href: "/rider/earnings",  icon: <Wallet size={20} />,     label: "수익내역" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1.5 bg-white/20 active:scale-95 transition-all rounded-2xl py-3">
              {item.icon}
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PICK 등급 배너 ─────────────────────────────────────
function GradeBanner({ grade }: { grade: Grade }) {
  const pct = grade.nextThreshold > 0
    ? Math.min((grade.earned / grade.nextThreshold) * 100, 100)
    : 100;

  const NEXT_GRADE: Record<string, string> = {
    "🌱 SEED":   "🌿 SPROUT",
    "🌿 SPROUT": "🌳 TREE",
    "🌳 TREE":   "🌲 FOREST",
    "🌲 FOREST": "최고 등급",
  };
  const nextLabel = NEXT_GRADE[grade.label] ?? "최고 등급";

  return (
    <div className="px-4 mb-4">
      <div className="bg-gradient-to-r from-pick-purple to-pick-purple-light rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-lg">{grade.label}</span>
          <span className="text-xs text-white/80 bg-white/15 px-3 py-1 rounded-full font-semibold">
            {grade.earned.toLocaleString()} PICK 적립
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5">
          <div
            className="bg-pick-yellow-light h-2.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-white/75 mt-2">
          {grade.nextThreshold > 0
            ? `${(grade.nextThreshold - grade.earned).toLocaleString()} PICK 더 모으면 ${nextLabel} 달성!`
            : `최고 등급 달성 🎉`
          }
        </p>
      </div>
    </div>
  );
}

// ── 즐겨찾기 섹션 ──────────────────────────────────────
function FavoritesSection({ favorites }: { favorites: Favorite[] }) {
  if (favorites.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={16} className="text-red-400" />
        <h3 className="font-bold text-pick-text text-sm">즐겨찾기 가맹점</h3>
      </div>
      <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        {favorites.map((fav) => (
          <Link
            key={fav.storeId}
            href={`/store/${fav.storeId}`}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-pick-bg transition-colors"
          >
            <span className="text-2xl">{getCategoryEmoji(fav.category)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-pick-text text-sm truncate">{fav.name}</p>
              <p className="text-xs text-pick-text-sub mt-0.5">
                ⭐ {fav.rating} · {fav.deliveryTime}분 ·{" "}
                {fav.deliveryFee === 0
                  ? <span className="text-green-600 font-bold">무료배달</span>
                  : `배달비 ${fav.deliveryFee.toLocaleString()}원`
                }
              </p>
            </div>
            <ChevronRight size={16} className="text-pick-text-sub flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── 내 리뷰 섹션 ───────────────────────────────────────
function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-pick-yellow fill-pick-yellow" />
        <h3 className="font-bold text-pick-text text-sm">내 리뷰</h3>
      </div>
      <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        {reviews.map((r) => (
          <div key={r.id} className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-pick-text text-sm">{r.storeName}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
                  />
                ))}
              </div>
            </div>
            {r.content && (
              <p className="text-xs text-pick-text-sub line-clamp-2">{r.content}</p>
            )}
            <p className="text-[10px] text-pick-text-sub mt-1">
              {new Date(r.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 프로필 수정 모달 ───────────────────────────────────
interface ProfileData { name: string; phone: string; addressMain: string }

function EditProfileModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: ProfileData;
  onClose: () => void;
  onSaved: (data: ProfileData) => void;
}) {
  const [name,        setName]        = useState(initial.name);
  const [phone,       setPhone]       = useState(initial.phone);
  const [addressMain, setAddressMain] = useState(initial.addressMain);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleSave = async () => {
    if (name.trim().length < 2) return setError("이름은 2자 이상이어야 해요");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), addressMain: addressMain.trim() }),
      });
      if (res.ok) {
        onSaved({ name: name.trim(), phone: phone.trim(), addressMain: addressMain.trim() });
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        setError((err.error as string) ?? "저장에 실패했습니다");
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
          <h2 className="font-black text-pick-text text-lg">프로필 수정 ✏️</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple" />
          </div>
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">전화번호</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple" />
          </div>
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">기본 주소</label>
            <input type="text" value={addressMain} onChange={(e) => setAddressMain(e.target.value)}
              placeholder="서울시 강남구 역삼동..."
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple" />
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
        </div>
        <div className="px-5 pb-8 pt-1 border-t border-pick-border">
          <button
            onClick={() => void handleSave()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Check size={18} /> 저장하기</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

// ── 레퍼럴 카드 ────────────────────────────────────────
function ReferralCard() {
  const [code,         setCode]         = useState<string | null>(null);
  const [stats,        setStats]        = useState({ referralCount: 0, totalReward: 0 });
  const [inputCode,    setInputCode]    = useState("");
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [msg,          setMsg]          = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((j) => {
        if (j.code) { setCode(j.code); setStats({ referralCount: j.referralCount, totalReward: j.totalReward }); }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (!code) return;
    const text = `PICK PICK 배달앱에서 첫 주문 시 ${process.env.NEXT_PUBLIC_APP_NAME ?? "PICK PICK"}을 이용해보세요! 초대 코드: ${code}`;
    if (navigator.share) {
      navigator.share({ title: "PICK PICK 초대", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUse = async () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed.length !== 8) return setMsg({ text: "8자리 코드를 입력해주세요", ok: false });
    setSubmitting(true);
    setMsg(null);
    try {
      const res  = await fetch("/api/referral/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg({ text: json.message ?? "보상이 지급됐어요!", ok: true });
        setInputCode("");
      } else {
        setMsg({ text: json.error ?? "오류가 발생했습니다", ok: false });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-4 mb-4">
      {/* 내 초대 코드 */}
      <div className="bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light rounded-3xl p-5 text-white shadow-lg mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={16} className="text-pick-yellow-light" />
          <p className="text-xs font-bold text-white/80">내 초대 코드</p>
        </div>

        {loading ? (
          <div className="h-10 bg-white/20 rounded-2xl animate-pulse my-2" />
        ) : (
          <div className="flex items-center gap-3 my-2">
            <span className="text-3xl font-black tracking-[0.2em] text-pick-yellow-light">
              {code ?? "------"}
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleCopy}
                className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-white/70 mb-4">
          친구가 이 코드로 가입하면 둘 다 <span className="font-black text-pick-yellow-light">50 PICK</span> 지급!
        </p>

        {/* 초대 실적 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/15 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xl font-black">{stats.referralCount}명</p>
            <p className="text-[10px] text-white/70">초대한 친구</p>
          </div>
          <div className="bg-white/15 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xl font-black">{stats.totalReward.toLocaleString()} P</p>
            <p className="text-[10px] text-white/70">총 획득 보상</p>
          </div>
        </div>
      </div>

      {/* 코드 입력 (친구에게 받은 코드) */}
      <div className="bg-white rounded-3xl border-2 border-pick-border p-4 shadow-sm">
        <p className="text-xs font-bold text-pick-text mb-2">
          친구에게 초대 코드를 받았나요?
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="8자리 코드 입력"
            maxLength={8}
            className="flex-1 border-2 border-pick-border rounded-2xl px-4 py-2.5 text-sm font-bold tracking-widest text-pick-text focus:outline-none focus:border-pick-purple uppercase"
          />
          <button
            onClick={() => void handleUse()}
            disabled={submitting || inputCode.length !== 8}
            className="px-4 py-2.5 rounded-2xl bg-pick-purple text-white text-sm font-bold disabled:opacity-40 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Gift size={14} />
            }
            적용
          </button>
        </div>
        {msg && (
          <p className={`text-xs font-bold mt-2 ${msg.ok ? "text-green-600" : "text-red-500"}`}>
            {msg.ok ? "🎉 " : "⚠️ "}{msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

// ── 메뉴 아이템 ────────────────────────────────────────
function MenuItem({ icon, label, badge, onClick }: {
  icon: React.ReactNode; label: string; badge?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-5 py-4 hover:bg-pick-bg transition-colors"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-pick-bg text-pick-purple">
          {icon}
        </span>
        <span className="text-sm text-pick-text font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-xs bg-pick-yellow-light text-pick-yellow-dark font-black px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight size={16} className="text-pick-text-sub" />
      </div>
    </button>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
type PreviewRole = "user" | "owner" | "rider";

export default function MyPickPage() {
  const user    = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router  = useRouter();

  const [meData,      setMeData]      = useState<MeData | null>(null);
  const [loadingMe,   setLoadingMe]   = useState(false);
  const [previewRole, setPreviewRole] = useState<PreviewRole>("user");
  const [editOpen,    setEditOpen]    = useState(false);

  const displayRole = user ? user.role : previewRole;

  const fetchMe = useCallback(async () => {
    if (!user) return;
    setLoadingMe(true);
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) setMeData(await res.json());
    } finally {
      setLoadingMe(false);
    }
  }, [user]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  // 기본 등급 (로딩 전 또는 비로그인)
  const grade = meData?.grade ?? { label: "🌱 SEED", earned: 0, nextThreshold: 1000 };

  return (
    <div className="min-h-full pb-4">

      {/* 개발용 역할 미리보기 — 로그인 전에만 표시 */}
      {!user && (
        <div className="mx-4 mt-4 mb-1 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-yellow-700 font-bold flex-shrink-0">🛠 미리보기</span>
          <div className="flex gap-1.5 ml-auto">
            {(["user", "owner", "rider"] as PreviewRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setPreviewRole(r)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  previewRole === r
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-white text-yellow-600 border border-yellow-200"
                }`}
              >
                {r === "user" ? "👤" : r === "owner" ? "🏪" : "🛵"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 프로필 카드 */}
      <div className="px-4 pt-4 pb-4">
        <div className="bg-white rounded-3xl border-2 border-pick-border p-5 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-pick-bg border-2 border-pick-border flex items-center justify-center flex-shrink-0">
            <User size={32} className="text-pick-purple-light" />
          </div>
          {user ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-black text-pick-text text-base truncate">{user.name}</p>
                {loadingMe && <RefreshCw size={12} className="text-pick-text-sub animate-spin flex-shrink-0" />}
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-pick-bg border border-pick-border flex-shrink-0"
                >
                  <Pencil size={11} className="text-pick-text-sub" />
                </button>
              </div>
              <p className="text-xs text-pick-text-sub mt-0.5 truncate">{user.email}</p>
              {meData?.wallet && (
                <p className="text-xs font-bold text-pick-purple mt-1">
                  💜 {meData.wallet.pickBalance.toLocaleString()} PICK 보유
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-black text-pick-text text-base">로그인이 필요해요</p>
                <p className="text-xs text-pick-text-sub mt-0.5">로그인하고 PICK 혜택을 누려보세요 ✨</p>
              </div>
              <Link
                href="/login"
                className="bg-pick-purple text-white text-xs font-black px-4 py-2.5 rounded-full flex-shrink-0 active:scale-95 transition-transform"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>

      {/* PICK 등급 배너 */}
      <GradeBanner grade={grade} />

      {/* 역할별 배너 */}
      {displayRole === "owner" && <OwnerBanner />}
      {displayRole === "rider" && <RiderBanner />}

      {/* 즐겨찾기 (데이터 있을 때만) */}
      {meData?.favorites && meData.favorites.length > 0 && (
        <FavoritesSection favorites={meData.favorites} />
      )}

      {/* 내 리뷰 (데이터 있을 때만) */}
      {meData?.reviews && meData.reviews.length > 0 && (
        <ReviewsSection reviews={meData.reviews} />
      )}

      {/* 친구 초대 레퍼럴 카드 */}
      <ReferralCard />

      {/* 메뉴 목록 */}
      <div className="mx-4 bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        <MenuItem icon={<MapPin  size={18} />} label="배달 주소 관리" />
        <MenuItem icon={<Heart   size={18} />} label="즐겨찾기 가맹점" />
        <MenuItem icon={<Star    size={18} />} label="내 리뷰" />
        <MenuItem icon={<Bell    size={18} />} label="알림 설정" />
        <MenuItem icon={<HelpCircle size={18} />} label="공지사항 / FAQ" />
      </div>

      {/* 로그아웃 */}
      <div className="mx-4 mt-3 bg-white rounded-3xl border-2 border-red-100 overflow-hidden shadow-sm">
        <button
          onClick={() => void handleSignOut()}
          className="flex items-center gap-3.5 w-full px-5 py-4 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-red-50">
            <LogOut size={18} />
          </span>
          <span className="text-sm font-semibold">로그아웃</span>
        </button>
      </div>

      <p className="text-center text-xs text-pick-text-sub mt-6 mb-2">
        PICK PICK v0.1.0
      </p>

      {/* 프로필 수정 모달 */}
      {editOpen && user && (
        <EditProfileModal
          initial={{
            name:        meData?.profile.name        ?? user.name ?? "",
            phone:       meData?.profile.phone        ?? "",
            addressMain: meData?.profile.addressMain  ?? "",
          }}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            void fetchMe();
          }}
        />
      )}
    </div>
  );
}
