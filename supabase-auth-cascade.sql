-- ============================================================
-- Auth 유저 삭제 시 users 테이블 자동 삭제 트리거
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- auth.users 삭제 → public.users 자동 삭제 함수
CREATE OR REPLACE FUNCTION handle_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE auth_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 등록
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_deleted();

-- ============================================================
-- (보너스) Auth 유저 생성 시 wallets 테이블 자동 생성 트리거
-- 가입하면 지갑이 자동으로 만들어집니다
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
