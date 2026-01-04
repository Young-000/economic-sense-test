import { describe, test, expect } from 'vitest';
import { questions } from '../questions';

describe('questions data', () => {
  test('정확히 10개의 질문이 있어야 함', () => {
    expect(questions).toHaveLength(10);
  });

  describe('질문 유형별 개수', () => {
    test('위험회피 질문 3개 (Q1-3)', () => {
      const riskQs = questions.filter((q) => q.type === 'risk');
      expect(riskQs).toHaveLength(3);
    });

    test('손실회피 질문 3개 (Q4-6)', () => {
      const lossQs = questions.filter((q) => q.type === 'loss');
      expect(lossQs).toHaveLength(3);
    });

    test('시간할인 질문 2개 (Q7-8)', () => {
      const timeQs = questions.filter((q) => q.type === 'time');
      expect(timeQs).toHaveLength(2);
    });

    test('확률가중 질문 2개 (Q9-10)', () => {
      const probQs = questions.filter((q) => q.type === 'probability');
      expect(probQs).toHaveLength(2);
    });
  });

  describe('질문 구조 검증', () => {
    test('각 질문은 필수 필드를 가져야 함', () => {
      questions.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('type');
        expect(q).toHaveProperty('optionA');
        expect(q).toHaveProperty('optionB');
      });
    });

    test('각 옵션은 label과 description을 가져야 함', () => {
      questions.forEach((q) => {
        expect(q.optionA).toHaveProperty('label');
        expect(q.optionA).toHaveProperty('description');
        expect(q.optionB).toHaveProperty('label');
        expect(q.optionB).toHaveProperty('description');
      });
    });

    test('질문 ID는 1부터 10까지 순차적', () => {
      const ids = questions.map((q) => q.id);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('질문 순서 검증', () => {
    test('Q1-3은 risk 타입', () => {
      expect(questions[0].type).toBe('risk');
      expect(questions[1].type).toBe('risk');
      expect(questions[2].type).toBe('risk');
    });

    test('Q4-6은 loss 타입', () => {
      expect(questions[3].type).toBe('loss');
      expect(questions[4].type).toBe('loss');
      expect(questions[5].type).toBe('loss');
    });

    test('Q7-8은 time 타입', () => {
      expect(questions[6].type).toBe('time');
      expect(questions[7].type).toBe('time');
    });

    test('Q9-10은 probability 타입', () => {
      expect(questions[8].type).toBe('probability');
      expect(questions[9].type).toBe('probability');
    });
  });
});
