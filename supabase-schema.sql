-- ============================================================
-- PICK PICK 배달앱 — 전체 DB 스키마
-- Supabase SQL Editor에 전체 복사 후 Run 하세요
-- ============================================================

-- ────────────────────────────────────────
-- 1. 사용자
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT UNIQUE,
  role          TEXT DEFAULT 'user'
                CHECK (role IN ('user','owner','rider','admin')),
  address_main  TEXT,
  lat           DECIMAL(10,8),
  lng           DECIMAL(11,8),
  profile_image TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 2. PICK 토큰 지갑
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  pick_balance    DECIMAL(18,6) DEFAULT 0,
  locked_balance  DECIMAL(18,6) DEFAULT 0,
  total_earned    DECIMAL(18,6) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 3. 지갑 트랜잭션 내역
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type            TEXT NOT NULL
                  CHECK (type IN ('charge','payment','refund','reward','transfer','withdraw')),
  amount          DECIMAL(18,6) NOT NULL,
  balance_after   DECIMAL(18,6) NOT NULL,
  ref_order_id    UUID,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 4. 가맹점
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,
  phone             TEXT,
  address           TEXT NOT NULL,
  lat               DECIMAL(10,8) NOT NULL,
  lng               DECIMAL(11,8) NOT NULL,
  image_url         TEXT,
  banner_url        TEXT,
  min_order_amount  DECIMAL(10,2) DEFAULT 0,
  delivery_fee      DECIMAL(10,2) DEFAULT 0,
  delivery_time     INT DEFAULT 30,
  is_open           BOOLEAN DEFAULT TRUE,
  is_approved       BOOLEAN DEFAULT FALSE,
  rating            DECIMAL(3,2) DEFAULT 0,
  review_count      INT DEFAULT 0,
  pick_reward_rate  DECIMAL(5,2) DEFAULT 1.0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 5. 메뉴
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menus (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID REFERENCES stores(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  image_url    TEXT,
  category     TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular   BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 6. 메뉴 옵션 그룹
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_option_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id     UUID REFERENCES menus(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  max_select  INT DEFAULT 1
);

-- ────────────────────────────────────────
-- 7. 메뉴 옵션
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_options (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id UUID REFERENCES menu_option_groups(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  extra_price     DECIMAL(10,2) DEFAULT 0
);

-- ────────────────────────────────────────
-- 8. 주문
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  store_id         UUID REFERENCES stores(id) ON DELETE SET NULL,
  rider_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN (
                     'pending','confirmed','preparing','ready',
                     'picked_up','delivering','delivered','cancelled','refunded'
                   )),
  payment_method   TEXT DEFAULT 'PICK'
                   CHECK (payment_method IN ('PICK','CASH')),
  total_amount     DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) DEFAULT 0,
  pick_used        DECIMAL(18,6) DEFAULT 0,
  pick_reward      DECIMAL(18,6) DEFAULT 0,
  delivery_address TEXT NOT NULL,
  delivery_lat     DECIMAL(10,8),
  delivery_lng     DECIMAL(11,8),
  delivery_note    TEXT,
  estimated_time   INT,
  confirmed_at     TIMESTAMPTZ,
  picked_up_at     TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 9. 주문 아이템
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id  UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_id   UUID REFERENCES menus(id) ON DELETE SET NULL,
  menu_name TEXT NOT NULL,
  price     DECIMAL(10,2) NOT NULL,
  quantity  INT NOT NULL DEFAULT 1,
  options   JSONB DEFAULT '[]'
);

-- ────────────────────────────────────────
-- 10. 리뷰
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  store_id    UUID REFERENCES stores(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT,
  image_urls  TEXT[] DEFAULT '{}',
  pick_reward DECIMAL(18,6) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 11. 즐겨찾기
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id   UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- ────────────────────────────────────────
-- 12. 라이더 실시간 위치
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rider_locations (
  rider_id   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lat        DECIMAL(10,8) NOT NULL,
  lng        DECIMAL(11,8) NOT NULL,
  is_active  BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 13. 라이더 수익 내역
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rider_earnings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount_pick DECIMAL(18,6) DEFAULT 0,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','settled')),
  settled_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 14. 알림
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 15. 연결 테스트용 테이블 (개발 확인 후 삭제)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pick_connection_test (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) 활성화
-- ============================================================
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores               ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus                ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_option_groups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_locations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_earnings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_connection_test ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책 — 개발 초기 임시 (전체 허용)
-- ⚠️ 실서비스 전에 반드시 역할별 세분화 정책으로 교체하세요
-- ============================================================
CREATE POLICY "dev_allow_all" ON users                FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON wallets              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON wallet_transactions  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON stores               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON menus                FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON menu_option_groups   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON menu_options         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON orders               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON order_items          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON reviews              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON favorites            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON rider_locations      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON rider_earnings       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON notifications        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON pick_connection_test FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
