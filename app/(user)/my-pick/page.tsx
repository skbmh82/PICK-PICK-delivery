"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import {
  User, MapPin, Heart, Star, Gift, Bell, HelpCircle, LogOut,
  ChevronRight, Store, Bike, LayoutDashboard, ClipboardList,
  TrendingUp, Navigation, Wallet, RefreshCw, Pencil, X, Check,
  Copy, Share2, Plus, Trash2, Home, Briefcase,
} from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

// ── 타입 ──────────────────────────────────────────────
interface Grade    { label: string; earned: number; nextThreshold: number; multiplier?: number }
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
          <div className="flex items-center gap-2">
            {grade.multiplier && grade.multiplier > 1 && (
              <span className="text-xs bg-pick-yellow text-white px-2 py-0.5 rounded-full font-bold">
                ×{grade.multiplier} 적립
              </span>
            )}
            <span className="text-xs text-white/80 bg-white/15 px-3 py-1 rounded-full font-semibold">
              {grade.earned.toLocaleString()} PICK 적립
            </span>
          </div>
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

// ── 배달 주소 관리 모달 ────────────────────────────────
interface UserAddress {
  id:        string;
  label:     string;
  address:   string;
  detail:    string;
  isDefault: boolean;
}

const ADDRESS_LABELS = ["집", "회사", "기타"] as const;
type AddressLabel = typeof ADDRESS_LABELS[number];

const LABEL_ICON: Record<string, React.ReactNode> = {
  "집":   <Home size={14} />,
  "회사": <Briefcase size={14} />,
  "기타": <MapPin size={14} />,
};

/* Daum Postcode API 타입 */
declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (data: { roadAddress: string; jibunAddress: string; zonecode: string }) => void;
        width?: string | number;
        height?: string | number;
      }) => { open: () => void; embed: (el: HTMLElement) => void };
    };
  }
}

