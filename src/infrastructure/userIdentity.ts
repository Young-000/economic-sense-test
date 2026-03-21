/**
 * 앱인토스 비게임 인증 - 유저 식별자 관리
 *
 * appLogin() -> Supabase Edge Function(mTLS) -> 토스 파트너 API
 * -> userKey 추출 -> 클라이언트 캐싱
 */

import { appLogin, closeView } from '@apps-in-toss/web-framework';

// --- 상수 ---

const USER_KEY_CACHE = 'economic-sense-user-key';
const USER_KEY_EXPIRY = 'economic-sense-user-key-expiry';
const LOCAL_USER_ID_KEY = 'economic-sense-test-local-user-id';
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 캐시 TTL: AccessToken 만료보다 약간 짧게 (50분, 토큰 유효기간 60분 기준)
const CACHE_TTL_MS = 50 * 60 * 1000;

// Edge Function 요청 타임아웃 (5초)
const EDGE_FUNCTION_TIMEOUT_MS = 5_000;

let cachedUserKey: string | null = null;
let lastAuthError: string | null = null;

// --- 환경 감지 ---

/**
 * 앱인토스 환경 판별 (appLogin 기반)
 */
export function isAppsInTossEnvironment(): boolean {
  try {
    const fn = appLogin as unknown as { isSupported?: () => boolean };
    return typeof fn.isSupported === 'function' && fn.isSupported();
  } catch {
    return false;
  }
}

// --- 캐시 관리 ---

function getCachedUserKey(): string | null {
  if (cachedUserKey) return cachedUserKey;
  try {
    const key = localStorage.getItem(USER_KEY_CACHE);
    const expiry = localStorage.getItem(USER_KEY_EXPIRY);
    if (key && expiry && Date.now() < Number(expiry)) {
      cachedUserKey = key;
      return key;
    }
    localStorage.removeItem(USER_KEY_CACHE);
    localStorage.removeItem(USER_KEY_EXPIRY);
  } catch {
    // localStorage 접근 실패
  }
  return null;
}

function setCachedUserKey(userKey: string, ttlMs: number = CACHE_TTL_MS): void {
  cachedUserKey = userKey;
  try {
    localStorage.setItem(USER_KEY_CACHE, userKey);
    localStorage.setItem(USER_KEY_EXPIRY, String(Date.now() + ttlMs));
  } catch {
    // localStorage 저장 실패 -- 메모리 캐시만 유지
  }
}

// --- 로컬 ID fallback ---

function getOrCreateLocalUserId(): string {
  try {
    let localId = localStorage.getItem(LOCAL_USER_ID_KEY);
    if (!localId) {
      localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(LOCAL_USER_ID_KEY, localId);
    }
    return localId;
  } catch {
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

function fallbackToLocalId(): string {
  const localId = getOrCreateLocalUserId();
  cachedUserKey = localId;
  return localId;
}

// --- Edge Function 통신 ---

interface AuthResponse {
  userKey: string;
  expiresAt: string;
}

interface AuthErrorResponse {
  error: string;
  message: string;
}

async function exchangeAuthCode(authorizationCode: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT_MS);

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ authorizationCode }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json() as AuthErrorResponse;
      throw new Error(error.error ?? `HTTP ${response.status}`);
    }

    const data = await response.json() as AuthResponse;
    return data.userKey;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Edge Function timeout (${EDGE_FUNCTION_TIMEOUT_MS}ms)`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- 메인 초기화 ---

/**
 * 앱 시작 시 호출 -- userKey 조회 후 캐싱
 */
export async function initializeUserIdentity(): Promise<string> {
  // 개발 모드 mock 지원
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_USER_KEY) {
    const mockKey = import.meta.env.VITE_MOCK_USER_KEY as string;
    setCachedUserKey(mockKey);
    return mockKey;
  }

  // 1. 메모리/localStorage 캐시 확인
  const cached = getCachedUserKey();
  if (cached) return cached;

  // 2. AIT 환경이면 appLogin 플로우
  if (isAppsInTossEnvironment()) {
    try {
      const loginResult = await appLogin();

      if (!loginResult) {
        console.warn('[userIdentity] appLogin not supported');
        return fallbackToLocalId();
      }

      const { authorizationCode } = loginResult;
      const userKey = await exchangeAuthCode(authorizationCode);
      setCachedUserKey(userKey);
      return userKey;
    } catch (err) {
      const errorMsg = err instanceof Error
        ? `${err.name}: ${err.message}`
        : String(err);
      console.warn('[userIdentity] appLogin flow failed:', errorMsg);
      lastAuthError = errorMsg;
      return fallbackToLocalId();
    }
  }

  // 3. 비AIT 환경
  return fallbackToLocalId();
}

// --- Public API ---

export async function getUserId(): Promise<string> {
  if (cachedUserKey) return cachedUserKey;
  return initializeUserIdentity();
}

export function getCachedUserId(): string | null {
  return cachedUserKey;
}

export function getLastAuthError(): string | null {
  return lastAuthError;
}

/**
 * 미니앱 종료 (appLogin 실패/취소 시 호출)
 */
export async function exitApp(): Promise<void> {
  await closeView();
}

export function resetUserIdentityCache(): void {
  cachedUserKey = null;
  lastAuthError = null;
  try {
    localStorage.removeItem(USER_KEY_CACHE);
    localStorage.removeItem(USER_KEY_EXPIRY);
  } catch {
    // localStorage 접근 실패
  }
}

/**
 * UNLINK referrer 체크
 * 토스앱 설정에서 연결 해제 시 URL에 referrer=UNLINK 파라미터가 전달됨
 */
export function checkUnlinkReferrer(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('referrer') === 'UNLINK';
  } catch {
    return false;
  }
}

/**
 * 앱 전용 사용자 데이터만 삭제 (UNLINK 시 호출)
 */
export function clearAllUserData(): void {
  const APP_PREFIXES = ['economic-sense-', 'est-'];
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (APP_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // localStorage 접근 실패
  }
}
