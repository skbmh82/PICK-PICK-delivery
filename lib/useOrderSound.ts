"use client";

import { useCallback } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _audioEl: HTMLAudioElement | null = null;
let _blobUrl: string | null = null;
let _orderInterval: ReturnType<typeof setInterval> | null = null;

/** AudioBuffer → WAV ArrayBuffer 변환 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numCh   = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const dataLen = numFrames * numCh * bytesPerSample;
  const wavLen  = 44 + dataLen;
  const out = new ArrayBuffer(wavLen);
  const view = new DataView(out);

  const write = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4,  wavLen - 8, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);           // PCM
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

/** OfflineAudioContext로 픽픽딩동 비프를 WAV Blob URL로 사전 렌더링 */
async function renderBeepUrl(): Promise<string> {
  const sr  = 44100;
  const dur = 1.0;
  const off = new OfflineAudioContext(1, sr * dur, sr);

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

  const buffer = await off.startRendering();
  const wav    = audioBufferToWav(buffer);
  return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

function playAudio() {
  if (!_audioEl || !_blobUrl) return;
  _audioEl.currentTime = 0;
  _audioEl.play().catch(() => {/* 무시 */});

  // Chrome은 페이지 포커스를 잃으면 speechSynthesis를 일시정지함
  // → cancel() + resume() 후 speak() 하면 재활성화됨
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance("픽픽 주문이 들어왔습니다");
    u.lang = "ko-KR";
    u.rate = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }
}

// ─────────────────────────────────────────────────────

export function useOrderSound() {

  /**
   * 🔔 버튼 클릭 (user gesture) →
   * 1) 픽픽딩동 WAV 사전 렌더링
   * 2) HTMLAudioElement 생성 후 user gesture로 play/pause → 이후 언제든 재생 가능
   * 3) TTS 확인 메시지
   */
  const unlock = useCallback(async () => {
    try {
      // 이미 초기화됐으면 스킵
      if (_audioEl) {
        // 재확인용 재생
        playAudio();
        return;
      }

      _blobUrl = await renderBeepUrl();
      _audioEl = new Audio(_blobUrl);
      _audioEl.preload = "auto";

      // user gesture로 play 후 즉시 pause → HTMLAudioElement 잠금 해제
      await _audioEl.play();
      _audioEl.pause();
      _audioEl.currentTime = 0;

      // TTS 확인 (user gesture이므로 확실히 동작)
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("픽픽 알림 소리가 켜졌습니다");
        u.lang = "ko-KR"; u.rate = 1.0; u.volume = 1.0;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.error("[useOrderSound] unlock 실패:", e);
    }
  }, []);

  /** 신규 주문 → 3초마다 픽픽딩동 반복 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_orderInterval) return;

    playAudio();
    _orderInterval = setInterval(playAudio, 3000);
  }, []);

  /** 수락/취소 → 반복 중단 */
  const stop = useCallback(() => {
    if (_orderInterval) {
      clearInterval(_orderInterval);
      _orderInterval = null;
    }
  }, []);

  return { play, stop, unlock };
}
