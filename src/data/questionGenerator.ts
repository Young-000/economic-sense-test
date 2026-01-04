/**
 * 질문 생성기 - 랜덤화된 질문 생성
 *
 * 목표:
 * - 질문 순서 랜덤
 * - 숫자 랜덤화 (같은 상황, 다른 금액)
 * - 기대값 범위 통일 (-10만 ~ +10만)
 */

import type { Question, Option } from '@domain/entities';

// 랜덤 범위 내 숫자 생성 (만원 단위)
const randomAmount = (min: number, max: number): number => {
  const value = Math.floor(Math.random() * (max - min + 1) + min);
  return value * 10_000; // 만원 단위
};

// 배열 셔플
const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// 질문 템플릿 타입
interface QuestionTemplate {
  situation: string;
  category: 'investment' | 'daily' | 'career' | 'gambling';
  generate: () => { optionA: Option; optionB: Option };
}

// 질문 템플릿들
const questionTemplates: QuestionTemplate[] = [
  // === 투자 카테고리 ===
  {
    situation: '💰 보너스가 들어왔다!',
    category: 'investment',
    generate: () => {
      const safeReturn = randomAmount(5, 15); // 5~15만원
      const riskWin = randomAmount(150, 250); // 150~250만원
      const riskLose = randomAmount(80, 120); // 80~120만원 손실
      // 기대값: 50% * win - 50% * lose = 약 15~65만원 (B가 높음)
      return {
        optionA: {
          label: '적금 넣기',
          description: `확정 +${safeReturn / 10_000}만원`,
          outcomes: [{ probability: 1, value: safeReturn }],
        },
        optionB: {
          label: '주식 투자',
          description: `50%로 +${riskWin / 10_000}만, 50%로 -${riskLose / 10_000}만`,
          outcomes: [
            { probability: 0.5, value: riskWin },
            { probability: 0.5, value: -riskLose },
          ],
        },
      };
    },
  },
  {
    situation: '📈 친구가 "이거 무조건 오른다" 추천',
    category: 'investment',
    generate: () => {
      const winMultiple = randomAmount(300, 500); // 큰 수익
      const loseAmount = randomAmount(60, 100); // 손실
      const winProb = 0.15 + Math.random() * 0.1; // 15~25%
      // 기대값: ~0 근처
      return {
        optionA: {
          label: '무시하기',
          description: '내 돈은 안전하게',
          outcomes: [{ probability: 1, value: 0 }],
        },
        optionB: {
          label: '투자해보기',
          description: `${Math.round(winProb * 100)}%로 +${winMultiple / 10_000}만, ${Math.round((1 - winProb) * 100)}%로 -${loseAmount / 10_000}만`,
          outcomes: [
            { probability: winProb, value: winMultiple },
            { probability: 1 - winProb, value: -loseAmount },
          ],
        },
      };
    },
  },
  {
    situation: '📉 내 투자가 -30% 됐다...',
    category: 'investment',
    generate: () => {
      const cutLoss = randomAmount(20, 40); // 손절 금액
      const recoveryProb = 0.35 + Math.random() * 0.1; // 35~45%
      const additionalLoss = randomAmount(15, 30);
      return {
        optionA: {
          label: '손절하기',
          description: `지금 팔면 -${cutLoss / 10_000}만원 확정`,
          outcomes: [{ probability: 1, value: -cutLoss }],
        },
        optionB: {
          label: '존버하기',
          description: `${Math.round(recoveryProb * 100)}%로 본전, ${Math.round((1 - recoveryProb) * 100)}%로 추가 -${additionalLoss / 10_000}만`,
          outcomes: [
            { probability: recoveryProb, value: cutLoss },
            { probability: 1 - recoveryProb, value: -additionalLoss },
          ],
        },
      };
    },
  },

  // === 일상 카테고리 ===
  {
    situation: '🍜 점심 메뉴 고민 중',
    category: 'daily',
    generate: () => {
      const happyBonus = randomAmount(3, 7);
      const disappointment = randomAmount(5, 10);
      return {
        optionA: {
          label: '단골집 가기',
          description: '맛 보장, 기대값 0',
          outcomes: [{ probability: 1, value: 0 }],
        },
        optionB: {
          label: '신상 맛집 도전',
          description: `50%로 대만족 +${happyBonus / 10_000}만, 50%로 실망 -${disappointment / 10_000}만`,
          outcomes: [
            { probability: 0.5, value: happyBonus },
            { probability: 0.5, value: -disappointment },
          ],
        },
      };
    },
  },
  {
    situation: '🥕 중고거래 판매 중',
    category: 'daily',
    generate: () => {
      const quickSale = randomAmount(6, 10);
      const fullPrice = randomAmount(10, 15);
      const lateSale = randomAmount(5, 8);
      const sellProb = 0.55 + Math.random() * 0.1; // 55~65%
      return {
        optionA: {
          label: '할인해서 바로 팔기',
          description: `확정 +${quickSale / 10_000}만원`,
          outcomes: [{ probability: 1, value: quickSale }],
        },
        optionB: {
          label: '제값 고수',
          description: `${Math.round(sellProb * 100)}%로 +${fullPrice / 10_000}만, ${Math.round((1 - sellProb) * 100)}%로 +${lateSale / 10_000}만`,
          outcomes: [
            { probability: sellProb, value: fullPrice },
            { probability: 1 - sellProb, value: lateSale },
          ],
        },
      };
    },
  },
  {
    situation: '✈️ 비행기 예약해야 해',
    category: 'daily',
    generate: () => {
      const refundPenalty = randomAmount(2, 5);
      const savings = randomAmount(4, 8);
      const cancelLoss = randomAmount(6, 12);
      const okProb = 0.85 + Math.random() * 0.1; // 85~95%
      return {
        optionA: {
          label: '환불가능 티켓',
          description: `안전하게 -${refundPenalty / 10_000}만원 더 지출`,
          outcomes: [{ probability: 1, value: -refundPenalty }],
        },
        optionB: {
          label: '환불불가 저가',
          description: `${Math.round(okProb * 100)}%로 +${savings / 10_000}만 절약, ${Math.round((1 - okProb) * 100)}%로 -${cancelLoss / 10_000}만 날림`,
          outcomes: [
            { probability: okProb, value: savings },
            { probability: 1 - okProb, value: -cancelLoss },
          ],
        },
      };
    },
  },

  // === 커리어 카테고리 ===
  {
    situation: '💼 연봉 협상 기회!',
    category: 'career',
    generate: () => {
      const safeBump = randomAmount(20, 40);
      const bigBump = randomAmount(50, 80);
      const successProb = 0.6 + Math.random() * 0.15; // 60~75%
      return {
        optionA: {
          label: '확정 인상',
          description: `안전하게 +${safeBump / 10_000}만원`,
          outcomes: [{ probability: 1, value: safeBump }],
        },
        optionB: {
          label: '성과급 도전',
          description: `${Math.round(successProb * 100)}%로 +${bigBump / 10_000}만, ${Math.round((1 - successProb) * 100)}%로 +0`,
          outcomes: [
            { probability: successProb, value: bigBump },
            { probability: 1 - successProb, value: 0 },
          ],
        },
      };
    },
  },
  {
    situation: '🚀 친구 스타트업 투자 제안',
    category: 'career',
    generate: () => {
      const investment = randomAmount(30, 70);
      const returnMultiple = randomAmount(200, 400);
      const successProb = 0.08 + Math.random() * 0.07; // 8~15%
      return {
        optionA: {
          label: '정중히 거절',
          description: '우정은 우정, 돈은 돈',
          outcomes: [{ probability: 1, value: 0 }],
        },
        optionB: {
          label: `${investment / 10_000}만원 투자`,
          description: `${Math.round(successProb * 100)}%로 +${returnMultiple / 10_000}만, ${Math.round((1 - successProb) * 100)}%로 전액 손실`,
          outcomes: [
            { probability: successProb, value: returnMultiple },
            { probability: 1 - successProb, value: -investment },
          ],
        },
      };
    },
  },

  // === 도박/복권 카테고리 ===
  {
    situation: '🎰 로또 vs 저축',
    category: 'gambling',
    generate: () => {
      const lottoSpend = randomAmount(1, 3);
      const jackpot = randomAmount(500, 1000);
      const jackpotProb = 0.005 + Math.random() * 0.01; // 0.5~1.5%
      const savingsReturn = randomAmount(1, 3);
      return {
        optionA: {
          label: '로또 사기',
          description: `${(jackpotProb * 100).toFixed(1)}%로 +${jackpot / 10_000}만, 나머지 -${lottoSpend / 10_000}만`,
          outcomes: [
            { probability: jackpotProb, value: jackpot },
            { probability: 1 - jackpotProb, value: -lottoSpend },
          ],
        },
        optionB: {
          label: '그냥 저축',
          description: `확정 +${savingsReturn / 10_000}만원`,
          outcomes: [{ probability: 1, value: savingsReturn }],
        },
      };
    },
  },
  {
    situation: '🎲 내기 제안 받음',
    category: 'gambling',
    generate: () => {
      const winAmount = randomAmount(8, 15);
      const loseAmount = randomAmount(5, 10);
      const winProb = 0.45 + Math.random() * 0.1; // 45~55%
      return {
        optionA: {
          label: '거절',
          description: '리스크 없이 0원',
          outcomes: [{ probability: 1, value: 0 }],
        },
        optionB: {
          label: '승부!',
          description: `${Math.round(winProb * 100)}%로 +${winAmount / 10_000}만, ${Math.round((1 - winProb) * 100)}%로 -${loseAmount / 10_000}만`,
          outcomes: [
            { probability: winProb, value: winAmount },
            { probability: 1 - winProb, value: -loseAmount },
          ],
        },
      };
    },
  },
  {
    situation: '🛒 할인쿠폰 vs 포인트 적립',
    category: 'daily',
    generate: () => {
      const instantDiscount = randomAmount(2, 5);
      const pointsMax = randomAmount(8, 15);
      const pointsMin = randomAmount(1, 3);
      const maxProb = 0.25 + Math.random() * 0.15; // 25~40%
      return {
        optionA: {
          label: '즉시 할인',
          description: `확정 +${instantDiscount / 10_000}만원 절약`,
          outcomes: [{ probability: 1, value: instantDiscount }],
        },
        optionB: {
          label: '포인트 적립',
          description: `${Math.round(maxProb * 100)}%로 +${pointsMax / 10_000}만, ${Math.round((1 - maxProb) * 100)}%로 +${pointsMin / 10_000}만`,
          outcomes: [
            { probability: maxProb, value: pointsMax },
            { probability: 1 - maxProb, value: pointsMin },
          ],
        },
      };
    },
  },
  {
    situation: '🏠 월세 vs 전세',
    category: 'investment',
    generate: () => {
      const monthlyCost = randomAmount(3, 8);
      const depositReturn = randomAmount(10, 20);
      const depositLoss = randomAmount(5, 15);
      const safeProb = 0.8 + Math.random() * 0.1; // 80~90%
      return {
        optionA: {
          label: '월세 유지',
          description: `확정 -${monthlyCost / 10_000}만원/월`,
          outcomes: [{ probability: 1, value: -monthlyCost }],
        },
        optionB: {
          label: '전세 전환',
          description: `${Math.round(safeProb * 100)}%로 +${depositReturn / 10_000}만, ${Math.round((1 - safeProb) * 100)}%로 -${depositLoss / 10_000}만`,
          outcomes: [
            { probability: safeProb, value: depositReturn },
            { probability: 1 - safeProb, value: -depositLoss },
          ],
        },
      };
    },
  },
];

/**
 * 랜덤화된 10개 질문 생성
 */
export function generateQuestions(): Question[] {
  // 템플릿 셔플
  const shuffled = shuffle(questionTemplates);

  // 10개 선택 후 질문 생성
  return shuffled.slice(0, 10).map((template, index) => {
    const { optionA, optionB } = template.generate();
    return {
      id: index + 1,
      situation: template.situation,
      optionA,
      optionB,
    };
  });
}
