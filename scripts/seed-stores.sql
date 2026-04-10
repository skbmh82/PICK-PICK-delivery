-- ============================================================
-- PICK PICK 샘플 가맹점 + 메뉴 데이터 삽입
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1) 사장님 역할 유저 생성 (이미 있으면 스킵)
--    ※ auth.users 에 실제 가입한 계정이 있으면 아래 owner_id 를 해당 users.id 로 교체하세요
DO $$
DECLARE
  owner_uuid UUID := gen_random_uuid();
BEGIN
  -- 테스트용 owner 프로필이 없을 경우에만 삽입
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'owner' LIMIT 1) THEN
    INSERT INTO users (id, name, phone, email, role)
    VALUES (owner_uuid, '김사장', '010-1234-5678', 'owner@pickpick.app', 'owner');
  ELSE
    SELECT id INTO owner_uuid FROM users WHERE role = 'owner' LIMIT 1;
  END IF;

  -- ─────────────────────────────────────────────────────────
  -- 가게 1: 바삭대장 치킨 (치킨)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO stores (
    id, owner_id, name, description, category, phone, address, lat, lng,
    min_order_amount, delivery_fee, delivery_time, is_open, is_approved,
    rating, review_count, pick_reward_rate
  ) VALUES (
    'a1000000-0000-0000-0000-000000000001', owner_uuid,
    '바삭대장 치킨', '강남에서 가장 바삭한 치킨집', 'chicken',
    '02-123-4567', '서울 강남구 역삼동 123', 37.4979, 127.0276,
    15000, 2000, 25, true, true, 4.8, 312, 2.0
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO menus (store_id, name, description, price, category, is_available, is_popular, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', '후라이드 치킨',    '바삭하고 담백한 정통 후라이드', 18000, '치킨', true, true,  1),
  ('a1000000-0000-0000-0000-000000000001', '양념 치킨',        '달콤 매콤 양념 치킨',           19000, '치킨', true, true,  2),
  ('a1000000-0000-0000-0000-000000000001', '반반 치킨',        '후라이드 반 + 양념 반',          19000, '치킨', true, false, 3),
  ('a1000000-0000-0000-0000-000000000001', '마늘간장 치킨',    '고소한 마늘간장 소스',           20000, '치킨', true, false, 4),
  ('a1000000-0000-0000-0000-000000000001', '콜라 1.25L',       '시원한 콜라',                    3000,  '음료', true, false, 5),
  ('a1000000-0000-0000-0000-000000000001', '치킨무',           '새콤달콤 치킨무',                 500,   '사이드', true, false, 6)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────
  -- 가게 2: 명동칼국수 (한식)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO stores (
    id, owner_id, name, description, category, phone, address, lat, lng,
    min_order_amount, delivery_fee, delivery_time, is_open, is_approved,
    rating, review_count, pick_reward_rate
  ) VALUES (
    'a2000000-0000-0000-0000-000000000002', owner_uuid,
    '명동칼국수', '40년 전통 손칼국수 전문점', 'korean',
    '02-234-5678', '서울 강남구 역삼동 456', 37.4985, 127.0280,
    10000, 0, 35, true, true, 4.6, 189, 1.5
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO menus (store_id, name, description, price, category, is_available, is_popular, sort_order) VALUES
  ('a2000000-0000-0000-0000-000000000002', '칼국수',      '직접 뽑은 쫄깃한 손칼국수',    9000,  '면',   true, true,  1),
  ('a2000000-0000-0000-0000-000000000002', '만두국',      '꽉 찬 속 만두국',               9500,  '면',   true, false, 2),
  ('a2000000-0000-0000-0000-000000000002', '콩국수',      '고소한 여름 콩국수',            10000, '면',   true, false, 3),
  ('a2000000-0000-0000-0000-000000000002', '만두 (10개)', '직접 빚은 왕만두',               8000,  '사이드', true, true, 4),
  ('a2000000-0000-0000-0000-000000000002', '공기밥',      '쌀밥',                           1000,  '사이드', true, false, 5)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────
  -- 가게 3: 도미노 피자 역삼점 (피자)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO stores (
    id, owner_id, name, description, category, phone, address, lat, lng,
    min_order_amount, delivery_fee, delivery_time, is_open, is_approved,
    rating, review_count, pick_reward_rate
  ) VALUES (
    'a3000000-0000-0000-0000-000000000003', owner_uuid,
    '피자팡팡 역삼점', '즉석에서 구워내는 도우 피자', 'pizza',
    '02-345-6789', '서울 강남구 역삼동 789', 37.4970, 127.0265,
    20000, 3000, 40, true, true, 4.4, 95, 1.0
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO menus (store_id, name, description, price, category, is_available, is_popular, sort_order) VALUES
  ('a3000000-0000-0000-0000-000000000003', '불고기 피자 (L)', '달콤 불고기 토핑',           23000, '피자', true, true,  1),
  ('a3000000-0000-0000-0000-000000000003', '포테이토 피자 (L)', '감자 + 베이컨',             22000, '피자', true, false, 2),
  ('a3000000-0000-0000-0000-000000000003', '콤비네이션 (M)',  '다양한 토핑 콤비네이션',     19000, '피자', true, false, 3),
  ('a3000000-0000-0000-0000-000000000003', '치즈스틱 (5개)', '쭈욱 늘어나는 치즈스틱',      6000,  '사이드', true, true, 4),
  ('a3000000-0000-0000-0000-000000000003', '콜라 1.5L',      '콜라',                         3000,  '음료', true, false, 5)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────
  -- 가게 4: 떡볶이왕 (분식)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO stores (
    id, owner_id, name, description, category, phone, address, lat, lng,
    min_order_amount, delivery_fee, delivery_time, is_open, is_approved,
    rating, review_count, pick_reward_rate
  ) VALUES (
    'a4000000-0000-0000-0000-000000000004', owner_uuid,
    '떡볶이왕', '쫄깃하고 매콤한 국물떡볶이', 'snack',
    '02-456-7890', '서울 강남구 역삼동 321', 37.4975, 127.0270,
    8000, 1000, 20, true, true, 4.7, 421, 2.0
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO menus (store_id, name, description, price, category, is_available, is_popular, sort_order) VALUES
  ('a4000000-0000-0000-0000-000000000004', '국물떡볶이 (2인)', '쫄깃 국물 떡볶이',          12000, '떡볶이', true, true,  1),
  ('a4000000-0000-0000-0000-000000000004', '로제떡볶이 (2인)', '크리미 로제 소스',           14000, '떡볶이', true, true,  2),
  ('a4000000-0000-0000-0000-000000000004', '순대 (1인분)',    '찰순대',                       5000,  '사이드', true, false, 3),
  ('a4000000-0000-0000-0000-000000000004', '튀김 모둠 (5개)', '오징어+고추+야채 튀김',       6000,  '튀김', true, false, 4),
  ('a4000000-0000-0000-0000-000000000004', '라볶이 세트',     '라면+떡볶이 조합',             13000, '세트', true, false, 5)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────
  -- 가게 5: 스시오마카세 (일식)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO stores (
    id, owner_id, name, description, category, phone, address, lat, lng,
    min_order_amount, delivery_fee, delivery_time, is_open, is_approved,
    rating, review_count, pick_reward_rate
  ) VALUES (
    'a5000000-0000-0000-0000-000000000005', owner_uuid,
    '스시사부로 역삼', '신선한 재료로 만드는 초밥 전문점', 'japanese',
    '02-567-8901', '서울 강남구 역삼동 654', 30000, 3000, 45,
    true, true, 4.9, 78, 3.0
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO menus (store_id, name, description, price, category, is_available, is_popular, sort_order) VALUES
  ('a5000000-0000-0000-0000-000000000005', '연어 초밥 (8P)',  '두툼한 노르웨이 연어',       20000, '초밥', true, true,  1),
  ('a5000000-0000-0000-0000-000000000005', '모둠 초밥 (12P)', '제철 생선 12종',              35000, '초밥', true, true,  2),
  ('a5000000-0000-0000-0000-000000000005', '참치 초밥 (8P)',  '신선한 참치',                 22000, '초밥', true, false, 3),
  ('a5000000-0000-0000-0000-000000000005', '된장국',          '일본식 된장국',                3000,  '사이드', true, false, 4),
  ('a5000000-0000-0000-0000-000000000005', '우롱차',          '차가운 우롱차',                2000,  '음료', true, false, 5)
  ON CONFLICT DO NOTHING;

  -- ─────────────────────────────────────────────────────────
  -- 가게 6: 맥도날드 스타일 버거 (버거)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO stores (
    id, owner_id, name, description, category, phone, address, lat, lng,
    min_order_amount, delivery_fee, delivery_time, is_open, is_approved,
    rating, review_count, pick_reward_rate
  ) VALUES (
    'a6000000-0000-0000-0000-000000000006', owner_uuid,
    '버거킹 역삼점', '불맛 가득 와퍼 버거', 'burger',
    '02-678-9012', '서울 강남구 역삼동 987', 37.4982, 127.0259,
    10000, 2000, 30, true, true, 4.3, 267, 1.0
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO menus (store_id, name, description, price, category, is_available, is_popular, sort_order) VALUES
  ('a6000000-0000-0000-0000-000000000006', '와퍼 단품',       '100% 순쇠고기 패티',          8900,  '버거', true, true,  1),
  ('a6000000-0000-0000-0000-000000000006', '치즈와퍼 세트',   '와퍼+감자튀김+콜라',          12900, '세트', true, true,  2),
  ('a6000000-0000-0000-0000-000000000006', '치킨와퍼 단품',   '바삭한 치킨 패티',             7900,  '버거', true, false, 3),
  ('a6000000-0000-0000-0000-000000000006', '감자튀김 (중)',   '바삭한 감자튀김',              2900,  '사이드', true, false, 4),
  ('a6000000-0000-0000-0000-000000000006', '콜라 (중)',       '차가운 콜라',                   2000,  '음료', true, false, 5)
  ON CONFLICT DO NOTHING;

END $$;

-- 결과 확인
SELECT s.name, s.category, COUNT(m.id) AS menu_count
FROM stores s
LEFT JOIN menus m ON m.store_id = s.id
WHERE s.is_approved = true
GROUP BY s.id, s.name, s.category
ORDER BY s.name;
