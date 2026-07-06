"use client";

import { useCallback, useEffect } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx:          AudioContext | null = null;
let _masterGain:   GainNode | null = null;   // 즉시 무음용 마스터 게인
let _isPlaying   = false;
let _scheduleTimer: ReturnType<typeof setTimeout> | null = null;
let _ttsInterval:   ReturnType<typeof setInterval> | null = null;
let _ttsMessage    = "픽픽 주문이 들어왔습니다";

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getOrCreateCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") return _ctx;
  const W  = window as WindowWithWebkit;
  const AC = window.AudioContext ?? W.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  _masterGain = _ctx.createGain();
  _masterGain.connect(_ctx.destination);
  return _ctx;
}

/**
 * Web Audio API로 픽픽딩동 비프를 특정 시각(absTime)에 예약.
 * 각 oscillator 는 ctx.destination 이 아닌 _masterGain 에 연결 → 즉시 무음 가능
 */
function scheduleBeep(ctx: AudioContext, absTime: number) {
  if (!_masterGain) return;
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
    gain.connect(_masterGain!);   // destination 대신 마스터 게인에 연결
    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}

const INTERVAL = 3.0;   // 비프 간격 (초)
const BATCH    = 10;    // 한 번에 예약할 비프 수 (30초 분량)

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

  // 첫 번째 사용자 제스처에서 AudioContext 사전 unlock
  // iOS 포함 모든 브라우저에서 이후 play() 가 resume() 없이 즉시 작동
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

  // 페이지가 foreground로 돌아올 때 suspended AudioContext 복구
  useEffect(() => {
    const onVisible = () => {
      if (_ctx?.state === "suspended") void _ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /**
   * 🔔 소리 버튼 클릭 (user gesture) → AudioContext 활성화 + 확인음 1회
   */
  const unlock = useCallback(async () => {
    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    // 마스터 게인 정상화 (이전 stop 이 낮췄을 수 있음)
    if (_masterGain) _masterGain.gain.setValueAtTime(1, ctx.currentTime);
    scheduleBeep(ctx, ctx.currentTime + 0.05);
  }, []);

  /**
   * 신규 주문 → 비프를 Web Audio 스케줄러로 미리 예약
   */
  const play = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (_isPlaying) return;

    const ctx = getOrCreateCtx();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // iOS/Chrome 정책상 resume() 거절 — user gesture 후 자동 복구됨
        return;
      }
    }
    if (ctx.state !== "running") return;

    // 마스터 게인이 0으로 내려가 있을 수 있으므로 복원
    if (_masterGain) _masterGain.gain.setValueAtTime(1, ctx.currentTime);

    _isPlaying = true;
    scheduleBatch(ctx, ctx.currentTime + 0.05);

    if (_ttsInterval) clearInterval(_ttsInterval);
    _ttsInterval = setInterval(speakTts, 30_000);
  }, []);

  /**
   * 수락/취소 → 마스터 게인을 0으로 내려 즉시 무음 (AudioContext 는 닫지 않음)
   * AudioContext 를 닫으면 iOS 에서 다음 play() 때 재unlock 불가 → 알람 무음 버그
   */
  const stop = useCallback(() => {
    _isPlaying = false;
    if (_scheduleTimer) { clearTimeout(_scheduleTimer); _scheduleTimer = null; }
    if (_ttsInterval)   { clearInterval(_ttsInterval);  _ttsInterval   = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    // 이미 예약된 비프를 마스터 게인으로 즉시 소거 — context 는 유지
    if (_masterGain && _ctx) {
      _masterGain.gain.setValueAtTime(0, _ctx.currentTime);
    }
  }, []);

  return { play, stop, unlock };
}
