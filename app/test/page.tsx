"use client";

import { useState, useEffect, useCallback } from "react";

interface TestRow {
  id: number;
  message: string;
  created_at: string;
}

export default function SupabaseTestPage() {
  const [rows, setRows] = useState<TestRow[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRows = useCallback(async () => {
    const res = await fetch("/api/test/supabase");
    const json = await res.json() as { ok: boolean; data?: TestRow[]; error?: string };
    if (json.ok && json.data) {
      setRows(json.data);
    } else {
      setErrorMsg(json.error ?? "조회 실패");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  async function handleInsert() {
    if (!input.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/test/supabase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const json = await res.json() as { ok: boolean; error?: string };

    if (json.ok) {
      setStatus("ok");
      setInput("");
      await fetchRows();
    } else {
      setStatus("error");
      setErrorMsg(json.error ?? "저장 실패");
    }
  }

  async function handleClear() {
    setStatus("loading");
    await fetch("/api/test/supabase", { method: "DELETE" });
    setRows([]);
    setStatus("idle");
  }

  return (
    <div className="min-h-screen bg-pick-bg flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[430px] flex flex-col gap-5">

        {/* 헤더 */}
        <div className="text-center">
          <p className="text-4xl mb-2">🔌</p>
          <h1 className="text-xl font-black text-pick-text">Supabase 연결 테스트</h1>
          <p className="text-sm text-pick-text-sub mt-1">
            데이터 저장 → 조회 동작을 확인합니다
          </p>
        </div>

        {/* 입력 카드 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm flex flex-col gap-3">
          <label className="text-sm font-bold text-pick-text">메시지 저장</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleInsert()}
            placeholder="저장할 텍스트를 입력하세요"
            className="w-full rounded-2xl border-2 border-pick-border px-4 py-3 text-sm text-pick-text outline-none focus:border-pick-purple transition-colors"
          />
          <button
            onClick={() => void handleInsert()}
            disabled={status === "loading" || !input.trim()}
            className="w-full bg-pick-purple text-white font-bold py-3 rounded-full disabled:opacity-50 active:scale-95 transition-all hover:bg-pick-purple-dark"
          >
            {status === "loading" ? "저장 중..." : "저장하기 💾"}
          </button>
        </div>

        {/* 상태 메시지 */}
        {status === "ok" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700 font-semibold text-center">
            ✅ 저장 성공! Supabase 연결이 정상입니다.
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-semibold">
            ❌ 오류: {errorMsg}
          </div>
        )}

        {/* 조회 결과 카드 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-pick-text">
              저장된 데이터 ({rows.length}건)
            </span>
            {rows.length > 0 && (
              <button
                onClick={() => void handleClear()}
                className="text-xs text-red-400 hover:text-red-600 font-semibold"
              >
                전체 삭제
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-pick-text-sub">
              <span className="text-3xl mb-2">📭</span>
              <p className="text-sm">저장된 데이터가 없어요</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between bg-pick-bg rounded-2xl px-4 py-3"
                >
                  <span className="text-sm text-pick-text font-medium">{row.message}</span>
                  <span className="text-xs text-pick-text-sub ml-2 flex-shrink-0">
                    {new Date(row.created_at).toLocaleTimeString("ko-KR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-xs text-pick-text-sub">
          이 페이지는 연결 테스트용입니다 — 실서비스 배포 전에 삭제하세요
        </p>
      </div>
    </div>
  );
}
