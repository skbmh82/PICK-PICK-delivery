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
} from "lucide-react";

const GRADE_INFO = {
  label: "🌱 SEED",
  earned: 0,
  nextThreshold: 1000,
};

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

export default function MyPickPage() {
  return (
    <div className="min-h-full pb-4">
      {/* 프로필 카드 */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-white rounded-3xl border-2 border-pick-border p-5 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-pick-bg border-2 border-pick-border flex items-center justify-center flex-shrink-0">
            <User size={32} className="text-pick-purple-light" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-pick-text text-base">로그인이 필요해요</p>
            <p className="text-xs text-pick-text-sub mt-0.5">로그인하고 PICK 혜택을 누려보세요 ✨</p>
          </div>
          <button className="bg-pick-purple text-white text-xs font-black px-4 py-2.5 rounded-full flex-shrink-0 active:scale-95 transition-transform">
            로그인
          </button>
        </div>
      </div>

      {/* PICK 등급 배너 */}
      <div className="px-4 mb-5">
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
        <button className="flex items-center gap-3.5 w-full px-5 py-4 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors">
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
