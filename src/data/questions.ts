/**
 * 투자 시뮬레이션 질문 데이터
 *
 * 구조: 카테고리(벌기/쓰기) → 세부분류 → 금액대 → 시나리오
 * 향후 DB 마이그레이션 시 questions 테이블로 변환 가능
 */

import type { Question } from '@domain/entities';
import type { QuestionCategory } from './questionCategories';

// ============ 확장된 Question 타입 ============

export interface QuestionWithMeta extends Question {
  category: QuestionCategory;
  amountRange: string;  // "5~15만원" 형식
}

// ============ 벌기 질문 (3개) ============

const EARNING_QUESTIONS: QuestionWithMeta[] = [
  // 월급/연봉
  {
    id: 101,
    category: 'salary',
    amountRange: '10~20만원',
    situation: '💼 연봉 협상 기회!',
    optionA: {
      label: '확정 월 10만원 인상',
      description: '안전하게 +10만',
      outcomes: [{ probability: 1, value: 100_000 }],
    },
    optionB: {
      label: '성과급 도전',
      description: '60% 확률 +20만, 40% 확률 +0',
      outcomes: [
        { probability: 0.6, value: 200_000 },
        { probability: 0.4, value: 0 },
      ],
    },
  },
  // 부수입 (당근마켓)
  {
    id: 102,
    category: 'side_income',
    amountRange: '5~10만원',
    situation: '🥕 당근마켓 10만원짜리 판매 중',
    optionA: {
      label: '8만원에 바로 팔기',
      description: '20% 할인해서 오늘 끝내기',
      outcomes: [{ probability: 1, value: 80_000 }],
    },
    optionB: {
      label: '10만원 고수',
      description: '50% 팔림, 50% 결국 포기',
      outcomes: [
        { probability: 0.5, value: 100_000 },
        { probability: 0.5, value: 0 },
      ],
    },
  },
  // 투자/저축 (손실 관리)
  {
    id: 103,
    category: 'investment',
    amountRange: '30~50만원',
    situation: '📉 내 주식이 -30% 됐다...',
    optionA: {
      label: '손절하기',
      description: '지금 팔면 -30만원 확정',
      outcomes: [{ probability: 1, value: -300_000 }],
    },
    optionB: {
      label: '존버하기',
      description: '40% 확률 본전, 60% 확률 추가 -20만',
      outcomes: [
        { probability: 0.4, value: 0 },
        { probability: 0.6, value: -500_000 },
      ],
    },
  },
];

// ============ 쓰기 질문 (7개) ============

