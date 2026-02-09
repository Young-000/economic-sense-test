/**
 * 앱 환경 유틸리티 (순수 웹 버전)
 * - 토스 SDK 제거 후 웹 기본 API만 사용
 */

// no-op analytics
export function trackClick(_buttonName: string, _extraParams?: Record<string, unknown>): void {}
export function trackImpression(_itemId: string, _extraParams?: Record<string, unknown>): void {}
export function trackPageView(_pageName: string, _extraParams?: Record<string, unknown>): void {}

// no-op haptic
export function triggerHapticFeedback(
  _style: 'light' | 'medium' | 'heavy' = 'medium'
): void {}
