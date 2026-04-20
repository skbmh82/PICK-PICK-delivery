"use client";

import { useCallback } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _audioEl:    HTMLAudioElement | null = null;
let _blobUrl:    string | null = null;
let _isPlaying = false;
let _ttsInterval: ReturnType<typeof setInterval> | null = null;
let _ttsMessage  = "픽픽 주문이 들어왔습니다";

/** AudioBuffer → WAV ArrayBuffer 변환 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numCh      = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames  = buffer.length;
  const bytesPerSample = 2;
  const dataLen = numFrames * numCh * bytesPerSample;
  const wavLen  = 44 + dataLen;
  const out  = new ArrayBuffer(wavLen);
  const view = new DataView(out);

  const write = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4,  wavLen - 8, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1,  true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * bytesPerSample, true);
  view.setUint16(32, numCh * bytesPerSample, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, dataLen, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return out;
}

/**
 * OfflineAudioContext로 "픽픽딩동(1초) + 무음(2초)" WAV를 사전 렌더링.
 * loop=true 로 재생하면 3초 주기로 자동 반복 — setInterval 불필요.
 */
async function renderBeepUrl(): Promise<string> {
  const sr  = 44100;
  const dur = 3.0;          // 1s 비프 + 2s 무음 → 루프 주기 3초
  const off = new OfflineAudioContext(1, Math.round(sr * dur), sr);

  const note = (freq: number, start: number, noteDur: number) => {
    const osc  = off.createOscillator();
    const gain = off.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.5, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDur);
    osc.connect(gain);
    gain.connect(off.destination);
    osc.start(start);
    osc.stop(start + noteDur + 0.02);
  };

  note(880, 0.00, 0.10);  // 픽
  note(880, 0.18, 0.10);  // 픽
  note(523, 0.38, 0.20);  // 딩
  note(784, 0.55, 0.28);  // ↗동
  // 0.9 ~ 3.0 는 무음 (gap)

  const buffer = await off.startRendering();
  const wav    = audioBufferToWav(buffer);
  return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

function speakTts() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  const u = new SpeechSynthesisUtterance(_ttsMessage);
  u.lang = "ko-KR";
  u.rate = 1.0;
  u.volume = 1.0;
  window.speechSynthesis.speak(u);
}

// ─────────────────────────────────────────────────────

export function useOrderSound(ttsMessage?: string) {
  if (ttsMessage) _ttsMessage = ttsMessage;

  /**
   * 버튼 클릭(user gesture) → AudioElement 잠금 해제
   * 한 번 클릭해야 이후 자동 재생 허용됨 (모바일 autoplay 정책)
   */
  const unlock = useCallback(async () => {
    try {
      if (!_audioEl) {
        _blobUrl = await renderBeepUrl();
        _audioEl = new Audio(_blobUrl);
        _audioEl.preload = "auto";
        _audioEl.loop    = true;
      }
      // user gesture로 play 후 즉시 pause → AudioElement 잠금 해제
      await _audioEl.play();
      _audioEl.pause();
      _audioEl.currentTime = 0;

      speakTts();
    } catch (e) {
      console.error("[useOrderSound] unlock 실패:", e);
    }
  }, []);

  /** 신규 주문 → loop 재생 시작 (브라우저가 루프 관리 → setInterval 불필요) */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_isPlaying) return;
    if (!_audioEl || !_blobUrl) return;

    _isPlaying = true;
    _audioEl.loop = true;
    _audioEl.currentTime = 0;
    _audioEl.play().catch(() => {/* autoplay 정책으로 막히면 무시 */});

    // TTS: 즉시 1회 + 30초마다 반복
    speakTts();
    if (_ttsInterval) clearInterval(_ttsInterval);
    _ttsInterval = setInterval(speakTts, 30_000);
  }, []);

  /** 수락/취소 → loop 중단 */
  const stop = useCallback(() => {
    _isPlaying = false;
    if (_audioEl) {
      _audioEl.pause();
      _audioEl.currentTime = 0;
    }
    if (_ttsInterval) {
      clearInterval(_ttsInterval);
      _ttsInterval = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return { play, stop, unlock };
}
