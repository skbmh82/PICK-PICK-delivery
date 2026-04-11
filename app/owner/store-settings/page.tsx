"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Store, MapPin, Phone, Clock, Wallet, ToggleLeft, ToggleRight,
  ChevronLeft, Check, Loader2, Star, FileText, AlertCircle,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface StoreData {
  id:             string;
  name:           string;
  category:       string;
  description:    string | null;
  phone:          string | null;
  address:        string;
  isOpen:         boolean;
  deliveryFee:    number;
  minOrderAmount: number;
  deliveryTime:   number;
  pickRewardRate: number;
  isApproved:     boolean;
  rating:         number;
  reviewCount:    number;
}

// ── 입력 필드 래퍼 ─────────────────────────────────────
function Field({
  label, icon, children,
}: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-1.5 text-xs font-bold text-pick-text-sub mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-pick-bg border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text font-medium focus:outline-none focus:border-pick-purple transition-colors";
const numInputCls = `${inputCls} text-right`;

export default function StoreSettingsPage() {
  const router = useRouter();

  const [store,   setStore]   = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  // 폼 상태
  const [name,           setName]           = useState("");
  const [description,    setDescription]    = useState("");
  const [phone,          setPhone]          = useState("");
  const [address,        setAddress]        = useState("");
  const [isOpen,         setIsOpen]         = useState(true);
  const [deliveryFee,    setDeliveryFee]    = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [deliveryTime,   setDeliveryTime]   = useState("");
  const [pickRewardRate, setPickRewardRate] = useState("");

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores/my");
      if (!res.ok) return;
      const { store: s } = await res.json();
      if (!s) return;

      const data: StoreData = {
        id:             s.id,
        name:           s.name,
        category:       s.category,
        description:    s.description,
        phone:          s.phone,
        address:        s.address,
        isOpen:         s.is_open,
        deliveryFee:    Number(s.delivery_fee),
        minOrderAmount: Number(s.min_order_amount),
        deliveryTime:   Number(s.delivery_time),
        pickRewardRate: Number(s.pick_reward_rate),
        isApproved:     s.is_approved,
        rating:         Number(s.rating),
        reviewCount:    Number(s.review_count),
      };
      setStore(data);

      // 폼 초기화
      setName(data.name);
      setDescription(data.description ?? "");
      setPhone(data.phone ?? "");
      setAddress(data.address);
      setIsOpen(data.isOpen);
      setDeliveryFee(String(data.deliveryFee));
      setMinOrderAmount(String(data.minOrderAmount));
      setDeliveryTime(String(data.deliveryTime));
      setPickRewardRate(String(data.pickRewardRate));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  const handleSave = async () => {
    if (!name.trim())    return setError("가게 이름을 입력해주세요");
    if (!address.trim()) return setError("주소를 입력해주세요");

    const fee  = parseInt(deliveryFee,    10);
    const min  = parseInt(minOrderAmount, 10);
    const time = parseInt(deliveryTime,   10);
    const rate = parseFloat(pickRewardRate);

    if (isNaN(fee)  || fee  < 0)           return setError("배달비를 올바르게 입력해주세요");
    if (isNaN(min)  || min  < 0)           return setError("최소 주문금액을 올바르게 입력해주세요");
    if (isNaN(time) || time < 5 || time > 120) return setError("예상 배달 시간은 5~120분 사이로 입력해주세요");
    if (isNaN(rate) || rate < 0.1)         return setError("PICK 적립률을 올바르게 입력해주세요");

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/stores/my", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:           name.trim(),
          description:    description.trim() || null,
          phone:          phone.trim() || null,
          address:        address.trim(),
          isOpen,
          deliveryFee:    fee,
          minOrderAmount: min,
          deliveryTime:   time,
          pickRewardRate: rate,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "저장에 실패했습니다");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await fetchStore();
    } finally {
      setSaving(false);
    }
  };

  // ── 스켈레톤 ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-pick-bg pb-24">
        <div className="sticky top-0 z-10 bg-white border-b border-pick-border px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-5 w-32 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="px-4 pt-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-pick-bg flex flex-col items-center justify-center gap-4 px-6">
        <Store size={48} className="text-gray-200" />
        <p className="text-sm font-bold text-pick-text-sub text-center">
          등록된 가게가 없어요.<br />대시보드에서 먼저 가게를 등록해주세요.
        </p>
        <button
          onClick={() => router.push("/owner/dashboard")}
          className="bg-pick-purple text-white text-sm font-bold px-6 py-3 rounded-full active:scale-95 transition-all"
        >
          대시보드로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pick-bg pb-28">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-pick-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border border-pick-border active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-pick-text" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-pick-text">가게 설정</h1>
            <p className="text-xs text-pick-text-sub">{store.category} · {store.name}</p>
          </div>
          {/* 승인 상태 배지 */}
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            store.isApproved
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {store.isApproved ? "✅ 승인완료" : "⏳ 승인대기"}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* 가게 현황 요약 */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pick-border">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-black text-pick-purple">{store.rating.toFixed(1)}</p>
              <p className="text-[10px] text-pick-text-sub flex items-center justify-center gap-0.5">
                <Star size={9} className="fill-pick-yellow text-pick-yellow" /> 평점
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-pick-text">{store.reviewCount}</p>
              <p className="text-[10px] text-pick-text-sub">리뷰 수</p>
            </div>
            <div>
              <p className={`text-lg font-black ${isOpen ? "text-green-600" : "text-gray-400"}`}>
                {isOpen ? "영업중" : "휴무"}
              </p>
              <p className="text-[10px] text-pick-text-sub">현재 상태</p>
            </div>
          </div>
        </div>

        {/* 영업 상태 토글 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pick-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-green-50">
                <Store size={18} className="text-green-600" />
              </span>
              <div>
                <p className="text-sm font-bold text-pick-text">영업 상태</p>
                <p className="text-xs text-pick-text-sub">
                  {isOpen ? "현재 주문을 받고 있어요" : "현재 주문을 받지 않아요"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="active:scale-95 transition-transform"
            >
              {isOpen
                ? <ToggleRight size={36} className="text-green-500" />
                : <ToggleLeft  size={36} className="text-gray-300" />
              }
            </button>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pick-border">
          <h2 className="text-sm font-black text-pick-text mb-4 flex items-center gap-2">
            <Store size={15} className="text-pick-purple" />
            기본 정보
          </h2>

          <Field label="가게 이름" icon={<Store size={12} />}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="가게 이름"
              maxLength={50}
            />
          </Field>

          <Field label="한 줄 소개" icon={<FileText size={12} />}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="가게 소개를 입력해주세요"
              maxLength={200}
            />
          </Field>

          <Field label="전화번호" icon={<Phone size={12} />}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="010-0000-0000"
              type="tel"
              maxLength={20}
            />
          </Field>

          <Field label="주소" icon={<MapPin size={12} />}>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputCls}
              placeholder="가게 주소"
              maxLength={200}
            />
          </Field>
        </div>

        {/* 배달 설정 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pick-border">
          <h2 className="text-sm font-black text-pick-text mb-4 flex items-center gap-2">
            <Clock size={15} className="text-pick-purple" />
            배달 설정
          </h2>

          <Field label="배달비 (원)" icon={<Wallet size={12} />}>
            <input
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value.replace(/\D/g, ""))}
              className={numInputCls}
              placeholder="0"
              inputMode="numeric"
            />
          </Field>

          <Field label="최소 주문금액 (원)" icon={<Wallet size={12} />}>
            <input
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value.replace(/\D/g, ""))}
              className={numInputCls}
              placeholder="0"
              inputMode="numeric"
            />
          </Field>

          <Field label="예상 배달 시간 (분)" icon={<Clock size={12} />}>
            <div className="flex gap-2">
              {[20, 30, 40, 50, 60].map((t) => (
                <button
                  key={t}
                  onClick={() => setDeliveryTime(String(t))}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                    deliveryTime === String(t)
                      ? "bg-pick-purple text-white"
                      : "bg-pick-bg border border-pick-border text-pick-text-sub"
                  }`}
                >
                  {t}분
                </button>
              ))}
            </div>
            <input
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value.replace(/\D/g, ""))}
              className={`${numInputCls} mt-2`}
              placeholder="직접 입력 (분)"
              inputMode="numeric"
            />
          </Field>
        </div>

        {/* PICK 적립 설정 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pick-border">
          <h2 className="text-sm font-black text-pick-text mb-1 flex items-center gap-2">
            <Star size={15} className="text-pick-yellow" />
            PICK 적립률 설정
          </h2>
          <p className="text-xs text-pick-text-sub mb-4">주문 금액의 몇 %를 고객에게 PICK으로 적립해드릴까요?</p>

          <div className="flex gap-2 mb-3">
            {[0.5, 1.0, 1.5, 2.0].map((r) => (
              <button
                key={r}
                onClick={() => setPickRewardRate(String(r))}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                  pickRewardRate === String(r)
                    ? "bg-pick-yellow text-white"
                    : "bg-pick-bg border border-pick-border text-pick-text-sub"
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
          <input
            value={pickRewardRate}
            onChange={(e) => setPickRewardRate(e.target.value)}
            className={`${numInputCls}`}
            placeholder="직접 입력 (%)"
            inputMode="decimal"
          />
        </div>

        {/* 에러 */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-full font-black text-base transition-all active:scale-95 disabled:opacity-60 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-gradient-to-r from-pick-purple to-pick-purple-light text-white shadow-lg"
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              저장 중...
            </span>
          ) : saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={18} />
              저장 완료!
            </span>
          ) : (
            "변경사항 저장"
          )}
        </button>

      </div>
    </div>
  );
}
