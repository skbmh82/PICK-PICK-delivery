-- ============================================================
-- PICK PICK 배달앱 — 완전 통합 DB 셋업 (한 번에 실행)
-- Supabase SQL Editor → 전체 복사 후 Run 하세요
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
  is_approved       BOOLEAN DEFAULT TRUE,
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
  estimated_time   INT DEFAULT 30,
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

-- ============================================================
-- RLS 활성화 (개발 초기 — 전체 허용 정책)
-- ⚠️ 실서비스 전에 역할별 세분화 정책으로 교체 필수
-- ============================================================
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores              ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus               ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_option_groups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_earnings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- 개발용 전체 허용 정책 (한 번만 실행되도록 IF NOT EXISTS 패턴 사용)
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'users','wallets','wallet_transactions','stores','menus',
    'menu_option_groups','menu_options','orders','order_items',
    'reviews','favorites','rider_locations','rider_earnings','notifications'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl AND policyname = 'dev_allow_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY dev_allow_all ON %I FOR ALL USING (true) WITH CHECK (true)', tbl
      );
    END IF;
  END LOOP;
END $$;

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

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['users','wallets','stores','orders'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- Auth 트리거 — 유저 삭제 시 public.users 자동 삭제
-- ============================================================
CREATE OR REPLACE FUNCTION handle_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE auth_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_deleted();

-- ============================================================
-- 가입 시 지갑 자동 생성 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_wallet ON public.users;
CREATE TRIGGER on_user_created_wallet
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_wallet();

-- ============================================================
-- RPC: deduct_pick — PICK 토큰 차감 + 거래 내역 기록
-- 주문 생성 시 서버에서 호출 (클라이언트 직접 잔액 수정 금지)
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_pick(
  p_user_id  UUID,
  p_amount   DECIMAL,
  p_order_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_wallet_id     UUID;
  v_current_bal   DECIMAL;
  v_new_bal       DECIMAL;
BEGIN
  -- 지갑 조회
  SELECT id, pick_balance INTO v_wallet_id, v_current_bal
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '지갑을 찾을 수 없습니다';
  END IF;

  IF v_current_bal < p_amount THEN
    RAISE EXCEPTION 'PICK 잔액이 부족합니다 (현재: %, 필요: %)', v_current_bal, p_amount;
  END IF;

  v_new_bal := v_current_bal - p_amount;

  -- 잔액 차감
  UPDATE wallets
  SET pick_balance = v_new_bal, updated_at = NOW()
  WHERE id = v_wallet_id;

  -- 거래 내역 기록
  INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, ref_order_id, description)
  VALUES (v_wallet_id, 'payment', p_amount, v_new_bal, p_order_id, '주문 결제');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: reward_pick — PICK 토큰 적립 (주문 완료 / 리뷰 시)
-- ============================================================
CREATE OR REPLACE FUNCTION reward_pick(
  p_user_id    UUID,
  p_amount     DECIMAL,
  p_order_id   UUID DEFAULT NULL,
  p_desc       TEXT DEFAULT '적립'
)
RETURNS VOID AS $$
DECLARE
  v_wallet_id  UUID;
  v_new_bal    DECIMAL;
BEGIN
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '지갑을 찾을 수 없습니다';
  END IF;

  UPDATE wallets
  SET pick_balance  = pick_balance + p_amount,
      total_earned  = total_earned + p_amount,
      updated_at    = NOW()
  WHERE id = v_wallet_id
  RETURNING pick_balance INTO v_new_bal;

  INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, ref_order_id, description)
  VALUES (v_wallet_id, 'reward', p_amount, v_new_bal, p_order_id, p_desc);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: update_order_status — 주문 상태 변경 + 타임스탬프 자동 기록
-- ============================================================
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status   TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET status       = p_status,
      confirmed_at = CASE WHEN p_status = 'confirmed'  THEN NOW() ELSE confirmed_at END,
      picked_up_at = CASE WHEN p_status = 'picked_up'  THEN NOW() ELSE picked_up_at END,
      delivered_at = CASE WHEN p_status = 'delivered'  THEN NOW() ELSE delivered_at END,
      cancelled_at = CASE WHEN p_status = 'cancelled'  THEN NOW() ELSE cancelled_at END,
      updated_at   = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Supabase Realtime — 구독 대상 테이블 등록
