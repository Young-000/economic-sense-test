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
  }, [isAdSupported]);

  return { isAdSupported, showInterstitialIfNeeded };
}

export { incrementGameCount };
