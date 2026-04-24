"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store, MapPin, Phone, Clock, Wallet, ToggleLeft, ToggleRight,
  ChevronLeft, Check, Loader2, Star, FileText, AlertCircle,
  ImagePlus, Camera, Ticket, Plus, X, Tag, CalendarDays, Gift, Image,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface StoreData {
  id:                    string;
  name:                  string;
  category:              string;
  description:           string | null;
  notice:                string | null;
  phone:                 string | null;
  address:               string;
  isOpen:                boolean;
  deliveryFee:           number;
  minOrderAmount:        number;
  deliveryTime:          number;
  deliveryRadiusKm:      number;
  photoReviewRewardKrw:  number;
  isApproved:            boolean;
  rating:                number;
  reviewCount:           number;
  imageUrl:              string | null;
  bannerUrl:             string | null;
}

// 현재 PICK 시세 (1 PICK = 1원, 추후 API/config 테이블에서 동적으로 조회)
const PICK_RATE_KRW = 1; // 원화 기준 1 PICK = 1원
const krwToPick = (krw: number) => Math.round(krw / PICK_RATE_KRW);

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

// ── 영업시간 관리 섹션 ──────────────────────────────────
const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

interface HourRow {
  day_of_week: number;
  open_time:   string;
  close_time:  string;
  is_closed:   boolean;
}

function defaultHours(): HourRow[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    open_time:   "09:00",
    close_time:  "22:00",
    is_closed:   false,
  }));
}