function AddressManagerModal({ onClose }: { onClose: () => void }) {
  const [addresses,   setAddresses]   = useState<UserAddress[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [addOpen,     setAddOpen]     = useState(false);
  const [editTarget,  setEditTarget]  = useState<UserAddress | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const searchLayerRef                = useRef<HTMLDivElement>(null);

  // 폼 state
  const [label,     setLabel]     = useState<AddressLabel>("집");
  const [address,   setAddress]   = useState("");
  const [detail,    setDetail]    = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState("");

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/addresses");
      if (res.ok) {
        const { addresses: rows } = await res.json() as { addresses: UserAddress[] };
        setAddresses(rows ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* Daum Postcode 스크립트 로드 + 주소 검색 레이어 열기 */
  const openPostcodeSearch = useCallback(() => {
    const load = () => {
      if (!window.daum?.Postcode || !searchLayerRef.current) return;
      searchLayerRef.current.innerHTML = "";
      setSearchOpen(true);
      new window.daum.Postcode({
        oncomplete: (data) => {
          setAddress(data.roadAddress || data.jibunAddress);
          setSearchOpen(false);
          setFormErr("");
        },
        width: "100%",
        height: "100%",
      }).embed(searchLayerRef.current);
    };

    if (window.daum?.Postcode) {
      load();
    } else {
      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = load;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const openAdd = () => {
    setEditTarget(null);
    setLabel("집"); setAddress(""); setDetail(""); setIsDefault(addresses.length === 0);
    setFormErr("");
    setAddOpen(true);
  };

  const openEdit = (addr: UserAddress) => {
    setEditTarget(addr);
    setLabel(addr.label as AddressLabel);
    setAddress(addr.address);
    setDetail(addr.detail);
    setIsDefault(addr.isDefault);
    setFormErr("");
    setAddOpen(true);
  };

  const handleSave = async () => {
    if (address.trim().length < 2) return setFormErr("주소를 2자 이상 입력해주세요");
    setSaving(true); setFormErr("");
    try {
      if (editTarget) {
        const res = await fetch(`/api/users/addresses/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, address: address.trim(), detail: detail.trim(), isDefault }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          return setFormErr((j.error as string) ?? "수정에 실패했습니다");
        }
      } else {
        const res = await fetch("/api/users/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, address: address.trim(), detail: detail.trim() || undefined, isDefault }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          return setFormErr((j.error as string) ?? "추가에 실패했습니다");
        }
      }
      setAddOpen(false);
      await fetchAddresses();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/users/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/users/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border flex-shrink-0">
          <div>
            <h2 className="font-black text-pick-text text-lg">배달 주소 관리 📍</h2>
            <p className="text-xs text-pick-text-sub mt-0.5">최대 5개까지 저장할 수 있어요</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 border-2 border-pick-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-pick-text-sub">
              <MapPin size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">저장된 배달 주소가 없어요</p>
              <p className="text-xs mt-1">아래 버튼으로 주소를 추가해보세요</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl border-2 px-4 py-4 shadow-sm ${
                  addr.isDefault ? "border-pick-purple" : "border-pick-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                      addr.isDefault
                        ? "bg-pick-purple text-white"
                        : "bg-pick-bg text-pick-text-sub border border-pick-border"
                    }`}>
                      {LABEL_ICON[addr.label]}
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-pick-purple">기본</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {!addr.isDefault && (
                      <button
                        onClick={() => void handleSetDefault(addr.id)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-pick-border text-pick-text-sub hover:border-pick-purple hover:text-pick-purple transition-colors"
                      >
                        기본 설정
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(addr)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-pick-bg border border-pick-border text-pick-text-sub hover:text-pick-purple transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => void handleDelete(addr.id)}
                      disabled={deleting === addr.id}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {deleting === addr.id
                        ? <span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 size={12} />
                      }
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-pick-text">{addr.address}</p>
                {addr.detail && (
                  <p className="text-xs text-pick-text-sub mt-0.5">{addr.detail}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* 폼 (추가/수정) */}
        {addOpen && (
          <div className="flex-shrink-0 border-t-2 border-pick-border px-5 pt-4 pb-2 bg-pick-bg">
            <p className="text-xs font-black text-pick-text mb-3">
              {editTarget ? "주소 수정" : "새 주소 추가"}
            </p>
            {/* 레이블 */}
            <div className="flex gap-2 mb-3">
              {ADDRESS_LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                    label === l
                      ? "bg-pick-purple text-white"
                      : "bg-white border-2 border-pick-border text-pick-text-sub"
                  }`}
                >
                  {LABEL_ICON[l]} {l}
                </button>
              ))}
            </div>
            {/* 주소 검색 레이어 */}
            {searchOpen && (
              <div className="fixed inset-0 z-[70] flex flex-col bg-white rounded-t-3xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-pick-border flex-shrink-0">
                  <p className="font-black text-pick-text text-sm">주소 검색 🔍</p>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg"
                  >
                    <X size={15} className="text-pick-text-sub" />
                  </button>
                </div>
                <div ref={searchLayerRef} className="flex-1" />
              </div>
            )}
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="도로명 주소 또는 지번 주소"
                className="flex-1 border-2 border-pick-border rounded-2xl px-3 py-2.5 text-sm text-pick-text focus:outline-none focus:border-pick-purple bg-white"
              />
              <button
                type="button"
                onClick={openPostcodeSearch}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-pick-purple text-white text-xs font-black whitespace-nowrap active:scale-95 transition-transform"
              >
                <MapPin size={13} /> 검색
              </button>
            </div>
            <input
              type="text" value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="상세 주소 (동/호수 등, 선택)"
              className="w-full border-2 border-pick-border rounded-2xl px-3 py-2.5 text-sm text-pick-text focus:outline-none focus:border-pick-purple bg-white mb-2"
            />
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <div
                onClick={() => setIsDefault(!isDefault)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isDefault ? "bg-pick-purple border-pick-purple" : "border-pick-border bg-white"
                }`}
              >
                {isDefault && <Check size={12} className="text-white" />}
              </div>
              <span className="text-xs font-bold text-pick-text">기본 배달 주소로 설정</span>
            </label>
            {formErr && <p className="text-xs text-red-500 font-bold mb-2">{formErr}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setAddOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border-2 border-pick-border text-pick-text-sub text-sm font-bold"
              >
                취소
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex-1 py-2.5 rounded-2xl bg-pick-purple text-white text-sm font-black flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><Check size={14} /> {editTarget ? "수정" : "추가"}</>
                }
              </button>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        {!addOpen && (
          <div className="flex-shrink-0 px-5 pb-8 pt-3 border-t border-pick-border">
            <button
              onClick={openAdd}
              disabled={addresses.length >= 5}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-pick-purple text-white font-black text-sm active:scale-95 transition-all disabled:opacity-40 shadow-md"
            >
              <Plus size={16} />
              주소 추가하기 ({addresses.length}/5)
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── 메뉴 아이템 ────────────────────────────────────────
function MenuItem({ icon, label, badge, onClick, href }: {
  icon: React.ReactNode; label: string; badge?: string; onClick?: () => void; href?: string;
}) {
  const inner = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between w-full px-5 py-4 hover:bg-pick-bg transition-colors">
        {inner}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-5 py-4 hover:bg-pick-bg transition-colors"
    >
      {inner}
    </button>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
type PreviewRole = "user" | "owner" | "rider";

export default function MyPickPage() {
  const user    = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router  = useRouter();

  const [meData,       setMeData]       = useState<MeData | null>(null);
  const [loadingMe,    setLoadingMe]    = useState(false);
  const [previewRole,  setPreviewRole]  = useState<PreviewRole>("user");
  const [editOpen,     setEditOpen]     = useState(false);
  const [addressOpen,  setAddressOpen]  = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const pfpInputRef = useRef<HTMLInputElement>(null);

  const displayRole = user ? user.role : previewRole;

  const fetchMe = useCallback(async () => {
    if (!user) return;
    setLoadingMe(true);
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setMeData(data);
        if (data.profile?.profileImage) setProfileImage(data.profile.profileImage);
      }
    } finally {
      setLoadingMe(false);
    }
  }, [user]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const handleSignOut = async () => {
    await fetch("/api/fcm/token", { method: "DELETE" }).catch(() => {});
    await signOut();
    router.replace("/login");
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file",   file);
    form.append("folder", "profile");
    setUploadingPfp(true);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "이미지 업로드 실패"); return; }
      setProfileImage(json.url);
      // 서버에 프로필 이미지 URL 저장
      await fetch("/api/users/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ profileImage: json.url }),
      });
    } finally {
      setUploadingPfp(false);
      if (pfpInputRef.current) pfpInputRef.current.value = "";
    }
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
          {/* 프로필 이미지 */}
          <div className="relative flex-shrink-0">
            <input ref={pfpInputRef} type="file" accept="image/*" className="hidden"
              onChange={handleProfileImageUpload} />
            <button
              onClick={() => user && pfpInputRef.current?.click()}
              disabled={uploadingPfp}
              className="w-16 h-16 rounded-full bg-pick-bg border-2 border-pick-border flex items-center justify-center overflow-hidden active:scale-95 transition-transform disabled:opacity-60"
            >
              {uploadingPfp ? (
                <RefreshCw size={20} className="text-pick-purple animate-spin" />
              ) : profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-pick-purple-light" />
              )}
            </button>
            {user && (
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-pick-purple rounded-full flex items-center justify-center border-2 border-white">
                <Pencil size={9} className="text-white" />
              </span>
            )}
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
        <MenuItem icon={<MapPin  size={18} />} label="배달 주소 관리" onClick={() => setAddressOpen(true)} />
        <MenuItem icon={<Heart   size={18} />} label="즐겨찾기 가맹점" />
        <MenuItem icon={<Star    size={18} />} label="내 리뷰" />
        <MenuItem icon={<Bell    size={18} />} label="알림" href="/notifications" />
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

      {/* 배달 주소 관리 모달 */}
      {addressOpen && <AddressManagerModal onClose={() => setAddressOpen(false)} />}
    </div>
  );
}
