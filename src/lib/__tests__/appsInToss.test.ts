/**
 * appsInToss 유틸리티 테스트 (순수 웹 버전)
 * 모든 함수가 no-op으로 안전하게 동작하는지 확인
 */
import { describe, it, expect } from 'vitest';
import {
  trackClick,
  trackImpression,
  trackPageView,
  triggerHapticFeedback,
} from '../appsInToss';

describe('appsInToss (no-op stubs)', () => {
  describe('trackClick', () => {
    it('should be callable without error', () => {
      expect(() => trackClick('test_button')).not.toThrow();
    });

    it('should accept extra params', () => {
      expect(() => trackClick('test_button', { key: 'value' })).not.toThrow();
    });
  });

  describe('trackImpression', () => {
    it('should be callable without error', () => {
      expect(() => trackImpression('test_item')).not.toThrow();
    });

    it('should accept extra params', () => {
      expect(() => trackImpression('test_item', { position: 'top' })).not.toThrow();
    });
  });

  describe('trackPageView', () => {
    it('should be callable without error', () => {
      expect(() => trackPageView('test_page')).not.toThrow();
    });

    it('should accept extra params', () => {
      expect(() => trackPageView('test_page', { score: 100 })).not.toThrow();
    });
  });

  describe('triggerHapticFeedback', () => {
    it('should be callable without error', () => {
      expect(() => triggerHapticFeedback()).not.toThrow();
    });

    it('should accept style parameter', () => {
      expect(() => triggerHapticFeedback('heavy')).not.toThrow();
      expect(() => triggerHapticFeedback('light')).not.toThrow();
      expect(() => triggerHapticFeedback('medium')).not.toThrow();
    });
  });
});
