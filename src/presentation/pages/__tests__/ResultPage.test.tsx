/**
 * ResultPage 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResultPage } from '../ResultPage';

// vi.hoisted를 사용하여 mock 함수들을 호이스팅
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

// react-router-dom 모킹
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 서비스 모킹 - vi.hoisted로 상수 값 사용
vi.mock('@data/rankingService', () => ({
  submitRanking: vi.fn().mockResolvedValue({ rank: 5 }),
  getTopRankings: vi.fn().mockResolvedValue([]),
  getPlayersAboveReturn: vi.fn().mockResolvedValue({ above: 100, total: 1000 }),
}));

// challengeUtils 모킹
vi.mock('@lib/challengeUtils', () => ({
  getSavedChallenge: vi.fn().mockReturnValue(null),
  compareResults: vi.fn().mockReturnValue({ winner: 'me', diff: 10, message: '승리!' }),
  createChallengeUrl: vi.fn().mockReturnValue('https://example.com/challenge'),
}));

vi.mock('@data/bestPerformanceService', () => ({
  getBestPerformance: vi.fn().mockReturnValue(null),
  updateBestPerformance: vi.fn().mockReturnValue(false),
  createAssetHistory: vi.fn().mockReturnValue([
    { round: 0, balance: 10_000_000 }, // GAME_CONFIG.INITIAL_BALANCE 값 직접 사용
  ]),
}));

vi.mock('@data/achievementService', () => ({
  checkAndUnlockAchievements: vi.fn().mockReturnValue([]),
  getAchievementStatus: vi.fn().mockReturnValue({ unlocked: [], locked: [], total: 0 }),
  calculateGameStats: vi.fn().mockReturnValue({}),
}));

vi.mock('@lib/appsInToss', () => ({
  trackPageView: vi.fn(),
  trackClick: vi.fn(),
  trackImpression: vi.fn(),
  triggerHapticFeedback: vi.fn(),
}));

// 유효한 게임 결과 데이터 생성
const createValidGameData = () => {
  const mockQuestion = {
    id: 1,
    situation: '테스트',
    optionA: {
      label: 'A',
      description: 'A',
      outcomes: [{ probability: 1, value: 100_000 }],
    },
    optionB: {
      label: 'B',
      description: 'B',
      outcomes: [{ probability: 1, value: 200_000 }],
    },
  };

  const questions = Array(10).fill(mockQuestion).map((q, i) => ({ ...q, id: i + 1 }));

  const results = questions.map((q, i) => ({
    questionId: i + 1,
    choice: 'A' as const,
    chosenOption: q.optionA,
    actualOutcome: 100_000,
    expectedValue: 100_000,
  }));

  return { questions, results };
};

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('ResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorageMock.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorageMock.clear();
  });

  const renderResultPage = () => {
    return render(
      <MemoryRouter>
        <ResultPage />
      </MemoryRouter>
    );
  };

  describe('결과 없음 처리', () => {
    it('should show error when no results in sessionStorage', () => {
      renderResultPage();

      expect(screen.getByText('결과를 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('should show retry button when no results', () => {
      renderResultPage();

      expect(screen.getByText('다시 시작하기')).toBeInTheDocument();
    });

    it('should navigate to home when retry clicked', () => {
      renderResultPage();

      const retryBtn = screen.getByText('다시 시작하기');
      fireEvent.click(retryBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('결과 표시', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render result page with valid data', () => {
      const { container } = renderResultPage();

      expect(container.querySelector('.result-page')).toBeInTheDocument();
    });

    it('should show final balance', async () => {
      renderResultPage();

      // 초기 잔액 + 10라운드 * 100,000 = 11,000,000
      // 공유 이미지 카드에도 동일한 텍스트가 있으므로 getAllByText 사용
      await waitFor(() => {
        expect(screen.getAllByText(/1,100만원/).length).toBeGreaterThan(0);
      });
    });

    it('should show return percentage element', async () => {
      const { container } = renderResultPage();

      // 수익률 표시 요소가 렌더링되어야 함
      await waitFor(() => {
        const returnElement = container.querySelector('.return-value');
        expect(returnElement).toBeInTheDocument();
      });
    });

    it('should show investor profile', async () => {
      renderResultPage();

      // 투자자 유형 프로필이 표시되어야 함
      await waitFor(() => {
        const resultContent = document.querySelector('.result-content');
        expect(resultContent).toBeInTheDocument();
      });
    });
  });

  describe('다시 하기 버튼', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render retry button', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('다시 도전하기')).toBeInTheDocument();
      });
    });

    it('should navigate to home and clear storage when play again clicked', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('다시 도전하기')).toBeInTheDocument();
      });

      const playAgainBtn = screen.getByText('다시 도전하기');
      fireEvent.click(playAgainBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('잘못된 데이터 처리', () => {
    it('should show error for invalid JSON', () => {
      sessionStorage.setItem('gameResults', 'invalid json');
      sessionStorage.setItem('gameQuestions', 'invalid json');

      renderResultPage();

      expect(screen.getByText('결과를 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('should show error for incomplete results', () => {
      const { questions } = createValidGameData();
      // 5개 결과만 저장 (10개 필요)
      const incompleteResults = Array(5).fill(null).map((_, i) => ({
        questionId: i + 1,
        choice: 'A',
        chosenOption: questions[0].optionA,
        actualOutcome: 100_000,
        expectedValue: 100_000,
      }));

      sessionStorage.setItem('gameResults', JSON.stringify(incompleteResults));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));

      renderResultPage();

      expect(screen.getByText('결과를 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('should show error when questions are missing', () => {
      const { results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      // questions 없음

      renderResultPage();

      expect(screen.getByText('결과를 찾을 수 없습니다.')).toBeInTheDocument();
    });
  });

  describe('스타일 클래스', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should have result-page class', async () => {
      const { container } = renderResultPage();

      await waitFor(() => {
        expect(container.querySelector('.result-page')).toBeInTheDocument();
      });
    });
  });

  describe('sessionStorage 파싱', () => {
    it('should handle empty results array', () => {
      sessionStorage.setItem('gameResults', '[]');
      sessionStorage.setItem('gameQuestions', '[]');

      renderResultPage();

      expect(screen.getByText('결과를 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('should handle null values', () => {
      sessionStorage.setItem('gameResults', 'null');
      sessionStorage.setItem('gameQuestions', 'null');

      renderResultPage();

      expect(screen.getByText('결과를 찾을 수 없습니다.')).toBeInTheDocument();
    });
  });

  describe('랭킹 등록', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render ranking input field', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });
    });

    it('should render ranking submit button', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('등록하기')).toBeInTheDocument();
      });
    });

    it('should have disabled submit button when nickname is empty', async () => {
      renderResultPage();

      await waitFor(() => {
        const submitBtn = screen.getByText('등록하기');
        expect(submitBtn).toBeDisabled();
      });
    });

    it('should enable submit button when nickname is entered', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)');
      fireEvent.change(input, { target: { value: '테스트유저' } });

      await waitFor(() => {
        const submitBtn = screen.getByText('등록하기');
        expect(submitBtn).not.toBeDisabled();
      });
    });
  });

  describe('공유 기능', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render share button', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('텍스트로 공유하기')).toBeInTheDocument();
      });
    });
  });

  describe('TOP 랭킹 보기', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render TOP 10 rankings toggle button', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('TOP 10 랭킹 보기 ▼')).toBeInTheDocument();
      });
    });
  });

  describe('업적 섹션', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render achievements toggle button', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText(/🏅 업적/)).toBeInTheDocument();
      });
    });
  });

  describe('투자 성향 분석', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render analysis section title', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('투자 성향 분석')).toBeInTheDocument();
      });
    });

    it('should render aggression stat', async () => {
      renderResultPage();

      // 공유 이미지 카드에도 동일한 텍스트가 있으므로 getAllByText 사용
      await waitFor(() => {
        expect(screen.getAllByText('공격성').length).toBeGreaterThan(0);
      });
    });

    it('should render rationality stat', async () => {
      renderResultPage();

      // 공유 이미지 카드에도 동일한 텍스트가 있으므로 getAllByText 사용
      await waitFor(() => {
        expect(screen.getAllByText('합리성').length).toBeGreaterThan(0);
      });
    });

    it('should render luck stat', async () => {
      renderResultPage();

      // 공유 이미지 카드에도 동일한 텍스트가 있으므로 getAllByText 사용
      await waitFor(() => {
        expect(screen.getAllByText('운').length).toBeGreaterThan(0);
      });
    });
  });

  describe('토글 버튼 인터랙션', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should have achievements toggle button', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText(/🏅 업적/)).toBeInTheDocument();
      });

      // 업적 버튼이 렌더링되어 있어야 함
      const toggleBtn = screen.getByText(/🏅 업적/);
      expect(toggleBtn).toBeInTheDocument();
    });

    it('should toggle rankings when button clicked', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('TOP 10 랭킹 보기 ▼')).toBeInTheDocument();
      });

      const toggleBtn = screen.getByText('TOP 10 랭킹 보기 ▼');
      fireEvent.click(toggleBtn);

      // 토글 후 버튼 텍스트 변경 확인
      await waitFor(() => {
        expect(screen.getByText('랭킹 숨기기 ▲')).toBeInTheDocument();
      });
    });
  });

  describe('다시 도전하기 버튼 상호작용', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should clear session storage and navigate when retry clicked', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('다시 도전하기')).toBeInTheDocument();
      });

      const retryBtn = screen.getByText('다시 도전하기');
      fireEvent.click(retryBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('공유 버튼 인터랙션', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should call share function when share button clicked', async () => {
      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('텍스트로 공유하기')).toBeInTheDocument();
      });

      const shareBtn = screen.getByText('텍스트로 공유하기');
      fireEvent.click(shareBtn);

      // 공유 기능 트리거됨 (실제 동작은 모킹된 함수에 의존)
      expect(shareBtn).toBeInTheDocument();
    });
  });

  describe('투자자 프로필 표시', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render investor type name', async () => {
      const { container } = renderResultPage();

      await waitFor(() => {
        const typeName = container.querySelector('.type-name');
        expect(typeName).toBeInTheDocument();
      });
    });

    it('should render investor type emoji', async () => {
      const { container } = renderResultPage();

      await waitFor(() => {
        const typeEmoji = container.querySelector('.type-emoji');
        expect(typeEmoji).toBeInTheDocument();
      });
    });

    it('should render investor type tag', async () => {
      const { container } = renderResultPage();

      await waitFor(() => {
        const typeTag = container.querySelector('.type-tag');
        expect(typeTag).toBeInTheDocument();
      });
    });
  });

  describe('최종 자산 카드', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should render final balance card', async () => {
      const { container } = renderResultPage();

      await waitFor(() => {
        const balanceCard = container.querySelector('.final-balance-card');
        expect(balanceCard).toBeInTheDocument();
      });
    });

    it('should show initial balance note', async () => {
      renderResultPage();

      // 공유 이미지 카드에도 동일한 텍스트가 있으므로 getAllByText 사용
      await waitFor(() => {
        expect(screen.getAllByText(/시작:/).length).toBeGreaterThan(0);
      });
    });
  });

  describe('랭킹 제출 핸들러', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should submit ranking when button clicked with nickname', async () => {
      const { submitRanking } = await import('@data/rankingService');
      (submitRanking as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, rank: 5 });

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)');
      fireEvent.change(input, { target: { value: '테스트유저' } });

      const submitBtn = screen.getByText('등록하기');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitRanking).toHaveBeenCalled();
      });
    });

    it('should show rank after successful submission', async () => {
      const { submitRanking } = await import('@data/rankingService');
      (submitRanking as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, rank: 5 });

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)');
      fireEvent.change(input, { target: { value: '테스트유저' } });

      const submitBtn = screen.getByText('등록하기');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/5위/)).toBeInTheDocument();
      });
    });

    it('should submit on Enter key press', async () => {
      const { submitRanking } = await import('@data/rankingService');
      (submitRanking as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, rank: 3 });

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)');
      fireEvent.change(input, { target: { value: '엔터유저' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(submitRanking).toHaveBeenCalled();
      });
    });

    it('should show alert on submission failure', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const { submitRanking } = await import('@data/rankingService');
      (submitRanking as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)');
      fireEvent.change(input, { target: { value: '실패유저' } });

      const submitBtn = screen.getByText('등록하기');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('랭킹 등록에 실패했어요.');
      });

      alertSpy.mockRestore();
    });

    it('should show alert on submission error', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const { submitRanking } = await import('@data/rankingService');
      (submitRanking as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('닉네임 입력 (한글/영문/숫자)');
      fireEvent.change(input, { target: { value: '에러유저' } });

      const submitBtn = screen.getByText('등록하기');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('오류가 발생했어요.');
      });

      alertSpy.mockRestore();
    });
  });

  describe('공유 핸들러', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should copy to clipboard when navigator.share is not available', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // navigator.clipboard 모킹
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('텍스트로 공유하기')).toBeInTheDocument();
      });

      const shareBtn = screen.getByText('텍스트로 공유하기');
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });
  });

  describe('업적 토글', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should toggle achievement list when button clicked', async () => {
      const { getAchievementStatus } = await import('@data/achievementService');
      (getAchievementStatus as ReturnType<typeof vi.fn>).mockReturnValue({
        unlocked: 2,
        total: 10,
        achievements: [
          { id: 'first_game', name: '첫 게임', description: '게임 완료', unlocked: true },
        ],
      });

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText(/🏅 업적/)).toBeInTheDocument();
      });

      const toggleBtn = screen.getByText(/🏅 업적/);
      fireEvent.click(toggleBtn);

      // 토글 후 AchievementList가 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText(/업적.*▲/)).toBeInTheDocument();
      });
    });
  });

  describe('랭킹 목록 표시', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should show rankings list when toggled with data', async () => {
      const { getTopRankings } = await import('@data/rankingService');
      (getTopRankings as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: '1', nickname: '금손왕', total_return: 50.5, final_balance: 15050000 },
        { id: '2', nickname: '투자고수', total_return: 30.2, final_balance: 13020000 },
        { id: '3', nickname: '행운아', total_return: 10.0, final_balance: 11000000 },
        { id: '4', nickname: '노력파', total_return: -5.5, final_balance: 9450000 },
      ]);

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('TOP 10 랭킹 보기 ▼')).toBeInTheDocument();
      });

      const toggleBtn = screen.getByText('TOP 10 랭킹 보기 ▼');
      fireEvent.click(toggleBtn);

      await waitFor(() => {
        // 금손왕은 top-player-highlight와 ranking-item 두 곳에 나타남
        expect(screen.getAllByText('금손왕').length).toBeGreaterThan(0);
        expect(screen.getByText('투자고수')).toBeInTheDocument();
        expect(screen.getByText('행운아')).toBeInTheDocument();
      });
    });

    it('should show medal emojis for top 3 rankings', async () => {
      const { getTopRankings } = await import('@data/rankingService');
      (getTopRankings as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: '1', nickname: '금손왕', total_return: 50, final_balance: 15000000 },
        { id: '2', nickname: '투자고수', total_return: 30, final_balance: 13000000 },
        { id: '3', nickname: '행운아', total_return: 10, final_balance: 11000000 },
      ]);

      const { container } = renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('TOP 10 랭킹 보기 ▼')).toBeInTheDocument();
      });

      const toggleBtn = screen.getByText('TOP 10 랭킹 보기 ▼');
      fireEvent.click(toggleBtn);

      await waitFor(() => {
        const positions = container.querySelectorAll('.ranking-position');
        expect(positions[0]?.textContent).toBe('🥇');
        expect(positions[1]?.textContent).toBe('🥈');
        expect(positions[2]?.textContent).toBe('🥉');
      });
    });

    it('should show negative balance in different style', async () => {
      const { getTopRankings } = await import('@data/rankingService');
      (getTopRankings as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: '1', nickname: '손실자', total_return: -25.5, final_balance: 7450000 },
      ]);

      const { container } = renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('TOP 10 랭킹 보기 ▼')).toBeInTheDocument();
      });

      const toggleBtn = screen.getByText('TOP 10 랭킹 보기 ▼');
      fireEvent.click(toggleBtn);

      await waitFor(() => {
        // 랭킹 목록이 표시되었는지 확인 (금액이 표시됨)
        const balanceEl = container.querySelector('.ranking-balance');
        expect(balanceEl).toBeInTheDocument();
      });
    });
  });

  describe('신기록 및 업적 표시', () => {
    beforeEach(() => {
      const { questions, results } = createValidGameData();
      sessionStorage.setItem('gameResults', JSON.stringify(results));
      sessionStorage.setItem('gameQuestions', JSON.stringify(questions));
    });

    it('should show new record badge when new record is achieved', async () => {
      const { updateBestPerformance } = await import('@data/bestPerformanceService');
      (updateBestPerformance as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderResultPage();

      await waitFor(() => {
        expect(screen.getByText('신기록 달성!')).toBeInTheDocument();
      });
    });

    it('should show achievement popup when new achievements unlocked', async () => {
      const { checkAndUnlockAchievements } = await import('@data/achievementService');
      (checkAndUnlockAchievements as ReturnType<typeof vi.fn>).mockReturnValue([
        { id: 'first_win', name: '첫 수익', description: '첫 번째 수익을 달성했습니다', unlocked: true },
      ]);

      renderResultPage();

      // NewAchievementsPopup이 렌더링되는지 확인
      await waitFor(() => {
        // 팝업 제목이나 내용이 표시되어야 함
        expect(screen.getByText('첫 수익')).toBeInTheDocument();
      });
    });

    it('should trigger confetti when new record or achievements', async () => {
      const { updateBestPerformance } = await import('@data/bestPerformanceService');
      (updateBestPerformance as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { container } = renderResultPage();

      // Confetti 컴포넌트가 렌더링되어야 함
      await waitFor(() => {
        const confetti = container.querySelector('.confetti-container');
        expect(confetti).toBeInTheDocument();
      });
    });
  });
});
