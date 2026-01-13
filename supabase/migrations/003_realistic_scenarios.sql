-- =============================================
-- 질문 시나리오 업데이트 - 현실적인 금액 반영
-- Schema: economic_sense_test
-- 값은 천원 단위 (value * 1,000 = 실제 원화)
-- =============================================

-- 기존 시나리오 삭제 (새로운 구조로 재생성)
DELETE FROM economic_sense_test.question_scenarios;

-- ========================================
-- 소비 시나리오 (SPENDING) - EV가 음수
-- 소비는 어떤 선택이든 돈이 나가지만, 합리적 선택으로 손실 최소화
-- ========================================

-- 식비 (food) - small: 점심
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🍜 점심 메뉴 고민 중',
  '8천원 단골집',
  '익숙한 맛, 확실한 만족',
  '[{"probability": 1, "value": -8}]'::jsonb,
  '1.5만원 신상 맛집',
  '50% 대만족, 50% 실망',
  '[{"probability": 0.5, "value": -8}, {"probability": 0.5, "value": -15}]'::jsonb,
  -8.0  -- 합리적 선택 EV (천원)
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'food' AND ar.size = 'small';

-- 식비 (food) - small: 커피
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '☕ 커피 한 잔의 선택',
  '편의점 커피',
  '2천원으로 카페인 충전',
  '[{"probability": 1, "value": -2}]'::jsonb,
  '프리미엄 카페',
  '70% 만족, 30% 그냥 그럼',
  '[{"probability": 0.7, "value": -5}, {"probability": 0.3, "value": -7}]'::jsonb,
  -2.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'food' AND ar.size = 'small';

-- 쇼핑 (shopping) - small: 핸드폰 케이스
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📱 핸드폰 케이스가 깨졌다',
  '1만원 저렴이',
  '그냥 보호만 되면 됨',
  '[{"probability": 1, "value": -10}]'::jsonb,
  '5만원 브랜드 케이스',
  '60% 오래 씀, 40% 금방 질림',
  '[{"probability": 0.6, "value": -30}, {"probability": 0.4, "value": -50}]'::jsonb,
  -10.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'small';

-- 쇼핑 (shopping) - medium: 마트 장보기
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🛒 마트에서 장보기',
  '필수품만 구매',
  '리스트대로 딱 필요한 것만',
  '[{"probability": 1, "value": -50}]'::jsonb,
  '1+1 세일 유혹',
  '40% 득템, 60% 충동구매',
  '[{"probability": 0.4, "value": -40}, {"probability": 0.6, "value": -100}]'::jsonb,
  -50.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'medium';

-- 여행 (travel) - small: 비행기 예약
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '✈️ 제주도 비행기 예약',
  '12만원 환불가능',
  '일정 변경시 100% 환불',
  '[{"probability": 1, "value": -120}]'::jsonb,
  '8만원 환불불가',
  '90% 절약, 10% 일정 꼬임',
  '[{"probability": 0.9, "value": -80}, {"probability": 0.1, "value": -200}]'::jsonb,
  -92.0  -- 환불불가가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'travel' AND ar.size = 'small';

-- 취미 (hobby) - medium: 새 게임
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎮 새 게임이 출시됐다',
  '세일까지 기다리기',
  '3개월 후 50% 할인',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '7만원 정가 구매',
  '60% 재밌음, 40% 후회',
  '[{"probability": 0.6, "value": -50}, {"probability": 0.4, "value": -70}]'::jsonb,
  0.0  -- 기다리기가 최선
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'medium';

-- 건강 (health) - large: 차량 정비 (차량=건강 느낌)
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🚗 차량 정비소 방문',
  '필수 항목만 정비',
  '당장 필요한 것만 30만원',
  '[{"probability": 1, "value": -300}]'::jsonb,
  '예방정비까지 풀옵션',
  '70% 나중에 아낌, 30% 과잉정비',
  '[{"probability": 0.7, "value": -400}, {"probability": 0.3, "value": -600}]'::jsonb,
  -300.0
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'large';

-- ========================================
-- 수익 시나리오 (INCOME) - EV가 양수
-- 수익 기회, 합리적 선택으로 수익 최대화
-- ========================================

-- 투자 (investment) - medium: 보너스 투자
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💰 보너스 300만원 지급!',
  '적금에 예치',
  '연 4% 이자 확정',
  '[{"probability": 1, "value": 120}]'::jsonb,
  '주식에 투자',
  '60% 수익 20%, 40% 손실 5%',
  '[{"probability": 0.6, "value": 600}, {"probability": 0.4, "value": -150}]'::jsonb,
  300.0  -- 주식이 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'medium';

