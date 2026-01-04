/**
 * 투자자 유형 프로필
 */

import type { InvestorType, InvestorProfile } from '@domain/entities';

export const investorProfiles: Record<InvestorType, InvestorProfile> = {
  lucky_gambler: {
    type: 'lucky_gambler',
    name: '운 좋은 도박사',
    emoji: '🎰',
    description: '과감한 선택을 했는데 운이 따라줬어요! 하지만 다음에도 이럴 거라는 보장은 없어요.',
    tag: '오늘 로또 사세요',
  },

  unlucky_gambler: {
    type: 'unlucky_gambler',
    name: '불운한 도전가',
    emoji: '🎲',
    description: '도전 정신은 좋았지만 운이 안 따랐네요. 리스크 관리도 실력이에요!',
    tag: '다음엔 분산투자',
  },

  smart_winner: {
    type: 'smart_winner',
    name: '합리적 승리자',
    emoji: '🏆',
    description: '기대값 높은 선택 + 운까지! 당신은 진짜 투자 센스가 있어요.',
    tag: '워렌 버핏 후계자',
  },

  smart_unlucky: {
    type: 'smart_unlucky',
    name: '실력있는 불운아',
    emoji: '📊',
    description: '선택은 합리적이었는데 운이 안 따랐어요. 장기적으로는 당신이 이겨요.',
    tag: '때를 기다리는 중',
  },

  steady_grower: {
    type: 'steady_grower',
    name: '안정적 성장가',
    emoji: '🌱',
    description: '안전한 선택으로 꾸준히 불렸어요. 복리의 마법을 아는 사람!',
    tag: '적금 마스터',
  },

  careful_realist: {
    type: 'careful_realist',
    name: '신중한 현실주의자',
    emoji: '🛡️',
    description: '리스크를 피했지만 수익도 적었어요. 가끔은 기회를 잡아보는 것도?',
    tag: '원금 보장 최고',
  },

  balanced_investor: {
    type: 'balanced_investor',
    name: '균형잡힌 투자자',
    emoji: '⚖️',
    description: '공격과 수비의 균형! 상황에 맞게 유연하게 대처했어요.',
    tag: '포트폴리오 장인',
  },

  wild_card: {
    type: 'wild_card',
    name: '예측불가 플레이어',
    emoji: '🃏',
    description: '어떤 패턴도 없는 자유로운 영혼! 직감을 믿는 타입이네요.',
    tag: '본능적 투자자',
  },
};
