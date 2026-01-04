/**
 * Apps in Toss 연동 서비스
 * - 게임 리더보드
 * - 배너 광고
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