-- ============================================================
-- orders 테이블 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE rider_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 샘플 가맹점 데이터 (개발용 — 실서비스 시 삭제)
-- ============================================================
INSERT INTO stores (name, description, category, address, lat, lng, min_order_amount, delivery_fee, delivery_time, is_open, is_approved, rating, review_count, pick_reward_rate)
VALUES
  ('맛있는 한식당', '정성껏 만든 한국 가정식', '한식', '서울시 강남구 테헤란로 1', 37.498095, 127.027610, 12000, 2000, 30, true, true, 4.5, 128, 1.5),
  ('황금 치킨', '바삭바삭 후라이드의 정석', '치킨', '서울시 서초구 강남대로 10', 37.494570, 127.028960, 15000, 2500, 35, true, true, 4.7, 342, 2.0),
  ('피자 하우스', '직화 화덕 피자 전문점', '피자', '서울시 강남구 역삼동 5', 37.500350, 127.036170, 18000, 3000, 40, true, true, 4.3, 89, 1.0),
  ('도쿄 스시', '신선한 재료의 일본 스시 전문', '일식', '서울시 강남구 압구정로 20', 37.527120, 127.027590, 20000, 3000, 45, true, true, 4.6, 201, 1.5),
  ('상하이 짬뽕', '깊은 국물 중화 요리 전문', '중식', '서울시 강남구 언주로 30', 37.510330, 127.042900, 12000, 2000, 30, true, true, 4.2, 156, 1.0),
  ('분식 천국', '즉석 떡볶이와 순대 전문', '분식', '서울시 강남구 봉은사로 40', 37.514100, 127.057200, 8000, 1500, 25, true, true, 4.4, 278, 1.5),
  ('카페 픽픽', '스페셜티 커피와 디저트', '카페·디저트', '서울시 강남구 도산대로 50', 37.522400, 127.037800, 6000, 2000, 30, true, true, 4.8, 512, 2.0),
  ('스테이크 하우스', '최상급 한우 스테이크', '양식', '서울시 강남구 청담동 60', 37.525500, 127.047300, 25000, 3000, 40, true, true, 4.5, 93, 1.5)
ON CONFLICT DO NOTHING;

-- 각 가맹점에 메뉴 추가 (첫 번째 가맹점 예시)
DO $$
DECLARE
  v_store_id UUID;
BEGIN
  SELECT id INTO v_store_id FROM stores WHERE name = '맛있는 한식당' LIMIT 1;
  IF v_store_id IS NOT NULL THEN
    INSERT INTO menus (store_id, name, description, price, is_available, is_popular, sort_order)
    VALUES
      (v_store_id, '된장찌개 정식', '구수한 된장찌개와 밥, 기본 반찬 포함', 9000, true, true, 1),
      (v_store_id, '김치찌개 정식', '잘 익은 김치로 끓인 얼큰 찌개 정식', 9000, true, false, 2),
      (v_store_id, '비빔밥', '싱싱한 나물과 고추장의 조화', 10000, true, true, 3),
      (v_store_id, '불고기 덮밥', '달콤한 불고기 소스의 덮밥', 11000, true, false, 4)
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO v_store_id FROM stores WHERE name = '황금 치킨' LIMIT 1;
  IF v_store_id IS NOT NULL THEN
    INSERT INTO menus (store_id, name, description, price, is_available, is_popular, sort_order)
    VALUES
      (v_store_id, '후라이드 치킨', '바삭한 정통 후라이드', 18000, true, true, 1),
      (v_store_id, '양념 치킨', '달콤매콤 황금 양념', 19000, true, true, 2),
      (v_store_id, '반반 치킨', '후라이드 반 + 양념 반', 19000, true, false, 3),
      (v_store_id, '순살 치킨', '뼈 없는 바삭 순살', 20000, true, false, 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
