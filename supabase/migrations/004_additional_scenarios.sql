-- =============================================
-- 추가 질문 시나리오 - 다양성 강화
-- Schema: economic_sense_test
-- 카테고리: 교육/자기계발, 보험/금융, 세금/공과금, 가족/경조사
-- 값은 천원 단위 (value * 1,000 = 실제 원화)
-- =============================================

-- ========================================
-- 교육/자기계발 시나리오
-- ========================================

-- 자격증 시험 준비 (spending)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📚 자격증 시험 준비',
  '독학으로 준비',
  '교재비 5만원만 투자',
  '[{"probability": 1, "value": -50}]'::jsonb,
  '학원 수강 30만원',
  '80% 합격, 20% 재수강 필요',
  '[{"probability": 0.8, "value": -300}, {"probability": 0.2, "value": -500}]'::jsonb,
  -50.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'medium';

-- 온라인 코딩 부트캠프 (mixed)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💻 온라인 코딩 부트캠프',
  '무료 유튜브 독학',
  '비용 0원, 시간만 투자',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '500만원 부트캠프',
  '60% 취업 성공, 40% 미취업',
  '[{"probability": 0.6, "value": 3000}, {"probability": 0.4, "value": -500}]'::jsonb,
  1600.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'large';

-- ========================================
-- 보험/금융 시나리오
-- ========================================

-- 실손보험 가입 제안 (mixed)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏥 실손보험 가입 제안',
  '가입 안 함',
  '월 보험료 아끼기',
  '[{"probability": 0.95, "value": 0}, {"probability": 0.05, "value": -2000}]'::jsonb,
  '월 1만원 가입',
  '연 12만원, 병원비 80% 보장',
  '[{"probability": 0.9, "value": -120}, {"probability": 0.1, "value": 500}]'::jsonb,
  -58.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'small';

-- 적금 만기 운용 (income)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💳 적금 만기! 500만원 수령',
  '재예치 (연 4%)',
  '1년 후 20만원 이자 확정',
  '[{"probability": 1, "value": 200}]'::jsonb,
  '채권 ETF 투자',
  '60% 15% 수익, 40% 5% 손실',
  '[{"probability": 0.6, "value": 750}, {"probability": 0.4, "value": -250}]'::jsonb,
  350.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'medium';

-- ========================================
-- 세금/공과금 시나리오
-- ========================================

-- 연말정산 (income)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📋 연말정산 시즌!',
  '기본 공제만 신청',
  '30만원 환급 확정',
  '[{"probability": 1, "value": 300}]'::jsonb,
  '공제 항목 꼼꼼히 챙기기',
  '70% 80만원, 30% 20만원 환급',
  '[{"probability": 0.7, "value": 800}, {"probability": 0.3, "value": 200}]'::jsonb,
  620.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'medium';

-- 세금 납부 방법 (mixed)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🧾 세금 납부 방법 선택',
  '일시납부',
  '50만원 한번에 납부',
  '[{"probability": 1, "value": -500}]'::jsonb,
  '분할납부 신청',
  '80% 무사히 완납, 20% 가산세',
  '[{"probability": 0.8, "value": -510}, {"probability": 0.2, "value": -600}]'::jsonb,
  -500.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'large';

-- ========================================
-- 가족/경조사 시나리오
-- ========================================

-- 부모님 결혼기념일 선물 (spending)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💐 부모님 결혼기념일 선물',
  '소박하게 꽃과 케이크',
  '10만원으로 정성 표현',
  '[{"probability": 1, "value": -100}]'::jsonb,
  '고급 레스토랑 예약',
  '70% 대만족, 30% 취향 아님',
  '[{"probability": 0.7, "value": -300}, {"probability": 0.3, "value": -400}]'::jsonb,
  -100.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'medium';

-- 친구 결혼식 축의금 (spending)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💒 친구 결혼식 축의금',
  '축의금 5만원',
  '부담 없는 금액',
  '[{"probability": 1, "value": -50}]'::jsonb,
  '축의금 10만원+선물',
  '60% 관계 돈독, 40% 과한 느낌',
  '[{"probability": 0.6, "value": -100}, {"probability": 0.4, "value": -150}]'::jsonb,
  -50.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'small';

-- 명절 용돈 (spending)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🧧 명절 조카 용돈',
  '인당 3만원씩',
  '부담 없는 금액으로 5명',
  '[{"probability": 1, "value": -150}]'::jsonb,
  '인당 5만원씩',
  '70% 좋아함, 30% 기대만큼 안 좋아함',
  '[{"probability": 0.7, "value": -250}, {"probability": 0.3, "value": -300}]'::jsonb,
  -150.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'medium';

-- 부모님 건강검진 (spending)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏥 부모님 건강검진 선물',
  '기본 검진 30만원',
  '필수 항목만 체크',
  '[{"probability": 1, "value": -300}]'::jsonb,
  '종합 검진 80만원',
  '85% 안심, 15% 조기발견',
  '[{"probability": 0.85, "value": -800}, {"probability": 0.15, "value": 2000}]'::jsonb,
  -380.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'large';

-- 확인용 쿼리
-- SELECT COUNT(*) FROM economic_sense_test.question_scenarios;
