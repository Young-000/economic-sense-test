/**
 * IntroPage 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntroPage } from '../IntroPage';
import { GAME_MODE_CONFIG } from '@domain/entities';

// react-router-dom 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// appsInToss 모킹
vi.mock('@lib/appsInToss', () => ({
  trackPageView: vi.fn(),
  trackClick: vi.fn(),
  triggerHapticFeedback: vi.fn(),
}));

// rankingService 모킹
vi.mock('@data/rankingService', () => ({
  getTotalPlayers: vi.fn().mockResolvedValue(1234),
  getTodayTopPlayer: vi.fn().mockResolvedValue({ nickname: '테스트', totalReturn: 50 }),
}));

// challengeUtils 모킹
vi.mock('@lib/challengeUtils', () => ({
  extractAndSaveChallenge: vi.fn().mockReturnValue(null),
}));

import { trackPageView, trackClick, triggerHapticFeedback } from '@lib/appsInToss';

describe('IntroPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderIntroPage = () => {
    return render(
      <MemoryRouter>
        <IntroPage />
      </MemoryRouter>
    );
  };

  describe('렌더링', () => {
    it('should render main title', () => {
      renderIntroPage();

      expect(screen.getByText('💸 돈 감각 테스트')).toBeInTheDocument();
    });

    it('should render MZ badge', () => {
      renderIntroPage();

      expect(screen.getByText('MZ 필수 테스트')).toBeInTheDocument();
    });

    it('should render start button', () => {
      renderIntroPage();

      expect(screen.getByRole('button', { name: '일반 모드로 게임 시작하기' })).toBeInTheDocument();
      expect(screen.getByText('돈 불려보기')).toBeInTheDocument();
    });

    it('should render disclaimer', () => {
      renderIntroPage();

      expect(screen.getByText(/실제 돈이 아닙니다/)).toBeInTheDocument();
    });

    it('should render initial balance from config', () => {
      renderIntroPage();

      const expectedBalance = `${Math.round(GAME_MODE_CONFIG.normal.initialBalance / 10_000).toLocaleString()}만원`;
      expect(screen.getByText(new RegExp(expectedBalance))).toBeInTheDocument();
    });

    it('should render total rounds from config', () => {
      renderIntroPage();

      expect(screen.getByText(new RegExp(`${GAME_MODE_CONFIG.normal.totalRounds}번 선택`))).toBeInTheDocument();
    });
  });

  describe('게임 특징 목록', () => {
    it('should render feature list with 3 items', () => {
      renderIntroPage();

      const featureList = screen.getByRole('list', { name: '게임 특징' });
      expect(featureList).toBeInTheDocument();

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });

    it('should render probability feature', () => {
      renderIntroPage();

      expect(screen.getByText('진짜 확률로 결과 결정')).toBeInTheDocument();
    });

    it('should render analysis feature', () => {
      renderIntroPage();

      expect(screen.getByText('투자 성향 + 운빨 분석')).toBeInTheDocument();
    });

    it('should render battle feature', () => {
      renderIntroPage();

      expect(screen.getByText('친구랑 수익률 배틀')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('should have main landmark with role', () => {
      renderIntroPage();

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      renderIntroPage();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('돈 감각 테스트');
    });

    it('should have aria-labelledby on main', () => {
      const { container } = renderIntroPage();

      const main = container.querySelector('main');
      expect(main).toHaveAttribute('aria-labelledby', 'intro-title');
    });

    it('should have disclaimer with role note', () => {
      renderIntroPage();

      expect(screen.getByRole('note')).toBeInTheDocument();
    });
  });

  describe('상호작용', () => {
    it('should navigate to /game with mode when start button clicked', () => {
      renderIntroPage();

      const startButton = screen.getByRole('button', { name: '일반 모드로 게임 시작하기' });
      fireEvent.click(startButton);

      expect(mockNavigate).toHaveBeenCalledWith('/game?mode=normal');
    });

    it('should trigger haptic feedback on start', () => {
      renderIntroPage();

      const startButton = screen.getByRole('button', { name: '일반 모드로 게임 시작하기' });
      fireEvent.click(startButton);

      expect(triggerHapticFeedback).toHaveBeenCalledWith('medium');
    });

    it('should track click event on start with mode', () => {
      renderIntroPage();

      const startButton = screen.getByRole('button', { name: '일반 모드로 게임 시작하기' });
      fireEvent.click(startButton);

      expect(trackClick).toHaveBeenCalledWith('start_game', { mode: 'normal' });
    });
  });

  describe('애널리틱스', () => {
    it('should track page view on mount', () => {
      renderIntroPage();

      // 도전 데이터 없이 마운트되면 undefined로 호출됨
      expect(trackPageView).toHaveBeenCalledWith('intro_page', undefined);
    });

    it('should track page view only once', () => {
      const { rerender } = renderIntroPage();

      rerender(
        <MemoryRouter>
          <IntroPage />
        </MemoryRouter>
      );

      // 첫 렌더링에서만 호출됨
      expect(trackPageView).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일 클래스', () => {
    it('should have intro-page class', () => {
      const { container } = renderIntroPage();

      expect(container.querySelector('.intro-page')).toBeInTheDocument();
    });

    it('should have start-button class on button', () => {
      const { container } = renderIntroPage();

      expect(container.querySelector('.start-button')).toBeInTheDocument();
    });
  });

  describe('모드 선택', () => {
    it('should render mode selector with two buttons', () => {
      renderIntroPage();

      expect(screen.getByRole('group', { name: '게임 모드 선택' })).toBeInTheDocument();
      expect(screen.getByText(GAME_MODE_CONFIG.normal.name)).toBeInTheDocument();
      expect(screen.getByText(GAME_MODE_CONFIG.extreme.name)).toBeInTheDocument();
    });

    it('should have normal mode selected by default', () => {
      renderIntroPage();

      const normalBtn = screen.getByRole('button', { name: /일반 모드/i, pressed: true });
      expect(normalBtn).toBeInTheDocument();
    });

    it('should switch to extreme mode when clicked', () => {
      renderIntroPage();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      // extreme 모드가 선택됨
      expect(extremeBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show extreme mode balance when extreme selected', () => {
      renderIntroPage();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      const expectedBalance = `${Math.round(GAME_MODE_CONFIG.extreme.initialBalance / 10_000).toLocaleString()}만원`;
      expect(screen.getByText(new RegExp(expectedBalance))).toBeInTheDocument();
    });

    it('should trigger haptic feedback when mode changed', () => {
      renderIntroPage();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      expect(triggerHapticFeedback).toHaveBeenCalledWith('light');
    });

    it('should track mode selection', () => {
      renderIntroPage();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      expect(trackClick).toHaveBeenCalledWith('select_mode_extreme');
    });

    it('should navigate with extreme mode when extreme start clicked', () => {
      renderIntroPage();

      // extreme 모드 선택
      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      // 시작 버튼 클릭
      const startButton = screen.getByRole('button', { name: '극한 모드로 게임 시작하기' });
      fireEvent.click(startButton);

      expect(mockNavigate).toHaveBeenCalledWith('/game?mode=extreme');
    });

    it('should change start button text for extreme mode', () => {
      renderIntroPage();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      expect(screen.getByText('🔥 극한 도전!')).toBeInTheDocument();
    });

    it('should change feature text for extreme mode', () => {
      renderIntroPage();

      // 기본 상태에서는 '친구랑 수익률 배틀'
      expect(screen.getByText('친구랑 수익률 배틀')).toBeInTheDocument();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      // extreme 모드에서는 '극한의 하이리스크'
      expect(screen.getByText('극한의 하이리스크')).toBeInTheDocument();
    });

    it('should change hook text for extreme mode', () => {
      renderIntroPage();

      // 기본: '당신은 금손? 흙손?'
      expect(screen.getByText('당신은 금손? 흙손?')).toBeInTheDocument();

      const extremeBtn = screen.getByText(GAME_MODE_CONFIG.extreme.name).closest('button');
      fireEvent.click(extremeBtn!);

      // extreme: '파산 각오됐어?'
      expect(screen.getByText('파산 각오됐어?')).toBeInTheDocument();
    });
  });
});
