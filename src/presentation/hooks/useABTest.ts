/**
 * A/B 테스트 React 훅
 * 컴포넌트에서 A/B 테스트 변형 및 이벤트 트래킹을 쉽게 사용
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getVariant,
  trackEvent,
  trackConversion,
  getExperiment,
  type Variant,
  type Experiment,
} from '@lib/abTest';

// ============================================================================
// Types
// ============================================================================

export interface UseABTestOptions {
  /** 변형이 결정되기 전까지 로딩 상태 표시 여부 */
  showLoading?: boolean;
  /** 자동으로 노출 이벤트 트래킹 */
  trackImpression?: boolean;
}

export interface UseABTestReturn {
  /** 현재 할당된 변형 */
  variant: Variant | null;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 실험 정보 */
  experiment: Experiment | undefined;
  /** 이벤트 트래킹 함수 */
  track: (eventName: string, eventData?: Record<string, unknown>) => Promise<void>;
  /** 전환 이벤트 트래킹 함수 */
  trackConversion: (conversionType?: string, value?: number) => Promise<void>;
  /** 특정 변형인지 확인 */
  isVariant: (variantId: Variant) => boolean;
}

export interface UseABTestsReturn {
  /** 실험별 변형 맵 */
  variants: Record<string, Variant | null>;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 특정 실험의 변형 확인 */
  getVariant: (experimentId: string) => Variant | null;
  /** 특정 실험의 특정 변형인지 확인 */
  isVariant: (experimentId: string, variantId: Variant) => boolean;
  /** 이벤트 트래킹 함수 */
  track: (
    experimentId: string,
    eventName: string,
    eventData?: Record<string, unknown>
  ) => Promise<void>;
}

// ============================================================================
// Single Experiment Hook
// ============================================================================

/**
 * 단일 실험용 훅
 *
 * @example
 * ```tsx
 * const { variant, isVariant, track } = useABTest('intro_cta_text');
 *
 * return (
 *   <button onClick={() => {
 *     track('click');
 *     startGame();
 *   }}>
 *     {isVariant('variant_a') ? '무료로 시작하기' : '게임 시작'}
 *   </button>
 * );
 * ```
 */
export function useABTest(
  experimentId: string,
  options: UseABTestOptions = {}
): UseABTestReturn {
  const { showLoading = false, trackImpression = true } = options;

  const [variant, setVariant] = useState<Variant | null>(() => {
    // SSR 대응: 초기에는 null
    if (typeof window === 'undefined') return null;
    return showLoading ? null : getVariant(experimentId);
  });
  const [isLoading, setIsLoading] = useState(showLoading);
  const [impressionTracked, setImpressionTracked] = useState(false);

  const experiment = useMemo(
    () => getExperiment(experimentId),
    [experimentId]
  );

  // 변형 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadedVariant = getVariant(experimentId);
    setVariant(loadedVariant);
    setIsLoading(false);
  }, [experimentId]);

  // 노출 이벤트 트래킹
  useEffect(() => {
    if (
      trackImpression &&
      variant !== null &&
      !impressionTracked &&
      typeof window !== 'undefined'
    ) {
      trackEvent(experimentId, 'impression').catch(() => {});
      setImpressionTracked(true);
    }
  }, [experimentId, variant, trackImpression, impressionTracked]);

  // 이벤트 트래킹
  const track = useCallback(
    async (eventName: string, eventData?: Record<string, unknown>) => {
      await trackEvent(experimentId, eventName, eventData);
    },
    [experimentId]
  );

  // 전환 트래킹
  const trackConversionFn = useCallback(
    async (conversionType: string = 'default', value?: number) => {
      await trackConversion(experimentId, conversionType, value);
    },
    [experimentId]
  );

  // 변형 확인
  const isVariant = useCallback(
    (variantId: Variant) => variant === variantId,
    [variant]
  );

  return {
    variant,
    isLoading,
    experiment,
    track,
    trackConversion: trackConversionFn,
    isVariant,
  };
}

