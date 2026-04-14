"use client";

import { useCallback } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx: AudioContext | null = null;
let _interval: ReturnType<typeof setInterval> | null = null;

function getOrCreateCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) _ctx = new AudioContext();
    return _ctx;
  } catch {
    return null;
  }
}

/** resume()을 await한 뒤 노트 재생 — 탭 백그라운드 후에도 안정 동작 */
async function playOnce(): Promise<void> {
  const ctx = getOrCreateCtx();
  if (!ctx) return;

  // suspended 상태면 resume 완료까지 대기
  if (ctx.state !== "running") {
    try { await ctx.resume(); } catch { return; }
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  const note = (freq: number, start: number, dur: number, vol = 0.45) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(vol, now + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  };

  note(880, 0.00, 0.10);  // 픽
  note(880, 0.18, 0.10);  // 픽
  note(523, 0.38, 0.20);  // 딩
  note(784, 0.55, 0.28);  // ↗동
}

function stopInterval() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
}

// ─────────────────────────────────────────────────────

export function useOrderSound() {
  /** 신규 주문 → 3초마다 반복 재생 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_interval) return; // 이미 반복 중
    void playOnce();
    _interval = setInterval(() => { void playOnce(); }, 3000);
  }, []);

  /** 수락/취소 → 반복 중단 */
  const stop = useCallback(() => {
    stopInterval();
  }, []);

  /** 🔔 버튼 클릭 → AudioContext 사용자 제스처로 생성/활성화 + TTS 확인 */
  const unlock = useCallback(async () => {
    const ctx = getOrCreateCtx();
    if (ctx && ctx.state !== "running") {
      try { await ctx.resume(); } catch { /* 무시 */ }
    }
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("픽픽 알림 소리가 켜졌습니다");
        u.lang = "ko-KR"; u.rate = 1.05; u.pitch = 1.1; u.volume = 1.0;
        const koVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
        if (koVoice) u.voice = koVoice;
        window.speechSynthesis.speak(u);
      } else {
        void playOnce();
      }
    } catch {
      void playOnce();
    }
  }, []);

  return { play, stop, unlock };
}
