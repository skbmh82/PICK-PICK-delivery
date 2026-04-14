"use client";

import { useCallback, useRef } from "react";

/**
 * 새 주문 알림 사운드
 * 1) Web Speech API로 "픽픽! 새 주문이 들어왔습니다" 음성 재생
 * 2) 음성 미지원 환경에서는 Web Audio API 비프음으로 폴백
 */
export function useOrderSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const freqs  = [523, 659, 784]; // C5 E5 G5
      const starts = [0, 0.18, 0.36];
      const dur    = 0.15;

      freqs.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + starts[i]);
        gain.gain.linearRampToValueAtTime(0.35, now + starts[i] + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + starts[i] + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + starts[i]);
        osc.stop(now + starts[i] + dur);
      });
    } catch {
      // AudioContext 미지원 환경에서는 무시
    }
  }, []);

  const play = useCallback(() => {
    try {
      if (typeof window === "undefined") return;

      if ("speechSynthesis" in window) {
        // 이전 발화 취소
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance("픽픽! 새 주문이 들어왔습니다");
        utterance.lang  = "ko-KR";
        utterance.rate  = 1.05;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // 한국어 음성이 있으면 우선 사용
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(
          (v) => v.lang.startsWith("ko") && !v.localService === false
        ) ?? voices.find((v) => v.lang.startsWith("ko"));
        if (koVoice) utterance.voice = koVoice;

        window.speechSynthesis.speak(utterance);
      } else {
        // 음성 미지원 → 비프음
        playBeep();
      }
    } catch {
      playBeep();
    }
  }, [playBeep]);

  return play;
}
