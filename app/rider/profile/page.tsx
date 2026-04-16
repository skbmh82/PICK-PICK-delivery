"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { User, Phone, Bike, Edit2, Check, X, Camera, LogOut, Gift, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

// ── 타입 ──────────────────────────────────────────────
interface RiderProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  vehicleType: "motorcycle" | "bicycle" | "kickboard" | "walk";
  isOnline: boolean;
}

interface RiderData {
  profile:  RiderProfile;
  wallet:   { pickBalance: number; totalEarned: number };
  rider:    { totalEarned: number; monthlyEarning: number; monthlyCount: number };
  grade:    { grade: string; emoji: string; bonus: number; nextMin: number | null; earned: number };
}

const VEHICLE_OPTIONS = [
  { value: "motorcycle", label: "오토바이", emoji: "🛵" },
  { value: "bicycle",    label: "자전거",   emoji: "🚴" },
  { value: "kickboard",  label: "킥보드",   emoji: "🛴" },
  { value: "walk",       label: "도보",     emoji: "🚶" },
] as const;

// ── 라이더 초대 공유 버튼 ─────────────────────────────
function RiderShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = "PICK PICK 라이더로 활동하고 자유롭게 수익을 올려보세요! 신규 라이더 가입 보너스 10,000 PICK 지급!";
    const url  = typeof window !== "undefined" ? window.location.origin : "";
    if (navigator.share) {
      navigator.share({ title: "PICK PICK 라이더 초대", text, url }).catch(() => {});
    } else {
      void navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 bg-white text-sky-600 font-black py-3 rounded-full active:scale-95 transition-all text-sm shadow-sm"
    >
      {copied ? <Copy size={15} /> : <Share2 size={15} />}
      {copied ? "링크 복사됐어요!" : "라이더 초대 링크 공유"}
    </button>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function RiderProfilePage() {
  const router   = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [data,      setData]      = useState<RiderData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState("");

  // 편집 상태
  const [editName,    setEditName]    = useState(false);
  const [editPhone,   setEditPhone]   = useState(false);
  const [nameVal,     setNameVal]     = useState("");
  const [phoneVal,    setPhoneVal]    = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rider/profile");
      if (res.ok) {
        const d = await res.json() as RiderData;
        setData(d);
        setNameVal(d.profile.name);
        setPhoneVal(d.profile.phone ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const savePatch = async (body: Record<string, string | null>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/rider/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (res.ok) { await fetchData(); showToast("저장됐어요 ✅"); }
      else        { showToast("저장에 실패했어요"); }
    } finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file",   file);
      form.append("folder", "profile");
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json() as { url?: string };
      if (json.url) await savePatch({ profileImage: json.url });
    } finally {
      setUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-full flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-full flex items-center justify-center py-20 text-pick-text-sub">
      데이터를 불러올 수 없어요
    </div>
  );

  const { profile, wallet, rider, grade } = data;
  const gradeProgress = grade.nextMin
    ? Math.min((grade.earned / grade.nextMin) * 100, 100)
    : 100;

  return (
    <div className="min-h-full py-5">
      {/* 토스트 */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-pick-purple text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="px-4 mb-4">
        <h1 className="font-black text-pick-text text-xl">내 정보 👤</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">라이더 프로필을 관리하세요</p>
      </div>

      {/* ── 프로필 카드 ── */}
      <div className="mx-4 mb-4 bg-white rounded-3xl border-2 border-sky-100 shadow-sm overflow-hidden">
        {/* 상단 그라데이션 */}
        <div className="h-16 bg-gradient-to-r from-sky-500 to-blue-500" />

        {/* 아바타 */}
        <div className="px-4 pb-4 -mt-8">
          <div className="relative w-fit mb-3">
            <div className="w-16 h-16 rounded-full bg-sky-100 border-4 border-white shadow overflow-hidden flex items-center justify-center">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <User size={30} className="text-sky-400" />
              )}
            </div>
            <button
              onClick={() => imgInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center border-2 border-white"
            >
              {uploading
                ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                : <Camera size={10} className="text-white" />}
            </button>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* 온라인 상태 뱃지 */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
            profile.isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${profile.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {profile.isOnline ? "온라인" : "오프라인"}
          </div>

          {/* 이름 */}
          <div className="mb-3">
            <p className="text-xs text-pick-text-sub mb-1 font-medium">이름</p>
            {editName ? (
              <div className="flex gap-2">
                <input
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-sky-200 text-sm focus:outline-none focus:border-sky-400"
                />
                <button disabled={saving} onClick={async () => { await savePatch({ name: nameVal }); setEditName(false); }}
                  className="p-2 bg-sky-500 text-white rounded-xl disabled:opacity-50">
                  <Check size={14} />
                </button>
                <button onClick={() => { setEditName(false); setNameVal(profile.name); }}
                  className="p-2 bg-gray-100 text-gray-500 rounded-xl">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-bold text-pick-text">{profile.name}</p>
                <button onClick={() => setEditName(true)} className="p-1.5 rounded-xl bg-sky-50 text-sky-500">
                  <Edit2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* 전화번호 */}
          <div className="mb-3">
            <p className="text-xs text-pick-text-sub mb-1 font-medium">전화번호</p>
            {editPhone ? (
              <div className="flex gap-2">
                <input
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="010-0000-0000"
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-sky-200 text-sm focus:outline-none focus:border-sky-400"
                />
                <button disabled={saving} onClick={async () => { await savePatch({ phone: phoneVal }); setEditPhone(false); }}
                  className="p-2 bg-sky-500 text-white rounded-xl disabled:opacity-50">
                  <Check size={14} />
                </button>
                <button onClick={() => { setEditPhone(false); setPhoneVal(profile.phone ?? ""); }}
                  className="p-2 bg-gray-100 text-gray-500 rounded-xl">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-sky-400" />
                  <p className="font-bold text-pick-text">{profile.phone ?? "미등록"}</p>
                </div>
                <button onClick={() => setEditPhone(true)} className="p-1.5 rounded-xl bg-sky-50 text-sky-500">
                  <Edit2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <p className="text-xs text-pick-text-sub mb-1 font-medium">이메일</p>
            <p className="text-sm text-pick-text-sub">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* ── 차량 종류 ── */}
      <div className="mx-4 mb-4 bg-white rounded-3xl border-2 border-sky-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bike size={16} className="text-sky-500" />
          <p className="font-bold text-pick-text text-sm">차량 종류</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {VEHICLE_OPTIONS.map((v) => (
            <button
              key={v.value}
              disabled={saving}
              onClick={() => savePatch({ vehicleType: v.value })}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                profile.vehicleType === v.value
                  ? "border-sky-400 bg-sky-50"
                  : "border-pick-border bg-white"
              }`}
            >
              <span className="text-2xl">{v.emoji}</span>
              <span className={`text-[11px] font-bold ${profile.vehicleType === v.value ? "text-sky-600" : "text-pick-text-sub"}`}>
                {v.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PICK 지갑 ── */}
      <div className="mx-4 mb-4 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-500 p-4 text-white shadow-lg">
        <p className="text-sm text-white/80 font-medium mb-1">💙 PICK 지갑</p>
        <p className="text-3xl font-black mb-3">{wallet.pickBalance.toLocaleString()} <span className="text-lg">PICK</span></p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xs text-white/70">이번 달 수익</p>
            <p className="font-black text-white">{rider.monthlyEarning.toLocaleString()} P</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xs text-white/70">이번 달 배달</p>
            <p className="font-black text-white">{rider.monthlyCount}건</p>
          </div>
        </div>
      </div>

      {/* ── 라이더 등급 ── */}
      <div className="mx-4 mb-4 bg-white rounded-3xl border-2 border-sky-100 shadow-sm p-4">
        <p className="text-xs text-pick-text-sub font-medium mb-2">라이더 등급</p>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{grade.emoji}</span>
          <div>
            <p className="font-black text-pick-text text-lg">{grade.grade}</p>
            <p className="text-xs text-sky-600 font-bold">
              배달비 +{grade.bonus}% 보너스
              {grade.bonus === 0 && " (기본)"}
            </p>
          </div>
        </div>
        {/* 등급 진행 바 */}
        <div className="bg-sky-50 rounded-2xl px-3 py-2">
          <div className="flex justify-between text-xs text-pick-text-sub mb-1.5">
            <span>누적 수익 {rider.totalEarned.toLocaleString()} PICK</span>
            {grade.nextMin && <span>다음 등급 {grade.nextMin.toLocaleString()} PICK</span>}
          </div>
          <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${gradeProgress}%` }}
            />
          </div>
        </div>

        {/* 등급 혜택 표 */}
        <div className="mt-3 grid grid-cols-5 gap-1">
          {[
            { emoji: "🔰", label: "뉴비",   min: 0 },
            { emoji: "🥉", label: "브론즈", min: 50000 },
            { emoji: "🥈", label: "실버",   min: 200000 },
            { emoji: "🥇", label: "골드",   min: 500000 },
            { emoji: "💎", label: "다이아", min: 1000000 },
          ].map((g) => (
            <div
              key={g.label}
              className={`flex flex-col items-center py-2 rounded-xl text-center ${
                rider.totalEarned >= g.min ? "bg-sky-50" : "bg-gray-50"
              }`}
            >
              <span className="text-lg">{g.emoji}</span>
              <span className={`text-[9px] font-bold mt-0.5 ${rider.totalEarned >= g.min ? "text-sky-600" : "text-gray-400"}`}>
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 신규 라이더 초대 ── */}
      <div className="mx-4 mb-4 bg-gradient-to-br from-sky-600 to-blue-500 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
            <Gift size={18} className="text-yellow-300" />
          </span>
          <div>
            <p className="font-black text-sm">신규 라이더 초대 🛵</p>
            <p className="text-xs text-white/70">라이더 지인을 초대하고 보상을 받으세요</p>
          </div>
        </div>
        <div className="bg-white/15 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">초대 성공 시 지급</p>
            <p className="text-2xl font-black text-yellow-300">10,000 <span className="text-base">PICK</span></p>
            <p className="text-[11px] text-white/60">≈ ₩10,000</p>
          </div>
          <span className="text-4xl">🎁</span>
        </div>
        <RiderShareButton />
      </div>

      {/* ── 로그아웃 ── */}
      <div className="mx-4 mb-8">
        <button
          onClick={() => void handleLogout()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm active:scale-95 transition-all"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  );
}
