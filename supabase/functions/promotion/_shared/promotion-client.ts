/**
 * mTLS 토스 프로모션 API 클라이언트
 *
 * 비게임 프로모션 3단계 플로우:
 * 1. get-key: 프로모션 실행 키 발급
 * 2. execute-promotion: 프로모션 실행
 * 3. execution-result: 실행 결과 확인 (폴링)
 */

import { PromotionErrorCode } from './types.ts';
import type {
  TossGetKeyResponse,
  TossExecuteResponse,
  TossExecutionResultResponse,
} from './types.ts';

const API_PATHS = {
  getKey: '/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key',
  execute: '/api-partner/v1/apps-in-toss/promotion/execute-promotion',
  result: '/api-partner/v1/apps-in-toss/promotion/execution-result',
} as const;

const POLLING_MAX_ATTEMPTS = 5;
const POLLING_INTERVAL_MS = 2000;

function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(
      `${PromotionErrorCode.SERVER_CONFIG_ERROR}: Missing environment variable: ${key}`
    );
  }
  return value;
}

function decodePem(encoded: string): string {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function tossApiFetch(
  endpoint: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<Response> {
  const certEncoded = getRequiredEnv('TOSS_MTLS_CERT');
  const keyEncoded = getRequiredEnv('TOSS_MTLS_KEY');
  const baseUrl = Deno.env.get('TOSS_API_BASE_URL') ?? 'https://apps-in-toss-api.toss.im';
  const appKey = getRequiredEnv('TOSS_APP_KEY');

  const certPem = decodePem(certEncoded);
  const keyPem = decodePem(keyEncoded);

  const client = Deno.createHttpClient({
    cert: certPem,
    key: keyPem,
  });

  try {
    return await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': appKey,
        ...headers,
      },
      body: JSON.stringify(body),
      // @ts-ignore Deno-specific fetch option
      client,
    });
  } finally {
    client.close();
  }
}

function extractTossError(
  data: { resultType: string; error?: { errorCode: string; reason: string } },
  fallbackCode: string,
): { errorCode: string; reason: string } {
  if (data.error) {
    return { errorCode: data.error.errorCode, reason: data.error.reason };
  }
  return { errorCode: fallbackCode, reason: 'Unknown error' };
}

export async function getPromotionKey(
  promotionCode: string,
  userKey: string,
): Promise<{ key: string }> {
  let response: Response;

  try {
    response = await tossApiFetch(
      API_PATHS.getKey,
      { promotionCode },
      { 'x-toss-user-key': userKey },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith(PromotionErrorCode.SERVER_CONFIG_ERROR)) throw err;
    throw new Error(`${PromotionErrorCode.NETWORK_ERROR}: get-key request failed: ${message}`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${PromotionErrorCode.GET_KEY_FAILED}: HTTP ${response.status} - ${text}`);
  }

  const data = (await response.json()) as TossGetKeyResponse;

  if (data.resultType === 'FAIL') {
    const { errorCode, reason } = extractTossError(data, 'UNKNOWN');
    throw new Error(`${PromotionErrorCode.GET_KEY_FAILED}: [${errorCode}] ${reason}`);
  }

  return { key: data.success.key };
}

export async function executePromotion(
  promotionCode: string,
  key: string,
  amount: number,
): Promise<void> {
  let response: Response;

  try {
    response = await tossApiFetch(API_PATHS.execute, { promotionCode, key, amount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith(PromotionErrorCode.SERVER_CONFIG_ERROR)) throw err;
    throw new Error(`${PromotionErrorCode.NETWORK_ERROR}: execute-promotion request failed: ${message}`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${PromotionErrorCode.EXECUTE_FAILED}: HTTP ${response.status} - ${text}`);
  }

  const data = (await response.json()) as TossExecuteResponse;

  if (data.resultType === 'FAIL') {
    const { errorCode, reason } = extractTossError(data, 'UNKNOWN');
    throw new Error(`${PromotionErrorCode.EXECUTE_FAILED}: [${errorCode}] ${reason}`);
  }
}

export type ExecutionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export async function pollExecutionResult(
  promotionCode: string,
  key: string,
): Promise<ExecutionStatus> {
  for (let attempt = 0; attempt < POLLING_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    }

    let response: Response;

    try {
      response = await tossApiFetch(API_PATHS.result, { promotionCode, key });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.startsWith(PromotionErrorCode.SERVER_CONFIG_ERROR)) throw err;
      console.warn(`[promotion] execution-result attempt ${attempt + 1} failed: ${message}`);
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[promotion] execution-result attempt ${attempt + 1} HTTP ${response.status}: ${text}`);
      continue;
    }

    const data = (await response.json()) as TossExecutionResultResponse;

    if (data.resultType === 'FAIL') {
      const { errorCode, reason } = extractTossError(data, 'UNKNOWN');
      throw new Error(`${PromotionErrorCode.EXECUTION_RESULT_FAILED}: [${errorCode}] ${reason}`);
    }

    const status = data.success;
    if (status === 'SUCCESS') return 'SUCCESS';
    if (status === 'FAILED') return 'FAILED';
  }

  throw new Error(
    `${PromotionErrorCode.POLLING_TIMEOUT}: execution-result still PENDING after ${POLLING_MAX_ATTEMPTS} attempts`
  );
}

export interface PromotionFlowResult {
  key: string;
  status: ExecutionStatus;
}

export async function executePromotionFlow(
  promotionCode: string,
  amount: number,
  userKey: string,
): Promise<PromotionFlowResult> {
  const { key } = await getPromotionKey(promotionCode, userKey);
  await executePromotion(promotionCode, key, amount);
  const status = await pollExecutionResult(promotionCode, key);
  return { key, status };
}
