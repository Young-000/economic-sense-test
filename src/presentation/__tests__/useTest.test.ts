import { describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTest } from '../hooks/useTest';

describe('useTest hook', () => {
  test('초기 상태가 올바르게 설정됨', () => {
    const { result } = renderHook(() => useTest());

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.answers).toEqual([]);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  test('답변 선택 시 상태가 업데이트됨', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      result.current.selectAnswer('A');
    });

    expect(result.current.answers).toEqual(['A']);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.progress).toBe(10);
  });

  test('10개 답변 완료 시 isComplete가 true', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.selectAnswer(i % 2 === 0 ? 'A' : 'B');
      }
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.progress).toBe(100);
    expect(result.current.answers).toHaveLength(10);
  });

  test('reset 시 초기 상태로 돌아감', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      result.current.selectAnswer('A');
      result.current.selectAnswer('B');
      result.current.reset();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.answers).toEqual([]);
    expect(result.current.isComplete).toBe(false);
  });

  test('완료 후 추가 답변은 무시됨', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.selectAnswer('A');
      }
    });

    expect(result.current.answers).toHaveLength(10);
  });
});
