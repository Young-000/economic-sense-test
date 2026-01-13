/**
 * Apps in Toss SDK 통합 테스트
 *
 * 이 테스트 파일은 window 객체에 AppsInToss SDK를 mock으로 주입하기 위해
 * any 타입을 사용합니다. 테스트 환경에서만 사용되므로 허용합니다.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isAppsInToss,
  submitToGameLeaderboard,
  openGameLeaderboard,
  getGameUserKey,
  initTossAds,
  attachBannerAd,
  removeBannerAd,
  addBackEventListener,
  setIosSwipeGestureEnabled,
  getSafeAreaInsets,
  closeApp,
  trackClick,
  trackImpression,
  trackPageView,
  triggerHapticFeedback,
  getClipboardText,
  setClipboardText,
} from '../appsInToss';

describe('Apps in Toss SDK', () => {
  const mockAppsInToss = {
    submitGameCenterLeaderBoardScore: vi.fn(),
    openGameCenterLeaderboard: vi.fn(),
    getUserKeyForGame: vi.fn(),
    TossAds: {
      initialize: Object.assign(vi.fn(), { isSupported: vi.fn(() => true) }),
      attach: vi.fn(() => ({ slotId: 'test-slot-id' })),
      destroy: vi.fn(),
    },
    graniteEvent: {
      addEventListener: vi.fn(() => vi.fn()),
    },
    setIosSwipeGestureEnabled: vi.fn(),
    getSafeAreaInsets: vi.fn(() => ({ top: 44, bottom: 34, left: 0, right: 0 })),
    closeView: vi.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    (window as any).AppsInToss = mockAppsInToss;
  });

  afterEach(() => {
    delete (window as any).AppsInToss;
    vi.clearAllMocks();
  });

  describe('isAppsInToss', () => {
    it('should return true when AppsInToss is available', () => {
      expect(isAppsInToss()).toBe(true);
    });

    it('should return false when AppsInToss is not available', () => {
      delete (window as any).AppsInToss;
      expect(isAppsInToss()).toBe(false);
    });
  });

  describe('submitToGameLeaderboard', () => {
    it('should submit score successfully', async () => {
      mockAppsInToss.submitGameCenterLeaderBoardScore.mockResolvedValue({ type: 'SUCCESS' });

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(true);
      expect(mockAppsInToss.submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: 1000 });
    });

    it('should handle NOT_SUPPORTED response', async () => {
      mockAppsInToss.submitGameCenterLeaderBoardScore.mockResolvedValue('NOT_SUPPORTED');

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should handle INVALID_CATEGORY response', async () => {
      mockAppsInToss.submitGameCenterLeaderBoardScore.mockResolvedValue('INVALID_CATEGORY');

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('game category');
    });

    it('should handle ERROR response', async () => {
      mockAppsInToss.submitGameCenterLeaderBoardScore.mockResolvedValue('ERROR');

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown error');
    });

    it('should handle non-AppsInToss environment', async () => {
      delete (window as any).AppsInToss;

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not in Apps in Toss');
    });

    it('should handle unknown response type', async () => {
      mockAppsInToss.submitGameCenterLeaderBoardScore.mockResolvedValue({ type: 'UNKNOWN' });

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown response');
    });
  });

  describe('openGameLeaderboard', () => {
    it('should open leaderboard successfully', async () => {
      mockAppsInToss.openGameCenterLeaderboard.mockResolvedValue({ type: 'SUCCESS' });

      const result = await openGameLeaderboard();

      expect(result.success).toBe(true);
      expect(mockAppsInToss.openGameCenterLeaderboard).toHaveBeenCalled();
    });

    it('should handle NOT_SUPPORTED response', async () => {
      mockAppsInToss.openGameCenterLeaderboard.mockResolvedValue('NOT_SUPPORTED');

      const result = await openGameLeaderboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should handle ERROR response', async () => {
      mockAppsInToss.openGameCenterLeaderboard.mockResolvedValue('ERROR');

      const result = await openGameLeaderboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown error');
    });

    it('should handle unknown response type', async () => {
      mockAppsInToss.openGameCenterLeaderboard.mockResolvedValue({ type: 'UNKNOWN' });

      const result = await openGameLeaderboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown response');
    });

    it('should return error in non-AppsInToss environment', async () => {
      delete (window as any).AppsInToss;

      const result = await openGameLeaderboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not in Apps in Toss');
    });

    it('should handle INVALID_CATEGORY response', async () => {
      mockAppsInToss.openGameCenterLeaderboard.mockResolvedValue('INVALID_CATEGORY');

      const result = await openGameLeaderboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('game category');
    });
  });

  describe('getGameUserKey', () => {
    it('should return user hash successfully', async () => {
      mockAppsInToss.getUserKeyForGame.mockResolvedValue({ type: 'HASH', hash: 'user-hash-123' });

      const result = await getGameUserKey();

      expect(result.success).toBe(true);
      expect(result.hash).toBe('user-hash-123');
    });

    it('should handle undefined response', async () => {
      mockAppsInToss.getUserKeyForGame.mockResolvedValue(undefined);

      const result = await getGameUserKey();

      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should handle INVALID_CATEGORY response', async () => {
      mockAppsInToss.getUserKeyForGame.mockResolvedValue('INVALID_CATEGORY');

      const result = await getGameUserKey();

      expect(result.success).toBe(false);
      expect(result.error).toContain('game category');
    });

    it('should handle ERROR response', async () => {
      mockAppsInToss.getUserKeyForGame.mockResolvedValue('ERROR');

      const result = await getGameUserKey();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown error');
    });

    it('should handle unknown response type', async () => {
      mockAppsInToss.getUserKeyForGame.mockResolvedValue({ type: 'UNKNOWN' });

      const result = await getGameUserKey();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown response');
    });

    it('should return error in non-AppsInToss environment', async () => {
      delete (window as any).AppsInToss;

      const result = await getGameUserKey();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not in Apps in Toss');
    });
  });

  describe('TossAds', () => {
    it('should initialize TossAds successfully', () => {
      const result = initTossAds(true);

      expect(result).toBe(true);
      expect(mockAppsInToss.TossAds.initialize).toHaveBeenCalledWith({ testMode: true });
    });

    it('should return false when TossAds is not supported', () => {
      mockAppsInToss.TossAds.initialize.isSupported = vi.fn(() => false);

      const result = initTossAds();

      expect(result).toBe(false);
    });

    it('should return false when in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      const result = initTossAds();

      expect(result).toBe(false);
    });

    it('should attach banner ad', () => {
      const container = document.createElement('div');
      const onLoad = vi.fn();
      const onError = vi.fn();

      const slotId = attachBannerAd(container, { onLoad, onError });

      expect(slotId).toBe('test-slot-id');
      expect(mockAppsInToss.TossAds.attach).toHaveBeenCalledWith({
        container,
        onLoad,
        onError,
      });
    });

    it('should return null for attachBannerAd in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;
      const container = document.createElement('div');

      const slotId = attachBannerAd(container);

      expect(slotId).toBeNull();
    });

    it('should handle error when attaching banner ad', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppsInToss.TossAds.attach.mockImplementation(() => {
        throw new Error('Attach failed');
      });

      const container = document.createElement('div');
      const slotId = attachBannerAd(container);

      expect(slotId).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to attach banner ad:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should remove banner ad', () => {
      removeBannerAd('test-slot-id');

      expect(mockAppsInToss.TossAds.destroy).toHaveBeenCalledWith('test-slot-id');
    });

    it('should do nothing when removing in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      removeBannerAd('test-slot-id'); // should not throw
    });

    it('should handle error when removing banner ad', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppsInToss.TossAds.destroy.mockImplementation(() => {
        throw new Error('Destroy failed');
      });

      removeBannerAd('test-slot-id');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to remove banner ad:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('graniteEvent - backEvent', () => {
    it('should add back event listener', () => {
      const onBack = vi.fn();
      const unsubscribe = addBackEventListener(onBack);

      expect(mockAppsInToss.graniteEvent.addEventListener).toHaveBeenCalledWith(
        'backEvent',
        expect.objectContaining({ onEvent: onBack })
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should return noop function in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;
      const onBack = vi.fn();

      const unsubscribe = addBackEventListener(onBack);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe(); // should not throw
    });

    it('should handle onError callback', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onBack = vi.fn();
      let capturedOnError: ((error: unknown) => void) | undefined;

      mockAppsInToss.graniteEvent.addEventListener.mockImplementation(
        ((_event: string, handlers: { onEvent: () => void; onError: (error: unknown) => void }) => {
          capturedOnError = handlers.onError;
          return vi.fn();
        }) as typeof mockAppsInToss.graniteEvent.addEventListener
      );

      addBackEventListener(onBack);

      // Simulate an error from the event listener
      if (capturedOnError) {
        capturedOnError(new Error('Back event failed'));
      }

      expect(consoleSpy).toHaveBeenCalledWith('Back event error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle exception in addEventListener', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppsInToss.graniteEvent.addEventListener.mockImplementation(() => {
        throw new Error('addEventListener failed');
      });

      const onBack = vi.fn();
      const unsubscribe = addBackEventListener(onBack);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to add back event listener:', expect.any(Error));
      expect(typeof unsubscribe).toBe('function');
      unsubscribe(); // noop should not throw
      consoleSpy.mockRestore();
    });
  });

  describe('setIosSwipeGestureEnabled', () => {
    it('should enable iOS swipe gesture', () => {
      setIosSwipeGestureEnabled(true);

      expect(mockAppsInToss.setIosSwipeGestureEnabled).toHaveBeenCalledWith(true);
    });

    it('should disable iOS swipe gesture', () => {
      setIosSwipeGestureEnabled(false);

      expect(mockAppsInToss.setIosSwipeGestureEnabled).toHaveBeenCalledWith(false);
    });

    it('should do nothing in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      setIosSwipeGestureEnabled(true); // should not throw
    });

    it('should handle error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppsInToss.setIosSwipeGestureEnabled.mockImplementation(() => {
        throw new Error('Gesture error');
      });

      setIosSwipeGestureEnabled(true);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to set iOS swipe gesture:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getSafeAreaInsets', () => {
    it('should return safe area insets', () => {
      const insets = getSafeAreaInsets();

      expect(insets).toEqual({ top: 44, bottom: 34, left: 0, right: 0 });
    });

    it('should return zero insets in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      const insets = getSafeAreaInsets();

      expect(insets).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('should handle error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppsInToss.getSafeAreaInsets.mockImplementation(() => {
        throw new Error('Insets error');
      });

      const insets = getSafeAreaInsets();

      expect(insets).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get safe area insets:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('closeApp', () => {
    it('should close app', async () => {
      await closeApp();

      expect(mockAppsInToss.closeView).toHaveBeenCalled();
    });

    it('should do nothing in non-AppsInToss environment', async () => {
      delete (window as any).AppsInToss;

      await closeApp(); // should not throw
    });

    it('should handle error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAppsInToss.closeView.mockRejectedValue(new Error('Close failed'));

      await closeApp();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to close app:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});

describe('Apps in Toss SDK - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error handling', () => {
    it('should handle exception in submitToGameLeaderboard', async () => {
      (window as any).AppsInToss = {
        submitGameCenterLeaderBoardScore: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      const result = await submitToGameLeaderboard(1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle exception in openGameLeaderboard', async () => {
      (window as any).AppsInToss = {
        openGameCenterLeaderboard: vi.fn().mockRejectedValue(new Error('Failed to open')),
      };

      const result = await openGameLeaderboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to open');
    });

    it('should handle exception in getGameUserKey', async () => {
      (window as any).AppsInToss = {
        getUserKeyForGame: vi.fn().mockRejectedValue(new Error('Auth error')),
      };

      const result = await getGameUserKey();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Auth error');
    });
  });

  describe('Score conversion', () => {
    it('should handle positive scores', async () => {
      (window as any).AppsInToss = {
        submitGameCenterLeaderBoardScore: vi.fn().mockResolvedValue({ type: 'SUCCESS' }),
      };

      await submitToGameLeaderboard(5050); // 50.5% return
      expect((window as any).AppsInToss.submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: 5050 });
    });

    it('should handle negative scores', async () => {
      (window as any).AppsInToss = {
        submitGameCenterLeaderBoardScore: vi.fn().mockResolvedValue({ type: 'SUCCESS' }),
      };

      await submitToGameLeaderboard(-2500); // -25% return
      expect((window as any).AppsInToss.submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: -2500 });
    });

    it('should handle zero score', async () => {
      (window as any).AppsInToss = {
        submitGameCenterLeaderBoardScore: vi.fn().mockResolvedValue({ type: 'SUCCESS' }),
      };

      await submitToGameLeaderboard(0);
      expect((window as any).AppsInToss.submitGameCenterLeaderBoardScore).toHaveBeenCalledWith({ score: 0 });
    });
  });
});

describe('Apps in Toss SDK - Analytics', () => {
  const mockAnalytics = {
    click: vi.fn(),
    impression: vi.fn(),
    pageView: vi.fn(),
  };

  beforeEach(() => {
    (window as any).AppsInToss = { Analytics: mockAnalytics };
  });

  afterEach(() => {
    delete (window as any).AppsInToss;
    vi.clearAllMocks();
  });

  describe('trackClick', () => {
    it('should track click event', () => {
      trackClick('start_game', { level: 1 });

      expect(mockAnalytics.click).toHaveBeenCalledWith({
        button_name: 'start_game',
        level: 1,
      });
    });

    it('should do nothing in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      trackClick('start_game'); // should not throw
    });

    it('should handle error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAnalytics.click.mockImplementation(() => {
        throw new Error('Click tracking failed');
      });

      trackClick('start_game');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to track click:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('trackImpression', () => {
    it('should track impression event', () => {
      trackImpression('banner_ad', { position: 'top' });

      expect(mockAnalytics.impression).toHaveBeenCalledWith({
        item_id: 'banner_ad',
        position: 'top',
      });
    });

    it('should do nothing in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      trackImpression('banner_ad'); // should not throw
    });

    it('should handle error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAnalytics.impression.mockImplementation(() => {
        throw new Error('Impression failed');
      });

      trackImpression('banner_ad');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to track impression:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('trackPageView', () => {
    it('should track page view event', () => {
      trackPageView('result_page', { score: 100 });

      expect(mockAnalytics.pageView).toHaveBeenCalledWith({
        page_name: 'result_page',
        score: 100,
      });
    });

    it('should do nothing in non-AppsInToss environment', () => {
      delete (window as any).AppsInToss;

      trackPageView('result_page'); // should not throw
    });

    it('should handle error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAnalytics.pageView.mockImplementation(() => {
        throw new Error('PageView failed');
      });

      trackPageView('result_page');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to track page view:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});

describe('Apps in Toss SDK - Haptic & Clipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).AppsInToss;
  });

  describe('triggerHapticFeedback', () => {
    it('should trigger haptic feedback with default style', async () => {
      const mockHaptic = vi.fn().mockResolvedValue(undefined);
      (window as any).AppsInToss = { generateHapticFeedback: mockHaptic };

      const result = await triggerHapticFeedback();

      expect(result).toBe(true);
      expect(mockHaptic).toHaveBeenCalledWith({ style: 'medium' });
    });

    it('should trigger haptic feedback with specified style', async () => {
      const mockHaptic = vi.fn().mockResolvedValue(undefined);
      (window as any).AppsInToss = { generateHapticFeedback: mockHaptic };

      await triggerHapticFeedback('heavy');

      expect(mockHaptic).toHaveBeenCalledWith({ style: 'heavy' });
    });

    it('should return false in non-AppsInToss environment', async () => {
      const result = await triggerHapticFeedback();

      expect(result).toBe(false);
    });

    it('should handle error gracefully', async () => {
      const mockHaptic = vi.fn().mockRejectedValue(new Error('Haptic failed'));
      (window as any).AppsInToss = { generateHapticFeedback: mockHaptic };

      const result = await triggerHapticFeedback();

      expect(result).toBe(false);
    });
  });

  describe('getClipboardText', () => {
    it('should get clipboard text', async () => {
      const mockGetClipboard = vi.fn().mockResolvedValue('copied text');
      (window as any).AppsInToss = { getClipboardText: mockGetClipboard };

      const result = await getClipboardText();

      expect(result).toBe('copied text');
    });

    it('should return null in non-AppsInToss environment', async () => {
      const result = await getClipboardText();

      expect(result).toBe(null);
    });

    it('should handle error gracefully', async () => {
      const mockGetClipboard = vi.fn().mockRejectedValue(new Error('Permission denied'));
      (window as any).AppsInToss = { getClipboardText: mockGetClipboard };

      const result = await getClipboardText();

      expect(result).toBe(null);
    });
  });

  describe('setClipboardText', () => {
    it('should set clipboard text', async () => {
      const mockSetClipboard = vi.fn().mockResolvedValue(undefined);
      (window as any).AppsInToss = { setClipboardText: mockSetClipboard };

      const result = await setClipboardText('new text');

      expect(result).toBe(true);
      expect(mockSetClipboard).toHaveBeenCalledWith('new text');
    });

    it('should return false in non-AppsInToss environment', async () => {
      const result = await setClipboardText('new text');

      expect(result).toBe(false);
    });

    it('should handle error gracefully', async () => {
      const mockSetClipboard = vi.fn().mockRejectedValue(new Error('Permission denied'));
      (window as any).AppsInToss = { setClipboardText: mockSetClipboard };

      const result = await setClipboardText('new text');

      expect(result).toBe(false);
    });
  });
});
