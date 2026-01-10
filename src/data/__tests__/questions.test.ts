/**
 * 질문 데이터 유효성 테스트
 */
import { describe, it, expect } from 'vitest';
import { questions } from '../questions';
import { GAME_CONFIG } from '@domain/entities';

describe('Questions Data', () => {
  it('should have exactly TOTAL_ROUNDS questions', () => {
    expect(questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
  });

  it('should have unique IDs', () => {
    const ids = questions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(questions.length);
  });

  it('should have valid question structure', () => {
    questions.forEach((q, index) => {
      expect(q.id).toBe(index + 1);
      expect(q.situation).toBeTruthy();
      expect(q.optionA).toBeDefined();
      expect(q.optionB).toBeDefined();
    });
  });

  describe('Option validation', () => {
    questions.forEach((q) => {
      describe(`Question ${q.id}`, () => {
        it('should have valid optionA', () => {
          expect(q.optionA.label).toBeTruthy();
          expect(q.optionA.description).toBeTruthy();
          expect(q.optionA.outcomes.length).toBeGreaterThan(0);
        });

        it('should have valid optionB', () => {
          expect(q.optionB.label).toBeTruthy();
          expect(q.optionB.description).toBeTruthy();
          expect(q.optionB.outcomes.length).toBeGreaterThan(0);
        });

        it('optionA probabilities should sum to 1', () => {
          const sum = q.optionA.outcomes.reduce((acc, o) => acc + o.probability, 0);
          expect(sum).toBeCloseTo(1, 5);
        });

        it('optionB probabilities should sum to 1', () => {
          const sum = q.optionB.outcomes.reduce((acc, o) => acc + o.probability, 0);
          expect(sum).toBeCloseTo(1, 5);
        });

        it('all probabilities should be between 0 and 1', () => {
          [...q.optionA.outcomes, ...q.optionB.outcomes].forEach((o) => {
            expect(o.probability).toBeGreaterThanOrEqual(0);
            expect(o.probability).toBeLessThanOrEqual(1);
          });
        });
      });
    });
  });

  describe('Expected value calculations', () => {
    const calculateEV = (outcomes: { probability: number; value: number }[]): number => {
      return outcomes.reduce((sum, o) => sum + o.probability * o.value, 0);
    };

    it('each question should have at least one option with positive EV', () => {
      questions.forEach((q) => {
        const evA = calculateEV(q.optionA.outcomes);
        const evB = calculateEV(q.optionB.outcomes);
        const hasPositiveEV = evA >= 0 || evB >= 0;
        expect(hasPositiveEV).toBe(true);
      });
    });

    it('questions should have variety in which option has higher EV', () => {
      let aHigher = 0;
      let bHigher = 0;

      questions.forEach((q) => {
        const evA = calculateEV(q.optionA.outcomes);
        const evB = calculateEV(q.optionB.outcomes);
        if (evA > evB) aHigher++;
        else if (evB > evA) bHigher++;
      });

      // 한쪽으로 너무 치우치지 않아야 함
      expect(aHigher).toBeGreaterThan(0);
      expect(bHigher).toBeGreaterThan(0);
    });
  });
});
