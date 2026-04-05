import { useEffect, useRef, useState } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { BANNER_TEXT_AD_GROUP_ID } from '@constants/ad';

interface AdBannerProps {
  className?: string;
}

function checkTossAdsSupported(): boolean {
  try {
    return TossAds.attachBanner.isSupported?.() ?? false;
  } catch {
    return false;
  }
}

// Module-level singleton: TossAds.initialize는 앱 전체에서 한 번만 호출
let tossAdsInitialized = false;
let tossAdsInitializing = false;
const initCallbacks: Array<() => void> = [];

function ensureTossAdsInitialized(onReady: () => void, onFail: () => void): void {
  if (tossAdsInitialized) {
    onReady();
    return;
  }

  initCallbacks.push(onReady);

  if (tossAdsInitializing) return;
  tossAdsInitializing = true;

  TossAds.initialize({
    callbacks: {
      onInitialized: () => {
        tossAdsInitialized = true;
        tossAdsInitializing = false;
        const pending = [...initCallbacks];
        initCallbacks.length = 0;
        pending.forEach((cb) => cb());
      },
      onInitializationFailed: (error) => {
        tossAdsInitializing = false;
        initCallbacks.length = 0;
        console.warn('[AdBanner] Initialization failed:', error.message);
        onFail();
      },
    },
  });
}

/**
 * AIT TossAds 배너 광고 컴포넌트
 *
 * TossAds.initialize는 module-level에서 한 번만 호출
 * 각 AdBanner는 attachBanner만 수행
 * 앱인토스 환경이 아닐 경우 아무것도 렌더링하지 않음
 */
export function AdBanner({ className = '' }: AdBannerProps): React.JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const destroyRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(() => checkTossAdsSupported());

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const container = containerRef.current;

    ensureTossAdsInitialized(
      () => {
        if (!container) return;

        try {
          const result = TossAds.attachBanner(
            BANNER_TEXT_AD_GROUP_ID,
            container,
            {
              theme: 'light',
              variant: 'card',
              callbacks: {
                onAdFailedToRender: (payload) => {
                  console.warn('[AdBanner] Failed to render:', payload);
                  setIsVisible(false);
                },
              },
            },
          );

          destroyRef.current = result.destroy;
        } catch (error) {
          console.warn('[AdBanner] attachBanner failed:', error);
          setIsVisible(false);
        }
      },
      () => {
        setIsVisible(false);
      },
    );

    return () => {
      try {
        destroyRef.current?.();
        destroyRef.current = null;
      } catch {
        // cleanup 실패 무시
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`ad-banner-container ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
