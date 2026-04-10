-- 사용자 등록 시 지갑 자동 생성 트리거
-- Supabase SQL Editor에서 실행하세요

-- 1. 트리거 함수 생성
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, pick_balance, locked_balance, total_earned)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거 등록 (users 테이블에 INSERT 후 실행)
DROP TRIGGER IF EXISTS on_user_created_create_wallet ON users;
CREATE TRIGGER on_user_created_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_new_user();

-- 3. 기존 users 중 wallet 없는 유저에게 지갑 생성
INSERT INTO wallets (user_id, pick_balance, locked_balance, total_earned)
SELECT id, 0, 0, 0
FROM users
WHERE id NOT IN (SELECT user_id FROM wallets WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 확인
SELECT u.id, u.name, u.email, w.pick_balance
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 20;
