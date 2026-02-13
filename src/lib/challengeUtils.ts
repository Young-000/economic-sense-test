/**
 * 친구 도전 기능 유틸리티
 * URL 파라미터를 통한 결과 공유 및 비교
 */
import type { InvestorType } from '@domain/entities';

export interface ChallengeData {
  /** 도전자 이름 (선택) */
  name?: string;
  /** 투자자 유형 */
  type: InvestorType;
  /** 수익률 */
  return: number;
  /** 생성 타임스탬프 */
  ts: number;
}

const CHALLENGE_STORAGE_KEY = 'economic-sense-challenge';

/**
 * 도전 데이터를 URL 파라미터 문자열로 인코딩
 */
export function encodeChallengeData(data: Omit<ChallengeData, 'ts'>): string {
  const payload: ChallengeData = {
    ...data,
    ts: Date.now(),
  };
  // UTF-8 안전 Base64 인코딩 (URL-safe)
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * URL 파라미터에서 도전 데이터 디코딩
 */
export function decodeChallengeData(encoded: string): ChallengeData | null {
  try {
    // URL-safe Base64 복원 (UTF-8 안전)
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as ChallengeData;

    // 유효성 검사
    if (!data.type || typeof data.return !== 'number') {
      return null;
    }

    // 24시간 이내 도전만 유효
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (data.ts < oneDayAgo) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * 도전 URL 생성
 */
export function createChallengeUrl(
  type: InvestorType,
  totalReturn: number,
  name?: string
): string {
  const encoded = encodeChallengeData({ type, return: totalReturn, name });
  const baseUrl = window.location.origin;
  return `${baseUrl}?challenge=${encoded}`;
}

/**
 * 현재 URL에서 도전 데이터 추출 및 저장
 */
export function extractAndSaveChallenge(): ChallengeData | null {
  const params = new URLSearchParams(window.location.search);
  const challengeParam = params.get('challenge');

  if (!challengeParam) {
    return null;
  }

  const data = decodeChallengeData(challengeParam);
  if (data) {
    // sessionStorage에 저장
    sessionStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(data));

    // URL에서 파라미터 제거 (깔끔한 URL 유지)
    const url = new URL(window.location.href);
    url.searchParams.delete('challenge');
    window.history.replaceState({}, '', url.toString());
  }

  return data;
}

/**
 * 저장된 도전 데이터 가져오기
 */
export function getSavedChallenge(): ChallengeData | null {
  const stored = sessionStorage.getItem(CHALLENGE_STORAGE_KEY);
  if (!stored) return null;

  try {
    const data = JSON.parse(stored) as ChallengeData;
    // 24시간 이내만 유효
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (data.ts < oneDayAgo) {
      sessionStorage.removeItem(CHALLENGE_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * 저장된 도전 데이터 삭제
 */
export function clearSavedChallenge(): void {
  sessionStorage.removeItem(CHALLENGE_STORAGE_KEY);
}

/**
 * 비교 결과 생성
 */
export function compareResults(
  myReturn: number,
  challengeReturn: number
): { winner: 'me' | 'friend' | 'tie'; diff: number; message: string } {
  const diff = Math.abs(myReturn - challengeReturn);

  if (Math.abs(myReturn - challengeReturn) < 0.1) {
    return { winner: 'tie', diff: 0, message: '🤝 무승부! 비슷한 실력이네요' };
  }

  if (myReturn > challengeReturn) {
    return {
      winner: 'me',
      diff,
      message: diff >= 50 ? '🔥 압도적 승리!' : diff >= 20 ? '✨ 멋진 승리!' : '👍 승리!',
    };
  }

  return {
    winner: 'friend',
    diff,
    message: diff >= 50 ? '😭 완패...' : diff >= 20 ? '😅 아쉽게 졌어요' : '🤏 아깝게 졌어요',
  };
}
