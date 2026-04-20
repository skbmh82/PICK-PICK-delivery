"use client";

import { useCallback, useEffect } from "react";

// ── 모듈 레벨 싱글톤 ─────────────────────────────────
let _audioEl:     HTMLAudioElement | null = null;
let _blobUrl:     string | null = null;
let _renderPromise: Promise<void> | null = null;
let _isPlaying  = false;
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
 * "픽픽딩동(1초) + 무음(2초)" WAV를 사전 렌더링.
 * loop=true 로 재생 시 3초 주기 자동 반복.
 * OfflineAudioContext는 user gesture 없이 사용 가능하므로 미리 실행.
 */
async function renderAndCache(): Promise<void> {
  if (_blobUrl) return; // 이미 완료
  const sr  = 44100;
  const dur = 3.0;
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

  note(880, 0.00, 0.10);
  note(880, 0.18, 0.10);
  note(523, 0.38, 0.20);
  note(784, 0.55, 0.28);

  const buffer = await off.startRendering();
  const wav    = audioBufferToWav(buffer);
  _blobUrl = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
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

  // 페이지 마운트 시 WAV 미리 렌더링 (user gesture 불필요)
  useEffect(() => {
    if (!_renderPromise) {
      _renderPromise = renderAndCache().catch((e) =>
        console.error("[useOrderSound] WAV 렌더링 실패:", e)
      );
    }
  }, []);

  /**
   * 🔔 버튼 클릭 (user gesture) → AudioElement 잠금 해제
   * WAV가 이미 렌더링되어 있으므로 동기적으로 play() 호출 가능.
   * await 없이 처리 → user gesture 컨텍스트 유지 → 모바일에서도 정상 작동.
   */
  const unlock = useCallback(() => {
    if (!_blobUrl) {
      // 아직 렌더링 중이면 완료 후 재시도
      if (_renderPromise) {
        _renderPromise.then(() => {
          if (_blobUrl) unlock();
        });
      }
      return;
    }

    if (!_audioEl) {
      _audioEl = new Audio(_blobUrl);
      _audioEl.preload = "auto";
      _audioEl.loop    = true;
    }

    // 동기 play → user gesture 컨텍스트에서 즉시 실행
    const p = _audioEl.play();
    if (p) {
      p.then(() => {
        // 재생 시작 확인 후 즉시 pause (잠금 해제 목적)
        _audioEl!.pause();
        _audioEl!.currentTime = 0;
      }).catch(() => {});
    }

    speakTts("픽픽 알림 소리가 켜졌습니다");
  }, []);

  /** 신규 주문 → loop 재생 시작 */
  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    if (_isPlaying) return;
    if (!_audioEl || !_blobUrl) return;

    _isPlaying = true;
    _audioEl.loop = true;
    _audioEl.currentTime = 0;
    _audioEl.play().catch(() => {});

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