const SPENDING_QUESTIONS: QuestionWithMeta[] = [
  // 여행
  {
    id: 201,
    category: 'travel',
    amountRange: '7~15만원',
    situation: '✈️ 제주도 비행기 예약해야 해',
    optionA: {
      label: '환불가능 12만원',
      description: '일정 바뀌면 100% 환불',
      outcomes: [{ probability: 1, value: -120_000 }],
    },
    optionB: {
      label: '환불불가 7만원',
      description: '90% OK, 10% 일정변경시 재구매',
      outcomes: [
        { probability: 0.9, value: -70_000 },
        { probability: 0.1, value: -190_000 },
      ],
    },
  },
  // 식비
  {
    id: 202,
    category: 'food',
    amountRange: '0.8~2만원',
    situation: '🍜 점심 메뉴 고민 중',
    optionA: {
      label: '8천원 단골집',
      description: '맛 보장, 빠름',
      outcomes: [{ probability: 1, value: -8_000 }],
    },
    optionB: {
      label: '1.5만원 신상 맛집',
      description: '50% 대박, 50% 실망',
      outcomes: [
        { probability: 0.5, value: -10_000 },
        { probability: 0.5, value: -20_000 },
      ],
    },
  },
  // 식비 (커피)
  {
    id: 203,
    category: 'food',
    amountRange: '0~5만원',
    situation: '☕ 매일 카페 아아 vs 회사 커피',
    optionA: {
      label: '회사 커피 마시기',
      description: '무료, 맛은 그럭저럭',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '매일 카페 아아',
      description: '하루 5천원, 일주일 5만원',
      outcomes: [{ probability: 1, value: -50_000 }],
    },
  },
  // 구독
  {
    id: 204,
    category: 'subscription',
    amountRange: '0.8~3만원',
    situation: '📺 OTT 구독 고민 중',
    optionA: {
      label: '월 1만원 기본',
      description: '필요한 것만 보기',
      outcomes: [{ probability: 1, value: -10_000 }],
    },
    optionB: {
      label: '연 10만원 프리미엄',
      description: '70% 잘 봄, 30% 3개월 후 안 봄',
      outcomes: [
        { probability: 0.7, value: -8_000 },
        { probability: 0.3, value: -30_000 },
      ],
    },
  },
  // 건강/보험
  {
    id: 205,
    category: 'health',
    amountRange: '0~50만원',
    situation: '🏥 해외여행, 여행자 보험 가입할까?',
    optionA: {
      label: '가입 안 함',
      description: '3만원 아끼기',
      outcomes: [
        { probability: 0.95, value: 0 },
        { probability: 0.05, value: -500_000 },
      ],
    },
    optionB: {
      label: '3만원 가입',
      description: '만약을 대비',
      outcomes: [{ probability: 1, value: -30_000 }],
    },
  },
  // 취미 (투자성 지출)
  {
    id: 206,
    category: 'hobby',
    amountRange: '0~100만원',
    situation: '🚀 친구가 스타트업 투자 제안',
    optionA: {
      label: '정중히 거절',
      description: '우정은 우정, 돈은 돈',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '100만원 투자',
      description: '10% 확률 5배, 90% 확률 전액 손실',
      outcomes: [
        { probability: 0.1, value: 400_000 },
        { probability: 0.9, value: -1_000_000 },
      ],
    },
  },
  // 취미 (로또)
  {
    id: 207,
    category: 'hobby',
    amountRange: '0~2만원',
    situation: '🎰 편의점에서 로또 살까?',
    optionA: {
      label: '안 사기',
      description: '2만원 그냥 저축',
      outcomes: [{ probability: 1, value: 0 }],
    },
    optionB: {
      label: '2만원어치 구매',
      description: '꿈을 사는 거지!',
      outcomes: [
        { probability: 0.00000001, value: 2_000_000_000 },
        { probability: 0.99999999, value: -20_000 },
      ],
    },
  },
];

// ============ 게임에서 사용할 질문 목록 ============

/**
 * 게임에 사용되는 10개 질문
 * 순서: 쓰기/벌기 섞어서 배치
 */
export const questions: Question[] = [
  SPENDING_QUESTIONS[0],  // 1. 여행 - 비행기
  SPENDING_QUESTIONS[1],  // 2. 식비 - 점심
  EARNING_QUESTIONS[0],   // 3. 월급 - 연봉협상
  SPENDING_QUESTIONS[2],  // 4. 식비 - 커피
  SPENDING_QUESTIONS[3],  // 5. 구독 - OTT
  EARNING_QUESTIONS[1],   // 6. 부수입 - 당근
  SPENDING_QUESTIONS[4],  // 7. 건강 - 보험
  SPENDING_QUESTIONS[5],  // 8. 취미 - 스타트업
  SPENDING_QUESTIONS[6],  // 9. 취미 - 로또
  EARNING_QUESTIONS[2],   // 10. 투자 - 주식
].map((q, index) => ({
  ...q,
  id: index + 1,  // 게임용 ID는 1~10
}));

// ============ 관리용 Export ============

export const earningQuestions = EARNING_QUESTIONS;
export const spendingQuestions = SPENDING_QUESTIONS;
export const allQuestionsWithMeta = [...EARNING_QUESTIONS, ...SPENDING_QUESTIONS];

/**
 * 카테고리별 질문 조회
 */
export function getQuestionsByCategory(category: QuestionCategory): QuestionWithMeta[] {
  return allQuestionsWithMeta.filter(q => q.category === category);
}

/**
 * 타입별 질문 조회
 */
export function getQuestionsByType(type: 'earning' | 'spending'): QuestionWithMeta[] {
  return type === 'earning' ? EARNING_QUESTIONS : SPENDING_QUESTIONS;
}
