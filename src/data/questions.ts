/**
 * 투자 시뮬레이션 10라운드 질문
 *
 * 쓰기 7개 / 벌기 3개 구성
 * 쓰기: 마이너스 (지출), 벌기: 플러스 (수입)
 * 최적 선택 시 총 기대수익: 약 +10만원
 */

import type { Question } from '@domain/entities';

export const questions: Question[] = [
  // 1. 쓰기 - 여행 경비 (7~15만원 규모)
  {
    id: 1,
    situation: '✈️ 제주도 비행기 예약해야 해',
    optionA: {
      label: '환불가능 12만원',
      description: '일정 바뀌면 100% 환불',
      outcomes: [{ probability: 1, value: -120_000 }],
      // 기대값: -12만
    },
    optionB: {
      label: '환불불가 7만원',
      description: '90% OK, 10% 일정변경시 재구매 필요',
      outcomes: [
        { probability: 0.9, value: -70_000 },
        { probability: 0.1, value: -190_000 }, // 7만 날림 + 12만 재구매
      ],
      // 기대값: -8.2만 (B가 나음)
    },
  },
  // 2. 쓰기 - 식비 (0.8~1.5만원 규모)
  {
    id: 2,
    situation: '🍜 점심 메뉴 고민 중',
    optionA: {
      label: '8천원 단골집',
      description: '맛 보장, 빠름',
      outcomes: [{ probability: 1, value: -8_000 }],
      // 기대값: -0.8만
    },
    optionB: {
      label: '1.5만원 신상 맛집',
      description: '50% 대박, 50% 실망',
      outcomes: [
        { probability: 0.5, value: -10_000 }, // 맛있으면 가성비 좋음
        { probability: 0.5, value: -20_000 }, // 별로면 손해 느낌
      ],
      // 기대값: -1.5만 (A가 나음)
    },
  },
  // 3. 벌기 - 연봉 협상 (10~20만원 규모)
  {
    id: 3,
    situation: '💼 연봉 협상 기회!',
    optionA: {
      label: '확정 월 10만원 인상',
      description: '안전하게 +10만',
      outcomes: [{ probability: 1, value: 100_000 }],
      // 기대값: +10만
    },
    optionB: {
      label: '성과급 도전',
      description: '60% 확률 +20만, 40% 확률 +0',
      outcomes: [
        { probability: 0.6, value: 200_000 },
        { probability: 0.4, value: 0 },
      ],
      // 기대값: +12만 (B가 나음)
    },
  },
  // 4. 쓰기 - 커피 습관 (0.5만원 규모)
  {
    id: 4,
    situation: '☕ 매일 카페 아아 vs 회사 커피',
    optionA: {
      label: '회사 커피 마시기',
      description: '무료, 맛은 그럭저럭',
      outcomes: [{ probability: 1, value: 0 }],
      // 기대값: 0
    },
    optionB: {
      label: '매일 카페 아아',
      description: '하루 5천원, 한 달 15만원',
      outcomes: [{ probability: 1, value: -50_000 }], // 일주일치
      // 기대값: -5만 (A가 나음)
    },
  },
  // 5. 쓰기 - 구독 서비스 (1~1.5만원/월 규모)
  {
    id: 5,
    situation: '📺 OTT 구독 고민 중',
    optionA: {
      label: '월 1만원 기본',
      description: '필요한 것만 보기',
      outcomes: [{ probability: 1, value: -10_000 }],
      // 기대값: -1만
    },
    optionB: {
      label: '연 10만원 프리미엄',
      description: '70% 잘 봄, 30% 3개월 후 안 봄',
      outcomes: [
        { probability: 0.7, value: -8_000 }, // 월 8,333원 가치
        { probability: 0.3, value: -30_000 }, // 안 보면 손해
      ],
      // 기대값: -1.46만 (A가 나음)
    },
  },
  // 6. 벌기 - 중고 판매 (7~10만원 규모)
  {
    id: 6,
    situation: '🥕 당근마켓 10만원짜리 판매 중',
    optionA: {
      label: '8만원에 바로 팔기',
      description: '20% 할인해서 오늘 끝내기',
      outcomes: [{ probability: 1, value: 80_000 }],
      // 기대값: +8만
    },
    optionB: {
      label: '10만원 고수',
      description: '50% 팔림, 50% 결국 포기',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: 0 },
      ],
      // 기대값: +5만 (A가 나음)
    },
  },
  // 7. 쓰기 - 보험 (3만원 규모)
  {
    id: 7,
    situation: '🏥 해외여행, 여행자 보험 가입할까?',
    optionA: {
      label: '가입 안 함',
      description: '3만원 아끼기',
      outcomes: [
        { probability: 0.95, value: 0 },
        { probability: 0.05, value: -500_000 }, // 사고시 자부담
      ],
      // 기대값: -2.5만
    },
    optionB: {
      label: '3만원 가입',
      description: '만약을 대비',
      outcomes: [{ probability: 1, value: -30_000 }],
      // 기대값: -3만 (A가 살짝 나음, but 리스크)
    },
  },
  // 8. 쓰기 - 투자 제안 (100만원 규모)
  {
    id: 8,
    situation: '🚀 친구가 스타트업 투자 제안',
    optionA: {
      label: '정중히 거절',
      description: '우정은 우정, 돈은 돈',
      outcomes: [{ probability: 1, value: 0 }],
      // 기대값: 0
    },
    optionB: {
      label: '100만원 투자',
      description: '10% 확률 5배, 90% 확률 전액 손실',
      outcomes: [
        { probability: 0.1, value: 400_000 }, // 5배 = +400만 수익
        { probability: 0.9, value: -1_000_000 },
      ],
      // 기대값: -86만 (A가 훨씬 나음)
    },
  },
  // 9. 쓰기 - 로또 (2만원 규모)
  {
    id: 9,
    situation: '🎰 편의점에서 로또 살까?',
    optionA: {
      label: '안 사기',
      description: '2만원 그냥 저축',
      outcomes: [{ probability: 1, value: 0 }],
      // 기대값: 0
    },
    optionB: {
      label: '2만원어치 구매',
      description: '꿈을 사는 거지!',
      outcomes: [
        { probability: 0.00000001, value: 2_000_000_000 },
        { probability: 0.99999999, value: -20_000 },
      ],
      // 기대값: -2만 (A가 나음)
    },
  },
  // 10. 벌기 - 손실 관리 (30만원 규모)
  {
    id: 10,
    situation: '📉 내 주식이 -30% 됐다...',
    optionA: {
      label: '손절하기',
      description: '지금 팔면 -30만원 확정',
      outcomes: [{ probability: 1, value: -300_000 }],
      // 기대값: -30만
    },
    optionB: {
      label: '존버하기',
      description: '40% 확률 본전, 60% 확률 추가 -20만',
      outcomes: [
        { probability: 0.4, value: 0 }, // 본전 회복
        { probability: 0.6, value: -500_000 }, // 추가 하락
      ],
      // 기대값: -30만 (동일하지만 리스크 다름)
    },
  },
];
