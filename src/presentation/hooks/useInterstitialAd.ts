/**
 * 전면 광고 훅 (v2 API)
 * - 게임 완료 시 결과 표시 전 전면 광고
 * - 하루 최대 10회
 */

import { useCallback, useState } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import {
  shouldShowInterstitial,
  recordInterstitialShown,
  incrementGameCount,
} from '@domain/services/adFrequencyService';
import { INTERSTITIAL_AD_GROUP_ID } from '@constants/ad';

interface UseInterstitialAdReturn {
  isAdSupported: boolean;
  showInterstitialIfNeeded: (onComplete: () => void) => void;
}

export function useInterstitialAd(): UseInterstitialAdReturn {
  const [isAdSupported] = useState(() => {
    try {
      return loadFullScreenAd.isSupported?.() === true;
    } catch {
      return false;
    }
  });

  const showInterstitialIfNeeded = useCallback((onComplete: () => void) => {
    if (!isAdSupported || !shouldShowInterstitial()) {
      onComplete();
      return;
    }

    // AIT 가이드라인: 전면 광고 표시 전 사전 안내
    const toast = document.createElement('div');
    toast.textContent = '잠시 후 광고가 표시됩니다';
    Object.assign(toast.style, {
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      padding: '12px 24px', background: 'rgba(0,0,0,0.8)', color: '#fff',
      borderRadius: '8px', fontSize: '14px', zIndex: '99999', pointerEvents: 'none',
    });
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    try {
      const cleanup = loadFullScreenAd({
        options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            cleanup();
            try {
              showFullScreenAd({
                options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
                onEvent: (showEvent) => {
                  if (showEvent.type === 'dismissed' || showEvent.type === 'failedToShow') {
                    recordInterstitialShown();
                    onComplete();
                  }
                },
                onError: () => {
                  onComplete();
                },
              });
            } catch {
              onComplete();
            }
          }
        },
        onError: () => {
          onComplete();
        },
      });
    } catch {
      onComplete();
    }
    }, 500);
  }, [isAdSupported]);

  return { isAdSupported, showInterstitialIfNeeded };
}

export { incrementGameCount };
