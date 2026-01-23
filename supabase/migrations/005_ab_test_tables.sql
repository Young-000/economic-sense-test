-- A/B 테스트 테이블 생성
-- Schema: economic_sense_test

-- ============================================================================
-- 변형 할당 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS economic_sense_test.ab_test_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  experiment_id VARCHAR(100) NOT NULL,
  variant VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 사용자별 실험당 하나의 변형만 할당
  CONSTRAINT ab_test_assignments_user_experiment_unique UNIQUE (user_id, experiment_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_experiment
  ON economic_sense_test.ab_test_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user
  ON economic_sense_test.ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_variant
  ON economic_sense_test.ab_test_assignments(experiment_id, variant);

-- RLS 활성화
ALTER TABLE economic_sense_test.ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- 누구나 할당 생성 가능
CREATE POLICY "Anyone can create assignments"
  ON economic_sense_test.ab_test_assignments
  FOR INSERT WITH CHECK (true);

-- 누구나 조회 가능 (통계용)
CREATE POLICY "Anyone can read assignments"
  ON economic_sense_test.ab_test_assignments
  FOR SELECT USING (true);

-- ============================================================================
-- 이벤트 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS economic_sense_test.ab_test_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  experiment_id VARCHAR(100) NOT NULL,
  variant VARCHAR(100) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ab_test_events_experiment
  ON economic_sense_test.ab_test_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_user
  ON economic_sense_test.ab_test_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_event_name
  ON economic_sense_test.ab_test_events(event_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant
  ON economic_sense_test.ab_test_events(experiment_id, variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_created_at
  ON economic_sense_test.ab_test_events(created_at);

-- RLS 활성화
ALTER TABLE economic_sense_test.ab_test_events ENABLE ROW LEVEL SECURITY;

-- 누구나 이벤트 생성 가능
CREATE POLICY "Anyone can create events"
  ON economic_sense_test.ab_test_events
  FOR INSERT WITH CHECK (true);

-- 누구나 조회 가능 (통계용)
CREATE POLICY "Anyone can read events"
  ON economic_sense_test.ab_test_events
  FOR SELECT USING (true);

-- ============================================================================
-- 통계 조회용 뷰
-- ============================================================================

-- 실험별 변형별 사용자 수
CREATE OR REPLACE VIEW economic_sense_test.ab_test_variant_stats AS
SELECT
  experiment_id,
  variant,
  COUNT(DISTINCT user_id) as total_users,
  MIN(assigned_at) as first_assignment,
  MAX(assigned_at) as last_assignment
FROM economic_sense_test.ab_test_assignments
GROUP BY experiment_id, variant;

-- 실험별 변형별 이벤트 집계
CREATE OR REPLACE VIEW economic_sense_test.ab_test_event_stats AS
SELECT
  experiment_id,
  variant,
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM economic_sense_test.ab_test_events
GROUP BY experiment_id, variant, event_name;

-- 전환율 계산 뷰
CREATE OR REPLACE VIEW economic_sense_test.ab_test_conversion_stats AS
SELECT
  a.experiment_id,
  a.variant,
  COUNT(DISTINCT a.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN e.event_name = 'conversion' THEN e.user_id END) as converted_users,
  ROUND(
    (COUNT(DISTINCT CASE WHEN e.event_name = 'conversion' THEN e.user_id END)::NUMERIC /
     NULLIF(COUNT(DISTINCT a.user_id), 0)) * 100,
    2
  ) as conversion_rate
FROM economic_sense_test.ab_test_assignments a
LEFT JOIN economic_sense_test.ab_test_events e
  ON a.user_id = e.user_id
  AND a.experiment_id = e.experiment_id
GROUP BY a.experiment_id, a.variant;

-- ============================================================================
-- 코멘트
-- ============================================================================

COMMENT ON TABLE economic_sense_test.ab_test_assignments IS 'A/B 테스트 사용자별 변형 할당';
COMMENT ON TABLE economic_sense_test.ab_test_events IS 'A/B 테스트 이벤트 로그';
COMMENT ON VIEW economic_sense_test.ab_test_variant_stats IS 'A/B 테스트 변형별 사용자 통계';
COMMENT ON VIEW economic_sense_test.ab_test_event_stats IS 'A/B 테스트 변형별 이벤트 통계';
COMMENT ON VIEW economic_sense_test.ab_test_conversion_stats IS 'A/B 테스트 전환율 통계';
