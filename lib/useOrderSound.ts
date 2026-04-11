"use client";

import { useCallback, useRef } from "react";

/**
 * Web Audio API를 이용한 새 주문 알림 비프음
 * - 파일 불필요, 브라우저 내장 AudioContext만 사용
 * - 사용: const playOrderAlert = useOrderSound(); → playOrderAlert();
 */
export function useOrderSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      // iOS/Safari 에서는 user gesture 이후에만 AudioContext 생성 가능
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // ── 알림음 : 3음절 상승 비프 ──
      const freqs  = [523, 659, 784]; // C5 E5 G5
      const starts = [0, 0.18, 0.36];
      const dur    = 0.15;

      freqs.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type        = "sine";
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

  return play;
}
