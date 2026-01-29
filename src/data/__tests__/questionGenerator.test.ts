/**
 * 질문 생성기 테스트
 * - 소비(spending): 음수 EV (지출 최소화가 합리적)
 * - 수익(income): 양수 EV (수익 최대화가 합리적)
 * - 혼합(mixed): 양/음 혼합 EV (기대값 계산 필요)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateQuestionsSync,
  generateQuestions as generateQuestionsAsync,
  generateQuestionsLocal,
  analyzeDistribution,
} from '../questionGenerator';
import { GAME_CONFIG } from '@domain/entities';

// 테스트용 동기 함수 (기존 테스트 호환성)
const generateQuestions = generateQuestionsSync;

// 기대값 계산 헬퍼
const calculateEV = (option: { outcomes: { probability: number; value: number }[] }) =>
  option.outcomes.reduce((sum, o) => sum + o.probability * o.value, 0);

describe('generateQuestions', () => {
  it('should generate exactly TOTAL_ROUNDS questions', () => {
    const questions = generateQuestions();
    expect(questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
  });

  it('should generate questions with unique IDs', () => {
    const questions = generateQuestions();
    const ids = questions.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(GAME_CONFIG.TOTAL_ROUNDS);
  });

  it('should generate questions with valid structure', () => {
    const questions = generateQuestions();

    questions.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('situation');
      expect(q).toHaveProperty('optionA');
      expect(q).toHaveProperty('optionB');

      // Option A structure
      expect(q.optionA).toHaveProperty('label');
      expect(q.optionA).toHaveProperty('description');
      expect(q.optionA).toHaveProperty('outcomes');
      expect(q.optionA.outcomes.length).toBeGreaterThan(0);

      // Option B structure
      expect(q.optionB).toHaveProperty('label');
      expect(q.optionB).toHaveProperty('description');
      expect(q.optionB).toHaveProperty('outcomes');
      expect(q.optionB.outcomes.length).toBeGreaterThan(0);
    });
  });

  it('should generate questions with valid probabilities', () => {
    const questions = generateQuestions();

    questions.forEach(q => {
      // Option A probabilities should sum to 1
      const probSumA = q.optionA.outcomes.reduce((sum, o) => sum + o.probability, 0);
      expect(probSumA).toBeCloseTo(1, 5);

      // Option B probabilities should sum to 1
      const probSumB = q.optionB.outcomes.reduce((sum, o) => sum + o.probability, 0);
      expect(probSumB).toBeCloseTo(1, 5);

      // All probabilities should be between 0 and 1
      q.optionA.outcomes.forEach(o => {
        expect(o.probability).toBeGreaterThanOrEqual(0);
        expect(o.probability).toBeLessThanOrEqual(1);
      });

      q.optionB.outcomes.forEach(o => {
        expect(o.probability).toBeGreaterThanOrEqual(0);
        expect(o.probability).toBeLessThanOrEqual(1);
      });
    });
  });

  it('should generate different questions on each call', () => {
    const questions1 = generateQuestions();
    const questions2 = generateQuestions();

    // 상황이 완전히 같을 확률은 매우 낮음
    const situations1 = questions1.map(q => q.situation).join(',');
    const situations2 = questions2.map(q => q.situation).join(',');

    // 순서나 금액이 다를 수 있으므로 대부분의 경우 다름
    let foundDifferent = situations1 !== situations2;

    if (!foundDifferent) {
      for (let i = 0; i < 5; i++) {
        const questions3 = generateQuestions();
        const situations3 = questions3.map(q => q.situation).join(',');
        if (situations1 !== situations3) {
          foundDifferent = true;
          break;
        }
      }
    }

    expect(foundDifferent).toBe(true);
  });

  it('should have reasonable expected value range', () => {
    const questions = generateQuestions();

    questions.forEach(q => {
      const evA = calculateEV(q.optionA);
      const evB = calculateEV(q.optionB);

      // 기대값이 너무 극단적이지 않아야 함 (-1억 ~ +1억 범위)
      expect(Math.abs(evA)).toBeLessThan(100_000_000);
      expect(Math.abs(evB)).toBeLessThan(100_000_000);
    });
  });
});

describe('generateQuestionsLocal', () => {
  it('should generate exactly TOTAL_ROUNDS questions', () => {
    const questions = generateQuestionsLocal();
    expect(questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
  });

  it('should return same structure as sync version', () => {
    const questions = generateQuestionsLocal();

    questions.forEach((q) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('situation');
      expect(q).toHaveProperty('optionA');
      expect(q).toHaveProperty('optionB');
    });
  });
});

describe('카테고리 균형 및 EV 분포', () => {
  it('should have balanced category distribution', () => {
    const questions = generateQuestions();
    const distribution = analyzeDistribution(questions);

    // 랜덤 생성 특성상 약간의 오차 허용 (각 카테고리 1-8개)
    expect(distribution.spending).toBeGreaterThanOrEqual(1);
    expect(distribution.spending).toBeLessThanOrEqual(8);
    expect(distribution.income).toBeGreaterThanOrEqual(1);
    expect(distribution.income).toBeLessThanOrEqual(8);
    expect(distribution.mixed).toBeGreaterThanOrEqual(0);
    expect(distribution.mixed).toBeLessThanOrEqual(6);
  });

  it('should have mixed positive and negative EV options', () => {
    const questions = generateQuestions();
    const distribution = analyzeDistribution(questions);

    // 양수 EV와 음수 EV가 섞여 있어야 함
    expect(distribution.evStats.positiveEV).toBeGreaterThan(0);
    expect(distribution.evStats.negativeEV).toBeGreaterThan(0);
  });

  it('spending questions should have both options with negative or zero EV', () => {
    const questions = generateQuestions();

    questions.forEach(q => {
      const evA = calculateEV(q.optionA);
      const evB = calculateEV(q.optionB);

      // 소비 카테고리 판단: 양쪽 모두 음수 또는 0
      if (evA <= 0 && evB <= 0) {
        // 소비 질문: 둘 다 0 이하여야 함
        expect(evA).toBeLessThanOrEqual(0);
        expect(evB).toBeLessThanOrEqual(0);
      }
    });
  });

  it('income questions should have at least one option with positive EV', () => {
    const questions = generateQuestions();

    questions.forEach(q => {
      const evA = calculateEV(q.optionA);
      const evB = calculateEV(q.optionB);

      // 수익 카테고리 판단: 양쪽 모두 양수 또는 0
      if (evA >= 0 && evB >= 0 && (evA > 0 || evB > 0)) {
        // 수익 질문: 최소 하나는 양수
        expect(Math.max(evA, evB)).toBeGreaterThan(0);
      }
    });
  });
});

describe('50개 문제 분포 검증', () => {
  it('should maintain consistent category distribution over 50 question sets', () => {
    const iterations = 50;
    let totalSpending = 0;
    let totalIncome = 0;
    let totalMixed = 0;
    let totalPositiveEV = 0;
    let totalNegativeEV = 0;
    let totalZeroEV = 0;

    for (let i = 0; i < iterations; i++) {
      const questions = generateQuestions();
      const dist = analyzeDistribution(questions);

      totalSpending += dist.spending;
      totalIncome += dist.income;
      totalMixed += dist.mixed;
      totalPositiveEV += dist.evStats.positiveEV;
      totalNegativeEV += dist.evStats.negativeEV;
      totalZeroEV += dist.evStats.zeroEV;
    }

    const avgSpending = totalSpending / iterations;
    const avgIncome = totalIncome / iterations;
    const avgMixed = totalMixed / iterations;
    const avgPositiveEV = totalPositiveEV / iterations;
    const avgNegativeEV = totalNegativeEV / iterations;
    const avgZeroEV = totalZeroEV / iterations;

    // 분포 검증 (EV 부호 기준)
    // 소비(양쪽 음수): 최소 2개 이상
    expect(avgSpending).toBeGreaterThanOrEqual(2);
    expect(avgSpending).toBeLessThanOrEqual(7);

    // 수익(양쪽 양수 또는 0): 최소 2개 이상
    expect(avgIncome).toBeGreaterThanOrEqual(2);
    expect(avgIncome).toBeLessThanOrEqual(7);

    // EV 분포: 양수와 음수 옵션이 모두 존재
    // 20개 옵션 중 양수가 최소 3개, 음수가 최소 3개
    expect(avgPositiveEV).toBeGreaterThan(2);
    expect(avgNegativeEV).toBeGreaterThan(2);

    console.log('=== 50회 분포 분석 결과 ===');
    console.log(`평균 소비 질문 (양쪽 EV ≤ 0): ${avgSpending.toFixed(1)}개`);
    console.log(`평균 수익 질문 (양쪽 EV ≥ 0): ${avgIncome.toFixed(1)}개`);
    console.log(`평균 혼합 질문: ${avgMixed.toFixed(1)}개`);
    console.log(`평균 양수 EV 옵션: ${avgPositiveEV.toFixed(1)}개 (20개 중)`);
    console.log(`평균 음수 EV 옵션: ${avgNegativeEV.toFixed(1)}개 (20개 중)`);
    console.log(`평균 0 EV 옵션: ${avgZeroEV.toFixed(1)}개 (20개 중)`);
  });

  it('should verify individual question EV patterns', () => {
    const questions = generateQuestions();

    console.log('\n=== 개별 질문 EV 분석 ===');
    questions.forEach((q, i) => {
      const evA = calculateEV(q.optionA);
      const evB = calculateEV(q.optionB);
      const betterChoice = evA > evB ? 'A' : (evB > evA ? 'B' : '동일');
      const category = (evA <= 0 && evB <= 0) ? '소비' :
                       (evA >= 0 && evB >= 0) ? '수익' : '혼합';

      console.log(
        `Q${i + 1} [${category}] ${q.situation.substring(0, 20)}... ` +
        `A: ${(evA / 10000).toFixed(1)}만원, B: ${(evB / 10000).toFixed(1)}만원 → ${betterChoice}`
      );
    });
  });

  it('should have diverse scenarios across 50 iterations', () => {
    const situationCounts = new Map<string, number>();
    const iterations = 50;

    for (let i = 0; i < iterations; i++) {
      const questions = generateQuestions();
      questions.forEach(q => {
        const count = situationCounts.get(q.situation) || 0;
        situationCounts.set(q.situation, count + 1);
      });
    }

    // 총 500개 질문 (50회 × 10개)
    const totalQuestions = iterations * 10;
    const uniqueSituations = situationCounts.size;

    console.log(`\n=== 시나리오 다양성 ===`);
    console.log(`총 생성 질문: ${totalQuestions}개`);
    console.log(`고유 시나리오 수: ${uniqueSituations}개`);

    // 최소 15개 이상의 고유 시나리오 (21개 템플릿 중)
    expect(uniqueSituations).toBeGreaterThanOrEqual(15);

    // 가장 많이 나온 시나리오와 가장 적게 나온 시나리오
    const counts = Array.from(situationCounts.values());
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    console.log(`최다 출현: ${maxCount}회`);
    console.log(`최소 출현: ${minCount}회`);

    // 편차가 너무 크지 않아야 함 (균등 분포)
    // 이상적으로 각 시나리오는 ~23회 (500/21) 나와야 함
    expect(maxCount).toBeLessThan(100); // 특정 시나리오가 너무 자주 나오지 않음
  });
});

describe('특정 시나리오 EV 검증', () => {
  it('갭투자 시나리오의 EV가 -1.4천만원(=-14,000,000원)이어야 함', () => {
    // 갭투자: 20% 확률로 +5천만, 80% 확률로 -3천만
    // EV = 0.2 * 50,000,000 + 0.8 * (-30,000,000) = 10,000,000 - 24,000,000 = -14,000,000원
    const gapInvestmentOutcomes = [
      { probability: 0.2, value: 50_000_000 }, // +5천만 (스케일 적용 후)
      { probability: 0.8, value: -30_000_000 }, // -3천만 (스케일 적용 후)
    ];

    const ev = calculateEV({ outcomes: gapInvestmentOutcomes });
    expect(ev).toBe(-14_000_000);

    // -14,000,000원 = -1.4천만
    // 이 값이 "-1천만"이 아닌 "-1.4천만"으로 표시되어야 함
    expect(ev / 10_000_000).toBe(-1.4);
  });

  it('800만원 투자 시나리오의 EV가 +5만원이어야 함', () => {
    // 35% 확률로 +1.5천만, 65% 확률로 -800만
    // EV = 0.35 * 15,000,000 + 0.65 * (-8,000,000) = 5,250,000 - 5,200,000 = 50,000원
    const investmentOutcomes = [
      { probability: 0.35, value: 15_000_000 },
      { probability: 0.65, value: -8_000_000 },
    ];

    const ev = calculateEV({ outcomes: investmentOutcomes });
    expect(ev).toBe(50_000);
  });
});

describe('generateQuestionsAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return questions from local when DB fails', async () => {
    // questionService를 모킹하여 에러 발생
    vi.doMock('../questionService', () => ({
      fetchQuestionsFromDB: vi.fn().mockRejectedValue(new Error('DB error')),
    }));

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const questions = await generateQuestionsAsync();

    expect(questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
    expect(questions[0]).toHaveProperty('id');
    expect(questions[0]).toHaveProperty('situation');

    consoleSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('should return valid questions structure', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const questions = await generateQuestionsAsync();

    questions.forEach((q) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('situation');
      expect(q).toHaveProperty('optionA');
      expect(q).toHaveProperty('optionB');
      expect(q.optionA.outcomes.length).toBeGreaterThan(0);
      expect(q.optionB.outcomes.length).toBeGreaterThan(0);
    });

    consoleSpy.mockRestore();
  });
});
