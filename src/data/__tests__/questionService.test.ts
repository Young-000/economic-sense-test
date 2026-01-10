/**
 * 질문 서비스 테스트 - Supabase DB 연동
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Supabase 모킹
const { mockFrom, mockSupabase, mockIsConfigured } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return {
    mockFrom,
    mockSupabase: { from: mockFrom },
    mockIsConfigured: { value: true },
  };
});

vi.mock('@lib/supabase', () => ({
  supabase: mockSupabase,
  get isSupabaseConfigured() {
    return mockIsConfigured.value;
  },
}));

// arrayUtils 모킹
vi.mock('@lib/arrayUtils', () => ({
  shuffle: vi.fn((arr) => arr), // 셔플하지 않고 그대로 반환
}));

import { fetchQuestionsFromDB, getQuestionCount } from '../questionService';

describe('questionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsConfigured.value = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchQuestionsFromDB', () => {
    // DB 값은 천원 단위 (value: 100 = 10만원)
    const mockDBRow = {
      id: 1,
      situation: '테스트 상황',
      option_a_label: '안전한 선택',
      option_a_description: '확정 수익',
      option_a_outcomes: [{ probability: 1, value: 100 }], // 10만원
      option_b_label: '위험한 선택',
      option_b_description: '50%로 수익 또는 손실',
      option_b_outcomes: [
        { probability: 0.5, value: 200 },   // 20만원
        { probability: 0.5, value: -50 },   // -5만원
      ],
      normalized_max_ev: 100,
      is_active: true,
      amount_ranges: {
        size: 'medium',
        min_amount: 50000,
        max_amount: 500000,
        typical_amount: 200000,
        label_ko: '중간 금액',
        question_categories: {
          type: 'spending',
          code: 'daily',
          name_ko: '일상',
          emoji: '☕',
        },
      },
    };

    it('should return null when Supabase is not configured', async () => {
      mockIsConfigured.value = false;

      const result = await fetchQuestionsFromDB();

      expect(result).toBeNull();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('should return questions when DB query succeeds', async () => {
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        ...mockDBRow,
        id: i + 1,
        situation: `테스트 상황 ${i + 1}`,
      }));

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).not.toBeNull();
      expect(result).toHaveLength(10); // 10개만 선택
      expect(mockFrom).toHaveBeenCalledWith('question_scenarios');
    });

    it('should return null when DB query returns error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB Error' },
          }),
        }),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchQuestionsFromDB();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should return null when no data found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await fetchQuestionsFromDB();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should return null when data is null', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).toBeNull();
    });

    it('should correctly convert DB scenario to Question', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [mockDBRow],
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).not.toBeNull();
      expect(result![0]).toHaveProperty('id');
      expect(result![0]).toHaveProperty('situation', '테스트 상황');
      expect(result![0]).toHaveProperty('optionA');
      expect(result![0]).toHaveProperty('optionB');
      expect(result![0].optionA.label).toBe('안전한 선택');
      expect(result![0].optionB.label).toBe('위험한 선택');
    });

    it('should convert values from 천원 to 원 (multiply by 1000)', async () => {
      // DB 값: 100 천원 → 원: 100 * 1000 = 100,000원
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [mockDBRow],
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).not.toBeNull();
      // optionA의 확정값은 100 * 1000 = 100,000원
      expect(result![0].optionA.outcomes[0].value).toBe(100000);
      // optionB의 첫 번째 결과는 200 * 1000 = 200,000원
      expect(result![0].optionB.outcomes[0].value).toBe(200000);
      // optionB의 두 번째 결과는 -50 * 1000 = -50,000원
      expect(result![0].optionB.outcomes[1].value).toBe(-50000);
    });

    it('should handle exceptions gracefully', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Network error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchQuestionsFromDB();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should update description for single outcome (확정)', async () => {
      const singleOutcomeRow = {
        ...mockDBRow,
        option_a_outcomes: [{ probability: 1, value: 100 }], // 10만원
      };

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [singleOutcomeRow],
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).not.toBeNull();
      // 확정 금액이므로 "확정 +10만원" 형식
      expect(result![0].optionA.description).toContain('확정');
    });

    it('should update description for double outcomes (확률)', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [mockDBRow],
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).not.toBeNull();
      // 두 개 결과가 있으므로 확률 형식
      expect(result![0].optionB.description).toMatch(/\d+%로.*\d+%로/);
    });

    it('should not change description for zero value outcome', async () => {
      const zeroValueRow = {
        ...mockDBRow,
        option_a_outcomes: [{ probability: 1, value: 0 }],
        option_b_outcomes: [{ probability: 1, value: 100 }], // 10만원
      };

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [zeroValueRow],
            error: null,
          }),
        }),
      });

      const result = await fetchQuestionsFromDB();

      expect(result).not.toBeNull();
      // 0원인 경우 원래 description 유지
      expect(result![0].optionA.description).toBe('확정 수익');
    });
  });

  describe('getQuestionCount', () => {
    it('should return 0 when Supabase is not configured', async () => {
      mockIsConfigured.value = false;

      const count = await getQuestionCount();

      expect(count).toBe(0);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('should return count when query succeeds', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 25,
            error: null,
          }),
        }),
      });

      const count = await getQuestionCount();

      expect(count).toBe(25);
    });

    it('should return 0 when query returns error', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: null,
            error: { message: 'DB Error' },
          }),
        }),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const count = await getQuestionCount();

      expect(count).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should return 0 when count is null', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: null,
            error: null,
          }),
        }),
      });

      const count = await getQuestionCount();

      expect(count).toBe(0);
    });

    it('should handle exceptions and return 0', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Network error');
      });

      const count = await getQuestionCount();

      expect(count).toBe(0);
    });
  });
});
