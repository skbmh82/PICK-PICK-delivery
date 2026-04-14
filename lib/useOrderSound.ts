"use client";

import { useCallback, useRef } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
// 어느 페이지에서 unlock()을 호출해도 같은 AudioContext를 공유
let _ctx: AudioContext | null = null;
let _interval: ReturnType<typeof setInterval> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) _ctx = new AudioContext();
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function playOnce() {
  const ctx = getCtx();
  if (!ctx) return;
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

// ─────────────────────────────────────────────────────

/**
 * useOrderSound — 어느 페이지에서 호출해도 같은 AudioContext 사용
 * - unlock(): 🔔 버튼 클릭 → AudioContext 잠금 해제 + TTS 확인
 * - play():   신규 주문 → 픽픽딩동 3초마다 반복
 * - stop():   수락/취소 → 반복 중단
 */
export function useOrderSound() {
  // intervalRef는 컴포넌트별로 관리 (중복 방지)
  const intervalRef = useRef(_interval);

  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_interval) return; // 이미 울리는 중
    playOnce();
    _interval = setInterval(playOnce, 3000);
    intervalRef.current = _interval;
  }, []);

  const stop = useCallback(() => {
    if (_interval) {
      clearInterval(_interval);
      _interval = null;
      intervalRef.current = null;
    }
  }, []);

  const unlock = useCallback(() => {
    // 사용자 제스처 컨텍스트에서 AudioContext 잠금 해제
    getCtx();
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("픽픽 알림 소리가 켜졌습니다");
        u.lang = "ko-KR"; u.rate = 1.05; u.pitch = 1.1; u.volume = 1.0;
        const koVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ko"));
        if (koVoice) u.voice = koVoice;
        window.speechSynthesis.speak(u);
      } else {
        playOnce();
      }
    } catch {
      playOnce();
    }
  }, []);

  return { play, stop, unlock };
}
