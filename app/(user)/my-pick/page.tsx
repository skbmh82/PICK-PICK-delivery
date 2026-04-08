"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  User,
  MapPin,
  Heart,
  Star,
  Gift,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  Bike,
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Navigation,
  Wallet,
} from "lucide-react";

const GRADE_INFO = {
  label: "🌱 SEED",
  earned: 0,
  nextThreshold: 1000,
};

type Role = "user" | "owner" | "rider";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

function MenuItem({ icon, label, badge }: MenuItemProps) {
  return (
    <button className="flex items-center justify-between w-full px-5 py-4 hover:bg-pick-bg transition-colors">
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
          <Link href="/owner/dashboard" className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-3">
            <LayoutDashboard size={20} />
            <span className="text-xs font-bold">대시보드</span>
          </Link>
          <Link href="/owner/orders" className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-3">
            <ClipboardList size={20} />
            <span className="text-xs font-bold">주문관리</span>
          </Link>
          <Link href="/owner/settlement" className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-3">
            <TrendingUp size={20} />
            <span className="text-xs font-bold">정산/매출</span>
          </Link>
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
          <Link href="/rider/dashboard" className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-3">
            <Navigation size={20} />
            <span className="text-xs font-bold">배달현황</span>
          </Link>
          <Link href="/rider/delivery" className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-3">
            <Bike size={20} />
            <span className="text-xs font-bold">배달하기</span>
          </Link>
          <Link href="/rider/earnings" className="flex flex-col items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl py-3">
            <Wallet size={20} />
            <span className="text-xs font-bold">수익내역</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyPickPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();
  const role = user?.role ?? "user";

  // 개발용 미리보기 전환 (로그인 전에만 표시)
  const [previewRole, setPreviewRole] = useState<Role>("user");
  const displayRole = user ? role : previewRole;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-full pb-4">

      {/* 개발용 역할 미리보기 — 로그인 전에만 표시 */}
      {!user && (
        <div className="mx-4 mt-4 mb-1 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-yellow-700 font-bold flex-shrink-0">🛠 미리보기</span>
          <div className="flex gap-1.5 ml-auto">
            {(["user", "owner", "rider"] as Role[]).map((r) => (
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
              <p className="font-black text-pick-text text-base truncate">{user.name}</p>
              <p className="text-xs text-pick-text-sub mt-0.5 truncate">{user.email}</p>
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
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-pick-purple to-pick-purple-light rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-lg">{GRADE_INFO.label}</span>
            <span className="text-xs text-white/80 bg-white/15 px-3 py-1 rounded-full font-semibold">
              {GRADE_INFO.earned} / {GRADE_INFO.nextThreshold} PICK
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className="bg-pick-yellow-light h-2.5 rounded-full transition-all"
              style={{ width: `${(GRADE_INFO.earned / GRADE_INFO.nextThreshold) * 100}%` }}
            />
          </div>
          <p className="text-xs text-white/75 mt-2">
            {GRADE_INFO.nextThreshold - GRADE_INFO.earned} PICK 더 모으면 🌿 SPROUT 달성!
          </p>
        </div>
      </div>

      {/* 역할별 배너 */}
      {displayRole === "owner" && <OwnerBanner />}
      {displayRole === "rider" && <RiderBanner />}

      {/* 메뉴 목록 */}
      <div className="mx-4 bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        <MenuItem icon={<MapPin size={18} />} label="배달 주소 관리" />
        <MenuItem icon={<Heart size={18} />} label="즐겨찾기 가맹점" />
        <MenuItem icon={<Star size={18} />} label="내 리뷰" />
        <MenuItem icon={<Gift size={18} />} label="친구 초대" badge="50 PICK" />
        <MenuItem icon={<Bell size={18} />} label="알림 설정" />
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
