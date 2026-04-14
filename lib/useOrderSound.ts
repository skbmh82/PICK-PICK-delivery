"use client";

import { useCallback, useRef } from "react";

/**
 * 새 주문 알림 사운드
 * - unlock(): 첫 사용자 클릭 시 호출 → 오디오 잠금 해제 + 소리 테스트
 * - play():   신규 주문 감지 시 호출 → "픽픽! 새 주문이 들어왔습니다" 음성
 */
export function useOrderSound() {
  const ctxRef     = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const playBeep = useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const freqs  = [523, 659, 784];
      const starts = [0, 0.18, 0.36];
      const dur    = 0.15;

      freqs.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + starts[i]);
        gain.gain.linearRampToValueAtTime(0.4, now + starts[i] + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + starts[i] + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + starts[i]);
        osc.stop(now + starts[i] + dur);
      });
    } catch { /* 무시 */ }
  }, []);

  const speakKo = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return false;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang   = "ko-KR";
      u.rate   = 1.05;
      u.pitch  = 1.1;
      u.volume = 1.0;

      // 목소리 목록이 이미 로드됐으면 한국어 우선 선택
      const voices  = window.speechSynthesis.getVoices();
      const koVoice = voices.find((v) => v.lang.startsWith("ko"));
      if (koVoice) u.voice = koVoice;

      window.speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  }, []);

  /** 페이지 첫 클릭 시 호출 — 오디오 잠금 해제 + 테스트 재생 */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;

    // AudioContext 잠금 해제
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    } catch { /* 무시 */ }

    // 음성 테스트
    const spoke = speakKo("픽픽 알림 소리가 켜졌습니다");
    if (!spoke) playBeep();
  }, [speakKo, playBeep]);

  /** 신규 주문 감지 시 호출 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    const spoke = speakKo("픽픽! 새 주문이 들어왔습니다");
    if (!spoke) playBeep();
  }, [speakKo, playBeep]);

  return { play, unlock };
}
