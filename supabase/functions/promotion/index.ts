/**
 * Supabase Edge Function: promotion
 *
 * POST /functions/v1/promotion
 * Body: { promotionCode: string, amount: number, userKey: string }
 * Response:
 *   Success: { success: true, key: string }
 *   Error:   { success: false, error: string, message: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreflightRequest, getCorsHeaders } from '../auth/_shared/cors.ts';
import { executePromotionFlow } from './_shared/promotion-client.ts';
import { PromotionErrorCode } from './_shared/types.ts';
import type {
  PromotionRequest,
  PromotionSuccessResponse,
  PromotionErrorResponse,
} from './_shared/types.ts';

function validateRequest(body: unknown): PromotionRequest {
  if (!body || typeof body !== 'object') {
    throw new Error(`${PromotionErrorCode.INVALID_REQUEST}: Request body is required`);
  }

  const { promotionCode, amount, userKey } = body as Record<string, unknown>;

  if (!promotionCode || typeof promotionCode !== 'string' || promotionCode.trim().length === 0) {
    throw new Error(`${PromotionErrorCode.INVALID_REQUEST}: promotionCode is required`);
  }

  if (amount === undefined || typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    throw new Error(`${PromotionErrorCode.INVALID_REQUEST}: amount must be a positive integer`);
  }

  if (!userKey || typeof userKey !== 'string' || userKey.trim().length === 0) {
    throw new Error(`${PromotionErrorCode.INVALID_REQUEST}: userKey is required`);
  }

  return {
    promotionCode: promotionCode.trim(),
    amount,
    userKey: userKey.trim(),
  };
}

function getSupabaseClient(): ReturnType<typeof createClient> | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[promotion] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'economic_sense_test' },
  });
}

async function checkAlreadyClaimed(userKey: string, promotionCode: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('promotion_records')
    .select('id, status')
    .eq('user_key', userKey)
    .eq('promotion_code', promotionCode)
    .maybeSingle();

  if (error) {
    console.error('[promotion] DB check error:', error.message);
    return false;
  }

  return data?.status === 'success';
}

async function createPromotionRecord(
  userKey: string,
  promotionCode: string,
  amount: number,
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('promotion_records')
    .upsert(
      {
        user_key: userKey,
        promotion_code: promotionCode,
        amount,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_key,promotion_code' }
    )
    .select('id')
    .single();

  if (error) {
    console.error('[promotion] DB insert error:', error.message);
    return null;
  }

  return data?.id ?? null;
}

async function updatePromotionRecord(
  userKey: string,
  promotionCode: string,
  updates: {
    status: 'success' | 'failed';
    promotion_key?: string;
    error_code?: string;
    error_message?: string;
  },
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from('promotion_records')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_key', userKey)
    .eq('promotion_code', promotionCode);

  if (error) {
    console.error('[promotion] DB update error:', error.message);
  }
}

function getHttpStatusForError(errorMessage: string): number {
  if (errorMessage.startsWith(PromotionErrorCode.INVALID_REQUEST)) return 400;
  if (errorMessage.startsWith(PromotionErrorCode.ALREADY_CLAIMED)) return 409;
  if (errorMessage.startsWith(PromotionErrorCode.GET_KEY_FAILED)) return 502;
  if (errorMessage.startsWith(PromotionErrorCode.EXECUTE_FAILED)) return 502;
  if (errorMessage.startsWith(PromotionErrorCode.EXECUTION_RESULT_FAILED)) return 502;
  if (errorMessage.startsWith(PromotionErrorCode.PROMOTION_FAILED)) return 502;
  if (errorMessage.startsWith(PromotionErrorCode.POLLING_TIMEOUT)) return 504;
  if (errorMessage.startsWith(PromotionErrorCode.NETWORK_ERROR)) return 502;
  if (errorMessage.startsWith(PromotionErrorCode.SERVER_CONFIG_ERROR)) return 500;
  return 500;
}

function extractErrorCode(errorMessage: string): string {
  const colonIndex = errorMessage.indexOf(':');
  return colonIndex > 0 ? errorMessage.substring(0, colonIndex).trim() : 'UNKNOWN_ERROR';
}

function extractErrorMessage(errorMessage: string): string {
  const colonIndex = errorMessage.indexOf(':');
  return colonIndex > 0 ? errorMessage.substring(colonIndex + 1).trim() : errorMessage;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  const headers = getCorsHeaders(req);

  if (req.method !== 'POST') {
    const errorResponse: PromotionErrorResponse = {
      success: false,
      error: PromotionErrorCode.INVALID_REQUEST,
      message: 'Only POST method is allowed',
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { promotionCode, amount, userKey } = validateRequest(body);

    const alreadyClaimed = await checkAlreadyClaimed(userKey, promotionCode);
    if (alreadyClaimed) {
      throw new Error(`${PromotionErrorCode.ALREADY_CLAIMED}: Promotion already claimed`);
    }

    await createPromotionRecord(userKey, promotionCode, amount);
    const result = await executePromotionFlow(promotionCode, amount, userKey);

    if (result.status === 'SUCCESS') {
      await updatePromotionRecord(userKey, promotionCode, {
        status: 'success',
        promotion_key: result.key,
      });

      const successResponse: PromotionSuccessResponse = {
        success: true,
        key: result.key,
      };

      return new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    await updatePromotionRecord(userKey, promotionCode, {
      status: 'failed',
      promotion_key: result.key,
      error_code: 'PROMOTION_FAILED',
      error_message: `Execution result: ${result.status}`,
    });

    throw new Error(`${PromotionErrorCode.PROMOTION_FAILED}: Promotion execution failed`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const status = getHttpStatusForError(errorMessage);
    const errorCode = extractErrorCode(errorMessage);
    const message = extractErrorMessage(errorMessage);

    const safeMessage = errorCode === PromotionErrorCode.SERVER_CONFIG_ERROR
      ? 'Server configuration error'
      : message;

    console.error(`[promotion] Error: ${errorCode} - ${message}`);

    const errorResponse: PromotionErrorResponse = {
      success: false,
      error: errorCode,
      message: safeMessage,
    };

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
