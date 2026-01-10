/**
 * App 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';

// appsInToss 모킹
const mockCloseApp = vi.fn();
let mockBackEventCallback: (() => void) | null = null;

vi.mock('@lib/appsInToss', () => ({
  isAppsInToss: vi.fn(() => false),
  addBackEventListener: vi.fn((cb: () => void) => {
    mockBackEventCallback = cb;
    return vi.fn();
  }),
  setIosSwipeGestureEnabled: vi.fn(),
  getSafeAreaInsets: vi.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  closeApp: () => mockCloseApp(),
  trackPageView: vi.fn(),
  trackClick: vi.fn(),
  triggerHapticFeedback: vi.fn(),
}));

import { isAppsInToss, getSafeAreaInsets, setIosSwipeGestureEnabled, addBackEventListener } from '@lib/appsInToss';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBackEventCallback = null;
    (isAppsInToss as ReturnType<typeof vi.fn>).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('should render intro page by default', () => {
      render(<App />);

      expect(screen.getByText('💸 돈 감각 테스트')).toBeInTheDocument();
    });

    it('should have app container', () => {
      const { container } = render(<App />);

      expect(container.querySelector('.app')).toBeInTheDocument();
    });
  });

  describe('Apps in Toss 환경', () => {
    beforeEach(() => {
      (isAppsInToss as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (getSafeAreaInsets as ReturnType<typeof vi.fn>).mockReturnValue({
        top: 44,
        bottom: 34,
        left: 0,
        right: 0,
      });
    });

    it('should apply safe area padding when in Apps in Toss', () => {
      const { container } = render(<App />);

      const appDiv = container.querySelector('.app');
      expect(appDiv).toHaveStyle({ paddingTop: '44px' });
    });

    it('should disable iOS swipe gesture', () => {
      render(<App />);

      expect(setIosSwipeGestureEnabled).toHaveBeenCalledWith(false);
    });

    it('should add back event listener', () => {
      render(<App />);

      expect(addBackEventListener).toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const mockCleanup = vi.fn();
      (addBackEventListener as ReturnType<typeof vi.fn>).mockReturnValue(mockCleanup);

      const { unmount } = render(<App />);
      unmount();

      expect(mockCleanup).toHaveBeenCalled();
      expect(setIosSwipeGestureEnabled).toHaveBeenCalledWith(true);
    });
  });

  describe('종료 다이얼로그', () => {
    beforeEach(() => {
      (isAppsInToss as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it('should show exit dialog when back event triggered', async () => {
      render(<App />);

      // 뒤로가기 이벤트 트리거
      if (mockBackEventCallback) {
        mockBackEventCallback();
      }

      await waitFor(() => {
        expect(screen.getByText('돈 감각 테스트를 종료할까요?')).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel clicked', async () => {
      render(<App />);

      if (mockBackEventCallback) {
        mockBackEventCallback();
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByText('돈 감각 테스트를 종료할까요?')).not.toBeInTheDocument();
      });
    });

    it('should call closeApp when confirm clicked', async () => {
      render(<App />);

      if (mockBackEventCallback) {
        mockBackEventCallback();
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '종료하기' })).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: '종료하기' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockCloseApp).toHaveBeenCalled();
      });
    });
  });

  describe('라우팅', () => {
    it('should render intro page at root path', () => {
      render(<App />);

      expect(screen.getByText('💸 돈 감각 테스트')).toBeInTheDocument();
    });
  });

  describe('Non Apps in Toss 환경', () => {
    it('should not apply safe area padding', () => {
      (isAppsInToss as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { container } = render(<App />);

      const appDiv = container.querySelector('.app');
      expect(appDiv).not.toHaveStyle({ paddingTop: '44px' });
    });

    it('should not add back event listener', () => {
      (isAppsInToss as ReturnType<typeof vi.fn>).mockReturnValue(false);
      vi.clearAllMocks(); // Clear mocks to check if it's called after this

      render(<App />);

      // isAppsInToss가 false이면 useEffect 내부로 진입하지 않음
      expect(setIosSwipeGestureEnabled).not.toHaveBeenCalled();
    });
  });
});
