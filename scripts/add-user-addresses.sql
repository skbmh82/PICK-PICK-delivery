-- 다중 배달 주소 테이블
-- Supabase SQL Editor 또는 psql로 실행하세요.

CREATE TABLE IF NOT EXISTS user_addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL DEFAULT '집',   -- '집' | '회사' | '기타'
  address    TEXT NOT NULL,                -- 도로명 또는 지번 주소
  detail     TEXT,                         -- 상세 주소 (동/호수 등)
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- RLS 활성화
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- 본인만 조회·수정 가능
CREATE POLICY "user_addresses_select" ON user_addresses
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "user_addresses_insert" ON user_addresses
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "user_addresses_update" ON user_addresses
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "user_addresses_delete" ON user_addresses
  FOR DELETE USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );
