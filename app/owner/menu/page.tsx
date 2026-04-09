"use client";

import { useState } from "react";
import { Plus, ToggleLeft, ToggleRight, Flame, Pencil } from "lucide-react";
import { MOCK_STORES } from "@/lib/mock/stores";

// 바삭대장 치킨 메뉴 사용 (사장님 가게 mock)
const STORE = MOCK_STORES.find((s) => s.id === "store-chicken-1")!;

export default function OwnerMenuPage() {
  const [menus, setMenus] = useState(STORE.menus);

  const toggleAvailable = (id: string) => {
    setMenus((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  // 카테고리별 그룹
  const groups = menus.reduce<Record<string, typeof menus>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-full py-5">
      <div className="flex items-center justify-between px-4 mb-5">
        <div>
          <h1 className="font-black text-pick-text text-xl">메뉴 관리 🍽️</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">메뉴 품절 처리 및 관리</p>
        </div>
        <button className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-md active:scale-95 transition-transform">
          <Plus size={16} />
          메뉴 추가
        </button>
      </div>

      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="mb-6">
          {/* 카테고리 헤더 */}
          <div className="flex items-center gap-2 px-4 mb-3">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h2 className="font-black text-pick-text text-sm">{category}</h2>
            <span className="text-xs text-pick-text-sub">{items.length}개</span>
          </div>

          {/* 메뉴 카드 목록 */}
          <div className="px-4 flex flex-col gap-3">
            {items.map((menu) => (
              <div
                key={menu.id}
                className={`bg-white rounded-3xl border-2 px-4 py-4 shadow-sm flex items-center gap-4 transition-opacity ${
                  menu.isAvailable ? "border-pick-border opacity-100" : "border-gray-200 opacity-50"
                }`}
              >
                {/* 이모지 */}
                <div className="w-16 h-16 rounded-2xl bg-pick-bg border border-pick-border flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{menu.image}</span>
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {menu.isPopular && (
                      <span className="flex items-center gap-0.5 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Flame size={10} />
                        인기
                      </span>
                    )}
                    {!menu.isAvailable && (
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        품절
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-pick-text text-sm">{menu.name}</p>
                  <p className="font-black text-amber-600 text-base mt-1">
                    {menu.price.toLocaleString()}원
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  {/* 품절 토글 */}
                  <button
                    onClick={() => toggleAvailable(menu.id)}
                    className="flex flex-col items-center gap-0.5"
                    aria-label={menu.isAvailable ? "품절 처리" : "판매 재개"}
                  >
                    {menu.isAvailable ? (
                      <ToggleRight size={28} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-300" />
                    )}
                    <span className="text-[9px] text-pick-text-sub font-medium">
                      {menu.isAvailable ? "판매중" : "품절"}
                    </span>
                  </button>

                  {/* 수정 버튼 */}
                  <button className="w-8 h-8 rounded-full bg-pick-bg border border-pick-border flex items-center justify-center active:scale-90 transition-transform">
                    <Pencil size={13} className="text-pick-text-sub" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 메뉴 추가 안내 */}
      <div className="mx-4 mt-2 mb-4 bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 flex items-center gap-3">
        <span className="text-3xl">💡</span>
        <div>
          <p className="font-bold text-amber-700 text-sm">메뉴 수정 및 추가</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
            메뉴 추가 / 가격 수정 / 이미지 변경 기능은 곧 추가됩니다!
          </p>
        </div>
      </div>
    </div>
  );
}
