import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import { BANNER_TEXT_AD_GROUP_ID } from '@constants/ad';

interface AdBannerProps {
  className?: string;
}

/**
 * AIT TossAds 배너 광고 컴포넌트
 *
 * TossAds.initialize + TossAds.attachBanner 사용
 * 앱인토스 환경이 아닐 경우 빈 영역 표시
 */
export function AdBanner({ className = '' }: AdBannerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAttached = useRef(false);

  useEffect(() => {
    if (isAttached.current || !containerRef.current) return;

    try {
      if (!TossAds.attachBanner.isSupported?.()) return;

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
          },
        },
      });
    } catch {
      // AIT SDK 미지원 환경 (웹 브라우저 등)
    }
  }, []);

  return (
    <div className={`ad-banner-container ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
