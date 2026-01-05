/**
 * 투자 시뮬레이션 10라운드 질문
 *
 * 쓰기 7개 / 벌기 3개 구성
 * 최적 선택 시 총 기대수익: 약 +50만원 (범위: -100 ~ +100만원)
 */

import type { Question } from '@domain/entities';

export const questions: Question[] = [
  // 1. 쓰기 - 여행 경비
  {
    id: 1,
    situation: '✈️ 제주도 비행기 예약해야 해',
    optionA: {
      label: '환불가능 티켓',
      description: '일정 바뀌면 100% 환불',
      outcomes: [{ probability: 1, value: 50_000 }],
      // 기대값: +5만
    },
    optionB: {
      label: '환불불가 저가',
      description: '90% 확률 절약, 10% 일정 변경시 손실',
      outcomes: [
        { probability: 0.9, value: 150_000 },
        { probability: 0.1, value: -500_000 },
      ],
      // 기대값: +8.5만
    },
  },
  // 2. 쓰기 - 식비
  {
    id: 2,
    situation: '🍜 점심 메뉴 고민 중',
    optionA: {
      label: '8천원 단골집',
      description: '맛 보장, 빠름',
      outcomes: [{ probability: 1, value: 30_000 }],
      // 기대값: +3만
    },
    optionB: {
      label: '1.5만원 신상 맛집',
      description: '50% 대박, 50% 실망',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: -80_000 },
      ],
      // 기대값: +1만
    },
  },
  // 3. 벌기 - 연봉 협상
  {
    id: 3,
    situation: '💼 연봉 협상 기회!',
    optionA: {
      label: '확정 200만원 인상',
      description: '안전하게 연봉 +200',
      outcomes: [{ probability: 1, value: 200_000 }],
      // 기대값: +20만
    },
    optionB: {
      label: '성과급 도전',
      description: '60% 확률 +400, 40% 확률 +0',
      outcomes: [
        { probability: 0.6, value: 400_000 },
        { probability: 0.4, value: 0 },
      ],
      // 기대값: +24만
    },
  },
  // 4. 쓰기 - 결제 방식
  {
    id: 4,
    situation: '🛒 100만원 결제해야 해',
    optionA: {
      label: '일시불',
      description: '포인트 1만원',
      outcomes: [{ probability: 1, value: 10_000 }],
      // 기대값: +1만
    },
    optionB: {
      label: '12개월 할부',
      description: '포인트 3만원, 수수료 2만원',
      outcomes: [{ probability: 1, value: 10_000 }],
      // 기대값: +1만
    },
  },
  // 5. 쓰기 - 구독 서비스
  {
    id: 5,
    situation: '📺 OTT 구독 고민 중',
    optionA: {
      label: '월 1만원 기본',
      description: '필요한 것만 보기',
      outcomes: [{ probability: 1, value: 20_000 }],
      // 기대값: +2만
    },
    optionB: {
      label: '연 10만원 프리미엄',
      description: '70% 확률 본전, 30% 확률 안 봄',
      outcomes: [
        { probability: 0.7, value: 50_000 },
        { probability: 0.3, value: -50_000 },
      ],
      // 기대값: +2만
    },
  },
  // 6. 벌기 - 중고 판매
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
      description: '50% 확률 제값, 50% 확률 안 팔림',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: 0 },
      ],
      // 기대값: +5만
    },
  },
  // 7. 쓰기 - 보험
  {
    id: 7,
    situation: '🏥 여행자 보험 가입할까?',
    optionA: {
      label: '가입 안 함',
      description: '보험료 아끼기',
      outcomes: [
        { probability: 0.95, value: 30_000 },
        { probability: 0.05, value: -500_000 },
      ],
      // 기대값: +0.35만
    },
    optionB: {
      label: '3만원 가입',
      description: '만약을 대비',
      outcomes: [{ probability: 1, value: 0 }],
      // 기대값: 0
    },
  },
  // 8. 쓰기 - 투자 제안
  {
    id: 8,
    situation: '🚀 스타트업 친구가 투자 제안',
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
        { probability: 0.1, value: 4_000_000 },
        { probability: 0.9, value: -1_000_000 },
      ],
      // 기대값: -50만
    },
  },
  // 9. 쓰기 - 로또
  {
    id: 9,
    situation: '🎰 월급날, 여유 자금 2만원',
    optionA: {
      label: '그냥 저축',
      description: '월 2만원 적금',
      outcomes: [{ probability: 1, value: 20_000 }],
      // 기대값: +2만
    },
    optionB: {
      label: '로또 구매',
      description: '꿈을 사는 거지!',
      outcomes: [
        { probability: 0.0000001, value: 2_000_000_000 },
        { probability: 0.9999999, value: -20_000 },
      ],
      // 기대값: ~0
    },
  },
  // 10. 벌기 - 손실 관리
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
      description: '40% 확률 본전, 60% 확률 추가 하락',
      outcomes: [
        { probability: 0.4, value: 300_000 },
        { probability: 0.6, value: -200_000 },
      ],
      // 기대값: 0
    },
  },
];