// ============================================================================
// Multiple Experiments Hook
// ============================================================================

/**
 * 여러 실험을 한 번에 관리하는 훅
 *
 * @example
 * ```tsx
 * const { variants, isVariant, track } = useABTests([
 *   'intro_cta_text',
 *   'result_share_position',
 * ]);
 *
 * return (
 *   <div>
 *     {isVariant('intro_cta_text', 'variant_a') && <SpecialBanner />}
 *     <ShareButton position={variants['result_share_position']} />
 *   </div>
 * );
 * ```
 */
export function useABTests(experimentIds: string[]): UseABTestsReturn {
  const [variants, setVariants] = useState<Record<string, Variant | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 모든 실험의 변형 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadedVariants: Record<string, Variant | null> = {};
    for (const id of experimentIds) {
      loadedVariants[id] = getVariant(id);
    }
    setVariants(loadedVariants);
    setIsLoading(false);
  }, [experimentIds.join(',')]);

  // 변형 가져오기
  const getVariantFn = useCallback(
    (experimentId: string) => variants[experimentId] ?? null,
    [variants]
  );

  // 변형 확인
  const isVariant = useCallback(
    (experimentId: string, variantId: Variant) =>
      variants[experimentId] === variantId,
    [variants]
  );

  // 이벤트 트래킹
  const track = useCallback(
    async (
      experimentId: string,
      eventName: string,
      eventData?: Record<string, unknown>
    ) => {
      await trackEvent(experimentId, eventName, eventData);
    },
    []
  );

  return {
    variants,
    isLoading,
    getVariant: getVariantFn,
    isVariant,
    track,
  };
}

// ============================================================================
// Variant Conditional Component
// ============================================================================

export interface ABVariantProps {
  /** 실험 ID */
  experimentId: string;
  /** 렌더링할 변형 ID */
  variant: Variant;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 로딩 중 표시할 fallback */
  fallback?: React.ReactNode;
}

/**
 * 조건부 변형 렌더링 컴포넌트
 *
 * @example
 * ```tsx
 * <ABVariant experimentId="intro_cta_text" variant="control">
 *   <button>게임 시작</button>
 * </ABVariant>
 * <ABVariant experimentId="intro_cta_text" variant="variant_a">
 *   <button>무료로 시작하기</button>
 * </ABVariant>
 * ```
 */
export function ABVariant({
  experimentId,
  variant: targetVariant,
  children,
  fallback = null,
}: ABVariantProps): React.ReactNode {
  const { variant, isLoading } = useABTest(experimentId, { trackImpression: false });

  if (isLoading) {
    return fallback;
  }

  if (variant !== targetVariant) {
    return null;
  }

  return children;
}

// ============================================================================
// Experiment Switch Component
// ============================================================================

export interface ExperimentSwitchProps {
  /** 실험 ID */
  experimentId: string;
  /** 변형별 컴포넌트 맵 */
  variants: Record<Variant, React.ReactNode>;
  /** 기본 컴포넌트 (변형이 없을 때) */
  defaultVariant?: React.ReactNode;
  /** 로딩 중 표시할 fallback */
  fallback?: React.ReactNode;
}

/**
 * 실험의 모든 변형을 한 번에 정의하는 컴포넌트
 *
 * @example
 * ```tsx
 * <ExperimentSwitch
 *   experimentId="intro_cta_text"
 *   variants={{
 *     control: <button>게임 시작</button>,
 *     variant_a: <button>무료로 시작하기</button>,
 *   }}
 *   fallback={<button>로딩 중...</button>}
 * />
 * ```
 */
export function ExperimentSwitch({
  experimentId,
  variants,
  defaultVariant = null,
  fallback = null,
}: ExperimentSwitchProps): React.ReactNode {
  const { variant, isLoading } = useABTest(experimentId);

  if (isLoading) {
    return fallback;
  }

  if (variant === null) {
    return defaultVariant;
  }

  return variants[variant] ?? defaultVariant;
}
