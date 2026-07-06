"use client";

import { useCallback, useEffect } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx:         AudioContext | null = null;
let _masterGain:  GainNode | null = null;
let _isPlaying  = false;
let _beepTimer:   ReturnType<typeof setInterval> | null = null;
let _ttsInterval: ReturnType<typeof setInterval> | null = null;
let _ttsMessage   = "픽픽 주문이 들어왔습니다";

const BEEP_INTERVAL_MS = 3000;   // 비프 반복 간격

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getOrCreateCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") return _ctx;
  const W  = window as WindowWithWebkit;
  const AC = window.AudioContext ?? W.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  _masterGain = _ctx.createGain();
  _masterGain.gain.setValueAtTime(1, 0);
  _masterGain.connect(_ctx.destination);
  return _ctx;
}

/** 비프 1회 — oscillator → noteGain → masterGain → destination */
function playOneBeep(ctx: AudioContext) {
  if (!_masterGain) return;
  const notes: [number, number, number][] = [
    [880, 0.00, 0.10],
    [880, 0.18, 0.10],
    [523, 0.38, 0.20],
    [784, 0.55, 0.28],
  ];
  const now = ctx.currentTime + 0.05;
  notes.forEach(([freq, offset, dur]) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + offset;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(_masterGain!);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}

function speakTts() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  const u = new SpeechSynthesisUtterance(_ttsMessage);
  u.lang = "ko-KR"; u.rate = 1.0; u.volume = 1.0;
  window.speechSynthesis.speak(u);
}

// ─────────────────────────────────────────────────────

export function useOrderSound(ttsMessage?: string) {
  if (ttsMessage) _ttsMessage = ttsMessage;

  // 첫 번째 사용자 제스처 시 AudioContext 사전 unlock (iOS 포함)
  useEffect(() => {
    const onGesture = () => {
      const ctx = getOrCreateCtx();
      if (ctx && ctx.state === "suspended") void ctx.resume();
      document.removeEventListener("click",      onGesture, { capture: true });
      document.removeEventListener("touchstart", onGesture, { capture: true });
      document.removeEventListener("keydown",    onGesture, { capture: true });
    };
    document.addEventListener("click",      onGesture, { capture: true });
    document.addEventListener("touchstart", onGesture, { capture: true });
    document.addEventListener("keydown",    onGesture, { capture: true });
    return () => {
      document.removeEventListener("click",      onGesture, { capture: true });
      document.removeEventListener("touchstart", onGesture, { capture: true });
      document.removeEventListener("keydown",    onGesture, { capture: true });
    };
  }, []);

  // 앱이 foreground로 복귀할 때 suspended 복구
  useEffect(() => {
    const onVisible = () => {
      if (_ctx?.state === "suspended") void _ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /** 소리 버튼 클릭 (user gesture) → AudioContext 활성화 + 확인음 1회 */
  const unlock = useCallback(async () => {
    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    if (_masterGain) {
      _masterGain.gain.cancelScheduledValues(0);
      _masterGain.gain.setValueAtTime(1, ctx.currentTime);
    }
    playOneBeep(ctx);
  }, []);

  /**
   * 신규 주문 알람 시작 — setInterval로 BEEP_INTERVAL_MS마다 비프 1회
   * (배치 선예약 제거 → stop() 시 setInterval.clear만으로 즉시 중단 가능)
   */
  const play = useCallback(async () => {
    if (_isPlaying) return;
    if (typeof window === "undefined") return;

    const ctx = getOrCreateCtx();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      try { await ctx.resume(); }
      catch { return; }   // iOS 정책상 resume() 거절 시
    }
    if (ctx.state !== "running") return;

    // master gain 복원 (이전 stop이 0으로 내렸을 수 있음)
    if (_masterGain) {
      _masterGain.gain.cancelScheduledValues(0);
      _masterGain.gain.setValueAtTime(1, ctx.currentTime);
    }

    _isPlaying = true;
    playOneBeep(ctx);   // 즉시 1회
    _beepTimer = setInterval(() => {
      if (!_isPlaying || !_ctx || _ctx.state !== "running") return;
      playOneBeep(_ctx);
    }, BEEP_INTERVAL_MS);

    if (_ttsInterval) clearInterval(_ttsInterval);
    _ttsInterval = setInterval(speakTts, 30_000);
  }, []);

  /**
   * 알람 중단 — setInterval 해제 + masterGain 0으로 즉시 무음
   * AudioContext는 닫지 않음 (iOS는 닫힌 ctx를 gesture 없이 재unlock 불가)
   */
  const stop = useCallback(() => {
    _isPlaying = false;
    if (_beepTimer)   { clearInterval(_beepTimer);   _beepTimer   = null; }
    if (_ttsInterval) { clearInterval(_ttsInterval); _ttsInterval = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    if (_masterGain && _ctx && _ctx.state !== "closed") {
      _masterGain.gain.cancelScheduledValues(0);
      _masterGain.gain.setValueAtTime(0, _ctx.currentTime);
    }
  }, []);

  return { play, stop, unlock };
}
