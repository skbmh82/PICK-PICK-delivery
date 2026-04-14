"use client";

import { useCallback } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx: AudioContext | null = null;
let _orderInterval: ReturnType<typeof setInterval> | null = null;
let _keepaliveInterval: ReturnType<typeof setInterval> | null = null;
let _unlocked = false;

function getOrCreateCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) _ctx = new AudioContext();
    return _ctx;
  } catch {
    return null;
  }
}

async function playBeepOnce(): Promise<void> {
  const ctx = getOrCreateCtx();
  if (!ctx) return;
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
  note(880, 0.00, 0.10);
  note(880, 0.18, 0.10);
  note(523, 0.38, 0.20);
  note(784, 0.55, 0.28);
}

/** Chrome speechSynthesis keepalive — 10초마다 무음 utterance로 활성 유지 */
function startKeepalive() {
  if (_keepaliveInterval) return;
  _keepaliveInterval = setInterval(() => {
    if (!("speechSynthesis" in window)) return;
    // 이미 말하는 중이면 스킵
    if (window.speechSynthesis.speaking) return;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    u.lang = "ko-KR";
    window.speechSynthesis.speak(u);
  }, 10000);
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 1.0;
    u.pitch = 1.1;
    u.volume = 1.0;
    const koVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
    if (koVoice) u.voice = koVoice;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────

export function useOrderSound() {

  /** 신규 주문 → 음성 + 비프 3초마다 반복 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_orderInterval) return;

    const ring = () => {
      const spoke = _unlocked ? speak("픽픽! 주문이 들어왔습니다") : false;
      if (!spoke) void playBeepOnce();
    };

    ring();
    _orderInterval = setInterval(ring, 3000);
  }, []);

  /** 수락/취소 → 반복 중단 */
  const stop = useCallback(() => {
    if (_orderInterval) {
      clearInterval(_orderInterval);
      _orderInterval = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  /** 🔔 버튼 클릭 → AudioContext + speechSynthesis 활성화 */
  const unlock = useCallback(async () => {
    _unlocked = true;

    // AudioContext 활성화
    const ctx = getOrCreateCtx();
    if (ctx && ctx.state !== "running") {
      try { await ctx.resume(); } catch { /* 무시 */ }
    }

    // 음성으로 잠금 해제 확인 (user gesture이므로 확실히 동작)
    speak("픽픽 알림 소리가 켜졌습니다");

    // Chrome keepalive 시작 — 이후 비사용자 제스처에서도 speak() 가능
    startKeepalive();
  }, []);

  return { play, stop, unlock };
}
