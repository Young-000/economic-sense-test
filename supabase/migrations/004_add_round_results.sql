-- 라운드별 결과 저장을 위한 컬럼 추가
-- 1등 플레이어의 라운드별 자산 변화를 그래프로 표시하기 위함

ALTER TABLE economic_sense_test.economic_rankings
ADD COLUMN IF NOT EXISTS round_results JSONB DEFAULT '[]'::jsonb;

-- round_results 형식:
-- [
--   { "round": 1, "balance": 1080000, "outcome": 80000 },
--   { "round": 2, "balance": 1580000, "outcome": 500000 },
--   ...
-- ]

-- 인덱스 추가 (1등 조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_rankings_total_return_desc
ON economic_sense_test.economic_rankings (total_return DESC);

COMMENT ON COLUMN economic_sense_test.economic_rankings.round_results IS '라운드별 자산 변화 기록 (JSONB 배열)';
