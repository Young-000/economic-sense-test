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

/**
 * AIT TossAds 배너 광고 컴포넌트
 *
 * TossAds.initialize + TossAds.attachBanner 사용
 * 앱인토스 환경이 아닐 경우 아무것도 렌더링하지 않음
 */
export function AdBanner({ className = '' }: AdBannerProps): React.JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAttached = useRef(false);
  const [isVisible, setIsVisible] = useState(() => checkTossAdsSupported());

  useEffect(() => {
    if (isAttached.current || !isVisible || !containerRef.current) return;

    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          if (!containerRef.current || isAttached.current) return;

          const result = TossAds.attachBanner(
            BANNER_TEXT_AD_GROUP_ID,
            containerRef.current,
            {
              theme: 'light',
              variant: 'card',
              callbacks: {
                onAdFailedToRender: (payload) => {
                  console.warn('[AdBanner] Failed to render:', payload.error.message);
                  setIsVisible(false);
                },
              },
            },
          );

          isAttached.current = true;

          return () => {
            result.destroy();
          };
        },
        onInitializationFailed: (error) => {
          console.warn('[AdBanner] Initialization failed:', error.message);
          setIsVisible(false);
        },
      },
    });
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
