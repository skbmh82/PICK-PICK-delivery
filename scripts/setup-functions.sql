-- ================================================================
-- PICK PICK — 필수 DB 함수 & 설정
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

-- ── 1. 주문 상태 변경 RPC ─────────────────────────────────────
-- PATCH /api/orders/[orderId]/status 에서 호출
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id     UUID,
  p_status       TEXT,
  p_est_minutes  INT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE orders SET
    status         = p_status,
    updated_at     = NOW(),
    estimated_time = COALESCE(p_est_minutes, estimated_time),
    confirmed_at   = CASE WHEN p_status = 'confirmed'  AND confirmed_at IS NULL THEN NOW() ELSE confirmed_at  END,
    picked_up_at   = CASE WHEN p_status = 'picked_up'  AND picked_up_at IS NULL THEN NOW() ELSE picked_up_at  END,
    delivered_at   = CASE WHEN p_status = 'delivered'  AND delivered_at IS NULL THEN NOW() ELSE delivered_at  END,
    cancelled_at   = CASE WHEN p_status = 'cancelled'  AND cancelled_at IS NULL THEN NOW() ELSE cancelled_at  END
  WHERE id = p_order_id;
END;
$$;

-- ── 2. PICK 토큰 적립 RPC ─────────────────────────────────────
-- 배달 완료 시 고객 적립, 라이더 수익 지급에서 호출
CREATE OR REPLACE FUNCTION reward_pick(
  p_user_id   UUID,
  p_amount    DECIMAL,
  p_order_id  UUID    DEFAULT NULL,
  p_desc      TEXT    DEFAULT '적립'
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wallet_id   UUID;
  v_new_balance DECIMAL;
BEGIN
  SELECT id, pick_balance INTO v_wallet_id, v_new_balance
  FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE WARNING 'reward_pick: wallet not found for user %', p_user_id;
    RETURN;
  END IF;

  v_new_balance := COALESCE(v_new_balance, 0) + p_amount;

  UPDATE wallets SET
    pick_balance = v_new_balance,
    total_earned = total_earned + p_amount,
    updated_at   = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO wallet_transactions
    (wallet_id, type, amount, balance_after, ref_order_id, description)
  VALUES
    (v_wallet_id, 'reward', p_amount, v_new_balance, p_order_id, p_desc);
END;
$$;

-- ── 3. PICK 토큰 차감 RPC (주문 결제 시) ─────────────────────
CREATE OR REPLACE FUNCTION spend_pick(
  p_user_id   UUID,
  p_amount    DECIMAL,
  p_order_id  UUID    DEFAULT NULL,
  p_desc      TEXT    DEFAULT '결제'
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wallet_id   UUID;
  v_new_balance DECIMAL;
BEGIN
  SELECT id, pick_balance INTO v_wallet_id, v_new_balance
  FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'wallet not found for user %', p_user_id;
  END IF;

  IF COALESCE(v_new_balance, 0) < p_amount THEN
    RAISE EXCEPTION 'insufficient balance: % < %', v_new_balance, p_amount;
  END IF;

  v_new_balance := v_new_balance - p_amount;

  UPDATE wallets SET
    pick_balance = v_new_balance,
    updated_at   = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO wallet_transactions
    (wallet_id, type, amount, balance_after, ref_order_id, description)
  VALUES
    (v_wallet_id, 'payment', p_amount, v_new_balance, p_order_id, p_desc);
END;
$$;

-- ── 4. Supabase Realtime — 변경 감지 대상 테이블 등록 ──────────
-- orders, notifications 테이블에 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── 5. (선택) 기존 order_items 옵션 컬럼 타입 확인 ────────────
-- order_items.options 컬럼이 없으면 추가
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';

-- ── 확인 쿼리 ─────────────────────────────────────────────────
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type   = 'FUNCTION'
  AND routine_name   IN ('update_order_status', 'reward_pick', 'spend_pick')
ORDER BY routine_name;
