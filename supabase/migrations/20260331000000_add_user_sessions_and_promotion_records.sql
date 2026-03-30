-- user_sessions: Edge Function auth에서 토스 액세스 토큰 저장
CREATE TABLE IF NOT EXISTS economic_sense_test.user_sessions (
  user_key TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- promotion_records: Edge Function promotion에서 토스포인트 지급 이력 저장
CREATE TABLE IF NOT EXISTS economic_sense_test.promotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key TEXT NOT NULL,
  promotion_code TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  promotion_key TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_key, promotion_code)
);

-- RLS 활성화 (Edge Function은 service_role_key로 접근하므로 bypass)
ALTER TABLE economic_sense_test.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_sense_test.promotion_records ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 허용 (Edge Function 전용)
CREATE POLICY "service_role_full_access" ON economic_sense_test.user_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_full_access" ON economic_sense_test.promotion_records
  FOR ALL USING (auth.role() = 'service_role');

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_promotion_records_user_key
  ON economic_sense_test.promotion_records (user_key);

CREATE INDEX IF NOT EXISTS idx_promotion_records_status
  ON economic_sense_test.promotion_records (status)
  WHERE status = 'pending';