-- 월급 (salary) - large: 연봉 협상
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💼 연봉 협상 기회!',
  '확정 200만원 인상',
  '안전하게 연봉 인상',
  '[{"probability": 1, "value": 2000}]'::jsonb,
  '성과급 도전',
  '70% 400만원, 30% 무산',
  '[{"probability": 0.7, "value": 4000}, {"probability": 0.3, "value": 0}]'::jsonb,
  2800.0  -- 성과급이 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'large';

-- 부수입 (side_income) - medium: 당근마켓
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🥕 당근마켓에서 물건 판매',
  '20% 할인 바로 팔기',
  '8만원에 오늘 거래 완료',
  '[{"probability": 1, "value": 80}]'::jsonb,
  '제값 10만원 고수',
  '65% 제값, 35% 한달 후 반값',
  '[{"probability": 0.65, "value": 100}, {"probability": 0.35, "value": 50}]'::jsonb,
  82.5  -- 제값 고수가 EV 살짝 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'side_income' AND ar.size = 'medium';

-- 부수입 (side_income) - large: 프리랜서 프로젝트
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💻 프리랜서 프로젝트 제안',
  '작은 프로젝트 수락',
  '100만원 확정, 1주 작업',
  '[{"probability": 1, "value": 1000}]'::jsonb,
  '큰 프로젝트 도전',
  '80% 200만원, 20% 중도포기',
  '[{"probability": 0.8, "value": 2000}, {"probability": 0.2, "value": -300}]'::jsonb,
  1540.0  -- 큰 프로젝트가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'side_income' AND ar.size = 'large';

-- 월급 (salary) - medium: 회사 공모전
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎯 회사 공모전 참가',
  '참가 안 함',
  '본업에 집중',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '열심히 준비해서 참가',
  '30% 상금 100만원, 70% 참가상',
  '[{"probability": 0.3, "value": 1000}, {"probability": 0.7, "value": -100}]'::jsonb,
  230.0  -- 참가가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'medium';

-- 부수입 (side_income) - large: 유료강의
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏆 재능기부 vs 유료강의',
  '무료 재능기부',
  '보람은 있지만 수익 없음',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '유료 온라인 강의',
  '50% 인기 50만원, 50% 비인기',
  '[{"probability": 0.5, "value": 500}, {"probability": 0.5, "value": 0}]'::jsonb,
  250.0  -- 유료강의가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'side_income' AND ar.size = 'large';

-- ========================================
-- 투자/도박 시나리오 (MIXED) - 양/음 혼합 EV
-- ========================================

-- 투자 (investment) - large: 코인 투자
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📈 친구가 "이 코인 무조건 오른다"',
  '무시하기',
  '내 돈은 안전하게',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '100만원 투자',
  '20% 대박 4배, 80% 80% 손실',
  '[{"probability": 0.2, "value": 4000}, {"probability": 0.8, "value": -800}]'::jsonb,
  160.0  -- 투자가 EV 살짝 좋음 (but 고위험)
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'large';

-- 취미 (hobby) - small: 로또
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎰 월 2만원 로또 vs 적금',
  '매주 로또 구매',
  '월 2만원, 꿈을 산다',
  '[{"probability": 0.00001, "value": 100000}, {"probability": 0.99999, "value": -20}]'::jsonb,
  '그냥 적금',
  '월 2만원 적금, 연 2% 이자',
  '[{"probability": 1, "value": 4}]'::jsonb,
  4.0  -- 적금이 EV 좋음 (로또는 마이너스)
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'small';

-- 투자 (investment) - large: 스타트업 투자
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🚀 친구 스타트업에 투자 제안',
  '정중히 거절',
  '우정은 우정, 돈은 돈',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '100만원 투자',
  '10% 대박 10배, 90% 전액 손실',
  '[{"probability": 0.1, "value": 10000}, {"probability": 0.9, "value": -1000}]'::jsonb,
  100.0  -- 투자가 EV 살짝 좋음 (but 초고위험)
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'large';

-- 취미 (hobby) - medium: 포커
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🎲 친구들과 내기 포커',
  '구경만 하기',
  '리스크 없이 친목만',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '5만원 참여',
  '40% 승리 3배, 60% 패배',
  '[{"probability": 0.4, "value": 150}, {"probability": 0.6, "value": -50}]'::jsonb,
  30.0  -- 참여가 EV 살짝 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'medium';

