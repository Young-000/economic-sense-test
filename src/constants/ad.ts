/**
 * 광고 그룹 ID 상수
 *
 * 테스트/프로덕션 ID를 환경별로 관리
 * 앱인토스 콘솔에서 경제 센스 테스트 전용 광고 그룹 생성 후 교체 필요
 */

const IS_PRODUCTION = import.meta.env.PROD;

/** 보상형 광고 (보너스 코인 충전) */
export const REWARDED_AD_GROUP_ID = IS_PRODUCTION
  ? 'ait.v2.live.economic-sense-rewarded'  // TODO: 콘솔 발급 후 교체
  : 'ait-ad-test-rewarded-id';

/** 전면 광고 (게임 완료 후) */
export const INTERSTITIAL_AD_GROUP_ID = IS_PRODUCTION
  ? 'ait.v2.live.economic-sense-interstitial'  // TODO: 콘솔 발급 후 교체
  : 'ait-ad-test-interstitial-id';

/** 배너 광고 - 문구형 */
export const BANNER_TEXT_AD_GROUP_ID = IS_PRODUCTION
  ? 'ait.v2.live.economic-sense-banner-text'  // TODO: 콘솔 발급 후 교체
  : 'ait-ad-test-banner-id';

/** 배너 광고 - 이미지형 */
export const BANNER_IMAGE_AD_GROUP_ID = IS_PRODUCTION
  ? 'ait.v2.live.economic-sense-banner-image'  // TODO: 콘솔 발급 후 교체
  : 'ait-ad-test-native-image-id';
