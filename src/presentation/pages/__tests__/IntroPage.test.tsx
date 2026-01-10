/**
 * IntroPage 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntroPage } from '../IntroPage';
import { GAME_CONFIG } from '@domain/entities';

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

      expect(screen.getByRole('button', { name: '게임 시작하기' })).toBeInTheDocument();
      expect(screen.getByText('돈 불려보기')).toBeInTheDocument();
    });

    it('should render disclaimer', () => {
      renderIntroPage();

      expect(screen.getByText(/실제 돈이 아닙니다/)).toBeInTheDocument();
    });

    it('should render initial balance from config', () => {
      renderIntroPage();

      const expectedBalance = `${Math.round(GAME_CONFIG.INITIAL_BALANCE / 10_000).toLocaleString()}만원`;
      expect(screen.getByText(new RegExp(expectedBalance))).toBeInTheDocument();
    });

    it('should render total rounds from config', () => {
      renderIntroPage();

      expect(screen.getByText(new RegExp(`${GAME_CONFIG.TOTAL_ROUNDS}번 선택`))).toBeInTheDocument();
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
    it('should navigate to /game when start button clicked', () => {
      renderIntroPage();

      const startButton = screen.getByRole('button', { name: '게임 시작하기' });
      fireEvent.click(startButton);

      expect(mockNavigate).toHaveBeenCalledWith('/game');
    });

    it('should trigger haptic feedback on start', () => {
      renderIntroPage();

      const startButton = screen.getByRole('button', { name: '게임 시작하기' });
      fireEvent.click(startButton);

      expect(triggerHapticFeedback).toHaveBeenCalledWith('medium');
    });

    it('should track click event on start', () => {
      renderIntroPage();

      const startButton = screen.getByRole('button', { name: '게임 시작하기' });
      fireEvent.click(startButton);

      expect(trackClick).toHaveBeenCalledWith('start_game');
    });
  });

  describe('애널리틱스', () => {
    it('should track page view on mount', () => {
      renderIntroPage();

      expect(trackPageView).toHaveBeenCalledWith('intro_page');
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
});