function StoreHoursSection() {
  const [expanded, setExpanded] = useState(false);
  const [hours,    setHours]    = useState<HourRow[]>(defaultHours());
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [err,      setErr]      = useState("");

  const fetchHours = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores/my/hours");
      if (res.ok) {
        const { hours: rows } = await res.json() as { hours: HourRow[] };
        if (rows && rows.length === 7) {
          setHours(rows.sort((a, b) => a.day_of_week - b.day_of_week));
        }
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (expanded) fetchHours(); }, [expanded, fetchHours]);

  const update = (dow: number, field: keyof HourRow, value: string | boolean) => {
    setHours((prev) => prev.map((h) =>
      h.day_of_week === dow ? { ...h, [field]: value } : h
    ));
  };

  // 특정 요일과 동일하게 일괄 복사
  const copyToAll = (dow: number) => {
    const src = hours.find((h) => h.day_of_week === dow);
    if (!src) return;
    setHours((prev) => prev.map((h) => ({
      ...h,
      open_time:  src.open_time,
      close_time: src.close_time,
      is_closed:  src.is_closed,
    })));
  };

  const handleSave = async () => {
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/stores/my/hours", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ hours }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const j = await res.json().catch(() => ({}));
        setErr((j.error as string) ?? "저장에 실패했습니다");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pick-border overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-pick-bg transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-pick-purple" />
          <span className="font-black text-pick-text text-sm">영업시간 설정</span>
        </div>
        {expanded
          ? <X size={16} className="text-pick-text-sub" />
          : <Plus size={16} className="text-pick-text-sub" />
        }
      </button>

      {expanded && (
        <div className="border-t border-pick-border px-4 py-4 flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              {hours.map((h) => (
                <div key={h.day_of_week} className={`px-3 py-2.5 rounded-2xl border-2 transition-all ${
                  h.is_closed ? "bg-gray-50 border-gray-200 opacity-60" : "bg-pick-bg border-pick-border"
                }`}>
                  {/* 1행: 요일 + 영업/휴무 토글 + 전체적용 */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black w-5 text-center ${
                        h.day_of_week === 0 ? "text-red-500" :
                        h.day_of_week === 6 ? "text-blue-500" :
                        "text-pick-text"
                      }`}>
                        {DAYS[h.day_of_week]}
                      </span>
                      {/* 영업/휴무 세그먼트 토글 */}
                      <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
                        <button
                          onClick={() => update(h.day_of_week, "is_closed", false)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-all ${
                            !h.is_closed
                              ? "bg-green-500 text-white shadow-sm"
                              : "text-gray-400"
                          }`}
                        >
                          영업
                        </button>
                        <button
                          onClick={() => update(h.day_of_week, "is_closed", true)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-all ${
                            h.is_closed
                              ? "bg-gray-400 text-white shadow-sm"
                              : "text-gray-400"
                          }`}
                        >
                          휴무
                        </button>
                      </div>
                    </div>
                    {!h.is_closed && (
                      <button
                        onClick={() => copyToAll(h.day_of_week)}
                        title="이 시간을 모든 요일에 적용"
                        className="text-[10px] text-pick-purple font-black px-2.5 py-1 bg-white border border-pick-purple/30 rounded-full whitespace-nowrap active:scale-90 transition-transform"
                      >
                        전체적용
                      </button>
                    )}
                  </div>

                  {/* 2행: 시간 설정 */}
                  {!h.is_closed ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.open_time}
                        onChange={(e) => update(h.day_of_week, "open_time", e.target.value)}
                        className="flex-1 min-w-0 text-xs font-bold bg-white border border-pick-border rounded-xl px-2 py-1.5 text-pick-text focus:outline-none focus:border-pick-purple"
                      />
                      <span className="text-xs text-pick-text-sub flex-shrink-0">~</span>
                      <input
                        type="time"
                        value={h.close_time}
                        onChange={(e) => update(h.day_of_week, "close_time", e.target.value)}
                        className="flex-1 min-w-0 text-xs font-bold bg-white border border-pick-border rounded-xl px-2 py-1.5 text-pick-text focus:outline-none focus:border-pick-purple"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-pick-text-sub text-center py-0.5">오늘 쉬어요</p>
                  )}
                </div>
              ))}

              {err && <p className="text-xs text-red-500 font-bold text-center">{err}</p>}

              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className={`w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-pick-purple text-white"
                }`}
              >
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> 저장 중...</>
                  : saved
                    ? <><Check size={14} /> 저장 완료!</>
                    : <><Clock size={14} /> 영업시간 저장</>
                }
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── 사진 리뷰 보상 설정 섹션 ──────────────────────────
interface PhotoReviewRewardSectionProps {
  storeId: string;
  initialKrw: number;
}

function PhotoReviewRewardSection({ storeId, initialKrw }: PhotoReviewRewardSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [krwInput, setKrwInput] = useState(String(initialKrw || 0));
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [err,      setErr]      = useState("");

  const pickAmount = krwToPick(parseFloat(krwInput) || 0);

  const handleSave = async () => {
    const krw = parseFloat(krwInput);
    if (isNaN(krw) || krw < 0) return setErr("올바른 금액을 입력해주세요");
    if (krw > 100000)          return setErr("최대 100,000원까지 설정 가능해요");

    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/stores/my", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ photoReviewRewardKrw: krw }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const j = await res.json().catch(() => ({}));
        setErr((j.error as string) ?? "저장에 실패했습니다");
      }
    } finally { setSaving(false); }
  };

  // storeId unused but kept for future per-store balance checks
  void storeId;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pick-border overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-pick-bg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Image size={16} className="text-pick-purple" />
          <span className="font-black text-pick-text text-sm">사진 리뷰 보상 설정</span>
          {initialKrw > 0 && (
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              ₩{initialKrw.toLocaleString()} 설정됨
            </span>
          )}
        </div>
        <span className="text-xs text-pick-purple font-bold">{expanded ? "접기 ▲" : "열기 ▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-pick-border px-5 py-4 flex flex-col gap-4">
          {/* 안내 */}
          <div className="bg-pick-bg rounded-2xl px-4 py-3 border border-pick-border">
            <p className="text-xs font-bold text-pick-text mb-1">📸 사진 리뷰 보상이란?</p>
            <p className="text-[11px] text-pick-text-sub leading-relaxed">
              고객이 주문 후 <strong>사진과 함께 리뷰</strong>를 작성하면 설정한 금액을 PICK으로 자동 지급해요.<br />
              PICK 가격이 변동되어도 <strong>원화 가치는 그대로 유지</strong>돼요.<br />
              <span className="text-pick-yellow font-bold">가맹점 PICK 잔액에서 차감</span>됩니다.
            </p>
          </div>

          {/* 금액 입력 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub block mb-2">
              보상 금액 (원화 기준)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-pick-text-sub">₩</span>
              <input
                type="number"
                value={krwInput}
                onChange={(e) => setKrwInput(e.target.value)}
                min="0"
                max="100000"
                step="100"
                placeholder="500"
                className="w-full bg-pick-bg border-2 border-pick-border rounded-2xl pl-8 pr-4 py-3 text-sm font-bold text-right text-pick-text focus:outline-none focus:border-pick-purple transition-colors"
              />
            </div>
            {/* 단계 버튼 */}
            <div className="flex gap-2 mt-2">
              {[0, 300, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => setKrwInput(String(v))}
                  className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                    krwInput === String(v)
                      ? "bg-pick-purple text-white"
                      : "bg-pick-bg border border-pick-border text-pick-text-sub"
                  }`}
                >
                  {v === 0 ? "미지급" : `₩${v}`}
                </button>
              ))}
            </div>
          </div>

          {/* 자동 환산 미리보기 */}
          {pickAmount > 0 && (
            <div className="bg-gradient-to-r from-pick-purple/10 to-pick-purple-light/10 rounded-2xl px-4 py-3 border border-pick-purple/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-pick-text-sub">현재 시세 (1 PICK = ₩{PICK_RATE_KRW})</p>
                  <p className="text-xs font-bold text-pick-text mt-0.5">고객에게 지급되는 PICK</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-pick-purple">{pickAmount.toLocaleString()} P</p>
                  <p className="text-[10px] text-pick-text-sub">≈ ₩{(pickAmount * PICK_RATE_KRW).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {err && <p className="text-xs text-red-500 font-bold">{err}</p>}

          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className={`w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 ${
              saved ? "bg-green-500 text-white" : "bg-pick-purple text-white"
            }`}
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> 저장 중...</>
              : saved
                ? <><Check size={14} /> 저장 완료!</>
                : <><Gift size={14} /> 보상 설정 저장</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

// ── 사장님 쿠폰 관리 섹션 ─────────────────────────────
interface OwnerCoupon {
  id: string; code: string; title: string;
  type: "fixed_pick" | "pick_rate" | "free_delivery";
  value: number; minOrder: number; maxUses: number | null;
  usedCount: number; isActive: boolean; expiresAt: string | null;
}

function OwnerCouponSection() {
  const [coupons,    setCoupons]    = useState<OwnerCoupon[]>([]);
  const [expanded,   setExpanded]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toggling,   setToggling]   = useState<string | null>(null);

  // 폼
  const [fCode,     setFCode]     = useState("");
  const [fTitle,    setFTitle]    = useState("");
  const [fType,     setFType]     = useState<"fixed_pick" | "pick_rate" | "free_delivery">("fixed_pick");
  const [fValue,    setFValue]    = useState("");
  const [fKrw,      setFKrw]      = useState(""); // KRW 입력 → PICK 자동 환산용
  const [fMinOrder, setFMinOrder] = useState("0");
  const [fMaxUses,  setFMaxUses]  = useState("");
  const [fExpires,  setFExpires]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState("");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/coupons");
      if (res.ok) setCoupons(await res.json().then((d: { coupons: OwnerCoupon[] }) => d.coupons));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (expanded) fetchCoupons(); }, [expanded, fetchCoupons]);

  const handleCreate = async () => {
    if (!fCode.trim() || !fTitle.trim()) return setFormErr("코드와 제목은 필수입니다");
    const val = fType === "free_delivery" ? 0 : parseFloat(fValue);
    if (fType !== "free_delivery" && (isNaN(val) || val <= 0)) return setFormErr("올바른 값을 입력해주세요");
    setSaving(true); setFormErr("");
    try {
      const res = await fetch("/api/owner/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: fCode.trim().toUpperCase(), title: fTitle.trim(),
          type: fType, value: val,
          minOrder: parseFloat(fMinOrder) || 0,
          maxUses:  fMaxUses ? parseInt(fMaxUses) : null,
          expiresAt: fExpires ? new Date(fExpires).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        setFCode(""); setFTitle(""); setFValue(""); setFKrw(""); setFMinOrder("0"); setFMaxUses(""); setFExpires("");
        await fetchCoupons();
      } else {
        setFormErr(json.error ?? "쿠폰 생성에 실패했습니다");
      }
    } finally { setSaving(false); }
  };

  const handleToggle = async (c: OwnerCoupon) => {
    setToggling(c.id);
    try {
      await fetch("/api/owner/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: c.id, isActive: !c.isActive }),
      });
      setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !c.isActive } : x));
    } finally { setToggling(null); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pick-border overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-pick-bg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Ticket size={16} className="text-pick-purple" />
          <span className="font-black text-pick-text text-sm">쿠폰 발행 관리</span>
          {coupons.filter((c) => c.isActive).length > 0 && (
            <span className="bg-pick-purple text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              활성 {coupons.filter((c) => c.isActive).length}개
            </span>
          )}
        </div>
        <span className="text-xs text-pick-purple font-bold">{expanded ? "접기 ▲" : "열기 ▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-pick-border">
          <div className="px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-pick-text-sub">가게 전용 쿠폰을 발행해 고객을 유치하세요</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1 bg-pick-purple text-white text-xs font-bold px-3 py-2 rounded-full"
            >
              <Plus size={12} /> 새 쿠폰
            </button>
          </div>

          {/* 생성 폼 인라인 */}
          {createOpen && (
            <div className="mx-4 mb-4 bg-pick-bg rounded-2xl p-4 border border-pick-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black text-pick-text">새 쿠폰 만들기</p>
                <button onClick={() => setCreateOpen(false)} className="w-6 h-6 rounded-full bg-white border border-pick-border flex items-center justify-center">
                  <X size={11} className="text-pick-text-sub" />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-pick-text-sub block mb-1">쿠폰 코드</label>
                    <input value={fCode} onChange={(e) => setFCode(e.target.value.toUpperCase())} placeholder="STORE10"
                      className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-sm uppercase font-bold tracking-wider focus:outline-none focus:border-pick-purple bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-pick-text-sub block mb-1">유형</label>
                    <select value={fType} onChange={(e) => setFType(e.target.value as typeof fType)}
                      className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-pick-purple">
                      <option value="fixed_pick">PICK 지급</option>
                      <option value="pick_rate">적립% 추가</option>
                      <option value="free_delivery">배달비 무료</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pick-text-sub block mb-1">쿠폰명</label>
                  <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="우리 가게 첫 방문 쿠폰"
                    className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pick-purple" />
                </div>
                {/* 쿠폰 값 입력 — fixed_pick은 원화 입력 후 PICK 자동 환산 */}
                {fType === "fixed_pick" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-pick-text-sub">보상 금액 (원화 입력)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-pick-text-sub">₩</span>
                        <input
                          type="number" value={fKrw} min="0" placeholder="500"
                          onChange={(e) => {
                            setFKrw(e.target.value);
                            setFValue(String(krwToPick(parseFloat(e.target.value) || 0)));
                          }}
                          className="w-full border-2 border-pick-border rounded-xl pl-7 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-pick-purple"
                        />
                      </div>
                      <span className="text-xs text-pick-text-sub flex-shrink-0">→</span>
                      <div className="flex-1 border-2 border-pick-purple/30 bg-pick-bg rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="text-xs font-black text-pick-purple">{krwToPick(parseFloat(fKrw) || 0).toLocaleString()} P</span>
                        <span className="text-[9px] text-pick-text-sub">PICK</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-pick-text-sub">현재 시세: 1 PICK = ₩{PICK_RATE_KRW} · PICK 가격 변동 시 자동 조정</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-pick-text-sub block mb-1">
                      {fType === "pick_rate" ? "추가 적립율 (%)" : "값 (0)"}
                    </label>
                    <input type="number" value={fValue} onChange={(e) => setFValue(e.target.value)} min="0"
                      disabled={fType === "free_delivery"}
                      className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pick-purple disabled:bg-gray-50" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-pick-text-sub block mb-1">최소주문(원)</label>
                    <input type="number" value={fMinOrder} onChange={(e) => setFMinOrder(e.target.value)} min="0"
                      className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pick-purple" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-pick-text-sub block mb-1">최대발급</label>
                    <input type="number" value={fMaxUses} onChange={(e) => setFMaxUses(e.target.value)} min="1" placeholder="∞"
                      className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pick-purple" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pick-text-sub block mb-1">만료일 (선택)</label>
                  <input type="datetime-local" value={fExpires} onChange={(e) => setFExpires(e.target.value)}
                    className="w-full border-2 border-pick-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pick-purple" />
                </div>
                {formErr && <p className="text-xs text-red-500 font-bold">{formErr}</p>}
                <button onClick={() => void handleCreate()} disabled={saving}
                  className="w-full py-3 rounded-2xl bg-pick-purple text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Ticket size={14} />}
                  쿠폰 발행
                </button>
              </div>
            </div>
          )}

          {/* 기존 쿠폰 목록 */}
          {loading ? (
            <div className="px-4 pb-4 animate-pulse flex flex-col gap-2">
              {[0,1].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-2xl" />)}
            </div>
          ) : coupons.length === 0 ? (
            <div className="px-4 pb-6 flex flex-col items-center gap-2 text-pick-text-sub">
              <Tag size={28} className="opacity-20" />
              <p className="text-xs">발행된 쿠폰이 없어요</p>
            </div>
          ) : (
            <div className="px-4 pb-4 flex flex-col gap-2">
              {coupons.map((c) => (
                <div key={c.id} className={`flex items-center gap-3 bg-pick-bg rounded-2xl px-4 py-3 border ${c.isActive ? "border-pick-border" : "border-gray-100 opacity-60"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black tracking-widest text-pick-purple">{c.code}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${c.isActive ? "bg-pick-purple/10 text-pick-purple" : "bg-gray-100 text-gray-400"}`}>
                        {c.isActive ? "활성" : "비활성"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-pick-text mt-0.5 truncate">{c.title}</p>
                    <p className="text-[10px] text-pick-text-sub">
                      {c.type === "fixed_pick"    && `${c.value} PICK 지급`}
                      {c.type === "pick_rate"     && `${c.value}% 추가 적립`}
                      {c.type === "free_delivery" && "배달비 무료"}
                      {" · "}사용 {c.usedCount}{c.maxUses != null ? `/${c.maxUses}` : ""}건
                    </p>
                  </div>
                  <button
                    onClick={() => void handleToggle(c)}
                    disabled={toggling === c.id}
                    className="flex-shrink-0 disabled:opacity-40"
                  >
                    {c.isActive
                      ? <ToggleRight size={22} className="text-pick-purple" />
                      : <ToggleLeft  size={22} className="text-gray-300" />
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [notice,         setNotice]         = useState("");
  const [phone,          setPhone]          = useState("");
  const [address,        setAddress]        = useState("");
  const [isOpen,         setIsOpen]         = useState(true);
  const [deliveryFee,      setDeliveryFee]      = useState("");
  const [minOrderAmount,   setMinOrderAmount]   = useState("");
  const [deliveryTime,     setDeliveryTime]     = useState("");
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState("5");
  const [photoReviewRewardKrw,  setPhotoReviewRewardKrw]  = useState(0);
  const [imageUrl,       setImageUrl]       = useState<string | null>(null);
  const [bannerUrl,      setBannerUrl]      = useState<string | null>(null);
  const [uploadingImg,   setUploadingImg]   = useState<"image" | "banner" | null>(null);
  const imageInputRef  = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores/my");
      if (!res.ok) return;
      const { store: s } = await res.json();
      if (!s) return;

      const data: StoreData = {
        id:                   s.id,
        name:                 s.name,
        category:             s.category,
        description:          s.description,
        notice:               s.notice ?? null,
        phone:                s.phone,
        address:              s.address,
        isOpen:               s.is_open,
        deliveryFee:          Number(s.delivery_fee),
        minOrderAmount:       Number(s.min_order_amount),
        deliveryTime:         Number(s.delivery_time),
        deliveryRadiusKm:     Number(s.delivery_radius_km ?? 5),
        photoReviewRewardKrw: Number(s.photo_review_reward_krw ?? 0),
        isApproved:           s.is_approved,
        rating:               Number(s.rating),
        reviewCount:          Number(s.review_count),
        imageUrl:             s.image_url  ?? null,
        bannerUrl:            s.banner_url ?? null,
      };
      setStore(data);

      // 폼 초기화
      setName(data.name);
      setDescription(data.description ?? "");
      setNotice(data.notice ?? "");
      setPhone(data.phone ?? "");
      setAddress(data.address);
      setIsOpen(data.isOpen);
      setDeliveryFee(String(data.deliveryFee));
      setMinOrderAmount(String(data.minOrderAmount));
      setDeliveryTime(String(data.deliveryTime));
      setDeliveryRadiusKm(String(data.deliveryRadiusKm));
      setPhotoReviewRewardKrw(data.photoReviewRewardKrw);
      setImageUrl(data.imageUrl);
      setBannerUrl(data.bannerUrl);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  const handleUpload = async (file: File, type: "image" | "banner") => {
    const form = new FormData();
    form.append("file",   file);
    form.append("folder", "store");
    setUploadingImg(type);
    setError("");
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "이미지 업로드 실패"); return; }
      if (type === "image")  setImageUrl(json.url);
      if (type === "banner") setBannerUrl(json.url);
    } finally {
      setUploadingImg(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim())    return setError("가게 이름을 입력해주세요");
    if (!address.trim()) return setError("주소를 입력해주세요");

    const fee    = parseInt(deliveryFee,      10);
    const min    = parseInt(minOrderAmount,   10);
    const time   = parseInt(deliveryTime,     10);
    const radius = parseFloat(deliveryRadiusKm);

    if (isNaN(fee)    || fee    < 0)                return setError("배달비를 올바르게 입력해주세요");
    if (isNaN(min)    || min    < 0)                return setError("최소 주문금액을 올바르게 입력해주세요");
    if (isNaN(time)   || time   < 5 || time > 120)  return setError("예상 배달 시간은 5~120분 사이로 입력해주세요");
    if (isNaN(radius) || radius < 1 || radius > 30) return setError("배달 반경은 1~30km 사이로 입력해주세요");

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/stores/my", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:             name.trim(),
          description:      description.trim() || null,
          notice:           notice.trim() || null,
          phone:            phone.trim() || null,
          address:          address.trim(),
          isOpen,
          deliveryFee:      fee,
          minOrderAmount:   min,
          deliveryTime:     time,
          deliveryRadiusKm: radius,
          imageUrl,
          bannerUrl,
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

        {/* 가게 이미지 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pick-border">
          <h2 className="text-sm font-black text-pick-text mb-4 flex items-center gap-2">
            <Camera size={15} className="text-pick-purple" />
            가게 이미지
          </h2>

          {/* 배너 이미지 */}
          <p className="text-xs text-pick-text-sub font-semibold mb-2">배너 이미지 (가게 상단 대형 이미지)</p>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "banner"); e.target.value = ""; }} />
          <button onClick={() => bannerInputRef.current?.click()} disabled={!!uploadingImg}
            className="w-full relative border-2 border-dashed border-pick-border rounded-2xl overflow-hidden bg-pick-bg active:scale-[0.98] transition-transform disabled:opacity-60 mb-4"
            style={{ minHeight: 96 }}>
            {uploadingImg === "banner" ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Loader2 size={22} className="text-pick-purple animate-spin" />
                <p className="text-xs text-pick-text-sub">업로드 중...</p>
              </div>
            ) : bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="배너" className="w-full h-28 object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <ImagePlus size={24} className="text-gray-300" />
                <p className="text-xs text-pick-text-sub">배너 이미지 선택 (권장: 1200×400)</p>
              </div>
            )}
          </button>
          {bannerUrl && (
            <button onClick={() => setBannerUrl(null)} className="text-xs text-red-400 font-semibold underline mb-4 block">
              배너 제거
            </button>
          )}

          {/* 프로필(썸네일) 이미지 */}
          <p className="text-xs text-pick-text-sub font-semibold mb-2">프로필 이미지 (목록에서 보이는 대표 이미지)</p>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "image"); e.target.value = ""; }} />
          <div className="flex items-center gap-4">
            <button onClick={() => imageInputRef.current?.click()} disabled={!!uploadingImg}
              className="w-20 h-20 rounded-3xl border-2 border-dashed border-pick-border bg-pick-bg flex items-center justify-center overflow-hidden active:scale-95 transition-transform disabled:opacity-60 flex-shrink-0">
              {uploadingImg === "image" ? (
                <Loader2 size={20} className="text-pick-purple animate-spin" />
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus size={22} className="text-gray-300" />
              )}
            </button>
            <div>
              <p className="text-xs font-bold text-pick-text mb-1">프로필 사진</p>
              <p className="text-[11px] text-pick-text-sub">권장 크기: 400×400</p>
              {imageUrl && (
                <button onClick={() => setImageUrl(null)} className="text-xs text-red-400 font-semibold underline mt-1 block">
                  제거
                </button>
              )}
            </div>
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

          <Field label="가게 소개" icon={<FileText size={12} />}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="가게 소개를 입력해주세요 (최대 200자)"
              maxLength={200}
            />
          </Field>

          <Field label="공지사항" icon={<FileText size={12} />}>
            <textarea
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="고객에게 전달할 공지사항을 입력해주세요&#10;(예: 주차 안내, 휴무 일정, 이벤트 등, 최대 500자)"
              maxLength={500}
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

          <Field label="배달 반경 (km)" icon={<MapPin size={12} />}>
            <p className="text-[11px] text-pick-text-sub mb-2">
              이 반경 내 고객에게만 가게가 노출돼요
            </p>
            <div className="flex gap-2 mb-2">
              {[3, 5, 7, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setDeliveryRadiusKm(String(r))}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                    deliveryRadiusKm === String(r)
                      ? "bg-pick-purple text-white"
                      : "bg-pick-bg border border-pick-border text-pick-text-sub"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
            <input
              value={deliveryRadiusKm}
              onChange={(e) => setDeliveryRadiusKm(e.target.value)}
              className={`${numInputCls}`}
              placeholder="직접 입력 (km, 1~30)"
              inputMode="decimal"
            />
          </Field>
        </div>

        {/* 영업시간 관리 */}
        <StoreHoursSection />

        {/* 사진 리뷰 보상 설정 */}
        <PhotoReviewRewardSection storeId={store.id} initialKrw={photoReviewRewardKrw} />

        {/* 쿠폰 관리 */}
        <OwnerCouponSection />

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
