/**
 * 배열 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import { shuffle } from '../arrayUtils';

describe('arrayUtils', () => {
  describe('shuffle', () => {
    it('should return a new array (not mutate original)', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      const result = shuffle(original);

      expect(original).toEqual(originalCopy);
      expect(result).not.toBe(original);
    });

    it('should maintain the same length', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = shuffle(arr);

      expect(result).toHaveLength(arr.length);
    });

    it('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffle(arr);

      arr.forEach((item) => {
        expect(result).toContain(item);
      });
    });

    it('should handle empty array', () => {
      const result = shuffle([]);
      expect(result).toEqual([]);
    });

    it('should handle single element array', () => {
      const result = shuffle([42]);
      expect(result).toEqual([42]);
    });

    it('should handle array with duplicate values', () => {
      const arr = [1, 1, 2, 2, 3, 3];
      const result = shuffle(arr);

      expect(result).toHaveLength(6);
      expect(result.filter((v) => v === 1)).toHaveLength(2);
      expect(result.filter((v) => v === 2)).toHaveLength(2);
      expect(result.filter((v) => v === 3)).toHaveLength(2);
    });

    it('should work with different types', () => {
      const strings = ['a', 'b', 'c'];
      const result = shuffle(strings);

      expect(result).toHaveLength(3);
      expect(result).toContain('a');
      expect(result).toContain('b');
      expect(result).toContain('c');
    });

    it('should produce different orders over many iterations (statistical test)', () => {
      const arr = [1, 2, 3, 4, 5];
      const results = new Set<string>();

      // 100번 셔플해서 다양한 결과가 나오는지 확인
      for (let i = 0; i < 100; i++) {
        results.add(shuffle(arr).join(','));
      }

      // 최소 5가지 이상의 다른 순서가 나와야 함 (5! = 120 가능)
      expect(results.size).toBeGreaterThan(5);
    });
  });
});
