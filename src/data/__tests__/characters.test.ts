import { describe, test, expect } from 'vitest';
import { characters, getCharacter } from '../characters';

const ALL_CODES = [
  'CSPO', 'CSPL', 'CSFO', 'CSFL',
  'CTPO', 'CTPL', 'CTFO', 'CTFL',
  'RSPO', 'RSPL', 'RSFO', 'RSFL',
  'RTPO', 'RTPL', 'RTFO', 'RTFL',
] as const;

describe('characters data', () => {
  test('정확히 16가지 캐릭터 유형이 있어야 함', () => {
    expect(Object.keys(characters)).toHaveLength(16);
  });

  test('모든 MBTI 스타일 코드가 존재해야 함', () => {
    ALL_CODES.forEach((code) => {
      expect(characters[code]).toBeDefined();
    });
  });

  describe('캐릭터 구조 검증', () => {
    test('각 캐릭터는 필수 필드를 가져야 함', () => {
      Object.values(characters).forEach((char) => {
        expect(char).toHaveProperty('code');
        expect(char).toHaveProperty('name');
        expect(char).toHaveProperty('description');
        expect(char).toHaveProperty('strengths');
        expect(char).toHaveProperty('weaknesses');
        expect(char).toHaveProperty('advice');
      });
    });

    test('strengths와 weaknesses는 배열이어야 함', () => {
      Object.values(characters).forEach((char) => {
        expect(Array.isArray(char.strengths)).toBe(true);
        expect(Array.isArray(char.weaknesses)).toBe(true);
      });
    });

    test('모든 필드는 비어있지 않아야 함', () => {
      Object.values(characters).forEach((char) => {
        expect(char.name.length).toBeGreaterThan(0);
        expect(char.description.length).toBeGreaterThan(0);
        expect(char.advice.length).toBeGreaterThan(0);
        expect(char.strengths.length).toBeGreaterThan(0);
        expect(char.weaknesses.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getCharacter 함수', () => {
    test('유효한 코드로 캐릭터를 가져올 수 있어야 함', () => {
      const char = getCharacter('CSPO');
      expect(char).toBeDefined();
      expect(char.code).toBe('CSPO');
    });

    test('모든 코드에 대해 캐릭터를 가져올 수 있어야 함', () => {
      ALL_CODES.forEach((code) => {
        const char = getCharacter(code);
        expect(char.code).toBe(code);
      });
    });
  });
});
