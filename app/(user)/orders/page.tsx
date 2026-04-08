import { ClipboardList } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="min-h-full px-4 py-6">
      <h1 className="font-black text-pick-text text-xl mb-6">PICK 주문 📋</h1>

      {/* 진행 중인 주문 */}
      <section className="mb-5">
        <h2 className="font-bold text-pick-text text-sm mb-3 px-1">진행 중인 주문</h2>
        <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
          <span className="text-5xl mb-3">🛵</span>
          <p className="text-sm font-medium">진행 중인 주문이 없어요</p>
        </div>
      </section>

      {/* 주문 내역 */}
      <section>
        <h2 className="font-bold text-pick-text text-sm mb-3 px-1">주문 내역</h2>
        <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
          <ClipboardList size={44} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">아직 주문 내역이 없어요</p>
          <p className="text-xs mt-1 opacity-70">첫 주문을 시작해보세요!</p>
          <Link
            href="/home"
            className="mt-4 bg-pick-purple text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-pick-purple-dark active:scale-95 transition-all"
          >
            음식 주문하러 가기
          </Link>
        </div>
      </section>
    </div>
  );
}
