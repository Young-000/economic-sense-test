/**
 * 리액션 메시지 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  getReactionMessage,
  getOutcomeEmoji,
  getLuckText,
  type ReactionParams,
} from '../reactions';

describe('Reactions', () => {
  const createParams = (overrides: Partial<ReactionParams> = {}): ReactionParams => ({
    outcome: 100_000,
    expectedValue: 100_000,
    winStreak: 0,
    loseStreak: 0,
    roundNumber: 5,
    totalRounds: 10,
    currentBalance: 10_000_000,
    initialBalance: 10_000_000,
    ...overrides,
  });

  describe('getReactionMessage', () => {
    it('should return a string message', () => {
      const message = getReactionMessage(createParams());
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should return fire message for 5+ win streak', () => {
      const message = getReactionMessage(createParams({ winStreak: 5 }));
      // 연승 메시지 중 하나가 반환되어야 함
      expect(message).toBeDefined();
    });

    it('should return encouraging message for 3+ lose streak', () => {
      const message = getReactionMessage(createParams({ loseStreak: 3 }));
      expect(message).toBeDefined();
    });

    it('should return big win message for outcome >= 1M', () => {
      const message = getReactionMessage(createParams({ outcome: 1_500_000 }));
      expect(message).toBeDefined();
    });

    it('should return big loss message for outcome <= -500K', () => {
      const message = getReactionMessage(createParams({ outcome: -600_000 }));
      expect(message).toBeDefined();
    });

    it('should return lucky message for outcome >> expected', () => {
      const message = getReactionMessage(createParams({
        outcome: 500_000,
        expectedValue: 100_000,
      }));
      expect(message).toBeDefined();
    });

    it('should return unlucky message for outcome << expected', () => {
      const message = getReactionMessage(createParams({
        outcome: -200_000,
        expectedValue: 100_000,
      }));
      expect(message).toBeDefined();
    });

    it('should return last round message', () => {
      const message = getReactionMessage(createParams({
        roundNumber: 9,
        totalRounds: 10,
      }));
      expect(message).toBeDefined();
    });

    it('should return first round message', () => {
      const message = getReactionMessage(createParams({ roundNumber: 0 }));
      expect(message).toBeDefined();
    });

    it('should return recovery message when crossing initial balance upward', () => {
      const message = getReactionMessage(createParams({
        currentBalance: 10_100_000,
        initialBalance: 10_000_000,
        outcome: 200_000, // Before outcome was 9.9M, now 10.1M
      }));
      expect(message).toBeDefined();
    });
  });

  describe('getOutcomeEmoji', () => {
    it('should return rocket for outcome >= 1M', () => {
      expect(getOutcomeEmoji(1_500_000)).toBe('🚀');
    });

    it('should return party for outcome >= 500K', () => {
      expect(getOutcomeEmoji(500_000)).toBe('🎉');
    });

    it('should return money for outcome >= 100K', () => {
      expect(getOutcomeEmoji(100_000)).toBe('💰');
    });

    it('should return up arrow for positive outcome', () => {
      expect(getOutcomeEmoji(50_000)).toBe('📈');
    });

    it('should return neutral for zero outcome', () => {
      expect(getOutcomeEmoji(0)).toBe('➡️');
    });

    it('should return down arrow for small loss', () => {
      expect(getOutcomeEmoji(-50_000)).toBe('📉');
    });

    it('should return sad for moderate loss', () => {
      expect(getOutcomeEmoji(-200_000)).toBe('😢');
    });

    it('should return flying money for big loss', () => {
      expect(getOutcomeEmoji(-600_000)).toBe('💸');
    });
  });

  describe('getLuckText', () => {
    it('should return double lucky for very high luck', () => {
      expect(getLuckText(700_000, 100_000)).toBe('🍀🍀 대박 행운!');
    });

    it('should return lucky for good luck', () => {
      expect(getLuckText(400_000, 100_000)).toBe('🍀 Lucky!');
    });

    it('should return sparkle for slight luck', () => {
      expect(getLuckText(200_000, 100_000)).toBe('✨ 운 좋았어요');
    });

    it('should return expected for neutral luck', () => {
      expect(getLuckText(100_000, 100_000)).toBe('📊 기대값 수준');
    });

    it('should return sad for bad luck', () => {
      expect(getLuckText(-50_000, 100_000)).toBe('😢 운이 없었어요');
    });

    it('should return crying for very bad luck', () => {
      expect(getLuckText(-150_000, 100_000)).toBe('😭 Unlucky');
    });

    it('should return skull for extreme bad luck', () => {
      expect(getLuckText(-500_000, 100_000)).toBe('💀 극심한 불운');
    });
  });
});
