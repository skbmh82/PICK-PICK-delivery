-- ============================================================
--  PICK 어뷰징 감사 스크립트 (테스트넷 → 메인넷 전환 스냅샷용)
--  목적: 다계정 자기초대/파밍 의심 계정을 탐지해 비율 전환 대상에서 제외.
--  사용: 스냅샷 시점에 각 쿼리를 실행해 리포트로 활용.
--  (읽기 전용 — 아무것도 수정하지 않음)
-- ============================================================

-- 0) 전체 요약 --------------------------------------------------
SELECT
  (SELECT count(*) FROM public.users WHERE pi_uid IS NOT NULL)                           AS pi_users,
  (SELECT count(*) FROM public.wallets w JOIN public.users u ON u.id=w.user_id
     WHERE u.pi_uid IS NOT NULL AND w.pick_balance>0)                                     AS pick_holders,
  (SELECT COALESCE(sum(w.pick_balance),0) FROM public.wallets w JOIN public.users u ON u.id=w.user_id
     WHERE u.pi_uid IS NOT NULL)                                                          AS pi_total_pick;

-- 1) 양방향(서로) 초대 쌍 탐지 ---------------------------------
--    A가 B를 초대하고 B도 A를 초대한 경우 = 자기초대 파밍 강한 정황
WITH ref AS (   -- description 텍스트에서 (초대: 상대) 추출 = 내가 초대한 사람
  SELECT w.user_id AS referrer_id,
         substring(t.description from '\(초대: (.+)\)') AS invitee_name
  FROM public.wallet_transactions t
  JOIN public.wallets w ON w.id=t.wallet_id
  WHERE t.type='reward' AND t.description LIKE '친구초대 보상%'
)
SELECT ru.pi_username AS a, iu.pi_username AS b, '서로 초대' AS flag
FROM ref r
JOIN public.users ru ON ru.id=r.referrer_id
JOIN public.users iu ON iu.pi_username=r.invitee_name
WHERE EXISTS (   -- 상대(b)도 나(a)를 초대했는가
  SELECT 1 FROM ref r2
  JOIN public.users ru2 ON ru2.id=r2.referrer_id
  WHERE ru2.pi_username=iu.pi_username AND r2.invitee_name=ru.pi_username
)
ORDER BY a;

-- 2) 유사 username + 근접 가입시각 (다계정 의심) ----------------
--    앞 6글자가 같은 username이 여러 개 = 한 사람이 순차 생성 정황
SELECT left(pi_username,6) AS prefix,
       count(*)            AS accounts,
       string_agg(pi_username, ', ' ORDER BY created_at) AS usernames,
       min(created_at)     AS first_at,
       max(created_at)     AS last_at
FROM public.users
WHERE pi_uid IS NOT NULL AND pi_username IS NOT NULL
GROUP BY left(pi_username,6)
HAVING count(*) >= 2
ORDER BY accounts DESC;

-- 3) PICK 있으나 실사용(주문) 0 = 파밍 의심 ---------------------
SELECT u.pi_username, w.pick_balance,
       (SELECT count(*) FROM public.orders o WHERE o.user_id=u.id)         AS orders,
       (SELECT count(*) FROM public.daily_checkins d WHERE d.user_id=u.id) AS checkins,
       (SELECT COALESCE(sum(t.amount),0) FROM public.wallet_transactions t
          WHERE t.wallet_id=w.id AND t.description LIKE '친구초대%')        AS referral_pick
FROM public.users u
JOIN public.wallets w ON w.user_id=u.id
WHERE u.pi_uid IS NOT NULL
  AND w.pick_balance > 0
  AND (SELECT count(*) FROM public.orders o WHERE o.user_id=u.id) = 0
ORDER BY w.pick_balance DESC;

-- 4) 초대 보상 상위 랭킹 (많이 받은 순) -------------------------
SELECT u.pi_username,
       count(*)          AS referral_tx,
       sum(t.amount)     AS referral_pick,
       min(t.created_at) AS first_at,
       max(t.created_at) AS last_at
FROM public.wallet_transactions t
JOIN public.wallets w ON w.id=t.wallet_id
JOIN public.users   u ON u.id=w.user_id
WHERE t.description LIKE '친구초대%'
GROUP BY u.pi_username
ORDER BY referral_pick DESC;

-- 5) 계정별 PICK 출처 분해 (스냅샷 산정용) ---------------------
--    출석 / 초대 / 기타 로 나눠 '진짜 활동' 가중치 판단에 사용
SELECT u.pi_username, w.pick_balance,
       COALESCE(sum(t.amount) FILTER (WHERE t.description LIKE '%출석%' OR t.description LIKE '%체크인%'),0) AS from_checkin,
       COALESCE(sum(t.amount) FILTER (WHERE t.description LIKE '친구초대%'),0)                              AS from_referral,
       COALESCE(sum(t.amount) FILTER (WHERE t.type='payment' OR t.type='charge'),0)                        AS from_order_or_charge,
       (SELECT count(*) FROM public.orders o WHERE o.user_id=u.id)                                         AS orders
FROM public.users u
JOIN public.wallets w ON w.user_id=u.id
LEFT JOIN public.wallet_transactions t ON t.wallet_id=w.id
WHERE u.pi_uid IS NOT NULL
GROUP BY u.pi_username, w.pick_balance
ORDER BY w.pick_balance DESC;
