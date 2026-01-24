/**
 * 포맷팅 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import { formatBalance, formatMoney, getReturnClass, getLuckLabel } from '../formatUtils';

describe('formatUtils', () => {
  describe('formatBalance', () => {
    it('should format values under 100M in 만원', () => {
      expect(formatBalance(10_000_000)).toBe('1,000만원');
      expect(formatBalance(15_500_000)).toBe('1,550만원');
      expect(formatBalance(500_000)).toBe('50만원');
    });

    it('should format values over 100M in 억원', () => {
      expect(formatBalance(100_000_000)).toBe('1.0억원');
      expect(formatBalance(150_000_000)).toBe('1.5억원');
      expect(formatBalance(250_000_000)).toBe('2.5억원');
    });

    it('should handle edge cases', () => {
      expect(formatBalance(0)).toBe('0만원');
      expect(formatBalance(99_999_999)).toBe('10,000만원');
    });
  });

  describe('formatMoney', () => {
    it('should format positive values with + sign', () => {
      expect(formatMoney(500_000)).toBe('+50만');
      expect(formatMoney(10_000)).toBe('+1만');
    });

    it('should format negative values with - sign', () => {
      expect(formatMoney(-300_000)).toBe('-30만');
      expect(formatMoney(-5_000)).toBe('-5천');
    });

    it('should format large values in 천만', () => {
      expect(formatMoney(10_000_000)).toBe('+1천만');
      expect(formatMoney(-20_000_000)).toBe('-2천만');
    });

    it('should format decimal 천만 values correctly (갭투자 EV 검증)', () => {
      // 갭투자 시나리오: EV = 0.2 * 50,000,000 + 0.8 * (-30,000,000) = -14,000,000원
      expect(formatMoney(-14_000_000)).toBe('-1.4천만');
      expect(formatMoney(15_000_000)).toBe('+1.5천만');
      expect(formatMoney(-18_000_000)).toBe('-1.8천만');
      expect(formatMoney(25_000_000)).toBe('+2.5천만');
    });

    it('should format 억 values correctly', () => {
      expect(formatMoney(100_000_000)).toBe('+1억');
      expect(formatMoney(-150_000_000)).toBe('-1.5억');
      expect(formatMoney(200_000_000)).toBe('+2억');
    });

    it('should handle small values in 천', () => {
      expect(formatMoney(1_000)).toBe('+1천');
      expect(formatMoney(9_000)).toBe('+9천');
    });
  });

  describe('getReturnClass', () => {
    it('should return profit-high for returns >= 30%', () => {
      expect(getReturnClass(30)).toBe('profit-high');
      expect(getReturnClass(50)).toBe('profit-high');
    });

    it('should return profit-medium for returns 10-30%', () => {
      expect(getReturnClass(10)).toBe('profit-medium');
      expect(getReturnClass(25)).toBe('profit-medium');
    });

    it('should return profit-low for returns 0-10%', () => {
      expect(getReturnClass(0.1)).toBe('profit-low');
      expect(getReturnClass(9)).toBe('profit-low');
    });

    it('should return loss classes for negative returns', () => {
      expect(getReturnClass(0)).toBe('loss-low');
      expect(getReturnClass(-5)).toBe('loss-low');
      expect(getReturnClass(-15)).toBe('loss-medium');
      expect(getReturnClass(-25)).toBe('loss-high');
    });
  });

  describe('getLuckLabel', () => {
    it('should return appropriate labels for luck scores', () => {
      expect(getLuckLabel(60)).toBe('대박 행운');
      expect(getLuckLabel(30)).toBe('행운');
      expect(getLuckLabel(0)).toBe('보통');
      expect(getLuckLabel(-30)).toBe('불운');
      expect(getLuckLabel(-60)).toBe('극심한 불운');
    });

    it('should handle boundary values', () => {
      expect(getLuckLabel(50)).toBe('행운'); // exactly 50 is not > 50
      expect(getLuckLabel(51)).toBe('대박 행운');
      expect(getLuckLabel(20)).toBe('보통'); // exactly 20 is not > 20
      expect(getLuckLabel(21)).toBe('행운');
    });
  });
});
