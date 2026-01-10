/**
 * Apps in Toss 연동 서비스
 * - 게임 리더보드
 * - 배너 광고
 * - 뒤로가기/종료 처리
 * - Safe Area
 */

// Apps in Toss SDK 타입 정의 (런타임에서 로드됨)
declare global {
  interface Window {
    AppsInToss?: {
      submitGameCenterLeaderBoardScore?: (params: { score: number }) => Promise<
        | { type: 'SUCCESS' }
        | 'NOT_SUPPORTED'
        | 'INVALID_CATEGORY'
        | 'ERROR'
      >;
      openGameCenterLeaderboard?: () => Promise<
        | { type: 'SUCCESS' }
        | 'NOT_SUPPORTED'
        | 'INVALID_CATEGORY'
        | 'ERROR'
      >;
      getUserKeyForGame?: () => Promise<
        | { type: 'HASH'; hash: string }
        | 'INVALID_CATEGORY'
        | 'ERROR'
        | undefined
      >;
      TossAds?: {
        initialize: {
          isSupported: () => boolean;
          (options?: { testMode?: boolean }): void;
        };
        attach: (options: {
          container: HTMLElement;
          slotId?: string;
          onLoad?: () => void;
          onError?: (error: Error) => void;
        }) => { slotId: string };
        destroy: (slotId: string) => void;
      };
      graniteEvent?: {
        addEventListener: (
          eventType: 'backEvent',
          handlers: {
            onEvent: () => void;
            onError?: (error: Error) => void;
          }
        ) => () => void;
      };
      setIosSwipeGestureEnabled?: (enabled: boolean) => void;
      getSafeAreaInsets?: () => { top: number; bottom: number; left: number; right: number };
      closeView?: () => Promise<void>;
      Analytics?: {
        click: (params: { button_name: string; [key: string]: unknown }) => void;
        impression: (params: { item_id: string; [key: string]: unknown }) => void;
        pageView: (params: { page_name: string; [key: string]: unknown }) => void;
      };
      generateHapticFeedback?: (options: { style: 'light' | 'medium' | 'heavy' }) => Promise<void>;
      getClipboardText?: () => Promise<string>;
      setClipboardText?: (text: string) => Promise<void>;
    };
  }
}

/**
 * Apps in Toss 환경인지 확인
 */
export function isAppsInToss(): boolean {
  return typeof window !== 'undefined' && !!window.AppsInToss;
}

/**
 * 게임 리더보드에 점수 제출
 * @param score 점수 (수익률 * 100으로 정수 변환 권장)
 */
