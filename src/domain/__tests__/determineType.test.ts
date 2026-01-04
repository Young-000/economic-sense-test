import { describe, test, expect } from 'vitest';
import { determineType } from '../usecases/determineType';
import type { Scores } from '../entities';

describe('determineType', () => {
  describe('극단적 케이스', () => {
    test('모든 점수 높음 → CSPO', () => {
      const scores: Scores = {
        riskAversion: 100,
        lossAversion: 100,
        timeDiscount: 100,
        probabilityWeight: 100,
      };
      expect(determineType(scores)).toBe('CSPO');
    });

    test('모든 점수 낮음 → RTFL', () => {
      const scores: Scores = {
        riskAversion: 0,
        lossAversion: 0,
        timeDiscount: 0,
        probabilityWeight: 0,
      };
      expect(determineType(scores)).toBe('RTFL');
    });
  });

  describe('경계값 테스트 (threshold = 50)', () => {
    test('모든 점수 50 → CSPO (경계는 높음으로 판정)', () => {
      const scores: Scores = {
        riskAversion: 50,
        lossAversion: 50,
        timeDiscount: 50,
        probabilityWeight: 50,
      };
      expect(determineType(scores)).toBe('CSPO');
    });

    test('모든 점수 49 → RTFL', () => {
      const scores: Scores = {
        riskAversion: 49,
        lossAversion: 49,
        timeDiscount: 49,
        probabilityWeight: 49,
      };
      expect(determineType(scores)).toBe('RTFL');
    });
  });

  describe('16가지 유형 전체 테스트', () => {
    const testCases: [Scores, string][] = [
      // C (high risk aversion) + S (high loss aversion)
      [{ riskAversion: 80, lossAversion: 80, timeDiscount: 80, probabilityWeight: 80 }, 'CSPO'],
      [{ riskAversion: 80, lossAversion: 80, timeDiscount: 80, probabilityWeight: 20 }, 'CSPL'],
      [{ riskAversion: 80, lossAversion: 80, timeDiscount: 20, probabilityWeight: 80 }, 'CSFO'],
      [{ riskAversion: 80, lossAversion: 80, timeDiscount: 20, probabilityWeight: 20 }, 'CSFL'],

      // C (high risk aversion) + T (low loss aversion)
      [{ riskAversion: 80, lossAversion: 20, timeDiscount: 80, probabilityWeight: 80 }, 'CTPO'],
      [{ riskAversion: 80, lossAversion: 20, timeDiscount: 80, probabilityWeight: 20 }, 'CTPL'],
      [{ riskAversion: 80, lossAversion: 20, timeDiscount: 20, probabilityWeight: 80 }, 'CTFO'],
      [{ riskAversion: 80, lossAversion: 20, timeDiscount: 20, probabilityWeight: 20 }, 'CTFL'],

      // R (low risk aversion) + S (high loss aversion)
      [{ riskAversion: 20, lossAversion: 80, timeDiscount: 80, probabilityWeight: 80 }, 'RSPO'],
      [{ riskAversion: 20, lossAversion: 80, timeDiscount: 80, probabilityWeight: 20 }, 'RSPL'],
      [{ riskAversion: 20, lossAversion: 80, timeDiscount: 20, probabilityWeight: 80 }, 'RSFO'],
      [{ riskAversion: 20, lossAversion: 80, timeDiscount: 20, probabilityWeight: 20 }, 'RSFL'],

      // R (low risk aversion) + T (low loss aversion)
      [{ riskAversion: 20, lossAversion: 20, timeDiscount: 80, probabilityWeight: 80 }, 'RTPO'],
      [{ riskAversion: 20, lossAversion: 20, timeDiscount: 80, probabilityWeight: 20 }, 'RTPL'],
      [{ riskAversion: 20, lossAversion: 20, timeDiscount: 20, probabilityWeight: 80 }, 'RTFO'],
      [{ riskAversion: 20, lossAversion: 20, timeDiscount: 20, probabilityWeight: 20 }, 'RTFL'],
    ];

    test.each(testCases)('scores %o → type %s', (scores, expected) => {
      expect(determineType(scores)).toBe(expected);
    });
  });

  describe('유형 코드 구조 검증', () => {
    test('결과는 항상 4글자', () => {
      const scores: Scores = {
        riskAversion: 50,
        lossAversion: 50,
        timeDiscount: 50,
        probabilityWeight: 50,
      };
      const result = determineType(scores);
      expect(result).toHaveLength(4);
    });

    test('첫 글자는 C 또는 R', () => {
      const scoresHigh: Scores = { riskAversion: 80, lossAversion: 50, timeDiscount: 50, probabilityWeight: 50 };
      const scoresLow: Scores = { riskAversion: 20, lossAversion: 50, timeDiscount: 50, probabilityWeight: 50 };
      expect(determineType(scoresHigh)[0]).toBe('C');
      expect(determineType(scoresLow)[0]).toBe('R');
    });

    test('두번째 글자는 S 또는 T', () => {
      const scoresHigh: Scores = { riskAversion: 50, lossAversion: 80, timeDiscount: 50, probabilityWeight: 50 };
      const scoresLow: Scores = { riskAversion: 50, lossAversion: 20, timeDiscount: 50, probabilityWeight: 50 };
      expect(determineType(scoresHigh)[1]).toBe('S');
      expect(determineType(scoresLow)[1]).toBe('T');
    });

    test('세번째 글자는 P 또는 F', () => {
      const scoresHigh: Scores = { riskAversion: 50, lossAversion: 50, timeDiscount: 80, probabilityWeight: 50 };
      const scoresLow: Scores = { riskAversion: 50, lossAversion: 50, timeDiscount: 20, probabilityWeight: 50 };
      expect(determineType(scoresHigh)[2]).toBe('P');
      expect(determineType(scoresLow)[2]).toBe('F');
    });

    test('네번째 글자는 O 또는 L', () => {
      const scoresHigh: Scores = { riskAversion: 50, lossAversion: 50, timeDiscount: 50, probabilityWeight: 80 };
      const scoresLow: Scores = { riskAversion: 50, lossAversion: 50, timeDiscount: 50, probabilityWeight: 20 };
      expect(determineType(scoresHigh)[3]).toBe('O');
      expect(determineType(scoresLow)[3]).toBe('L');
    });
  });
});
