/**
 * 투자 시뮬레이션 10라운드 질문
 *
 * 돈을 버는 스토리와 쓰는 스토리가 번갈아 나옴
 * - 홀수: 쓰는 스토리 (지출/소비 상황)
 * - 짝수: 버는 스토리 (수입/투자 상황)
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
      outcomes: [{ probability: 1, value: 260_000 }],
    },
    optionB: {
      label: '환불불가 저가',
      description: '90% 확률 절약, 10% 일정 변경시 손실',
      outcomes: [
        { probability: 0.9, value: 390_000 },
        { probability: 0.1, value: -510_000 },
      ],
    },
  },
  // 2. 벌기 - 보너스 수입
  {
    id: 2,
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
  // 3. 쓰기 - 식비
  {
    id: 3,
    situation: '🍜 점심 메뉴 고민 중',
    optionA: {
      label: '8천원 단골집',
      description: '맛 보장, 빠름',
      outcomes: [{ probability: 1, value: 300_000 }],
    },
    optionB: {
      label: '1.5만원 신상 맛집',
      description: '50% 대박, 50% 실망',
      outcomes: [
        { probability: 0.5, value: 600_000 },
        { probability: 0.5, value: -300_000 },
      ],
    },
  },
  // 4. 벌기 - 연봉 협상
  {
    id: 4,
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
  // 5. 쓰기 - 결제 방식
  {
    id: 5,
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
  // 6. 벌기 - 중고 판매
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
    },
  },
  // 7. 쓰기 - 복권 vs 저축
  {
    id: 7,
    situation: '🎰 월급날, 여유 자금 2만원',
    optionA: {
      label: '그냥 저축',
      description: '월 2만원 적금, 연 4%',
      outcomes: [{ probability: 1, value: 20_800 }],
    },
    optionB: {
      label: '매주 로또 5천원',
      description: '월 2만원, 1등 확률 1/800만',
      outcomes: [
        { probability: 0.0000001, value: 2_000_000_000 },
        { probability: 0.9999999, value: -20_000 },
      ],
    },
  },
  // 8. 벌기 - 투자 기회
  {
    id: 8,
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
  // 9. 쓰기 - 지인 투자
  {
    id: 9,
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
  // 10. 벌기 - 손실 관리
  {
    id: 10,
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
];
