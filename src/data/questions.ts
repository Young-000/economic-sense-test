import type { Question } from '@domain/entities';

/**
 * 경제감각 테스트 10개 질문
 *
 * Q1-3: 위험회피 측정 (확실 vs 도박)
 * Q4-6: 손실회피 측정 (게임 참여 vs 거절)
 * Q7-8: 시간할인 측정 (현재 vs 미래)
 * Q9-10: 확률가중 측정 (낮은확률 대박 vs 확실)
 */
export const questions: Question[] = [
  // === 위험회피 측정 (Q1-3) ===
  {
    id: 1,
    type: 'risk',
    optionA: {
      label: '확정 5만원',
      description: '지금 바로 5만원을 받습니다',
    },
    optionB: {
      label: '50% 확률로 10만원',
      description: '동전 던지기로 앞면이 나오면 10만원, 뒷면이면 0원',
    },
  },
  {
    id: 2,
    type: 'risk',
    optionA: {
      label: '확정 3만원',
      description: '지금 바로 3만원을 받습니다',
    },
    optionB: {
      label: '50% 확률로 10만원',
      description: '동전 던지기로 앞면이 나오면 10만원, 뒷면이면 0원',
    },
  },
  {
    id: 3,
    type: 'risk',
    optionA: {
      label: '확정 7만원',
      description: '지금 바로 7만원을 받습니다',
    },
    optionB: {
      label: '50% 확률로 10만원',
      description: '동전 던지기로 앞면이 나오면 10만원, 뒷면이면 0원',
    },
  },

  // === 손실회피 측정 (Q4-6) ===
  {
    id: 4,
    type: 'loss',
    optionA: {
      label: '게임 참여',
      description: '50% 확률로 3만원을 얻거나, 50% 확률로 1만원을 잃습니다',
    },
    optionB: {
      label: '게임 안 함',
      description: '아무것도 하지 않고 현재 상태를 유지합니다',
    },
  },
  {
    id: 5,
    type: 'loss',
    optionA: {
      label: '게임 참여',
      description: '50% 확률로 2만원을 얻거나, 50% 확률로 1만원을 잃습니다',
    },
    optionB: {
      label: '게임 안 함',
      description: '아무것도 하지 않고 현재 상태를 유지합니다',
    },
  },
  {
    id: 6,
    type: 'loss',
    optionA: {
      label: '게임 참여',
      description: '50% 확률로 4만원을 얻거나, 50% 확률로 2만원을 잃습니다',
    },
    optionB: {
      label: '게임 안 함',
      description: '아무것도 하지 않고 현재 상태를 유지합니다',
    },
  },

  // === 시간할인 측정 (Q7-8) ===
  {
    id: 7,
    type: 'time',
    optionA: {
      label: '오늘 10만원',
      description: '지금 바로 10만원을 받습니다',
    },
    optionB: {
      label: '1년 후 11만원',
      description: '1년을 기다리면 11만원을 받습니다 (10% 수익)',
    },
  },
  {
    id: 8,
    type: 'time',
    optionA: {
      label: '오늘 10만원',
      description: '지금 바로 10만원을 받습니다',
    },
    optionB: {
      label: '1년 후 15만원',
      description: '1년을 기다리면 15만원을 받습니다 (50% 수익)',
    },
  },

  // === 확률가중 측정 (Q9-10) ===
  {
    id: 9,
    type: 'probability',
    optionA: {
      label: '1% 확률로 300만원',
      description: '로또처럼 1%의 낮은 확률이지만 당첨되면 300만원',
    },
    optionB: {
      label: '확정 5만원',
      description: '확실하게 5만원을 받습니다',
    },
  },
  {
    id: 10,
    type: 'probability',
    optionA: {
      label: '90% 확률로 10만원',
      description: '높은 확률로 10만원을 받지만, 10% 확률로 0원',
    },
    optionB: {
      label: '확정 8만원',
      description: '확실하게 8만원을 받습니다',
    },
  },
];
