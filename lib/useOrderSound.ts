"use client";

import { useCallback, useEffect } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx:        AudioContext | null = null;
let _isPlaying = false;
let _beepInterval: ReturnType<typeof setInterval> | null = null;
let _ttsInterval:  ReturnType<typeof setInterval> | null = null;
let _ttsMessage  = "픽픽 주문이 들어왔습니다";

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const W = window as WindowWithWebkit;
  const AC = window.AudioContext ?? W.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

/** Web Audio API로 픽픽딩동 비프 1회 재생 */
function playBeep(ctx: AudioContext) {
  const now = ctx.currentTime;
  const notes: [number, number, number][] = [
    [880, 0.00, 0.10],
    [880, 0.18, 0.10],
    [523, 0.38, 0.20],
    [784, 0.55, 0.28],
  ];
  notes.forEach(([freq, start, dur]) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(0.8, now + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  });
}

/** AudioContext가 suspended면 resume 후 비프 재생 */
async function tryPlayBeep() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") await ctx.resume();
  playBeep(ctx);
}

function speakTts(msg = _ttsMessage) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  const u = new SpeechSynthesisUtterance(msg);
  u.lang = "ko-KR"; u.rate = 1.0; u.volume = 1.0;
  window.speechSynthesis.speak(u);
}

// ─────────────────────────────────────────────────────

export function useOrderSound(ttsMessage?: string) {
  if (ttsMessage) _ttsMessage = ttsMessage;

  // 페이지 포커스 복귀 시 suspended AudioContext 자동 resume
  useEffect(() => {
    const onVisible = () => {
      if (_ctx?.state === "suspended") void _ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /**
   * 🔔 버튼 클릭 (user gesture)
   * AudioContext를 생성·resume하고 비프 1회 재생 — 이후 자동 재생 허용됨.
   */
  const unlock = useCallback(async () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    playBeep(ctx);
    speakTts("픽픽 알림 소리가 켜졌습니다");
  }, []);

  /** 신규 주문 → 3초마다 비프 반복 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_isPlaying) return;
    _isPlaying = true;

    void tryPlayBeep();
    _beepInterval = setInterval(() => void tryPlayBeep(), 3000);

    speakTts();
    if (_ttsInterval) clearInterval(_ttsInterval);
    _ttsInterval = setInterval(() => speakTts(), 30_000);
  }, []);

  /** 수락/취소 → 반복 중단 */
  const stop = useCallback(() => {
    _isPlaying = false;
    if (_beepInterval) { clearInterval(_beepInterval); _beepInterval = null; }
    if (_ttsInterval)  { clearInterval(_ttsInterval);  _ttsInterval  = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return { play, stop, unlock };
}
