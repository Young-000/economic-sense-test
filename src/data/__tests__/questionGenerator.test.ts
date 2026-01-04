/**
 * 질문 생성기 테스트
 */
import { describe, it, expect } from 'vitest';
import { generateQuestions } from '../questionGenerator';
import { GAME_CONFIG } from '@domain/entities';

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
    // (우연히 같을 수도 있으므로 여러 번 생성해서 하나라도 다르면 통과)
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

  it('should generate questions with randomized amounts', () => {
    const questions1 = generateQuestions();
    const questions2 = generateQuestions();

    // 같은 상황이라도 금액이 다를 수 있음
    // 모든 금액이 정확히 같을 확률은 매우 낮음
    let foundDifferentAmount = false;

    for (let i = 0; i < Math.min(questions1.length, questions2.length); i++) {
      const q1 = questions1[i];
      const q2 = questions2[i];

      const amounts1 = q1.optionA.outcomes.map(o => o.value).concat(q1.optionB.outcomes.map(o => o.value));
      const amounts2 = q2.optionA.outcomes.map(o => o.value).concat(q2.optionB.outcomes.map(o => o.value));

      if (JSON.stringify(amounts1) !== JSON.stringify(amounts2)) {
        foundDifferentAmount = true;
        break;
      }
    }

    expect(foundDifferentAmount).toBe(true);
  });

  it('should have reasonable expected value range', () => {
    const questions = generateQuestions();

    questions.forEach(q => {
      const evA = q.optionA.outcomes.reduce((sum, o) => sum + o.probability * o.value, 0);
      const evB = q.optionB.outcomes.reduce((sum, o) => sum + o.probability * o.value, 0);

      // 기대값이 너무 극단적이지 않아야 함 (-500만 ~ +500만 범위)
      expect(Math.abs(evA)).toBeLessThan(5_000_000);
      expect(Math.abs(evB)).toBeLessThan(5_000_000);
    });
  });
});