-- 투자 (investment) - medium: 주식 손절
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📉 내 주식이 -30% 됐다...',
  '손절하기',
  '30만원 확정 손실',
  '[{"probability": 1, "value": -300}]'::jsonb,
  '존버하기',
  '40% 반등 50%, 60% 추가 하락',
  '[{"probability": 0.4, "value": 500}, {"probability": 0.6, "value": -500}]'::jsonb,
  -100.0  -- 존버가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'investment' AND ar.size = 'medium';

-- 쇼핑 (shopping) - medium: 블프 세일
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🛒 블프 세일 물건 발견',
  '세일 패스',
  '어차피 필요 없는 물건',
  '[{"probability": 1, "value": 0}]'::jsonb,
  '50% 세일 5만원 구매',
  '40% 실제로 씀, 60% 장롱행',
  '[{"probability": 0.4, "value": 30}, {"probability": 0.6, "value": -50}]'::jsonb,
  0.0  -- 패스가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'medium';

-- 주거 (housing) - large: 전세 vs 월세
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🏠 전세 vs 월세 선택 (연 기준)',
  '월세 10만원',
  '매달 10만원, 연 120만원',
  '[{"probability": 1, "value": -1200}]'::jsonb,
  '전세 대출',
  '95% 이자 50만원, 5% 문제 발생',
  '[{"probability": 0.95, "value": -500}, {"probability": 0.05, "value": -5000}]'::jsonb,
  -725.0  -- 전세가 EV 더 좋음 (but 리스크)
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'housing' AND ar.size = 'large';

-- 쇼핑 (shopping) - large: 리볼빙
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💳 신용카드 리볼빙 제안',
  '일시불 결제',
  '이번 달 빡세지만 이자 없음',
  '[{"probability": 1, "value": -1000}]'::jsonb,
  '리볼빙 신청',
  '60% 다음달 완납, 40% 이자 늪',
  '[{"probability": 0.6, "value": -1050}, {"probability": 0.4, "value": -1800}]'::jsonb,
  -1000.0  -- 일시불이 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'shopping' AND ar.size = 'large';

-- ========================================
-- 추가 시나리오 - 다양성 확보
-- ========================================

-- 구독 (subscription) - small: OTT
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '📺 넷플릭스 구독 고민',
  '월정액 1.4만원',
  '매월 고정 지출',
  '[{"probability": 1, "value": -14}]'::jsonb,
  '연간 결제 15만원',
  '70% 많이 봄, 30% 3개월 후 안 봄',
  '[{"probability": 0.7, "value": -13}, {"probability": 0.3, "value": -15}]'::jsonb,
  -13.6  -- 연간 결제가 EV 살짝 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'subscription' AND ar.size = 'small';

-- 여행 (travel) - medium: 해외 숙소
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🌴 해외여행 숙소 예약',
  '20만원 호텔 예약',
  '안전하고 편리함',
  '[{"probability": 1, "value": -200}]'::jsonb,
  '10만원 에어비앤비',
  '70% 대만족, 30% 실망',
  '[{"probability": 0.7, "value": -100}, {"probability": 0.3, "value": -150}]'::jsonb,
  -115.0  -- 에어비앤비가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'travel' AND ar.size = 'medium';

-- 건강 (health) - small: 약국
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '🤧 감기 기운이 있다',
  '집에서 쉬기',
  '약국 약 5천원만',
  '[{"probability": 0.7, "value": -5}, {"probability": 0.3, "value": -30}]'::jsonb,
  '병원 가기',
  '확실하게 진료 2만원',
  '[{"probability": 1, "value": -20}]'::jsonb,
  -12.5  -- 집에서 쉬기가 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'small';

-- 월급 (salary) - large: 이직
INSERT INTO economic_sense_test.question_scenarios (amount_range_id, situation, option_a_label, option_a_description, option_a_outcomes, option_b_label, option_b_description, option_b_outcomes, normalized_max_ev)
SELECT ar.id,
  '💻 이직 제안이 왔다',
  '현 직장 유지',
  '올해 보너스 300만원 확정',
  '[{"probability": 1, "value": 3000}]'::jsonb,
  '이직하기',
  '75% 연봉 500만원 인상, 25% 적응 실패',
  '[{"probability": 0.75, "value": 5000}, {"probability": 0.25, "value": -1000}]'::jsonb,
  3500.0  -- 이직이 EV 더 좋음
FROM amount_ranges ar
JOIN question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'large';

-- 확인용 쿼리
-- SELECT * FROM v_questions;
