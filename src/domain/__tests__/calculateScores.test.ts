import { describe, test, expect } from 'vitest';
import { calculateScores } from '../usecases/calculateScores';
import type { AnswerChoice } from '../entities';

describe('calculateScores', () => {
  describe('위험회피 (Risk Aversion) - Q1-3', () => {
    test('모두 A 선택 시 위험회피 100%', () => {
      const answers: AnswerChoice[] = ['A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBe(100);
    });

    test('모두 B 선택 시 위험회피 0%', () => {
      const answers: AnswerChoice[] = ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBe(0);
    });

    test('혼합 선택 시 비율에 맞게 계산', () => {
      const answers: AnswerChoice[] = ['A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBeCloseTo(66.67, 1);
    });
  });

  describe('손실회피 (Loss Aversion) - Q4-6', () => {
    test('모두 B(거절) 선택 시 손실회피 100%', () => {
      const answers: AnswerChoice[] = ['A', 'A', 'A', 'B', 'B', 'B', 'A', 'A', 'A', 'A'];
      const result = calculateScores(answers);
      expect(result.lossAversion).toBe(100);
    });

    test('모두 A(참여) 선택 시 손실회피 0%', () => {
      const answers: AnswerChoice[] = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'];
      const result = calculateScores(answers);
      expect(result.lossAversion).toBe(0);
    });
  });

  describe('시간할인 (Time Discount) - Q7-8', () => {
    test('모두 A(현재) 선택 시 시간할인 100%', () => {
      const answers: AnswerChoice[] = ['B', 'B', 'B', 'B', 'B', 'B', 'A', 'A', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.timeDiscount).toBe(100);
    });

    test('모두 B(미래) 선택 시 시간할인 0%', () => {
      const answers: AnswerChoice[] = ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.timeDiscount).toBe(0);
    });
  });

  describe('확률가중 (Probability Weight) - Q9-10', () => {
    test('모두 A(낙관) 선택 시 확률가중 100%', () => {
      const answers: AnswerChoice[] = ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'A', 'A'];
      const result = calculateScores(answers);
      expect(result.probabilityWeight).toBe(100);
    });

    test('모두 B(현실) 선택 시 확률가중 0%', () => {
      const answers: AnswerChoice[] = ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.probabilityWeight).toBe(0);
    });
  });

  describe('통합 테스트', () => {
    test('모두 A 선택 시', () => {
      const answers: AnswerChoice[] = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBe(100);
      expect(result.lossAversion).toBe(0); // A는 게임 참여 = 손실회피 낮음
      expect(result.timeDiscount).toBe(100);
      expect(result.probabilityWeight).toBe(100);
    });

    test('모두 B 선택 시', () => {
      const answers: AnswerChoice[] = ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBe(0);
      expect(result.lossAversion).toBe(100); // B는 게임 거절 = 손실회피 높음
      expect(result.timeDiscount).toBe(0);
      expect(result.probabilityWeight).toBe(0);
    });

    test('교대로 선택 시 균형 잡힌 점수', () => {
      // ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']
      // Q1-3 (idx 0,1,2): A,B,A → 2/3 A = 66.67% riskAversion
      // Q4-6 (idx 3,4,5): B,A,B → 2/3 B = 66.67% lossAversion
      // Q7-8 (idx 6,7): A,B → 1/2 A = 50% timeDiscount
      // Q9-10 (idx 8,9): A,B → 1/2 A = 50% probabilityWeight
      const answers: AnswerChoice[] = ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'];
      const result = calculateScores(answers);
      expect(result.riskAversion).toBeCloseTo(66.67, 1);
      expect(result.lossAversion).toBeCloseTo(66.67, 1);
      expect(result.timeDiscount).toBe(50);
      expect(result.probabilityWeight).toBe(50);
    });
  });
});
