"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  User, MapPin, Heart, Star, Gift, Bell, HelpCircle, LogOut,
  ChevronRight, Store, Bike, LayoutDashboard, ClipboardList,
  TrendingUp, Navigation, Wallet, RefreshCw,
} from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

// ── 타입 ──────────────────────────────────────────────
interface Grade    { label: string; earned: number; nextThreshold: number }
interface Favorite { storeId: string; name: string; category: string; rating: number; deliveryFee: number; deliveryTime: number }
interface Review   { id: string; rating: number; content: string; createdAt: string; storeName: string }
interface MeData {
  grade: Grade;
  wallet: { pickBalance: number; totalEarned: number };
  favorites: Favorite[];
  reviews: Review[];
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

      {/* 메뉴 목록 */}
      <div className="mx-4 bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        <MenuItem icon={<MapPin  size={18} />} label="배달 주소 관리" />
        <MenuItem icon={<Heart   size={18} />} label="즐겨찾기 가맹점" />
        <MenuItem icon={<Star    size={18} />} label="내 리뷰" />
        <MenuItem icon={<Gift    size={18} />} label="친구 초대" badge="50 PICK" />
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
    </div>
  );
}
