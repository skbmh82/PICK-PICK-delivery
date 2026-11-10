import { useEffect, useRef } from "react";

/**
 * 탭이 화면에 보일 때만 돌아가는 서버 폴링 훅.
 *
 * - document.visibilityState !== "visible" 이면 콜백을 호출하지 않음 (백그라운드 탭에서 서버 호출 0)
 * - 탭이 다시 보이면(visibilitychange) 즉시 1회 호출 후 주기 유지
 * - 이전 요청이 끝나기 전에는 다음 요청을 보내지 않음 (in-flight 가드)
 * - 언마운트 시 interval + 이벤트 리스너 정리
 * - 콜백은 ref로 보관 → interval 재생성 없이 항상 최신 상태 참조
 *
 * Realtime(웹소켓)이 주 경로이고, 이 폴링은 "Realtime 누락 대비 백업" 용도.
 *
 * @param callback   매 tick마다 실행할 비동기 콜백 (초기 1회 로드는 호출부에서 별도 처리)
 * @param intervalMs 폴링 주기(ms)
 * @param enabled    false면 폴링하지 않음 (조건부 폴링)
 */
export function useVisiblePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean = true,
) {
  const savedCallback = useRef(callback);
  const inFlight = useRef(false);

  // interval을 재생성하지 않고 최신 콜백을 유지
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await savedCallback.current();
      } finally {
        inFlight.current = false;
      }
    };

    const interval = setInterval(() => void tick(), intervalMs);

    // 탭이 다시 보이면 즉시 1회 호출
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}
