"use client";

import { useEffect, useState } from "react";

export default function PiTestPage() {
  const [hasPi,   setHasPi]   = useState(false);
  const [status,  setStatus]  = useState("대기 중");
  const [log,     setLog]     = useState<string[]>([]);

  const addLog = (msg: string) => setLog((p) => [...p, `${new Date().toLocaleTimeString()} ${msg}`]);

  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined" && window.Pi) {
        setHasPi(true);
        addLog("✅ Pi SDK 감지됨");
      } else {
        addLog("⚠️ Pi SDK 없음 — Pi Browser에서 열어주세요");
      }
    };
    // SDK가 afterInteractive로 로드되므로 약간 대기
    setTimeout(check, 1000);
  }, []);

  const handlePay = async () => {
    if (!window.Pi) { addLog("❌ Pi SDK 없음"); return; }
    setStatus("Pi 인증 중...");
    addLog("→ Pi.authenticate() 호출");
    try {
      const auth = await window.Pi.authenticate(["payments"], async (pmt) => {
        addLog(`⚠️ 미완료 결제 발견: ${pmt.identifier}`);
        if (pmt.transaction?.txid) {
          await fetch("/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: pmt.identifier, txid: pmt.transaction.txid }),
          });
          addLog("→ 미완료 결제 complete 처리");
        }
      });
      addLog(`✅ 인증 성공: ${auth.user.username}`);
      setStatus("결제 생성 중...");

      window.Pi.createPayment(
        { amount: 0.001, memo: "PICK PICK 테스트 결제", metadata: { test: true } },
        {
          onReadyForServerApproval: async (paymentId) => {
            addLog(`→ approve 요청: ${paymentId}`);
            const res = await fetch("/api/pi/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
            addLog(res.ok ? "✅ approve 완료" : `❌ approve 실패 ${res.status}`);
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            addLog(`→ complete 요청: ${txid}`);
            const res = await fetch("/api/pi/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });
            addLog(res.ok ? "✅ complete 완료" : `❌ complete 실패 ${res.status}`);
            setStatus("🎉 결제 완료!");
          },
          onCancel: (id) => { addLog(`취소됨: ${id}`); setStatus("취소됨"); },
          onError: (err) => { addLog(`❌ 오류: ${err.message}`); setStatus("오류"); },
        }
      );
    } catch (e) {
      addLog(`❌ 예외: ${e instanceof Error ? e.message : String(e)}`);
      setStatus("오류");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-3xl mb-1">π</p>
        <h1 className="text-xl font-black">Pi Network 결제 테스트</h1>
        <p className="text-sm text-gray-400 mt-1">PICK PICK Developer Checklist Step 10</p>
      </div>

      {/* 상태 */}
      <div className="bg-gray-800 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">상태</p>
        <p className="font-black text-lg">{status}</p>
        <p className={`text-xs mt-1 ${hasPi ? "text-green-400" : "text-yellow-400"}`}>
          {hasPi ? "Pi SDK 연결됨 ✓" : "Pi Browser 필요"}
        </p>
      </div>

      {/* 결제 버튼 */}
      <button
        onClick={() => void handlePay()}
        disabled={!hasPi}
        className="w-full py-4 rounded-2xl font-black text-lg bg-amber-500 text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        0.001 π 테스트 결제 시작
      </button>

      {/* 로그 */}
      <div className="bg-gray-900 rounded-2xl p-4 flex flex-col gap-1 min-h-[200px]">
        <p className="text-xs text-gray-500 mb-2 font-bold">로그</p>
        {log.length === 0 && <p className="text-xs text-gray-600">로그 없음</p>}
        {log.map((l, i) => (
          <p key={i} className="text-xs text-gray-300 font-mono">{l}</p>
        ))}
      </div>
    </div>
  );
}