export async function submitToGameLeaderboard(score: number): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isAppsInToss() || !window.AppsInToss?.submitGameCenterLeaderBoardScore) {
    return { success: false, error: 'Not in Apps in Toss environment' };
  }

  try {
    const result = await window.AppsInToss.submitGameCenterLeaderBoardScore({ score });

    if (result === 'NOT_SUPPORTED') {
      return { success: false, error: 'Feature not supported in this app version' };
    }
    if (result === 'INVALID_CATEGORY') {
      return { success: false, error: 'This app is not in game category' };
    }
    if (result === 'ERROR') {
      return { success: false, error: 'Unknown error occurred' };
    }
    if (result?.type === 'SUCCESS') {
      return { success: true };
    }

    return { success: false, error: 'Unknown response' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 게임 리더보드 UI 열기
 */
export async function openGameLeaderboard(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isAppsInToss() || !window.AppsInToss?.openGameCenterLeaderboard) {
    return { success: false, error: 'Not in Apps in Toss environment' };
  }

  try {
    const result = await window.AppsInToss.openGameCenterLeaderboard();

    if (result === 'NOT_SUPPORTED') {
      return { success: false, error: 'Feature not supported in this app version' };
    }
    if (result === 'INVALID_CATEGORY') {
      return { success: false, error: 'This app is not in game category' };
    }
    if (result === 'ERROR') {
      return { success: false, error: 'Unknown error occurred' };
    }
    if (result?.type === 'SUCCESS') {
      return { success: true };
    }

    return { success: false, error: 'Unknown response' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * 게임용 사용자 키 조회
 */
export async function getGameUserKey(): Promise<{
  success: boolean;
  hash?: string;
  error?: string;
}> {
  if (!isAppsInToss() || !window.AppsInToss?.getUserKeyForGame) {
    return { success: false, error: 'Not in Apps in Toss environment' };
  }

  try {
    const result = await window.AppsInToss.getUserKeyForGame();

    if (!result) {
      return { success: false, error: 'Feature not supported in this app version' };
    }
    if (result === 'INVALID_CATEGORY') {
      return { success: false, error: 'This app is not in game category' };
    }
    if (result === 'ERROR') {
      return { success: false, error: 'Unknown error occurred' };
    }
    if (result.type === 'HASH') {
      return { success: true, hash: result.hash };
    }

    return { success: false, error: 'Unknown response' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * TossAds 배너 광고 초기화
 */
export function initTossAds(testMode = false): boolean {
  if (!isAppsInToss() || !window.AppsInToss?.TossAds) {
    return false;
  }

  const TossAds = window.AppsInToss.TossAds;

  if (!TossAds.initialize.isSupported()) {
    console.warn('TossAds is not supported in this environment');
    return false;
  }

  TossAds.initialize({ testMode });
  return true;
}

/**
 * 배너 광고 부착
 */
export function attachBannerAd(
  container: HTMLElement,
  options?: {
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }
): string | null {
  if (!isAppsInToss() || !window.AppsInToss?.TossAds) {
    return null;
  }

  try {
    const result = window.AppsInToss.TossAds.attach({
      container,
      onLoad: options?.onLoad,
      onError: options?.onError,
    });
    return result.slotId;
  } catch (err) {
    console.error('Failed to attach banner ad:', err);
    return null;
  }
}

/**
 * 배너 광고 제거
 */
export function removeBannerAd(slotId: string): void {
  if (!isAppsInToss() || !window.AppsInToss?.TossAds) {
    return;
  }

  try {
    window.AppsInToss.TossAds.destroy(slotId);
  } catch (err) {
    console.error('Failed to remove banner ad:', err);
  }
}

/**
 * 뒤로가기 이벤트 리스너 등록
 * @param onBack 뒤로가기 시 호출될 콜백 (기본 뒤로가기 동작은 차단됨)
 * @returns cleanup 함수
 */
export function addBackEventListener(onBack: () => void): () => void {
  if (!isAppsInToss() || !window.AppsInToss?.graniteEvent) {
    return () => {};
  }

  try {
    const unsubscribe = window.AppsInToss.graniteEvent.addEventListener('backEvent', {
      onEvent: onBack,
      onError: (error) => {
        console.error('Back event error:', error);
      },
    });
    return unsubscribe;
  } catch (err) {
    console.error('Failed to add back event listener:', err);
    return () => {};
  }
}

/**
 * iOS 스와이프 뒤로가기 제스처 활성화/비활성화
 */
export function setIosSwipeGestureEnabled(enabled: boolean): void {
  if (!isAppsInToss() || !window.AppsInToss?.setIosSwipeGestureEnabled) {
    return;
  }

  try {
    window.AppsInToss.setIosSwipeGestureEnabled(enabled);
  } catch (err) {
    console.error('Failed to set iOS swipe gesture:', err);
  }
}

/**
 * Safe Area Insets 가져오기
 */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (!isAppsInToss() || !window.AppsInToss?.getSafeAreaInsets) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  try {
    return window.AppsInToss.getSafeAreaInsets();
  } catch (err) {
    console.error('Failed to get safe area insets:', err);
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
}

/**
 * 앱 종료 (미니앱 닫기)
 */
export async function closeApp(): Promise<void> {
  if (!isAppsInToss() || !window.AppsInToss?.closeView) {
    return;
  }

  try {
    await window.AppsInToss.closeView();
  } catch (err) {
    console.error('Failed to close app:', err);
  }
}

/**
 * Analytics - 클릭 이벤트 로깅
 */
export function trackClick(buttonName: string, extraParams?: Record<string, unknown>): void {
  if (!isAppsInToss() || !window.AppsInToss?.Analytics) {
    return;
  }

  try {
    window.AppsInToss.Analytics.click({
      button_name: buttonName,
      ...extraParams,
    });
  } catch (err) {
    console.error('Failed to track click:', err);
  }
}

/**
 * Analytics - 노출 이벤트 로깅
 */
export function trackImpression(itemId: string, extraParams?: Record<string, unknown>): void {
  if (!isAppsInToss() || !window.AppsInToss?.Analytics) {
    return;
  }

  try {
    window.AppsInToss.Analytics.impression({
      item_id: itemId,
      ...extraParams,
    });
  } catch (err) {
    console.error('Failed to track impression:', err);
  }
}

/**
 * Analytics - 페이지뷰 이벤트 로깅
 */
export function trackPageView(pageName: string, extraParams?: Record<string, unknown>): void {
  if (!isAppsInToss() || !window.AppsInToss?.Analytics) {
    return;
  }

  try {
    window.AppsInToss.Analytics.pageView({
      page_name: pageName,
      ...extraParams,
    });
  } catch (err) {
    console.error('Failed to track page view:', err);
  }
}

/**
 * 햅틱 피드백 (진동)
 * @param style 진동 강도: light, medium, heavy
 */
export async function triggerHapticFeedback(
  style: 'light' | 'medium' | 'heavy' = 'medium'
): Promise<boolean> {
  if (!isAppsInToss() || !window.AppsInToss?.generateHapticFeedback) {
    return false;
  }

  try {
    await window.AppsInToss.generateHapticFeedback({ style });
    return true;
  } catch (err) {
    console.error('Failed to trigger haptic feedback:', err);
    return false;
  }
}

/**
 * 클립보드 텍스트 읽기
 */
export async function getClipboardText(): Promise<string | null> {
  if (!isAppsInToss() || !window.AppsInToss?.getClipboardText) {
    return null;
  }

  try {
    return await window.AppsInToss.getClipboardText();
  } catch (err) {
    console.error('Failed to get clipboard text:', err);
    return null;
  }
}

/**
 * 클립보드에 텍스트 쓰기
 */
export async function setClipboardText(text: string): Promise<boolean> {
  if (!isAppsInToss() || !window.AppsInToss?.setClipboardText) {
    return false;
  }

  try {
    await window.AppsInToss.setClipboardText(text);
    return true;
  } catch (err) {
    console.error('Failed to set clipboard text:', err);
    return false;
  }
}
