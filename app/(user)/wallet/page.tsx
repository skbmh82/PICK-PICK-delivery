import { Wallet, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="min-h-full px-4 py-6 flex flex-col gap-5">
      {/* 잔액 카드 */}
      <div className="rounded-3xl bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light p-6 text-white shadow-xl">
        <p className="text-sm text-white/70 mb-1 font-medium">내 PICK 잔액 💜</p>
        <div className="flex items-end gap-2 mb-5">
          <span className="text-5xl font-black">0</span>
          <span className="text-pick-yellow-light font-black text-lg mb-1.5">PICK</span>
        </div>
        <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-2.5">
          <span className="text-xs text-white/70">잠금 잔액</span>
          <span className="text-sm font-bold text-white">0 PICK</span>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple hover:bg-pick-bg active:scale-95 transition-all">
          <ArrowDownLeft size={18} />
          충전하기
        </button>
        <button className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple hover:bg-pick-bg active:scale-95 transition-all">
          <ArrowUpRight size={18} />
          보내기
        </button>
      </div>

      {/* 거래 내역 */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <History size={16} className="text-pick-purple" />
          <h2 className="font-bold text-pick-text">거래 내역</h2>
        </div>
        <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
          <Wallet size={44} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">아직 거래 내역이 없어요</p>
          <p className="text-xs mt-1 opacity-70">충전하고 첫 주문을 해보세요!</p>
        </div>
      </div>
    </div>
  );
}
