/**
 * useGame 훅 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGame } from '../useGame';
import { GAME_CONFIG } from '@domain/entities';

// generateQuestions 모킹
vi.mock('@data/questionGenerator', () => ({
  generateQuestions: vi.fn().mockResolvedValue([
    {
      id: 1,
      situation: '테스트 상황 1',
      optionA: {
        label: 'A',
        description: 'Option A',
        outcomes: [{ probability: 1, value: 100_000 }],
      },
      optionB: {
        label: 'B',
        description: 'Option B',
        outcomes: [{ probability: 0.5, value: 300_000 }, { probability: 0.5, value: -100_000 }],
      },
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: i + 2,
      situation: `테스트 상황 ${i + 2}`,
      optionA: {
        label: 'A',
        description: 'Option A',
        outcomes: [{ probability: 1, value: 50_000 }],
      },
      optionB: {
        label: 'B',
        description: 'Option B',
        outcomes: [{ probability: 1, value: 100_000 }],
      },
    })),
  ]),
  generateQuestionsSync: vi.fn().mockReturnValue([
    {
      id: 1,
      situation: '동기 테스트 상황',
      optionA: {
        label: 'A',
        description: 'Option A',
        outcomes: [{ probability: 1, value: 100_000 }],
      },
      optionB: {
        label: 'B',
        description: 'Option B',
        outcomes: [{ probability: 1, value: 200_000 }],
      },
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: i + 2,
      situation: `동기 테스트 상황 ${i + 2}`,
      optionA: {
        label: 'A',
        description: 'Option A',
        outcomes: [{ probability: 1, value: 50_000 }],
      },
      optionB: {
        label: 'B',
        description: 'Option B',
        outcomes: [{ probability: 1, value: 100_000 }],
      },
    })),
  ]),
}));

describe('useGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.gameState.currentRound).toBe(0);
    expect(result.current.gameState.balance).toBe(GAME_CONFIG.INITIAL_BALANCE);
    expect(result.current.gameState.results).toEqual([]);
    expect(result.current.gameState.isComplete).toBe(false);
  });

  it('should have initial questions from sync generator', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
    expect(result.current.currentQuestion).not.toBeNull();
  });

  it('should have isWaitingResult false initially', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.isWaitingResult).toBe(false);
    expect(result.current.lastResult).toBeNull();
  });

  it('should load questions asynchronously', async () => {
    const { result } = renderHook(() => useGame());

    // 초기에는 로딩 중
    expect(result.current.isLoadingQuestions).toBe(true);

    // 비동기 로드 완료 대기
    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });
  });

  it('should process choice and show result', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 선택하기
    act(() => {
      result.current.makeChoice('A');
    });

    expect(result.current.isWaitingResult).toBe(true);
    expect(result.current.lastResult).not.toBeNull();
  });

  it('should advance to next round', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 선택 후 다음 라운드
    act(() => {
      result.current.makeChoice('A');
    });

    act(() => {
      result.current.nextRound();
    });

    expect(result.current.gameState.currentRound).toBe(1);
    expect(result.current.gameState.results).toHaveLength(1);
    expect(result.current.isWaitingResult).toBe(false);
  });

  it('should not make choice while waiting for result', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    act(() => {
      result.current.makeChoice('A');
    });

    const firstResult = result.current.lastResult;

    // 대기 중 다시 선택 시도
    act(() => {
      result.current.makeChoice('B');
    });

    // 결과가 변경되지 않아야 함
    expect(result.current.lastResult).toBe(firstResult);
  });

  it('should complete game after all rounds', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 10라운드 진행
    for (let i = 0; i < GAME_CONFIG.TOTAL_ROUNDS; i++) {
      act(() => {
        result.current.makeChoice('A');
      });
      act(() => {
        result.current.nextRound();
      });
    }

    expect(result.current.gameState.isComplete).toBe(true);
    expect(result.current.gameState.results).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
    expect(result.current.finalResult).not.toBeNull();
  });

  it('should reset game state', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 몇 라운드 진행
    act(() => {
      result.current.makeChoice('A');
    });
    act(() => {
      result.current.nextRound();
    });

    expect(result.current.gameState.currentRound).toBe(1);

    // 리셋
    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.gameState.currentRound).toBe(0);
    expect(result.current.gameState.balance).toBe(GAME_CONFIG.INITIAL_BALANCE);
    expect(result.current.gameState.results).toEqual([]);
  });

  it('should return null for currentQuestion when game is complete', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 게임 완료
    for (let i = 0; i < GAME_CONFIG.TOTAL_ROUNDS; i++) {
      act(() => {
        result.current.makeChoice('A');
      });
      act(() => {
        result.current.nextRound();
      });
    }

    expect(result.current.currentQuestion).toBeNull();
  });

  it('should not advance round when lastResult is null', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // lastResult가 null일 때 nextRound 호출
    act(() => {
      result.current.nextRound();
    });

    // 라운드가 변하지 않아야 함
    expect(result.current.gameState.currentRound).toBe(0);
  });

  it('should update balance correctly after choice', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    const initialBalance = result.current.gameState.balance;

    act(() => {
      result.current.makeChoice('A');
    });

    const outcome = result.current.lastResult?.actualOutcome ?? 0;

    act(() => {
      result.current.nextRound();
    });

    expect(result.current.gameState.balance).toBe(initialBalance + outcome);
  });

  it('should not make choice when currentQuestion is null', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 게임 완료
    for (let i = 0; i < GAME_CONFIG.TOTAL_ROUNDS; i++) {
      act(() => {
        result.current.makeChoice('A');
      });
      act(() => {
        result.current.nextRound();
      });
    }

    // currentQuestion이 null일 때 선택 시도
    const prevLastResult = result.current.lastResult;
    act(() => {
      result.current.makeChoice('B');
    });

    // lastResult가 변하지 않아야 함
    expect(result.current.lastResult).toBe(prevLastResult);
  });

  it('should calculate finalResult correctly', async () => {
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 게임 완료
    for (let i = 0; i < GAME_CONFIG.TOTAL_ROUNDS; i++) {
      act(() => {
        result.current.makeChoice('A');
      });
      act(() => {
        result.current.nextRound();
      });
    }

    const finalResult = result.current.finalResult;
    expect(finalResult).not.toBeNull();
    expect(finalResult?.profile).toBeDefined();
    expect(finalResult?.finalBalance).toBeDefined();
    expect(finalResult?.totalReturn).toBeDefined();
  });

  it('should handle generateQuestions error during initial load', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { generateQuestions } = await import('@data/questionGenerator');
    (generateQuestions as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // 에러 시에도 동기 질문으로 폴백하여 게임 가능
    expect(result.current.questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load questions:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle generateQuestions error during reset', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useGame());

    await waitFor(() => {
      expect(result.current.isLoadingQuestions).toBe(false);
    });

    // reset 시 에러 발생하도록 설정
    const { generateQuestions } = await import('@data/questionGenerator');
    (generateQuestions as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Reset error'));

    await act(async () => {
      await result.current.reset();
    });

    // 에러 시에도 동기 질문으로 폴백
    expect(result.current.questions).toHaveLength(GAME_CONFIG.TOTAL_ROUNDS);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load questions on reset:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
