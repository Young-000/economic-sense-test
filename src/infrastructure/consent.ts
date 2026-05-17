/**
 * 약관/개인정보 동의 상태 관리
 *
 * 콘솔 검토 요구사항: 토스 로그인 + 토스 포인트 지급 시스템 사용 →
 * 첫 진입 시 약관/개인정보 동의 필수, 동의 상태는 재진입 시 스킵.
 */

const CONSENT_KEY = 'economic-sense-test:legal-consent-v1';

export type ConsentState = {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  acceptedAt: string;
};

export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function hasConsented(): boolean {
  const state = getConsent();
  return !!state && state.termsAccepted && state.privacyAccepted;
}

export function saveConsent(): ConsentState {
  const state: ConsentState = {
    termsAccepted: true,
    privacyAccepted: true,
    acceptedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  return state;
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
}

/** 약관 / 개인정보 처리방침 공개 URL (Vercel 정적 호스팅) */
export const LEGAL_URLS = {
  terms: '/legal/terms.html',
  privacy: '/legal/privacy.html',
} as const;
