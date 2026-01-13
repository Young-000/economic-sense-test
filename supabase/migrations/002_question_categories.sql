-- =============================================
-- 질문 카테고리 및 시나리오 관리 스키마
-- Schema: economic_sense_test
-- =============================================

-- 1. 질문 타입 enum
CREATE TYPE economic_sense_test.question_type AS ENUM ('earning', 'spending');

-- 2. 카테고리 테이블
CREATE TABLE economic_sense_test.question_categories (
  id SERIAL PRIMARY KEY,
  type question_type NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  name_ko VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 시드 데이터
INSERT INTO economic_sense_test.question_categories (type, code, name_ko, emoji, description) VALUES
-- 벌기 (Earning)
('earning', 'salary', '월급/연봉', '💼', '월급 인상, 연봉 협상, 보너스 등'),
('earning', 'investment', '투자/저축', '📈', '주식, 펀드, 적금, 예금 등'),
('earning', 'side_income', '부수입', '🥕', '당근마켓, 알바, 프리랜서 등'),
-- 쓰기 (Spending)
('spending', 'food', '식비', '🍜', '점심, 저녁, 카페, 배달 등'),
('spending', 'travel', '여행', '✈️', '국내여행, 해외여행, 숙소, 항공권 등'),
('spending', 'health', '건강/의료', '🏥', '병원, 약국, 보험, 건강검진 등'),
('spending', 'hobby', '취미/여가', '🎮', '게임, 운동, 문화생활 등'),
('spending', 'subscription', '구독/고정', '📺', 'OTT, 멤버십, 월정액 서비스 등'),
('spending', 'shopping', '쇼핑', '🛒', '의류, 전자기기, 생활용품 등'),
('spending', 'housing', '주거', '🏠', '월세, 관리비, 이사 등');

-- 3. 금액 범위 테이블
CREATE TABLE economic_sense_test.amount_ranges (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES economic_sense_test.question_categories(id),
  size VARCHAR(20) NOT NULL, -- 'small', 'medium', 'large'
  min_amount INTEGER NOT NULL,
  max_amount INTEGER NOT NULL,
  typical_amount INTEGER NOT NULL,
  label_ko VARCHAR(50) NOT NULL, -- "1~5만원" 형식
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, size)
);

-- 금액 범위 시드 데이터
INSERT INTO economic_sense_test.amount_ranges (category_id, size, min_amount, max_amount, typical_amount, label_ko)
SELECT c.id, r.size, r.min_amount, r.max_amount, r.typical_amount, r.label_ko
FROM question_categories c
JOIN (VALUES
  -- 월급/연봉 (salary)
  ('salary', 'small', 50000, 150000, 100000, '5~15만원'),
  ('salary', 'medium', 200000, 500000, 300000, '20~50만원'),
  ('salary', 'large', 500000, 2000000, 1000000, '50~200만원'),
  -- 투자/저축 (investment)
  ('investment', 'small', 100000, 500000, 300000, '10~50만원'),
  ('investment', 'medium', 500000, 2000000, 1000000, '50~200만원'),
  ('investment', 'large', 2000000, 10000000, 5000000, '200~1000만원'),
  -- 부수입 (side_income)
  ('side_income', 'small', 10000, 50000, 30000, '1~5만원'),
  ('side_income', 'medium', 50000, 200000, 100000, '5~20만원'),
  ('side_income', 'large', 200000, 500000, 300000, '20~50만원'),
  -- 식비 (food)
  ('food', 'small', 5000, 15000, 8000, '0.5~1.5만원'),
  ('food', 'medium', 15000, 50000, 30000, '1.5~5만원'),
  ('food', 'large', 50000, 200000, 100000, '5~20만원'),
  -- 여행 (travel)
  ('travel', 'small', 50000, 200000, 100000, '5~20만원'),
  ('travel', 'medium', 200000, 500000, 300000, '20~50만원'),
  ('travel', 'large', 500000, 2000000, 1000000, '50~200만원'),
  -- 건강/의료 (health)
  ('health', 'small', 5000, 30000, 15000, '0.5~3만원'),
  ('health', 'medium', 30000, 200000, 100000, '3~20만원'),
  ('health', 'large', 200000, 2000000, 500000, '20~200만원'),
  -- 취미/여가 (hobby)
  ('hobby', 'small', 10000, 50000, 30000, '1~5만원'),
  ('hobby', 'medium', 50000, 200000, 100000, '5~20만원'),
  ('hobby', 'large', 200000, 1000000, 500000, '20~100만원'),
  -- 구독/고정 (subscription)
  ('subscription', 'small', 5000, 15000, 10000, '0.5~1.5만원'),
  ('subscription', 'medium', 15000, 50000, 30000, '1.5~5만원'),
  ('subscription', 'large', 50000, 150000, 100000, '5~15만원'),
  -- 쇼핑 (shopping)
  ('shopping', 'small', 30000, 100000, 50000, '3~10만원'),
  ('shopping', 'medium', 100000, 500000, 300000, '10~50만원'),
  ('shopping', 'large', 500000, 2000000, 1000000, '50~200만원'),
  -- 주거 (housing)
  ('housing', 'small', 100000, 300000, 200000, '10~30만원'),
  ('housing', 'medium', 300000, 1000000, 600000, '30~100만원'),
  ('housing', 'large', 1000000, 5000000, 2000000, '100~500만원')
) AS r(code, size, min_amount, max_amount, typical_amount, label_ko)
ON c.code = r.code;

