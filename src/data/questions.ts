/**
 * 투자 시뮬레이션 10라운드 질문
 *
 * 각 질문은 현실적인 상황 + 확률/수익 구조
 * - 일부는 안전 옵션이 기대값 높음 (합리성 테스트)
 * - 일부는 위험 옵션이 기대값 높음 (합리적 공격 테스트)
 */

import type { Question } from '@domain/entities';

export const questions: Question[] = [
  {
    id: 1,
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
      // 기대값: +500,000 (B가 더 높음 - 합리적 공격)
    },
  },
  {
    id: 2,
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
      // 기대값: +160,000 (B가 살짝 높음)
    },
  },
  {
    id: 3,
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
        { probability: 0.4, value: 300_000 },   // 본전 회복
        { probability: 0.6, value: -200_000 },  // 추가 하락
      ],
      // 기대값: 0 (A가 -30만원이니 B가 나음)
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
      description: '50% 대박, 50% 실망 (-7천원 손해 느낌)',
      outcomes: [
        { probability: 0.5, value: 50_000 },    // 맛집 발견 행복
        { probability: 0.5, value: -70_000 },   // 비싸고 별로
      ],
      // 기대값: -10,000 (A가 나음 - 보수 합리)
    },
  },
  {
    id: 5,
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
      // 기대값: +420,000 (B가 높음 - 합리적 공격)
    },
  },
  {
    id: 6,
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
      // 기대값: +88,000 (B가 살짝 높음)
    },
  },
  {
    id: 7,
    situation: '✈️ 제주도 비행기 예약',
    optionA: {
      label: '환불가능 12만원',
      description: '일정 바뀌면 100% 환불',
      outcomes: [{ probability: 1, value: -20_000 }],  // 5만원 더 비쌈
    },
    optionB: {
      label: '환불불가 7만원',
      description: '90% 확률 OK, 10% 일정 변경시 날림',
      outcomes: [
        { probability: 0.9, value: 50_000 },   // 5만원 절약
        { probability: 0.1, value: -70_000 },  // 7만원 날림
      ],
      // 기대값: +38,000 (B가 높음)
    },
  },
  {
    id: 8,
    situation: '🎰 로또 vs 저축',
    optionA: {
      label: '매주 로또 5천원',
      description: '월 2만원, 1등 확률 1/800만',
      outcomes: [
        { probability: 0.0000001, value: 20_000_000_00 },  // 20억
        { probability: 0.9999999, value: -20_000 },
      ],
      // 기대값: 약 0 (실제론 마이너스)
    },
    optionB: {
      label: '그냥 저축',
      description: '월 2만원 적금, 연 4%',
      outcomes: [{ probability: 1, value: 20_800 }],
      // 기대값: +20,800 (B가 나음)
    },
  },
  {
    id: 9,
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
      // 동일 기대값 - 선호도 테스트
    },
  },
  {
    id: 10,
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
        { probability: 0.1, value: 45_000_000 },  // 10배 (5000만-500만)
        { probability: 0.9, value: -5_000_000 },
      ],
      // 기대값: 0 (고위험 고수익)
    },
  },
];
