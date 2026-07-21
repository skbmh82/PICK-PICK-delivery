"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { User, Phone, Bike, Edit2, Check, X, Camera, LogOut, FileImage, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

// ── 타입 ──────────────────────────────────────────────
interface RiderProfile {
  id:                 string;
  name:               string;
  email:              string;
  phone:              string | null;
  profileImage:       string | null;
  vehicleType:        "car" | "motorcycle" | "bicycle" | "kickboard";
  isOnline:           boolean;
  idImageUrl:         string | null;
  vehicleRegImageUrl: string | null;
  insuranceImageUrl:  string | null;
  riderIsApproved:    boolean;
}

interface RiderData {
  profile:  RiderProfile;
  wallet:   { pickBalance: number; totalEarned: number };
  rider:    { totalEarned: number; monthlyEarning: number; monthlyCount: number };
  grade:    { grade: string; emoji: string; bonus: number; nextMin: number | null; earned: number };
}

const VEHICLE_OPTIONS = [
  { value: "car",        label: "차량",     emoji: "🚗" },
  { value: "motorcycle", label: "오토바이", emoji: "🛵" },
  { value: "bicycle",    label: "자전거",   emoji: "🚴" },
  { value: "kickboard",  label: "킥보드",   emoji: "🛴" },
] as const;

// 차량·오토바이: 면허증+차량등록증+보험 3종 / 자전거·킥보드: 신분증 1종
const DOC_REQUIREMENTS = {
  car:        [
    { key: "idImageUrl",         label: "면허증 사본",   required: true },
    { key: "vehicleRegImageUrl", label: "차량등록증",     required: true },
    { key: "insuranceImageUrl",  label: "보험가입증명서", required: true },
  ],
  motorcycle: [
    { key: "idImageUrl",         label: "면허증 사본",   required: true },
    { key: "vehicleRegImageUrl", label: "차량등록증",     required: true },
    { key: "insuranceImageUrl",  label: "보험가입증명서", required: true },
  ],
  bicycle:   [{ key: "idImageUrl", label: "신분증 또는 면허증", required: true }],
  kickboard: [{ key: "idImageUrl", label: "신분증 또는 면허증", required: true }],
} as const;


// ── 메인 페이지 ───────────────────────────────────────
export default function RiderProfilePage() {
  const router   = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [data,         setData]         = useState<RiderData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [toast,        setToast]        = useState("");
  const [docUploading, setDocUploading] = useState<Record<string, boolean>>({});
  const [docError,     setDocError]     = useState<Record<string, string>>({});

  // 편집 상태
  const [editName,           setEditName]           = useState(false);
  const [editPhone,          setEditPhone]          = useState(false);
  const [nameVal,            setNameVal]            = useState("");
  const [phoneVal,           setPhoneVal]           = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<RiderProfile["vehicleType"]>("motorcycle");

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
        setSelectedVehicleType(d.profile.vehicleType);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const savePatch = async (body: Record<string, string | null>, showSuccessToast = true) => {
    setSaving(true);
    try {
      const res = await fetch("/api/rider/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (res.ok) { await fetchData(); if (showSuccessToast) showToast("저장됐어요 ✅"); }
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

  const handleDocUpload = async (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setDocError((prev) => ({ ...prev, [docKey]: "파일 크기는 10MB 이하여야 합니다" }));
      return;
    }
    setDocUploading((prev) => ({ ...prev, [docKey]: true }));
    setDocError((prev) => ({ ...prev, [docKey]: "" }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "store-images");
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (res.ok && json.url) {
        // 파일은 즉시 업로드하되, 저장은 하단 저장 버튼으로 처리
        await savePatch({ [docKey]: json.url }, false);
      } else {
        setDocError((prev) => ({ ...prev, [docKey]: json.error ?? "업로드 실패" }));
      }
    } catch {
      setDocError((prev) => ({ ...prev, [docKey]: "업로드 중 오류가 발생했습니다" }));
    } finally {
      setDocUploading((prev) => ({ ...prev, [docKey]: false }));
      e.target.value = "";
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
            {profile.isOnline ? "운행 중" : "운행 종료"}
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
              onClick={() => setSelectedVehicleType(v.value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                selectedVehicleType === v.value
                  ? "border-sky-400 bg-sky-50"
                  : "border-pick-border bg-white"
              }`}
            >
              <span className="text-2xl">{v.emoji}</span>
              <span className={`text-[11px] font-bold ${selectedVehicleType === v.value ? "text-sky-600" : "text-pick-text-sub"}`}>
                {v.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 서류 제출 ── */}
      <div className="mx-4 mb-4 bg-white rounded-3xl border-2 border-sky-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileImage size={16} className="text-sky-500" />
            <p className="font-bold text-pick-text text-sm">서류 제출</p>
          </div>
          {profile.riderIsApproved ? (
            <span className="flex items-center gap-1 text-[11px] font-black text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} /> 승인 완료
            </span>
          ) : profile.idImageUrl ? (
            <span className="flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <AlertCircle size={12} /> 심사 중
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {DOC_REQUIREMENTS[selectedVehicleType].map((doc) => {
            const url       = profile[doc.key as keyof RiderProfile] as string | null;
            const isLoading = docUploading[doc.key] ?? false;
            const err       = docError[doc.key] ?? "";
            return (
              <div key={doc.key}>
                <p className="text-xs text-pick-text-sub font-bold mb-1.5">
                  {doc.label} {doc.required && <span className="text-red-400">*</span>}
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id={`doc-${doc.key}`}
                  onChange={(e) => void handleDocUpload(doc.key, e)}
                />
                {url ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={doc.label}
                      className="w-full max-h-36 object-contain rounded-2xl border-2 border-green-200 bg-green-50"
                    />
                    <label
                      htmlFor={`doc-${doc.key}`}
                      className="absolute top-2 right-2 bg-white/90 rounded-full px-2.5 py-1 text-[10px] font-bold text-sky-600 border border-sky-200 shadow-sm cursor-pointer"
                    >
                      다시 업로드
                    </label>
                    <p className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
                      <Check size={10} /> 제출 완료
                    </p>
                  </div>
                ) : (
                  <label
                    htmlFor={`doc-${doc.key}`}
                    className={`w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-5 cursor-pointer transition-all ${
                      isLoading ? "border-sky-200 bg-sky-50 opacity-70" : "border-pick-border bg-pick-bg active:bg-sky-50"
                    }`}
                  >
                    {isLoading
                      ? <span className="w-6 h-6 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                      : <Upload size={22} className="text-sky-400" />}
                    <span className="text-xs font-bold text-pick-text-sub">
                      {isLoading ? "업로드 중..." : "탭하여 사진 선택"}
                    </span>
                  </label>
                )}
                {err && <p className="text-xs text-red-500 font-bold mt-1">{err}</p>}
              </div>
            );
          })}
        </div>

        {!profile.riderIsApproved && (
          <p className="text-[11px] text-pick-text-sub text-center mt-3">
            서류 제출 후 관리자 검토를 거쳐 승인됩니다.
          </p>
        )}

        {/* 저장 버튼 */}
        <button
          onClick={() => void savePatch({ vehicleType: selectedVehicleType })}
          disabled={saving}
          className="w-full mt-4 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-md"
        >
          {saving
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Check size={16} />
          }
          {saving ? "저장 중..." : "저장하기"}
        </button>
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