-- 4. 질문 시나리오 테이블
CREATE TABLE economic_sense_test.question_scenarios (
  id SERIAL PRIMARY KEY,
  amount_range_id INTEGER NOT NULL REFERENCES economic_sense_test.amount_ranges(id),
  situation TEXT NOT NULL,
  -- Option A (보통 안전한 선택)
  option_a_label VARCHAR(100) NOT NULL,
  option_a_description TEXT NOT NULL,
  option_a_outcomes JSONB NOT NULL, -- [{probability: 1, value: 10000}]
  -- Option B (보통 리스크 있는 선택)
  option_b_label VARCHAR(100) NOT NULL,
  option_b_description TEXT NOT NULL,
  option_b_outcomes JSONB NOT NULL, -- [{probability: 0.5, value: 30000}, {probability: 0.5, value: -10000}]
  -- 메타 정보
  normalized_max_ev DECIMAL(10, 4) NOT NULL DEFAULT 1, -- 정규화된 최대 기대값 (1 기준)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 시나리오 시드 데이터
-- 각 카테고리 + 금액대별 시나리오들

-- === 월급/연봉 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💼 연봉 협상 기회가 왔다!',
  '확정 인상 수락',
  '안전하게 연봉 인상',
  '[{"probability": 1, "value": 0.85}]'::jsonb,
  '성과급 협상',
  '70%로 큰 인상, 30%로 무산',
  '[{"probability": 0.7, "value": 1.43}, {"probability": 0.3, "value": 0}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'medium';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💼 보너스 300만원이 들어왔다!',
  '적금 넣기',
  '1년 후 이자 확정',
  '[{"probability": 1, "value": 1}]'::jsonb,
  '주식 투자',
  '50%로 수익, 50%로 손실',
  '[{"probability": 0.5, "value": 3}, {"probability": 0.5, "value": -1.4}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'large';

-- === 투자/저축 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📈 친구가 "이 코인 무조건 오른다" 추천',
  '무시하기',
  '내 돈은 안전하게',
  '[{"probability": 1, "value": 0.8}]'::jsonb,
  '투자해보기',
  '20%로 대박, 80%로 손실',
  '[{"probability": 0.2, "value": 8}, {"probability": 0.8, "value": -0.5}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'medium';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📉 내 주식이 -30% 됐다...',
  '손절하기',
  '지금 확정 손실',
  '[{"probability": 1, "value": 0.7}]'::jsonb,
  '존버하기',
  '40%로 본전, 60%로 추가 손실',
  '[{"probability": 0.4, "value": 3}, {"probability": 0.6, "value": -0.33}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'large';

-- === 부수입 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🥕 당근마켓에서 물건 판매 중',
  '할인해서 바로 팔기',
  '20% 할인, 오늘 거래 완료',
  '[{"probability": 1, "value": 0.9}]'::jsonb,
  '제값 고수',
  '65%로 제값, 35%로 한달 후 반값',
  '[{"probability": 0.65, "value": 1.2}, {"probability": 0.35, "value": 0.6}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'side_income' AND ar.size = 'medium';

-- === 식비 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🍜 점심 메뉴 고민 중',
  '8천원 단골집',
  '익숙한 맛, 시간 절약',
  '[{"probability": 1, "value": 1}]'::jsonb,
  '1.5만원 신상 맛집',
  '50% 대만족, 50% 실망',
  '[{"probability": 0.5, "value": 2}, {"probability": 0.5, "value": -1}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'food' AND ar.size = 'small';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '☕ 커피 구독 vs 매번 구매',
  '매번 구매',
  '마실 때만 지출',
  '[{"probability": 1, "value": 0.9}]'::jsonb,
  '커피 구독',
  '55%로 절약, 45%로 낭비',
  '[{"probability": 0.55, "value": 2}, {"probability": 0.45, "value": -0.22}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'food' AND ar.size = 'medium';

-- === 여행 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '✈️ 제주도 비행기 예약해야 해',
  '환불가능 티켓',
  '일정 변경시 100% 환불',
  '[{"probability": 1, "value": 0.85}]'::jsonb,
  '환불불가 저가',
  '90%로 절약, 10%로 전액 손실',
  '[{"probability": 0.9, "value": 1.3}, {"probability": 0.1, "value": -1.7}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'travel' AND ar.size = 'small';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🌴 해외여행 숙소 예약',
  '호텔 예약',
  '안전하고 편리함',
  '[{"probability": 1, "value": 0.8}]'::jsonb,
  '에어비앤비',
  '70%로 대만족, 30%로 실망',
  '[{"probability": 0.7, "value": 1.5}, {"probability": 0.3, "value": -0.17}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'travel' AND ar.size = 'medium';

-- === 건강/의료 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏥 감기 기운이 있다',
  '집에서 쉬기',
  '약국 약만 먹기',
  '[{"probability": 0.7, "value": 1.2}, {"probability": 0.3, "value": 0.5}]'::jsonb,
  '병원 가기',
  '확실하게 진료',
  '[{"probability": 1, "value": 0.9}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'small';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🦷 치과 정기검진 vs 아플 때만',
  '정기검진',
  '6개월마다 체크',
  '[{"probability": 1, "value": 0.85}]'::jsonb,
  '아플 때만',
  '80%로 괜찮음, 20%로 큰 치료',
  '[{"probability": 0.8, "value": 1.2}, {"probability": 0.2, "value": -0.2}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'medium';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏥 건강검진 결과 수술 권유',
  '지금 수술',
  '확실하게 치료',
  '[{"probability": 1, "value": 0.75}]'::jsonb,
  '좀 더 지켜보기',
  '50%로 호전, 50%로 악화',
  '[{"probability": 0.5, "value": 2}, {"probability": 0.5, "value": -0.5}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'large';

-- === 취미/여가 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎮 새 게임 출시!',
  '중고로 기다리기',
  '한 달 후 30% 할인',
  '[{"probability": 1, "value": 0.9}]'::jsonb,
  '출시일 구매',
  '바로 플레이하는 즐거움',
  '[{"probability": 0.6, "value": 1.5}, {"probability": 0.4, "value": 0.25}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'small';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🚀 친구 스타트업에 투자 제안 받음',
  '정중히 거절',
  '우정은 우정, 돈은 돈',
  '[{"probability": 1, "value": 0.9}]'::jsonb,
  '투자하기',
  '12%로 대박, 88%로 전액 손실',
  '[{"probability": 0.12, "value": 10}, {"probability": 0.88, "value": -0.23}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'large';

-- === 구독/고정 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📺 OTT 서비스 고민',
  '월정액 구독',
  '매월 고정 지출',
  '[{"probability": 1, "value": 0.85}]'::jsonb,
  '연간 결제',
  '70%로 많이 봄, 30%로 3개월 후 안 봄',
  '[{"probability": 0.7, "value": 1.4}, {"probability": 0.3, "value": 0.1}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'subscription' AND ar.size = 'small';

-- === 쇼핑 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🛒 블프 세일 vs 평소 구매',
  '필요할 때 구매',
  '정가로 필요한 것만',
  '[{"probability": 1, "value": 0.85}]'::jsonb,
  '블프 세일 구매',
  '60%로 절약, 40%로 충동구매',
  '[{"probability": 0.6, "value": 2}, {"probability": 0.4, "value": -0.5}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'medium';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📱 최신폰 vs 중고폰',
  '신품 구매',
  'AS 보장, 마음 편함',
  '[{"probability": 1, "value": 0.8}]'::jsonb,
  '중고 구매',
  '80%로 절약, 20%로 하자 발견',
  '[{"probability": 0.8, "value": 1.35}, {"probability": 0.2, "value": -0.4}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'large';

-- === 주거 ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏠 월세 재계약 vs 이사',
  '재계약',
  '월세 인상 수용',
  '[{"probability": 1, "value": 0.75}]'::jsonb,
  '더 싼 곳으로 이사',
  '65%로 절약, 35%로 후회',
  '[{"probability": 0.65, "value": 1.7}, {"probability": 0.35, "value": -0.27}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'housing' AND ar.size = 'medium';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💻 이직 제안이 왔다',
  '현 직장 유지',
  '올해 보너스 확정',
  '[{"probability": 1, "value": 0.8}]'::jsonb,
  '이직하기',
  '75%로 연봉 상승, 25%로 적응 실패',
  '[{"probability": 0.75, "value": 1.5}, {"probability": 0.25, "value": -0.5}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'housing' AND ar.size = 'large';

-- === 도박/복권 (hobby large) ===
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎰 로또 vs 저축',
  '매주 로또',
  '월 2만원, 꿈을 산다',
  '[{"probability": 0.001, "value": 500}, {"probability": 0.999, "value": 0}]'::jsonb,
  '그냥 저축',
  '월 2만원 적금, 이자 확정',
  '[{"probability": 1, "value": 1}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'medium';

INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎲 친구들과 내기 포커',
  '구경만 하기',
  '리스크 없이 친목만',
  '[{"probability": 1, "value": 0.9}]'::jsonb,
  '참여하기',
  '45%로 승리, 55%로 패배',
  '[{"probability": 0.45, "value": 2.7}, {"probability": 0.55, "value": -0.18}]'::jsonb,
  1.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'medium';

-- 6. 인덱스 생성
CREATE INDEX idx_question_categories_type ON economic_sense_test.question_categories(type);
CREATE INDEX idx_question_categories_code ON economic_sense_test.question_categories(code);
CREATE INDEX idx_amount_ranges_category ON economic_sense_test.amount_ranges(category_id);
CREATE INDEX idx_question_scenarios_amount_range ON economic_sense_test.question_scenarios(amount_range_id);
CREATE INDEX idx_question_scenarios_active ON economic_sense_test.question_scenarios(is_active);

-- 7. 질문 조회 뷰 (편의용)
CREATE OR REPLACE VIEW economic_sense_test.v_questions AS
SELECT
  qs.id,
  c.type,
  c.code AS category_code,
  c.name_ko AS category_name,
  c.emoji AS category_emoji,
  ar.size AS amount_size,
  ar.min_amount,
  ar.max_amount,
  ar.typical_amount,
  ar.label_ko AS amount_label,
  qs.situation,
  qs.option_a_label,
  qs.option_a_description,
  qs.option_a_outcomes,
  qs.option_b_label,
  qs.option_b_description,
  qs.option_b_outcomes,
  qs.normalized_max_ev,
  qs.is_active
FROM economic_sense_test.question_scenarios qs
JOIN economic_sense_test.amount_ranges ar ON qs.amount_range_id = ar.id
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE qs.is_active = true
ORDER BY c.type, c.code, ar.size;
