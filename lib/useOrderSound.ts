"use client";

import { useCallback, useEffect } from "react";

/**
 * 신규 주문 알람 훅
 *
 * ⚠️ 왜 AudioContext가 아니라 <audio> 엘리먼트인가?
 *   - AudioContext는 탭 백그라운드/시간 경과 시 브라우저가 "suspended"로 정지시킴.
 *     주문 알림은 실시간 콜백(사용자 제스처 아님)에서 오므로 resume()이 실패 →
 *     "됐다가 안됐다가" 불안정 발생.
 *   - HTMLAudioElement는 사용자 제스처로 한 번 "unlock"되면 이후 어떤 컨텍스트
 *     (실시간 콜백·백그라운드 포함)에서도 .play()가 안정적으로 동작함.
 *
 * 알람음은 런타임에 WAV(3초 루프)를 합성해 Blob URL로 재생 → 외부 파일 불필요.
 */

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _audio:     HTMLAudioElement | null = null;
let _unlocked   = false;   // 사용자 제스처로 재생 허용됐는가
let _isPlaying   = false;
let _pendingPlay = false;   // unlock 전에 play() 호출 시 → 다음 제스처 대기
let _ttsInterval: ReturnType<typeof setInterval> | null = null;
let _ttsMessage   = "픽픽 주문이 들어왔습니다";

// ── WAV 알람음 합성 (3초 루프, 4음 멜로디 + 여백) ────
function buildAlarmBlobUrl(): string {
  const sampleRate = 44100;
  const loopSec    = 3.0;
  const n          = Math.floor(sampleRate * loopSec);
  const samples    = new Float32Array(n);

  // [주파수, 시작(초), 길이(초)]
  const notes: [number, number, number][] = [
    [880, 0.00, 0.12],
    [880, 0.20, 0.12],
    [523, 0.42, 0.22],
    [784, 0.60, 0.32],
  ];

  for (const [freq, offset, dur] of notes) {
    const start = Math.floor(offset * sampleRate);
    const len   = Math.floor(dur * sampleRate);
    for (let i = 0; i < len; i++) {
      const t   = i / sampleRate;
      const env = Math.min(1, t / 0.008) * Math.exp(-t * 5); // 빠른 어택 + 감쇠
      const idx = start + i;
      if (idx < n) samples[idx] += Math.sin(2 * Math.PI * freq * t) * env * 0.6;
    }
  }

  // 16-bit PCM mono WAV 인코딩
  const bytesPerSample = 2;
  const dataSize = n * bytesPerSample;
  const buffer   = new ArrayBuffer(44 + dataSize);
  const view     = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);              // Subchunk1Size
  view.setUint16(20, 1, true);               // PCM
  view.setUint16(22, 1, true);               // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // ByteRate
  view.setUint16(32, bytesPerSample, true);  // BlockAlign
  view.setUint16(34, 16, true);              // BitsPerSample
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let off = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += bytesPerSample;
  }

  const blob = new Blob([buffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (_audio) return _audio;
  const a  = new Audio(buildAlarmBlobUrl());
  a.loop   = true;
  a.volume = 1;
  a.preload = "auto";
  _audio = a;
  return _audio;
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

function startAlarm() {
  if (_isPlaying) return;
  const a = getAudio();
  if (!a) return;
  _isPlaying   = true;
  _pendingPlay = false;
  a.loop        = true;   // unlock 확인음이 loop를 껐을 수 있으므로 복원
  a.currentTime = 0;
  void a.play().catch(() => {
    // 아직 unlock 안 됐으면 실패 → 다음 제스처 대기
    _isPlaying   = false;
    _pendingPlay = true;
  });
  if (_ttsInterval) clearInterval(_ttsInterval);
  speakTts();
  _ttsInterval = setInterval(speakTts, 30_000);
}

/**
 * 모듈 레벨 제스처 핸들러 — 안정적 참조로 addEventListener 중복 방지.
 * 첫 클릭/터치 때 오디오를 "블레스(unlock)": 무음으로 play→pause 하여
 * 이후 실시간 콜백에서도 .play()가 허용되게 만듦.
 * 대기 중(_pendingPlay)인 알람이 있으면 즉시 시작.
 */
function _onGesture() {
  const a = getAudio();
  if (!a) return;
  if (!_unlocked) {
    a.play()
      .then(() => {
        _unlocked = true;
        if (_pendingPlay && !_isPlaying) {
          startAlarm();          // 대기 알람 즉시 시작
        } else {
          a.pause();             // 조용히 블레스만
          a.currentTime = 0;
        }
      })
      .catch(() => { /* 다음 제스처에서 재시도 */ });
    return;
  }
  if (_pendingPlay && !_isPlaying) startAlarm();
}

// ─────────────────────────────────────────────────────

export function useOrderSound(ttsMessage?: string) {
  if (ttsMessage) _ttsMessage = ttsMessage;

  useEffect(() => {
    document.addEventListener("click",      _onGesture, { capture: true });
    document.addEventListener("touchstart", _onGesture, { capture: true });
    document.addEventListener("keydown",    _onGesture, { capture: true });
    return () => {
      document.removeEventListener("click",      _onGesture, { capture: true });
      document.removeEventListener("touchstart", _onGesture, { capture: true });
      document.removeEventListener("keydown",    _onGesture, { capture: true });
    };
  }, []);

  /** 신규 주문 알람 시작 (unlock 전이면 다음 제스처까지 대기) */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_isPlaying) return;
    if (!_unlocked) { _pendingPlay = true; return; }
    startAlarm();
  }, []);

  /** 알람 중단 */
  const stop = useCallback(() => {
    _isPlaying   = false;
    _pendingPlay = false;
    if (_audio) { _audio.pause(); _audio.currentTime = 0; }
    if (_ttsInterval) { clearInterval(_ttsInterval); _ttsInterval = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  /** 소리 버튼 클릭(user gesture) → 오디오 unlock + 확인음 1회 */
  const unlock = useCallback(() => {
    const a = getAudio();
    if (!a) return;
    // 확인음은 1회만: loop 잠시 해제하고 재생, 끝나면 원복
    a.loop = false;
    a.currentTime = 0;
    void a.play()
      .then(() => { _unlocked = true; })
      .catch(() => { /* 무시 */ });
    const onEnded = () => { a.loop = true; a.removeEventListener("ended", onEnded); };
    a.addEventListener("ended", onEnded);
  }, []);

  return { play, stop, unlock };
}
