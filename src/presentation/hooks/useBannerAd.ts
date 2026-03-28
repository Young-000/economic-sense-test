/**
 * 배너 광고 훅
 * AIT 배너 광고 표시를 위한 상태 관리
 */

import { useState } from 'react';
import { BANNER_TEXT_AD_GROUP_ID, BANNER_IMAGE_AD_GROUP_ID } from '@constants/ad';

type BannerType = 'text' | 'image';

interface UseBannerAdReturn {
  textAdGroupId: string;
  imageAdGroupId: string;
  bannerType: BannerType;
  setBannerType: (type: BannerType) => void;
}

export function useBannerAd(): UseBannerAdReturn {
  const [bannerType, setBannerType] = useState<BannerType>('text');

  return {
    textAdGroupId: BANNER_TEXT_AD_GROUP_ID,
    imageAdGroupId: BANNER_IMAGE_AD_GROUP_ID,
    bannerType,
    setBannerType,
  };
}
