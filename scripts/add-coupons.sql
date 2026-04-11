-- ================================================================
-- PICK PICK — 쿠폰·프로모션 시스템
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

-- ── 쿠폰 마스터 테이블 ──────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,           -- 쿠폰 코드 (예: PICK2025)
  title        TEXT NOT NULL,                   -- 쿠폰명 (예: "신규 가입 혜택")
  description  TEXT,                            -- 설명
  type         TEXT NOT NULL                    -- 할인 유형
               CHECK (type IN (
                 'fixed_pick',    -- PICK 토큰 고정 지급
                 'pick_rate',     -- 주문 금액 대비 PICK 추가 적립 (%)
                 'free_delivery'  -- 배달비 무료
               )),
  value        DECIMAL(18,6) NOT NULL,          -- 할인값 (PICK 수량 or %)
  min_order    DECIMAL(10,2) DEFAULT 0,         -- 최소 주문금액
  max_uses     INT DEFAULT NULL,                -- 전체 최대 사용 횟수 (NULL=무제한)
  max_per_user INT DEFAULT 1,                   -- 1인당 최대 사용 횟수
  used_count   INT DEFAULT 0,                   -- 현재 사용 횟수
  store_id     UUID REFERENCES stores(id) ON DELETE CASCADE,  -- NULL=전체 가맹점
  issued_by    UUID REFERENCES users(id),       -- 발행자 (관리자/사장님)
  is_active    BOOLEAN DEFAULT TRUE,
  starts_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,                     -- NULL=만료 없음
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 사용자 쿠폰 보유함 ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_coupons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  coupon_id  UUID REFERENCES coupons(id) ON DELETE CASCADE,
  is_used    BOOLEAN DEFAULT FALSE,
  used_at    TIMESTAMPTZ,
  order_id   UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)  -- 1인 1쿠폰 (max_per_user=1 기본)
);

-- ── 인덱스 ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_coupons_code       ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user  ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon ON user_coupons(coupon_id);

-- ── 샘플 쿠폰 (테스트용) ─────────────────────────────────
INSERT INTO coupons (code, title, description, type, value, min_order, max_uses, expires_at)
VALUES
  ('WELCOME50', '신규가입 환영 쿠폰', '처음 가입하시면 50 PICK을 드려요!', 'fixed_pick', 50, 0,    1000, NOW() + INTERVAL '1 year'),
  ('PICK10',    '10% 추가 적립 쿠폰', '이번 주문에서 PICK 10% 추가 적립', 'pick_rate',  10, 5000, 500,  NOW() + INTERVAL '30 days'),
  ('FREESHIP',  '배달비 무료 쿠폰',   '배달비 걱정 없이 주문하세요!',      'free_delivery', 0, 10000, 200, NOW() + INTERVAL '14 days')
ON CONFLICT (code) DO NOTHING;

-- ── 확인 쿼리 ────────────────────────────────────────────
SELECT id, code, title, type, value, is_active
FROM coupons
ORDER BY created_at;
