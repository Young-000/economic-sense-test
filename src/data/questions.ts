/**
 * 투자 시뮬레이션 질문 풀
 *
 * 다양한 금액대의 현실적인 상황 + 확률/수익 구조
 * - 소액 (1천~5만원): 일상 소비 결정
 * - 중소액 (5만~30만원): 취미/생활 구매
 * - 중액 (30만~200만원): 보너스/월급 활용
 * - 고액 (200만~1000만원): 큰 투자 결정
 * - 초고액 (1000만원+): 인생을 바꾸는 결정
 */

import type { Question } from '@domain/entities';

export const questions: Question[] = [
  // ===== 소액 (1천~5만원) - 일상 소비 =====
  {
    id: 1,
    situation: '☕ 카페에서 3천원짜리 아메리카노 vs 6천원 신메뉴',
    optionA: {
      label: '익숙한 아메리카노',
      description: '맛 보장, 실패 없음',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '신메뉴 도전',
      description: '60% 대만족, 40% 별로',
      outcomes: [
        { probability: 0.6, value: 10_000 },
        { probability: 0.4, value: -30_000 },
      ],
    },
  },
  {
    id: 2,
    situation: '🎫 영화 티켓 할인권 발견! 1.5만원짜리가 5천원',
    optionA: {
      label: '일단 구매',
      description: '80% 확률로 볼 영화 있음',
      outcomes: [
        { probability: 0.8, value: 10_000 },
        { probability: 0.2, value: -5_000 },
      ],
    },
    optionB: {
      label: '필요할 때 사기',
      description: '확실한 건 없지만 손해도 없음',
      outcomes: [{ probability: 1, value: 0 }],
    },
  },
  {
    id: 3,
    situation: '🍕 배달앱 쿠폰 3천원! 최소주문 2만원',
    optionA: {
      label: '1.5만원 메뉴에 쿠폰 포기',
      description: '필요한 만큼만',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '2만원 맞춰서 주문',
      description: '쿠폰 쓰면 실질 1.7만원',
      outcomes: [
        { probability: 0.7, value: 3_000 },
        { probability: 0.3, value: -20_000 },
      ],
    },
  },
  {
    id: 4,
    situation: '🍜 점심 메뉴 고민 중',
    optionA: {
      label: '8천원 단골집',
      description: '맛 보장, 빠름',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '1.5만원 신상 맛집',
      description: '50% 대박, 50% 실망',
      outcomes: [
        { probability: 0.5, value: 50_000 },
        { probability: 0.5, value: -70_000 },
      ],
    },
  },

  // ===== 중소액 (5만~30만원) - 취미/생활 =====
  {
    id: 5,
    situation: '🎮 게임 할인 행사! 6만원 → 3만원 (한정 판매)',
    optionA: {
      label: '지금 당장 구매',
      description: '3만원에 확보',
      outcomes: [
        { probability: 0.6, value: 30_000 },
        { probability: 0.4, value: -30_000 },
      ],
    },
    optionB: {
      label: '더 싸질 때까지 기다리기',
      description: '30% 확률로 1만원까지 할인',
      outcomes: [
        { probability: 0.3, value: 50_000 },
        { probability: 0.7, value: -10_000 },
      ],
    },
  },
  {
    id: 6,
    situation: '👟 운동화 세일! 15만원 → 10만원 (내일까지)',
    optionA: {
      label: '고민 중... 패스',
      description: '지금 있는 거 더 신으면 됨',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '질러버리기',
      description: '평소 20만원짜리',
      outcomes: [
        { probability: 0.75, value: 100_000 },
        { probability: 0.25, value: -100_000 },
      ],
    },
  },
  {
    id: 7,
    situation: '🥕 당근마켓 10만원짜리 판매 중',
    optionA: {
      label: '8만원에 바로 팔기',
      description: '20% 할인해서 오늘 끝내기',
      outcomes: [{ probability: 1, value: 80_000 }],
    },
    optionB: {
      label: '10만원 고수',
      description: '60% 확률 제값, 40% 확률 한달 후 7만원',
      outcomes: [
        { probability: 0.6, value: 100_000 },
        { probability: 0.4, value: 70_000 },
      ],
    },
  },
  {
    id: 8,
    situation: '✈️ 제주도 비행기 예약',
    optionA: {
      label: '환불가능 12만원',
      description: '일정 바뀌면 100% 환불',
      outcomes: [{ probability: 1, value: -20_000 }],
    },
    optionB: {
      label: '환불불가 7만원',
      description: '90% 확률 OK, 10% 일정 변경시 날림',
      outcomes: [
        { probability: 0.9, value: 50_000 },
        { probability: 0.1, value: -70_000 },
      ],
    },
  },

  // ===== 중액 (30만~200만원) - 보너스/월급 =====
  {
    id: 9,
    situation: '💰 보너스 200만원이 들어왔다!',
    optionA: {
      label: '적금 넣기',
      description: '연 4% 이자 (1년 후 +8만원 확정)',
      outcomes: [{ probability: 1, value: 80_000 }],
    },
    optionB: {
      label: '주식 투자',
      description: '50% 확률로 2배, 50% 확률로 반토막',
      outcomes: [
        { probability: 0.5, value: 2_000_000 },
        { probability: 0.5, value: -1_000_000 },
      ],
    },
  },
  {
    id: 10,
    situation: '💼 연봉 협상 기회!',
    optionA: {
      label: '확정 300만원 인상',
      description: '안전하게 연봉 +300',
      outcomes: [{ probability: 1, value: 300_000 }],
    },
    optionB: {
      label: '성과급 도전',
      description: '70% 확률 +600, 30% 확률 +0',
      outcomes: [
        { probability: 0.7, value: 600_000 },
        { probability: 0.3, value: 0 },
      ],
    },
  },
  {
    id: 11,
    situation: '📈 친구가 "이 코인 무조건 오른다" 추천',
    optionA: {
      label: '무시하기',
      description: '내 돈은 안전하게',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '100만원 투자',
      description: '20% 확률로 5배, 80% 확률로 -80%',
      outcomes: [
        { probability: 0.2, value: 4_000_000 },
        { probability: 0.8, value: -800_000 },
      ],
    },
  },
  {
    id: 12,
    situation: '📉 내 주식이 -30% 됐다...',
    optionA: {
      label: '손절하기',
      description: '지금 팔면 -30만원 확정 손실',
      outcomes: [{ probability: 1, value: -300_000 }],
    },
    optionB: {
      label: '존버하기',
      description: '40% 확률 본전, 60% 확률 -50%',
      outcomes: [
        { probability: 0.4, value: 300_000 },
        { probability: 0.6, value: -200_000 },
      ],
    },
  },
  {
    id: 13,
    situation: '🛒 100만원 결제해야 해',
    optionA: {
      label: '일시불',
      description: '포인트 1만원, 당장 지출',
      outcomes: [{ probability: 1, value: 10_000 }],
    },
    optionB: {
      label: '12개월 할부',
      description: '포인트 3만원, 수수료 2만원',
      outcomes: [{ probability: 1, value: 10_000 }],
    },
  },

  // ===== 고액 (200만~1000만원) - 큰 투자 =====
  {
    id: 14,
    situation: '🚗 중고차 300만원 vs 새 차 500만원',
    optionA: {
      label: '중고차 구매',
      description: '200만원 절약, 20% 확률 수리비 150만원',
      outcomes: [
        { probability: 0.8, value: 2_000_000 },
        { probability: 0.2, value: 500_000 },
      ],
    },
    optionB: {
      label: '새 차 구매',
      description: '200만원 더 들지만 안심',
      outcomes: [{ probability: 1, value: 0 }],
    },
  },
  {
    id: 15,
    situation: '🏠 전세 vs 월세 선택 (보증금 차이 500만원)',
    optionA: {
      label: '전세 보증금 추가',
      description: '월 50만원 절약 (연 600만원)',
      outcomes: [{ probability: 1, value: 600_000 }],
    },
    optionB: {
      label: '월세로 가볍게',
      description: '500만원 여유자금으로 투자',
      outcomes: [
        { probability: 0.5, value: 1_000_000 },
        { probability: 0.5, value: -250_000 },
      ],
    },
  },
  {
    id: 16,
    situation: '🚀 스타트업 친구가 투자 제안',
    optionA: {
      label: '정중히 거절',
      description: '우정은 우정, 돈은 돈',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '500만원 투자',
      description: '10% 확률 10배, 90% 확률 전액 손실',
      outcomes: [
        { probability: 0.1, value: 45_000_000 },
        { probability: 0.9, value: -5_000_000 },
      ],
    },
  },
  {
    id: 17,
    situation: '💎 금 1000만원어치 vs ETF 투자',
    optionA: {
      label: '금 매수',
      description: '안전자산, 연 5% 기대',
      outcomes: [
        { probability: 0.7, value: 500_000 },
        { probability: 0.3, value: -200_000 },
      ],
    },
    optionB: {
      label: 'ETF 투자',
      description: '연 10% 기대, 변동성 높음',
      outcomes: [
        { probability: 0.6, value: 1_000_000 },
        { probability: 0.4, value: -500_000 },
      ],
    },
  },

  // ===== 초고액 (1000만원+) - 인생을 바꾸는 결정 =====
  {
    id: 18,
    situation: '🎰 로또 vs 저축',
    optionA: {
      label: '매주 로또 5천원',
      description: '월 2만원, 1등 확률 1/814만',
      outcomes: [
        { probability: 0.00000012, value: 1_000_000_000 },
        { probability: 0.99999988, value: -20_000 },
      ],
    },
    optionB: {
      label: '그냥 저축',
      description: '월 2만원 적금, 연 4%',
      outcomes: [{ probability: 1, value: 20_000 }],
    },
  },
  {
    id: 19,
    situation: '🏢 퇴직금 3000만원 운용',
    optionA: {
      label: '안전하게 예금',
      description: '연 4% 이자 (120만원)',
      outcomes: [{ probability: 1, value: 1_200_000 }],
    },
    optionB: {
      label: '부동산 펀드 투자',
      description: '65% 확률 연 15%, 35% 확률 -10%',
      outcomes: [
        { probability: 0.65, value: 4_500_000 },
        { probability: 0.35, value: -3_000_000 },
      ],
    },
  },
  {
    id: 20,
    situation: '🏡 아파트 청약 당첨! 계약금 2000만원 필요',
    optionA: {
      label: '계약 진행',
      description: '시세차익 5000만원 예상, 10% 확률 하락',
      outcomes: [
        { probability: 0.9, value: 50_000_000 },
        { probability: 0.1, value: -20_000_000 },
      ],
    },
    optionB: {
      label: '포기하고 다음 기회',
      description: '2000만원 묶이지 않음',
      outcomes: [{ probability: 1, value: 0 }],
    },
  },
  {
    id: 21,
    situation: '📊 비트코인 5000만원 보유 중, -20% 하락',
    optionA: {
      label: '전량 매도',
      description: '1000만원 손실 확정',
      outcomes: [{ probability: 1, value: -10_000_000 }],
    },
    optionB: {
      label: '추가 매수 (물타기)',
      description: '60% 확률 본전 회복, 40% 확률 -30%',
      outcomes: [
        { probability: 0.6, value: 10_000_000 },
        { probability: 0.4, value: -15_000_000 },
      ],
      // 기대값: 6,000,000 - 6,000,000 = 0 (손절보다 나음)
    },
  },
  {
    id: 22,
    situation: '💼 이직 제안! 연봉 1500만원 상승 vs 현 직장',
    optionA: {
      label: '현 직장 유지',
      description: '안정적, 승진 기회 80%',
      outcomes: [
        { probability: 0.8, value: 5_000_000 },
        { probability: 0.2, value: 0 },
      ],
    },
    optionB: {
      label: '이직하기',
      description: '연봉 상승, 70% 적응 성공',
      outcomes: [
        { probability: 0.7, value: 15_000_000 },
        { probability: 0.3, value: -5_000_000 },
      ],
    },
  },
  {
    id: 23,
    situation: '🎓 대학원 진학 vs 취업 (등록금 2년 4000만원)',
    optionA: {
      label: '취업하기',
      description: '바로 월급 300만원 시작',
      outcomes: [{ probability: 1, value: 7_200_000 }],
    },
    optionB: {
      label: '대학원 진학',
      description: '졸업 후 연봉 1000만원 상승 기대',
      outcomes: [
        { probability: 0.7, value: 10_000_000 },
        { probability: 0.3, value: -20_000_000 },
      ],
    },
  },
  {
    id: 24,
    situation: '🏪 카페 창업 기회! 초기 자본 8000만원',
    optionA: {
      label: '창업 포기',
      description: '안전하게 직장 유지',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '창업 도전',
      description: '40% 확률 연 순익 3000만원, 60% 폐업',
      outcomes: [
        { probability: 0.4, value: 30_000_000 },
        { probability: 0.6, value: -50_000_000 },
      ],
    },
  },
  {
    id: 25,
    situation: '🎁 상속 1억원! 어떻게 할까?',
    optionA: {
      label: '안전하게 분산투자',
      description: '예금+채권+주식 (연 6% 기대)',
      outcomes: [
        { probability: 0.8, value: 6_000_000 },
        { probability: 0.2, value: 2_000_000 },
      ],
    },
    optionB: {
      label: '부동산 원룸 매입',
      description: '월세 수익 + 시세차익',
      outcomes: [
        { probability: 0.6, value: 15_000_000 },
        { probability: 0.4, value: -10_000_000 },
      ],
    },
  },
];
