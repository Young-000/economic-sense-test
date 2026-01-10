/**
 * 투자자 유형 프로필 테스트
 */
import { describe, it, expect } from 'vitest';
import { investorProfiles } from '../investors';
import type { InvestorType } from '@domain/entities';

describe('investorProfiles', () => {
  const expectedTypes: InvestorType[] = [
    'lucky_gambler',
    'unlucky_gambler',
    'smart_winner',
    'smart_unlucky',
    'steady_grower',
    'careful_realist',
    'balanced_investor',
    'wild_card',
  ];

  it('should have all 8 investor types', () => {
    expect(Object.keys(investorProfiles)).toHaveLength(8);
  });

  it('should have all expected investor types', () => {
    expectedTypes.forEach((type) => {
      expect(investorProfiles).toHaveProperty(type);
    });
  });

  describe('each profile should have required properties', () => {
    expectedTypes.forEach((type) => {
      describe(type, () => {
        it('should have matching type property', () => {
          expect(investorProfiles[type].type).toBe(type);
        });

        it('should have a name', () => {
          expect(investorProfiles[type].name).toBeTruthy();
          expect(typeof investorProfiles[type].name).toBe('string');
        });

        it('should have an emoji', () => {
          expect(investorProfiles[type].emoji).toBeTruthy();
        });

        it('should have a description', () => {
          expect(investorProfiles[type].description).toBeTruthy();
          expect(investorProfiles[type].description.length).toBeGreaterThan(10);
        });

        it('should have a tag', () => {
          expect(investorProfiles[type].tag).toBeTruthy();
        });
      });
    });
  });

  describe('specific profile values', () => {
    it('lucky_gambler should have 운빨 부자 name', () => {
      expect(investorProfiles.lucky_gambler.name).toBe('운빨 부자');
      expect(investorProfiles.lucky_gambler.emoji).toBe('🍀');
    });

    it('smart_winner should have 금손 투자자 name', () => {
      expect(investorProfiles.smart_winner.name).toBe('금손 투자자');
      expect(investorProfiles.smart_winner.emoji).toBe('👑');
    });

    it('steady_grower should have 적금의 신 name', () => {
      expect(investorProfiles.steady_grower.name).toBe('적금의 신');
      expect(investorProfiles.steady_grower.emoji).toBe('🏦');
    });

    it('balanced_investor should have 밸런스 장인 name', () => {
      expect(investorProfiles.balanced_investor.name).toBe('밸런스 장인');
      expect(investorProfiles.balanced_investor.emoji).toBe('⚖️');
    });

    it('wild_card should have YOLO 투자자 name', () => {
      expect(investorProfiles.wild_card.name).toBe('YOLO 투자자');
      expect(investorProfiles.wild_card.emoji).toBe('🎲');
    });
  });

  describe('tags format', () => {
    it('all tags should be valid hashtag format (no spaces, underscore allowed)', () => {
      Object.values(investorProfiles).forEach((profile) => {
        expect(profile.tag).not.toContain(' ');
        expect(profile.tag.length).toBeGreaterThan(0);
      });
    });
  });
});
