/**
 * GamePage 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GamePage } from '../GamePage';
import { GAME_MODE_CONFIG } from '@domain/entities';

const normalConfig = GAME_MODE_CONFIG.normal;

// react-router-dom 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// useGame 훅 모킹
const mockMakeChoice = vi.fn();
const mockNextRound = vi.fn();

const mockQuestion = {
  id: 1,
  situation: '테스트 상황입니다',
  optionA: {
    label: 'A 선택',
    description: 'A 설명',
    outcomes: [{ probability: 1, value: 100_000 }],
  },
  optionB: {
    label: 'B 선택',
    description: 'B 설명',
    outcomes: [
      { probability: 0.5, value: 300_000 },
      { probability: 0.5, value: -100_000 },
    ],
  },
};

const mockQuestions = [mockQuestion];

const defaultGameState = {
  currentRound: 0,
  balance: normalConfig.initialBalance,
  results: [],
  isComplete: false,
};

vi.mock('../../hooks/useGame', () => ({
  useGame: vi.fn(() => ({
    gameState: defaultGameState,
    currentQuestion: mockQuestion,
    lastResult: null,
    makeChoice: mockMakeChoice,
    nextRound: mockNextRound,
    isWaitingResult: false,
    questions: mockQuestions,
  })),
}));

// appsInToss 모킹
vi.mock('@lib/appsInToss', () => ({
  triggerHapticFeedback: vi.fn(),
  trackClick: vi.fn(),
}));

import { useGame } from '../../hooks/useGame';
import { triggerHapticFeedback, trackClick } from '@lib/appsInToss';

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: defaultGameState,
      currentQuestion: mockQuestion,
      lastResult: null,
      makeChoice: mockMakeChoice,
      nextRound: mockNextRound,
      isWaitingResult: false,
      questions: mockQuestions,
    });
  });

  const renderGamePage = () => {
    return render(
      <MemoryRouter initialEntries={['/game?mode=normal']}>
        <GamePage />
      </MemoryRouter>
    );
  };

  describe('기본 렌더링', () => {
    it('should render game page', () => {
      const { container } = renderGamePage();
      expect(container.querySelector('.game-page')).toBeInTheDocument();
    });

    it('should render round counter', () => {
      renderGamePage();
      expect(screen.getByText('1/10')).toBeInTheDocument();
    });

    it('should render balance', () => {
      renderGamePage();
      expect(screen.getByText('1,000만원')).toBeInTheDocument();
    });

    it('should render situation text', () => {
      renderGamePage();
      expect(screen.getByText('테스트 상황입니다')).toBeInTheDocument();
    });

    it('should render choice options', () => {
      renderGamePage();
      expect(screen.getByText('A 선택')).toBeInTheDocument();
      expect(screen.getByText('B 선택')).toBeInTheDocument();
    });

    it('should render VS badge', () => {
      renderGamePage();
      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });

  describe('선택 기능', () => {
    it('should call makeChoice when option A clicked', () => {
      renderGamePage();

      const choiceA = screen.getByLabelText(/A 선택/);
      fireEvent.click(choiceA);

      expect(mockMakeChoice).toHaveBeenCalledWith('A');
    });

    it('should call makeChoice when option B clicked', () => {
      renderGamePage();

      const choiceB = screen.getByLabelText(/B 선택/);
      fireEvent.click(choiceB);

      expect(mockMakeChoice).toHaveBeenCalledWith('B');
    });

    it('should trigger haptic feedback on choice', () => {
      renderGamePage();

      const choiceA = screen.getByLabelText(/A 선택/);
      fireEvent.click(choiceA);

      expect(triggerHapticFeedback).toHaveBeenCalledWith('light');
    });

    it('should track click event on choice', () => {
      renderGamePage();

      const choiceA = screen.getByLabelText(/A 선택/);
      fireEvent.click(choiceA);

      expect(trackClick).toHaveBeenCalledWith('choice_A', { round: 1 });
    });
  });

  describe('결과 표시', () => {
    it('should show result overlay when waiting for result', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, currentRound: 0, results: [] },
        currentQuestion: mockQuestion,
        lastResult: {
          questionId: 1,
          choice: 'A',
          chosenOption: mockQuestion.optionA,
          actualOutcome: 100_000,
          expectedValue: 100_000,
        },
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: true,
        questions: mockQuestions,
      });

      renderGamePage();

      expect(screen.getByText('+10만')).toBeInTheDocument();
    });

    it('should show next button in result overlay', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, currentRound: 0 },
        currentQuestion: mockQuestion,
        lastResult: {
          questionId: 1,
          choice: 'A',
          chosenOption: mockQuestion.optionA,
          actualOutcome: 100_000,
          expectedValue: 100_000,
        },
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: true,
        questions: mockQuestions,
      });

      renderGamePage();

      expect(screen.getByText('다음 →')).toBeInTheDocument();
    });

    it('should call nextRound when next button clicked', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, currentRound: 0 },
        currentQuestion: mockQuestion,
        lastResult: {
          questionId: 1,
          choice: 'A',
          chosenOption: mockQuestion.optionA,
          actualOutcome: 100_000,
          expectedValue: 100_000,
        },
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: true,
        questions: mockQuestions,
      });

      renderGamePage();

      const nextBtn = screen.getByText('다음 →');
      fireEvent.click(nextBtn);

      expect(mockNextRound).toHaveBeenCalled();
      expect(triggerHapticFeedback).toHaveBeenCalledWith('medium');
    });

    it('should show 결과 보기 on last round', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, currentRound: 9 },
        currentQuestion: mockQuestion,
        lastResult: {
          questionId: 10,
          choice: 'A',
          chosenOption: mockQuestion.optionA,
          actualOutcome: 100_000,
          expectedValue: 100_000,
        },
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: true,
        questions: mockQuestions,
      });

      renderGamePage();

      expect(screen.getByText('결과 보기 →')).toBeInTheDocument();
    });
  });

  describe('게임 완료', () => {
    it('should navigate to result when game is complete', async () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, isComplete: true, results: [] },
        currentQuestion: null,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      renderGamePage();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/result', { replace: true });
      });
    });

    it('should save results to sessionStorage when complete', async () => {
      const mockResults = [
        {
          questionId: 1,
          choice: 'A',
          chosenOption: mockQuestion.optionA,
          actualOutcome: 100_000,
          expectedValue: 100_000,
        },
      ];

      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, isComplete: true, results: mockResults },
        currentQuestion: null,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      renderGamePage();

      await waitFor(() => {
        expect(sessionStorage.getItem('gameResults')).toBe(JSON.stringify(mockResults));
        expect(sessionStorage.getItem('gameQuestions')).toBe(JSON.stringify(mockQuestions));
      });
    });

    it('should render null when game is complete', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: { ...defaultGameState, isComplete: true },
        currentQuestion: null,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      const { container } = renderGamePage();

      expect(container.querySelector('.game-page')).not.toBeInTheDocument();
    });
  });

  describe('진행 상태 표시', () => {
    it('should show round progress dots after first round', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: {
          ...defaultGameState,
          currentRound: 1,
          results: [
            {
              questionId: 1,
              choice: 'A',
              chosenOption: mockQuestion.optionA,
              actualOutcome: 100_000,
              expectedValue: 100_000,
            },
          ],
        },
        currentQuestion: mockQuestion,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      const { container } = renderGamePage();

      const dots = container.querySelectorAll('.round-dot');
      expect(dots.length).toBe(normalConfig.totalRounds);
    });

    it('should show positive dot for positive outcome', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: {
          ...defaultGameState,
          currentRound: 1,
          results: [
            {
              questionId: 1,
              choice: 'A',
              chosenOption: mockQuestion.optionA,
              actualOutcome: 100_000,
              expectedValue: 100_000,
            },
          ],
        },
        currentQuestion: mockQuestion,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      const { container } = renderGamePage();

      expect(container.querySelector('.round-dot.positive')).toBeInTheDocument();
    });

    it('should show negative dot for negative outcome', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: {
          ...defaultGameState,
          currentRound: 1,
          results: [
            {
              questionId: 1,
              choice: 'B',
              chosenOption: mockQuestion.optionB,
              actualOutcome: -100_000,
              expectedValue: 100_000,
            },
          ],
        },
        currentQuestion: mockQuestion,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      const { container } = renderGamePage();

      expect(container.querySelector('.round-dot.negative')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('should have progress bar with aria attributes', () => {
      renderGamePage();

      const progressBar = screen.getByRole('progressbar', { name: '게임 진행률' });
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('should have choice group with aria label', () => {
      renderGamePage();

      expect(screen.getByRole('group', { name: '투자 선택지' })).toBeInTheDocument();
    });

    it('should have aria labels on choice buttons', () => {
      renderGamePage();

      expect(screen.getByLabelText(/A 선택.*기대수익/)).toBeInTheDocument();
      expect(screen.getByLabelText(/B 선택.*기대수익/)).toBeInTheDocument();
    });
  });

  describe('스트릭 표시', () => {
    it('should show win streak badge for 3+ consecutive wins', () => {
      // 이전 라운드 결과 (rounds 0, 1) - 2개의 연속 수익
      const previousResults = Array(2).fill(null).map((_, i) => ({
        questionId: i + 1,
        choice: 'A' as const,
        chosenOption: mockQuestion.optionA,
        actualOutcome: 100_000,
        expectedValue: 100_000,
      }));

      // 현재 라운드 결과 (round 2) - 3번째 연속 수익 (아직 results에 추가 안됨)
      const currentResult = {
        questionId: 3,
        choice: 'A' as const,
        chosenOption: mockQuestion.optionA,
        actualOutcome: 100_000,
        expectedValue: 100_000,
      };

      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: {
          ...defaultGameState,
          currentRound: 2,
          balance: normalConfig.initialBalance + 300_000,
          results: previousResults, // 이전 2개 결과만
        },
        currentQuestion: mockQuestion,
        lastResult: currentResult, // 현재 라운드 결과 (아직 results에 없음)
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: true,
        questions: mockQuestions,
      });

      renderGamePage();

      expect(screen.getByText(/3연속 수익!/)).toBeInTheDocument();
    });
  });

  describe('null 처리', () => {
    it('should render null when currentQuestion is null', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: defaultGameState,
        currentQuestion: null,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      const { container } = renderGamePage();

      expect(container.querySelector('.game-page')).not.toBeInTheDocument();
    });
  });

  describe('Extreme 모드', () => {
    const extremeConfig = GAME_MODE_CONFIG.extreme;

    const renderExtremeGamePage = () => {
      return render(
        <MemoryRouter initialEntries={['/game?mode=extreme']}>
          <GamePage />
        </MemoryRouter>
      );
    };

    it('should render with extreme mode balance', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: {
          ...defaultGameState,
          balance: extremeConfig.initialBalance,
        },
        currentQuestion: mockQuestion,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      renderExtremeGamePage();

      expect(screen.getByText('5,000만원')).toBeInTheDocument();
    });

    it('should use extreme mode config for progress bar', () => {
      (useGame as ReturnType<typeof vi.fn>).mockReturnValue({
        gameState: {
          ...defaultGameState,
          balance: extremeConfig.initialBalance,
        },
        currentQuestion: mockQuestion,
        lastResult: null,
        makeChoice: mockMakeChoice,
        nextRound: mockNextRound,
        isWaitingResult: false,
        questions: mockQuestions,
      });

      renderExtremeGamePage();

      const progressBar = screen.getByRole('progressbar', { name: '게임 진행률' });
      expect(progressBar).toHaveAttribute('aria-valuemax', String(extremeConfig.totalRounds));
    });
  });
});
