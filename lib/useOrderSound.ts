"use client";

import { useCallback, useRef } from "react";

/**
 * 새 주문 알림 사운드
 * - unlock(): 🔔 버튼 클릭 시 → AudioContext 잠금 해제 + 음성 확인
 * - play():   신규 주문 Realtime 이벤트 시 → "픽픽!" 비프 패턴 재생
 *
 * speechSynthesis은 브라우저 autoplay 정책상 비사용자-제스처 컨텍스트
 * (WebSocket 콜백 등)에서 차단되므로 play()는 Web Audio API 비프음 사용.
 */
export function useOrderSound() {
  const ctxRef     = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /**
   * "픽픽! 새 주문 알림" 비프 패턴
   * 픽(880Hz) - 픽(880Hz) - 딩동(523→784Hz)
   */
  const playBeep = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const schedule = (freq: number, start: number, dur: number, vol = 0.45) => {
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
      osc.stop(now + start + dur + 0.01);
    };

    // 픽(짧게) - 픽(짧게) - 딩↗동(상승)
    schedule(880, 0.00, 0.10);   // 픽
    schedule(880, 0.18, 0.10);   // 픽
    schedule(523, 0.38, 0.20);   // 딩
    schedule(784, 0.55, 0.25);   // ↗동

  }, [getCtx]);

  /** 🔔 버튼 클릭 시 → 잠금 해제 + TTS 확인 메시지 */
  const unlock = useCallback(() => {
    // AudioContext 잠금 해제 (사용자 제스처 컨텍스트에서 실행)
    getCtx();
    unlockedRef.current = true;

    // 음성 확인 (user gesture이므로 speechSynthesis 가능)
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
        playBeep();
      }
    } catch {
      playBeep();
    }
  }, [getCtx, playBeep]);

  /** 신규 주문 Realtime 이벤트 → 비프 패턴 재생 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    playBeep();
  }, [playBeep]);

  return { play, unlock };
}
