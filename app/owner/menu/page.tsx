"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ToggleLeft, ToggleRight, Flame, Pencil, Trash2, X, Check } from "lucide-react";
import { getMenuEmoji } from "@/lib/utils/categoryEmoji";

// ── 타입 ──────────────────────────────────────────────
interface Menu {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
  image_url: string | null;
}

// ── 메뉴 카테고리 목록 ─────────────────────────────────
const MENU_CATEGORIES = [
  "메인", "사이드", "음료", "세트", "디저트",
  "치킨", "피자", "버거", "한식", "분식", "기타",
];

// ── 메뉴 추가/수정 모달 ────────────────────────────────
function MenuFormModal({
  menu,
  onClose,
  onSave,
}: {
  menu: Menu | null;   // null = 추가, Menu = 수정
  onClose: () => void;
  onSave: (data: Partial<Menu>) => Promise<void>;
}) {
  const [name,        setName]        = useState(menu?.name        ?? "");
  const [price,       setPrice]       = useState(String(menu?.price ?? ""));
  const [category,    setCategory]    = useState(menu?.category    ?? "메인");
  const [description, setDescription] = useState(menu?.description ?? "");
  const [isPopular,   setIsPopular]   = useState(menu?.is_popular  ?? false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = async () => {
    const priceNum = parseInt(price, 10);
    if (!name.trim())       return setError("메뉴 이름을 입력해주세요");
    if (isNaN(priceNum) || priceNum < 0) return setError("올바른 가격을 입력해주세요");

    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        price: priceNum,
        category,
        description: description.trim() || null,
        is_popular: isPopular,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <h2 className="font-black text-pick-text text-lg">
            {menu ? "메뉴 수정" : "메뉴 추가"} 🍽️
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg"
          >
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>

        {/* 폼 */}
        <div className="px-5 py-4 flex flex-col gap-4 max-h-[70dvh] overflow-y-auto">
          {/* 메뉴명 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">메뉴 이름 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 후라이드 치킨"
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
            />
          </div>

          {/* 가격 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">가격 (원) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예) 18000"
              min="0"
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {MENU_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    category === cat
                      ? "bg-amber-500 text-white"
                      : "bg-pick-bg border border-pick-border text-pick-text-sub"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">메뉴 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메뉴에 대한 간단한 설명을 입력해주세요"
              rows={3}
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple resize-none"
            />
          </div>

          {/* 인기 메뉴 */}
          <div className="flex items-center justify-between bg-pick-bg border-2 border-pick-border rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-pick-text">인기 메뉴로 표시</span>
            </div>
            <button
              onClick={() => setIsPopular((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-all ${isPopular ? "bg-amber-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isPopular ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-bold text-center">{error}</p>
          )}
        </div>

        {/* 저장 버튼 */}
        <div className="px-5 pb-8 pt-3 border-t border-pick-border">
          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-400 text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Check size={18} />
            }
            {menu ? "수정 완료" : "메뉴 추가"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── 삭제 확인 모달 ─────────────────────────────────────
function DeleteConfirmModal({
  menu,
  onClose,
  onConfirm,
}: {
  menu: Menu;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl p-5">
        <div className="text-center mb-5">
          <p className="text-4xl mb-3">🗑️</p>
          <p className="font-black text-pick-text text-lg">메뉴를 삭제할까요?</p>
          <p className="text-sm text-pick-text-sub mt-1">
            <span className="font-bold text-pick-text">{menu.name}</span> 메뉴가 완전히 삭제됩니다
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3.5 rounded-2xl border-2 border-pick-border text-pick-text-sub font-bold text-sm"
          >
            취소
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={loading}
            className="py-3.5 rounded-2xl bg-red-500 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Trash2 size={15} />
            }
            삭제
          </button>
        </div>
      </div>
    </>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function OwnerMenuPage() {
  const [menus,       setMenus]       = useState<Menu[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [addOpen,     setAddOpen]     = useState(false);
  const [editTarget,  setEditTarget]  = useState<Menu | null>(null);
  const [deleteTarget,setDeleteTarget]= useState<Menu | null>(null);
  const [togglingId,  setTogglingId]  = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores/my/menus");
      if (res.ok) {
        const { menus: data } = await res.json();
        setMenus(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  // 품절 토글
  const handleToggle = async (menu: Menu) => {
    setTogglingId(menu.id);
    const newVal = !menu.is_available;
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: newVal }),
    });
    if (res.ok) {
      setMenus((prev) => prev.map((m) => m.id === menu.id ? { ...m, is_available: newVal } : m));
    } else {
      alert("상태 변경에 실패했습니다");
    }
    setTogglingId(null);
  };

  // 메뉴 추가
  const handleAdd = async (data: Partial<Menu>) => {
    const res = await fetch("/api/stores/my/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "메뉴 추가에 실패했습니다");
    }
    await fetchMenus();
  };

  // 메뉴 수정
  const handleEdit = async (data: Partial<Menu>) => {
    if (!editTarget) return;
    const res = await fetch(`/api/menus/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "수정에 실패했습니다");
    }
    await fetchMenus();
  };

  // 메뉴 삭제
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/menus/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setMenus((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      alert("삭제에 실패했습니다");
    }
  };

  // 카테고리별 그룹
  const groups = menus.reduce<Record<string, Menu[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-full py-5">
      <div className="flex items-center justify-between px-4 mb-5">
        <div>
          <h1 className="font-black text-pick-text text-xl">메뉴 관리 🍽️</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">
            {loading ? "불러오는 중..." : `총 ${menus.length}개 메뉴`}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-md active:scale-95 transition-transform"
        >
          <Plus size={16} />
          메뉴 추가
        </button>
      </div>

      {/* 로딩 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : menus.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-pick-text-sub px-4">
          <span className="text-5xl mb-3">🍽️</span>
          <p className="text-sm font-medium">등록된 메뉴가 없어요</p>
          <p className="text-xs mt-1 opacity-70">메뉴 추가 버튼을 눌러 첫 메뉴를 등록해보세요!</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-5 bg-amber-500 text-white text-sm font-bold px-6 py-2.5 rounded-full active:scale-95 transition-all"
          >
            + 메뉴 추가하기
          </button>
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([category, items]) => (
            <div key={category} className="mb-6">
              <div className="flex items-center gap-2 px-4 mb-3">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <h2 className="font-black text-pick-text text-sm">{category}</h2>
                <span className="text-xs text-pick-text-sub">{items.length}개</span>
              </div>

              <div className="px-4 flex flex-col gap-3">
                {items.map((menu) => (
                  <div
                    key={menu.id}
                    className={`bg-white rounded-3xl border-2 px-4 py-4 shadow-sm flex items-center gap-4 transition-opacity ${
                      menu.is_available ? "border-pick-border" : "border-gray-200 opacity-60"
                    }`}
                  >
                    {/* 이모지 */}
                    <div className="w-16 h-16 rounded-2xl bg-pick-bg border border-pick-border flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{getMenuEmoji(menu.category, menu.name)}</span>
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {menu.is_popular && (
                          <span className="flex items-center gap-0.5 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Flame size={10} />인기
                          </span>
                        )}
                        {!menu.is_available && (
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">품절</span>
                        )}
                      </div>
                      <p className="font-bold text-pick-text text-sm truncate">{menu.name}</p>
                      {menu.description && (
                        <p className="text-xs text-pick-text-sub mt-0.5 line-clamp-1">{menu.description}</p>
                      )}
                      <p className="font-black text-amber-600 text-base mt-1">
                        {menu.price.toLocaleString()}원
                      </p>
                    </div>

                    {/* 액션 */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      {/* 품절 토글 */}
                      <button
                        disabled={togglingId === menu.id}
                        onClick={() => void handleToggle(menu)}
                        className="flex flex-col items-center gap-0.5 disabled:opacity-50"
                        aria-label={menu.is_available ? "품절 처리" : "판매 재개"}
                      >
                        {menu.is_available ? (
                          <ToggleRight size={28} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={28} className="text-gray-300" />
                        )}
                        <span className="text-[9px] text-pick-text-sub font-medium">
                          {menu.is_available ? "판매중" : "품절"}
                        </span>
                      </button>

                      {/* 수정/삭제 */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditTarget(menu)}
                          className="w-7 h-7 rounded-full bg-pick-bg border border-pick-border flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Pencil size={12} className="text-pick-text-sub" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(menu)}
                          className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* 메뉴 추가 모달 */}
      {addOpen && (
        <MenuFormModal
          menu={null}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
        />
      )}

      {/* 메뉴 수정 모달 */}
      {editTarget && (
        <MenuFormModal
          menu={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          menu={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
