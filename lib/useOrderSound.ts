"use client";

import { useCallback, useEffect } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _ctx:        AudioContext | null = null;
let _masterGain: GainNode | null     = null;
let _isPlaying   = false;
let _pendingPlay = false;   // 컨텍스트 정지 중 play() 호출 시 → 다음 제스처 대기
let _beepTimer:   ReturnType<typeof setInterval> | null = null;
let _ttsInterval: ReturnType<typeof setInterval> | null = null;
let _ttsMessage   = "픽픽 주문이 들어왔습니다";

const BEEP_INTERVAL_MS = 3000;

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getOrCreateCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") return _ctx;
  const W  = window as WindowWithWebkit;
  const AC = window.AudioContext ?? W.webkitAudioContext;
  if (!AC) return null;
  _ctx        = new AC();
  _masterGain = _ctx.createGain();
  _masterGain.gain.value = 1;   // 스케줄링 없이 바로 1 고정
  _masterGain.connect(_ctx.destination);
  return _ctx;
}

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
    osc.type            = "sine";
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
  const u  = new SpeechSynthesisUtterance(_ttsMessage);
  u.lang   = "ko-KR";
  u.rate   = 1.0;
  u.volume = 1.0;
  window.speechSynthesis.speak(u);
}

function startBeeping() {
  if (_isPlaying) return;
  if (!_ctx || _ctx.state !== "running") return;
  _isPlaying   = true;
  _pendingPlay = false;
  playOneBeep(_ctx);
  if (_beepTimer) clearInterval(_beepTimer);
  _beepTimer = setInterval(() => {
    if (!_isPlaying || !_ctx || _ctx.state !== "running") return;
    playOneBeep(_ctx);
  }, BEEP_INTERVAL_MS);
  if (_ttsInterval) clearInterval(_ttsInterval);
  _ttsInterval = setInterval(speakTts, 30_000);
}

/**
 * 모듈 레벨 제스처 핸들러 — 안정적 참조로 addEventListener 중복 방지
 * 클릭·터치마다 실행: 컨텍스트 재개 + 대기 중인 알람 재생
 * self-remove 없이 유지 → Android/백그라운드 후 컨텍스트 재정지 시에도 복구
 */
function _onGesture() {
  const ctx = getOrCreateCtx();
  if (!ctx) return;
  if (ctx.state === "running") {
    if (_pendingPlay && !_isPlaying) startBeeping();
  } else if (ctx.state === "suspended") {
    void ctx.resume().then(() => {
      if (_pendingPlay && !_isPlaying && _ctx?.state === "running") startBeeping();
    });
  }
}

// ─────────────────────────────────────────────────────

export function useOrderSound(ttsMessage?: string) {
  if (ttsMessage) _ttsMessage = ttsMessage;

  useEffect(() => {
    document.addEventListener("click",      _onGesture, { capture: true });
    document.addEventListener("touchstart", _onGesture, { capture: true });
    document.addEventListener("keydown",    _onGesture, { capture: true });

    // 탭 포커스 복귀 시 컨텍스트 재개 시도 (백그라운드 정지 복구)
    const onVisible = () => {
      if (_ctx?.state === "suspended") void _ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("click",            _onGesture, { capture: true });
      document.removeEventListener("touchstart",       _onGesture, { capture: true });
      document.removeEventListener("keydown",          _onGesture, { capture: true });
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  /**
   * 신규 주문 알람 시작
   * - 컨텍스트가 running이면 즉시 beep 시작
   * - suspended이면 _pendingPlay = true → 다음 사용자 제스처 시 _onGesture가 재생
   */
  const play = useCallback(async () => {
    if (_isPlaying) return;
    if (typeof window === "undefined") return;

    const ctx = getOrCreateCtx();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      _pendingPlay = true;
      try { await ctx.resume(); } catch { /* 다음 제스처에서 _onGesture가 처리 */ }
      if (ctx.state === "running") startBeeping();
      return;
    }
    if (ctx.state !== "running") {
      _pendingPlay = true;
      return;
    }

    startBeeping();
  }, []);

  /**
   * 알람 중단 — interval만 해제, masterGain 불변
   * gain 조작 시 다음 play()에서 복원이 실패하는 버그 방지
   */
  const stop = useCallback(() => {
    _isPlaying   = false;
    _pendingPlay = false;
    if (_beepTimer)   { clearInterval(_beepTimer);   _beepTimer   = null; }
    if (_ttsInterval) { clearInterval(_ttsInterval); _ttsInterval = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  /** 소리 버튼 클릭 (user gesture) → 컨텍스트 활성화 + 확인음 1회 */
  const unlock = useCallback(async () => {
    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    if (ctx.state === "running") playOneBeep(ctx);
  }, []);

  return { play, stop, unlock };
}
