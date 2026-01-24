-- =============================================
-- 질문 시나리오 데이터 수정
-- Schema: economic_sense_test
-- 문제: 정규화된 양수 값(0.8, 1.2 등)이 천원 단위로 해석됨
-- 해결: 올바른 천원 단위 값으로 교체 (소비=-값, 수익=+값)
-- =============================================

-- 1. 기존 시나리오 삭제
DELETE FROM economic_sense_test.question_scenarios;

-- 2. 올바른 데이터 삽입 (003_realistic_scenarios.sql 기반)
-- ========================================
-- 소비 시나리오 (SPENDING) - EV가 음수
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
  -8.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -92.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  0.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'hobby' AND ar.size = 'medium';

-- 건강 (health) - large: 차량 정비
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
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'health' AND ar.size = 'large';

-- ========================================
-- 수익 시나리오 (INCOME) - EV가 양수
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
  300.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  2800.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  82.5
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  1540.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  230.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  250.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  160.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  4.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  100.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  30.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -100.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  0.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -725.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -1000.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -13.6
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -115.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  -12.5
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
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
  3500.0
FROM economic_sense_test.amount_ranges ar
JOIN economic_sense_test.question_categories c ON ar.category_id = c.id
WHERE c.code = 'salary' AND ar.size = 'large';

-- ========================================
-- 004_additional_scenarios.sql 추가 시나리오
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

-- 3. 확인 쿼리
SELECT COUNT(*) as total_scenarios FROM economic_sense_test.question_scenarios;
