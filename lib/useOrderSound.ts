"use client";

import { useCallback, useEffect } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx:         AudioContext | null = null;
let _isPlaying  = false;
let _scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let _ttsInterval:   ReturnType<typeof setInterval> | null = null;
let _ttsMessage   = "픽픽 주문이 들어왔습니다";

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getOrCreateCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const W  = window as WindowWithWebkit;
  const AC = window.AudioContext ?? W.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

/**
 * Web Audio API로 픽픽딩동 비프를 특정 시각(absTime)에 예약.
 * absTime = ctx.currentTime 기준 절대 시각 (초)
 */
function scheduleBeep(ctx: AudioContext, absTime: number) {
  const notes: [number, number, number][] = [
    [880, 0.00, 0.10],
    [880, 0.18, 0.10],
    [523, 0.38, 0.20],
    [784, 0.55, 0.28],
  ];
  notes.forEach(([freq, offset, dur]) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = absTime + offset;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}

const INTERVAL = 3.0;   // 비프 간격 (초)
const BATCH    = 10;    // 한 번에 예약할 비프 수 (30초 분량)

/**
 * 현재 시각부터 BATCH개의 비프를 미리 예약.
 * JS 타이머가 throttle돼도 Web Audio 스케줄러가 정확하게 재생함.
 * 마지막 비프 직전에 다음 배치를 예약 (연속성 유지).
 */
function scheduleBatch(ctx: AudioContext, startTime: number) {
  if (!_isPlaying) return;

  for (let i = 0; i < BATCH; i++) {
    scheduleBeep(ctx, startTime + i * INTERVAL);
  }

  // 다음 배치: 마지막 비프 2초 전에 예약 → 끊김 없이 연속
  const nextBatchDelay = (BATCH * INTERVAL - 2) * 1000;
  _scheduleTimer = setTimeout(() => {
    if (!_isPlaying || !_ctx) return;
    if (_ctx.state === "suspended") {
      void _ctx.resume().then(() => scheduleBatch(_ctx!, _ctx!.currentTime));
    } else {
      scheduleBatch(_ctx, _ctx.currentTime);
    }
  }, nextBatchDelay);
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

  // 페이지가 foreground로 돌아올 때 suspended AudioContext 복구
  useEffect(() => {
    const onVisible = () => {
      if (_ctx?.state === "suspended") void _ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /**
   * 🔔 버튼 클릭 (user gesture) → AudioContext 활성화 + 확인음 1회
   */
  const unlock = useCallback(async () => {
    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    scheduleBeep(ctx, ctx.currentTime + 0.05);
  }, []);

  /**
   * 신규 주문 → 비프를 Web Audio 스케줄러로 미리 예약 (JS 타이머 무관)
   */
  const play = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (_isPlaying) return;

    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();

    _isPlaying = true;
    scheduleBatch(ctx, ctx.currentTime + 0.05);

    if (_ttsInterval) clearInterval(_ttsInterval);
    _ttsInterval = setInterval(speakTts, 30_000);
  }, []);

  /**
   * 수락/취소 → 예약 취소 및 반복 중단
   */
  const stop = useCallback(() => {
    _isPlaying = false;
    if (_scheduleTimer) { clearTimeout(_scheduleTimer); _scheduleTimer = null; }
    if (_ttsInterval)   { clearInterval(_ttsInterval);  _ttsInterval   = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    // AudioContext를 닫아 이미 예약된 비프도 즉시 중단
    if (_ctx) { void _ctx.close(); _ctx = null; }
  }, []);

  return { play, stop, unlock };
}
