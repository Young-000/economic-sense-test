/**
 * 광고 그룹 ID 상수 (중앙화)
 *
 * 개발: 테스트 ID 사용 (운영 ID 사용 시 토스 제재)
 * 운영: 콘솔에서 광고 그룹 생성 후 발급된 ID로 교체
 *
 * 표준 패턴: bible-reading `AD_IDS` 객체 형태.
 */

const IS_PRODUCTION = import.meta.env.PROD;

export const AD_IDS = {
  /** 보상형 — 보너스 코인 충전 */
  rewarded: IS_PRODUCTION
    ? 'ait.v2.live.633248ecfa9e4273'
    : 'ait-ad-test-rewarded-id',

  /** 전면 — 게임 완료 후 */
  interstitial: IS_PRODUCTION
    ? 'ait.v2.live.6fea9a44740e423b'
    : 'ait-ad-test-interstitial-id',

  /** 배너 — 텍스트(리스트형) */
  bannerText: IS_PRODUCTION
    ? 'ait.v2.live.084e10a3cf73475d'
    : 'ait-ad-test-banner-id',

  /** 배너 — 이미지(피드형) */
  bannerImage: IS_PRODUCTION
    ? 'ait.v2.live.cb8b63dfa8004d5d'
    : 'ait-ad-test-native-image-id',
} as const;

// 하위 호환 (기존 호출부 보존)
export const REWARDED_AD_GROUP_ID = AD_IDS.rewarded;
export const INTERSTITIAL_AD_GROUP_ID = AD_IDS.interstitial;
export const BANNER_TEXT_AD_GROUP_ID = AD_IDS.bannerText;
export const BANNER_IMAGE_AD_GROUP_ID = AD_IDS.bannerImage;
