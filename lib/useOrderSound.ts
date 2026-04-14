"use client";

import { useCallback, useRef } from "react";

/**
 * 새 주문 알림 사운드
 * - unlock(): 🔔 버튼 클릭 시 → AudioContext 잠금 해제 + 음성 확인
 * - play():   신규 주문 도착 시 → "픽픽-딩동" 비프 3초마다 반복
 * - stop():   주문 수락/취소 시 → 반복 중단
 */
export function useOrderSound() {
  const ctxRef      = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /** "픽-픽-딩↗동" 한 번 재생 */
  const playOnce = useCallback(() => {
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
  }, [getCtx]);

  /** 수락 전까지 3초마다 반복 재생 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    // 이미 울리고 있으면 중복 방지
    if (intervalRef.current) return;

    playOnce(); // 즉시 1회
    intervalRef.current = setInterval(() => {
      playOnce();
    }, 3000);
  }, [playOnce]);

  /** 주문 수락/취소 시 반복 중단 */
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** 🔔 버튼 클릭 — AudioContext 잠금 해제 + TTS 확인 */
  const unlock = useCallback(() => {
    getCtx();
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("픽픽 알림 소리가 켜졌습니다");
        u.lang = "ko-KR"; u.rate = 1.05; u.pitch = 1.1; u.volume = 1.0;
        const voices  = window.speechSynthesis.getVoices();
        const koVoice = voices.find((v) => v.lang.startsWith("ko"));
        if (koVoice) u.voice = koVoice;
        window.speechSynthesis.speak(u);
      } else {
        playOnce();
      }
    } catch {
      playOnce();
    }
  }, [getCtx, playOnce]);

  return { play, stop, unlock };
}
