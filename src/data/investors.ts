/**
 * 투자자 유형 프로필
 */

import type { InvestorType, InvestorProfile } from '@domain/entities';

export const investorProfiles: Record<InvestorType, InvestorProfile> = {
  lucky_gambler: {
    type: 'lucky_gambler',
    name: '운빨 부자',
    emoji: '🍀',
    description: '실력? 그게 뭔데요. 운이면 충분해요! 오늘 운 다 쓴 거 아니죠?',
    tag: '오늘_치킨_각',
  },

  unlucky_gambler: {
    type: 'unlucky_gambler',
    name: '용감한 흙손',
    emoji: '😭',
    description: '용기는 좋았어요... 근데 운이 너무 없었네요. 현실에선 조심하세요!',
    tag: '내_돈_어디감',
  },

  smart_winner: {
    type: 'smart_winner',
    name: '금손 투자자',
    emoji: '👑',
    description: '똑똑한 선택 + 운까지 따라줬어요! 진짜 투자하면 부자될 스타일.',
    tag: '부자될_상',
  },

  smart_unlucky: {
    type: 'smart_unlucky',
    name: '억울한 전략가',
    emoji: '🥲',
    description: '선택은 완벽했는데 주사위가 배신했어요. 실력은 인정! 운만 따르면 버핏.',
    tag: '운만_따르면_버핏',
  },

  steady_grower: {
    type: 'steady_grower',
    name: '적금의 신',
    emoji: '🏦',
    description: '안전하게 불렸어요! 화려하진 않지만 잃지 않는 게 진짜 실력.',
    tag: '적금러_인정',
  },

  careful_realist: {
    type: 'careful_realist',
    name: '돌다리 검증러',
    emoji: '🐢',
    description: '손실은 싫어요! 근데 가끔은 도전도 해봐요. 기회비용도 손실이에요~',
    tag: '손실만은_싫어',
  },

  balanced_investor: {
    type: 'balanced_investor',
    name: '밸런스 장인',
    emoji: '⚖️',
    description: '공격과 수비의 완벽한 조화! 상황 판단 능력 甲.',
    tag: '줏대있는_투자',
  },

  wild_card: {
    type: 'wild_card',
    name: 'YOLO 투자자',
    emoji: '🎲',
    description: '패턴? 전략? 그냥 느낌 가는 대로! 인생은 모험이니까요~',
    tag: 'YOLO_투자',
  },
};
