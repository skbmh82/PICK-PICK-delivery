"use client";

import { useCallback, useEffect } from "react";

/**
 * 신규 주문 알람 훅 (Web Audio API — 맑은 벨소리)
 *
 * 안정성 전략:
 *   1. 모든 클릭/터치/키 입력에서 컨텍스트 resume (persistent 리스너, self-remove 안 함)
 *   2. 탭 포커스 복귀(visibilitychange) 시 resume + 대기 중 알람 재생
 *   3. 컨텍스트 정지 중 play() 호출 시 _pendingPlay=true → 다음 제스처/복귀 때 재생
 *
 * ⚠️ 브라우저 정책상 "페이지에 최소 1회 상호작용"이 있어야 소리가 납니다.
 *    (🔔 버튼 또는 화면 아무 곳이나 한 번 클릭)
 */

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
  _masterGain.gain.value = 1;
  _masterGain.connect(_ctx.destination);
  return _ctx;
}

/** 맑은 4음 벨소리 1회 ("딩딩 도-솔") */
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
  speakTts();
  _ttsInterval = setInterval(speakTts, 30_000);
}

/**
 * 모듈 레벨 제스처 핸들러 — self-remove 없이 유지.
 * 클릭·터치마다: 컨텍스트 재개 + 대기 중 알람 재생.
 */
function _onGesture() {
  const ctx = getOrCreateCtx();
  if (!ctx) return;
  if (ctx.state === "running") {
    if (_pendingPlay && !_isPlaying) startBeeping();
  } else {
    void ctx.resume().then(() => {
      if (_pendingPlay && !_isPlaying) startBeeping();
    }).catch(() => {});
  }
}

/** 탭 복귀 시 재개 + 대기 알람 재생 */
function _onVisible() {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return;
  const ctx = _ctx;
  if (!ctx || ctx.state === "closed") return;
  if (ctx.state === "running") {
    if (_pendingPlay && !_isPlaying) startBeeping();
  } else {
    void ctx.resume().then(() => {
      if (_pendingPlay && !_isPlaying) startBeeping();
    }).catch(() => {});
  }
}

// ─────────────────────────────────────────────────────

export function useOrderSound(ttsMessage?: string) {
  if (ttsMessage) _ttsMessage = ttsMessage;

  useEffect(() => {
    document.addEventListener("click",      _onGesture, { capture: true });
    document.addEventListener("touchstart", _onGesture, { capture: true });
    document.addEventListener("keydown",    _onGesture, { capture: true });
    document.addEventListener("visibilitychange", _onVisible);
    return () => {
      document.removeEventListener("click",            _onGesture, { capture: true });
      document.removeEventListener("touchstart",       _onGesture, { capture: true });
      document.removeEventListener("keydown",          _onGesture, { capture: true });
      document.removeEventListener("visibilitychange", _onVisible);
    };
  }, []);

  /**
   * 신규 주문 알람 시작
   * - running이면 즉시 재생
   * - 정지 상태면 resume 시도 + _pendingPlay=true (다음 제스처/복귀 때 재생)
   */
  const play = useCallback(() => {
    if (_isPlaying) return;
    if (typeof window === "undefined") return;
    const ctx = getOrCreateCtx();
    if (!ctx) return;

    if (ctx.state === "running") {
      startBeeping();
      return;
    }
    // 정지 상태 → 대기 표시 후 재개 시도 (성공 시 재생)
    _pendingPlay = true;
    void ctx.resume().then(() => {
      if (_pendingPlay && !_isPlaying) startBeeping();
    }).catch(() => {});
  }, []);

  /** 알람 중단 */
  const stop = useCallback(() => {
    _isPlaying   = false;
    _pendingPlay = false;
    if (_beepTimer)   { clearInterval(_beepTimer);   _beepTimer   = null; }
    if (_ttsInterval) { clearInterval(_ttsInterval); _ttsInterval = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  /** 🔔 버튼 클릭(user gesture) → 컨텍스트 활성화 + 확인음 1회 */
  const unlock = useCallback(() => {
    const ctx = getOrCreateCtx();
    if (!ctx) return;
    if (ctx.state === "running") {
      playOneBeep(ctx);
      if (_pendingPlay && !_isPlaying) startBeeping();
    } else {
      void ctx.resume().then(() => {
        if (_ctx && _ctx.state === "running") playOneBeep(_ctx);
        if (_pendingPlay && !_isPlaying) startBeeping();
      }).catch(() => {});
    }
  }, []);

  return { play, stop, unlock };
}
