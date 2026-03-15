/**
 * v2 보상형 광고 훅
 * loadFullScreenAd + showFullScreenAd (apps-in-toss v2 API)
 */

import { useCallback, useRef, useState } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { REWARDED_AD_GROUP_ID } from '@constants/ad';

interface FullScreenAdCallbacks {
  onRewarded: () => void;
  onDismiss?: () => void;
  onError?: (error: Error) => void;
}

interface UseFullScreenAdReturn {
  isAdSupported: boolean;
  isAdLoading: boolean;
  loadAndShowAd: (callbacks: FullScreenAdCallbacks) => void;
}

export function useFullScreenAd(): UseFullScreenAdReturn {
  const [isAdSupported] = useState(() => {
    try {
      return loadFullScreenAd.isSupported?.() === true;
    } catch {
      return false;
    }
  });
  const [isAdLoading, setIsAdLoading] = useState(false);

  const rewardCallbackRef = useRef<(() => void) | undefined>();
  const dismissCallbackRef = useRef<(() => void) | undefined>();
  const errorCallbackRef = useRef<((error: Error) => void) | undefined>();

  const loadAndShowAd = useCallback(({ onRewarded, onDismiss, onError }: FullScreenAdCallbacks) => {
    if (!isAdSupported) {
      onError?.(new Error('Ad not supported in this environment'));
      return;
    }

    if (isAdLoading) return;

    rewardCallbackRef.current = onRewarded;
    dismissCallbackRef.current = onDismiss;
    errorCallbackRef.current = onError;
    setIsAdLoading(true);

    try {
      const cleanup = loadFullScreenAd({
        options: { adGroupId: REWARDED_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            cleanup();
            try {
              showFullScreenAd({
                options: { adGroupId: REWARDED_AD_GROUP_ID },
                onEvent: (showEvent) => {
                  switch (showEvent.type) {
                    case 'userEarnedReward':
                      rewardCallbackRef.current?.();
                      break;
                    case 'dismissed':
                      setIsAdLoading(false);
                      dismissCallbackRef.current?.();
                      break;
                    case 'failedToShow':
                      setIsAdLoading(false);
                      errorCallbackRef.current?.(new Error('Failed to show ad'));
                      break;
                  }
                },
                onError: (err) => {
                  setIsAdLoading(false);
                  errorCallbackRef.current?.(err instanceof Error ? err : new Error(String(err)));
                },
              });
            } catch (showErr) {
              setIsAdLoading(false);
              errorCallbackRef.current?.(showErr instanceof Error ? showErr : new Error('Failed to show ad'));
            }
          }
        },
        onError: (loadErr) => {
          setIsAdLoading(false);
          errorCallbackRef.current?.(loadErr instanceof Error ? loadErr : new Error(String(loadErr)));
        },
      });
    } catch (error) {
      setIsAdLoading(false);
      onError?.(error instanceof Error ? error : new Error('Failed to load ad'));
    }
  }, [isAdSupported, isAdLoading]);

  return { isAdSupported, isAdLoading, loadAndShowAd };
}
