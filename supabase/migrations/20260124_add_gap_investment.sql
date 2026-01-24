-- =============================================
-- 갭투자 시나리오 추가
-- Schema: economic_sense_test
-- 값은 천원 단위 (value * 1,000 = 실제 원화)
-- =============================================

-- 갭투자 시나리오 (investment large)
-- Option A: 전세로 살기 (0원 - 리스크 없음)
-- Option B: 대출 풀로 갭투자
--   - 20% 확률로 +5천만원 (시세차익)
--   - 80% 확률로 -3천만원 (손실)
-- EV = 0.2 × 50000 + 0.8 × (-30000) = 10000 - 24000 = -14000천원 = -1.4천만원

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏠 갭투자 기회',
  '전세로 살기',
  '리스크 없이 안전하게',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '대출 풀로 갭투자',
  '20% 시세차익 5천만원!',
  '[{"probability": 0.2, "value": 50000}, {"probability": 0.8, "value": -30000}]'::jsonb,
  0.0  -- Option A (0원)가 EV가 더 좋음 (Option B EV = -14000)
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'large';
