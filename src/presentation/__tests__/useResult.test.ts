import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResult } from '../hooks/useResult';

describe('useResult hook', () => {
  test('답변에서 점수와 유형을 계산함', () => {
    // 모든 A 선택: riskAversion 100, lossAversion 0, timeDiscount 100, probabilityWeight 100
    const answers = 'AAAAAAAAAA';
    const { result } = renderHook(() => useResult(answers));

    expect(result.current.scores).toBeDefined();
    expect(result.current.characterCode).toBeDefined();
    expect(result.current.character).toBeDefined();
  });

  test('CSPO 유형이 올바르게 계산됨', () => {
    // C: risk 높음 (AAA), S: loss 높음 (BBB), P: time 높음 (AA), O: prob 높음 (AA)
    // Q1-3: AAA (risk 100%), Q4-6: BBB (loss 100%), Q7-8: AA (time 100%), Q9-10: AA (prob 100%)
    const answers = 'AAABBBAAAA';
    const { result } = renderHook(() => useResult(answers));

    expect(result.current.characterCode).toBe('CSPO');
    expect(result.current.character?.name).toBe('조심스러운 로또러');
  });

  test('RTFL 유형이 올바르게 계산됨', () => {
    // R: risk 낮음 (BBB), T: loss 낮음 (AAA), F: time 낮음 (BB), L: prob 낮음 (BB)
    const answers = 'BBBAAABBBB';
    const { result } = renderHook(() => useResult(answers));

    expect(result.current.characterCode).toBe('RTFL');
    expect(result.current.character?.name).toBe('냉철한 큰 그림');
  });

  test('빈 답변은 null 반환', () => {
    const { result } = renderHook(() => useResult(''));

    expect(result.current.scores).toBeNull();
    expect(result.current.characterCode).toBeNull();
    expect(result.current.character).toBeNull();
  });

  test('10자 미만 답변은 null 반환', () => {
    const { result } = renderHook(() => useResult('AABBA'));

    expect(result.current.scores).toBeNull();
  });
});
