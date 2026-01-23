/**
 * A/B 테스트 프레임워크
 * 사용자별 variant 할당 및 이벤트 트래킹
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ============================================================================
// Types
// ============================================================================

/** 실험 변형 */
export type Variant = string;

/** 실험 정의 */
export interface Experiment {
  /** 실험 고유 ID */
  id: string;
  /** 실험 이름 */
  name: string;
  /** 실험 설명 */
  description: string;
  /** 변형 목록 및 가중치 */
  variants: Array<{
    id: Variant;
    weight: number; // 0-100, 전체 합이 100
  }>;
  /** 실험 활성화 여부 */
  isActive: boolean;
  /** 실험 시작일 */
  startDate?: string;
  /** 실험 종료일 */
  endDate?: string;
}

/** 사용자별 할당된 변형 */
export interface VariantAssignment {
  experimentId: string;
  variant: Variant;
  assignedAt: string;
}

/** 이벤트 트래킹 데이터 */
export interface ABTestEvent {
  experimentId: string;
  variant: Variant;
  eventName: string;
  eventData?: Record<string, unknown>;
  timestamp: string;
}

/** 실험 결과 통계 */
export interface ExperimentStats {
  experimentId: string;
  variant: Variant;
  totalUsers: number;
  events: Record<string, number>;
  conversionRate?: number;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'economic-sense-ab-tests';
const USER_ID_KEY = 'economic-sense-user-id';

// ============================================================================
// 실험 정의
// ============================================================================

/**
 * 사전 정의된 실험 목록
 * 새 실험 추가 시 이 배열에 추가
 */
export const EXPERIMENTS: Experiment[] = [
  {
    id: 'intro_cta_text',
    name: 'Intro CTA 텍스트',
    description: '인트로 페이지의 시작 버튼 텍스트 A/B 테스트',
    variants: [
      { id: 'control', weight: 50 },   // 기존: "게임 시작"
      { id: 'variant_a', weight: 50 }, // 변형: "무료로 시작하기"
    ],
    isActive: true,
  },
  {
    id: 'result_share_position',
    name: '결과 공유 버튼 위치',
    description: '결과 페이지에서 공유 버튼 위치 테스트',
    variants: [
      { id: 'top', weight: 33 },
      { id: 'bottom', weight: 34 },
      { id: 'floating', weight: 33 },
    ],
    isActive: true,
  },
  {
    id: 'game_speed',
    name: '게임 진행 속도',
    description: '결과 애니메이션 속도 테스트',
    variants: [
      { id: 'normal', weight: 50 },   // 기존 속도
      { id: 'fast', weight: 50 },     // 빠른 속도
    ],
    isActive: true,
  },
  {
    id: 'motivation_message',
    name: '동기부여 메시지',
    description: '게임 중 동기부여 메시지 표시 여부',
    variants: [
      { id: 'none', weight: 50 },
      { id: 'show', weight: 50 },
    ],
    isActive: false, // 비활성화 상태
  },
];

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 고유 사용자 ID 생성 또는 조회
 */
export function getUserId(): string {
  try {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch {
    // localStorage 사용 불가시 임시 ID
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * 저장된 변형 할당 조회
 */
export function getStoredAssignments(): VariantAssignment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * 변형 할당 저장
 */
function saveAssignment(assignment: VariantAssignment): void {
  try {
    const assignments = getStoredAssignments();
    const existingIndex = assignments.findIndex(
      (a) => a.experimentId === assignment.experimentId
    );

    if (existingIndex >= 0) {
      assignments[existingIndex] = assignment;
    } else {
      assignments.push(assignment);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * 가중치 기반 무작위 변형 선택
 */
function selectVariantByWeight(variants: Experiment['variants']): Variant {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const random = Math.random() * totalWeight;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random < cumulative) {
      return variant.id;
    }
  }

  // Fallback to first variant
  return variants[0].id;
}

/**
 * 실험 활성 상태 확인
 */
function isExperimentActive(experiment: Experiment): boolean {
  if (!experiment.isActive) return false;

  const now = new Date();

  if (experiment.startDate) {
    const startDate = new Date(experiment.startDate);
    if (now < startDate) return false;
  }

  if (experiment.endDate) {
    const endDate = new Date(experiment.endDate);
    if (now > endDate) return false;
  }

  return true;
}

// ============================================================================
// 핵심 API
// ============================================================================

/**
 * 실험에 대한 변형 가져오기
 * - 이미 할당된 경우 기존 변형 반환
 * - 새로운 경우 무작위 할당 후 반환
 */
export function getVariant(experimentId: string): Variant | null {
  const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment) {
    console.warn(`[ABTest] Unknown experiment: ${experimentId}`);
    return null;
  }

  // 비활성화된 실험은 기본값 (첫 번째 변형) 반환
  if (!isExperimentActive(experiment)) {
    return experiment.variants[0].id;
  }

  // 기존 할당 확인
  const assignments = getStoredAssignments();
  const existing = assignments.find((a) => a.experimentId === experimentId);

  if (existing) {
    return existing.variant;
  }

  // 새로운 할당
  const variant = selectVariantByWeight(experiment.variants);
  const assignment: VariantAssignment = {
    experimentId,
    variant,
    assignedAt: new Date().toISOString(),
  };

  saveAssignment(assignment);

  // Supabase에 비동기로 기록 (실패해도 무시)
  recordAssignmentToSupabase(assignment).catch(() => {});

  return variant;
}

/**
 * 여러 실험의 변형을 한 번에 가져오기
 */
export function getVariants(experimentIds: string[]): Record<string, Variant | null> {
  const result: Record<string, Variant | null> = {};
  for (const id of experimentIds) {
    result[id] = getVariant(id);
  }
  return result;
}

/**
 * 모든 활성 실험의 현재 할당 조회
 */
export function getAllAssignments(): Record<string, Variant> {
  const assignments = getStoredAssignments();
  const result: Record<string, Variant> = {};

  for (const assignment of assignments) {
    result[assignment.experimentId] = assignment.variant;
  }

  return result;
}

/**
 * 특정 실험의 할당 강제 설정 (테스트/디버그용)
 */
export function forceVariant(experimentId: string, variant: Variant): void {
  const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!experiment) {
    console.warn(`[ABTest] Unknown experiment: ${experimentId}`);
    return;
  }

  const validVariant = experiment.variants.find((v) => v.id === variant);
  if (!validVariant) {
    console.warn(`[ABTest] Invalid variant: ${variant} for experiment: ${experimentId}`);
    return;
  }

  const assignment: VariantAssignment = {
    experimentId,
    variant,
    assignedAt: new Date().toISOString(),
  };

  saveAssignment(assignment);
}

/**
 * 모든 실험 할당 초기화 (테스트용)
 */
export function clearAssignments(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

// ============================================================================
// 이벤트 트래킹
// ============================================================================

/**
 * A/B 테스트 이벤트 기록
 */
export async function trackEvent(
  experimentId: string,
  eventName: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  const assignments = getStoredAssignments();
  const assignment = assignments.find((a) => a.experimentId === experimentId);

  if (!assignment) {
    console.warn(`[ABTest] No assignment found for experiment: ${experimentId}`);
    return;
  }

  const event: ABTestEvent = {
    experimentId,
    variant: assignment.variant,
    eventName,
    eventData,
    timestamp: new Date().toISOString(),
  };

  // Supabase에 기록
  await recordEventToSupabase(event);
}

/**
 * 전환 이벤트 기록 (conversion)
 */
export async function trackConversion(
  experimentId: string,
  conversionType: string = 'default',
  value?: number
): Promise<void> {
  await trackEvent(experimentId, 'conversion', {
    type: conversionType,
    value,
  });
}

// ============================================================================
// Supabase 연동
// ============================================================================

/**
 * Supabase에 변형 할당 기록
 */
async function recordAssignmentToSupabase(assignment: VariantAssignment): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const userId = getUserId();

    await supabase.from('ab_test_assignments').upsert(
      {
        user_id: userId,
        experiment_id: assignment.experimentId,
        variant: assignment.variant,
        assigned_at: assignment.assignedAt,
      },
      {
        onConflict: 'user_id,experiment_id',
      }
    );
  } catch (error) {
    console.error('[ABTest] Failed to record assignment:', error);
  }
}

/**
 * Supabase에 이벤트 기록
 */
async function recordEventToSupabase(event: ABTestEvent): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const userId = getUserId();

    await supabase.from('ab_test_events').insert({
      user_id: userId,
      experiment_id: event.experimentId,
      variant: event.variant,
      event_name: event.eventName,
      event_data: event.eventData,
      created_at: event.timestamp,
    });
  } catch (error) {
    console.error('[ABTest] Failed to record event:', error);
  }
}

/**
 * 실험 통계 조회 (관리자용)
 */
export async function getExperimentStats(experimentId: string): Promise<ExperimentStats[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    // 변형별 사용자 수
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('ab_test_assignments')
      .select('variant')
      .eq('experiment_id', experimentId);

    if (assignmentError) throw assignmentError;

    // 변형별 이벤트 집계
    const { data: eventData, error: eventError } = await supabase
      .from('ab_test_events')
      .select('variant, event_name')
      .eq('experiment_id', experimentId);

    if (eventError) throw eventError;

    // 변형별 통계 계산
    const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
    if (!experiment) return null;

    const stats: ExperimentStats[] = experiment.variants.map((v) => {
      const variantAssignments = (assignmentData || []).filter(
        (a) => a.variant === v.id
      );
      const variantEvents = (eventData || []).filter((e) => e.variant === v.id);

      // 이벤트별 카운트
      const eventCounts: Record<string, number> = {};
      for (const event of variantEvents) {
        eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
      }

      // 전환율 계산
      const totalUsers = variantAssignments.length;
      const conversions = eventCounts['conversion'] || 0;
      const conversionRate = totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;

      return {
        experimentId,
        variant: v.id,
        totalUsers,
        events: eventCounts,
        conversionRate,
      };
    });

    return stats;
  } catch (error) {
    console.error('[ABTest] Failed to get experiment stats:', error);
    return null;
  }
}

// ============================================================================
// 실험 조회 API
// ============================================================================

/**
 * 모든 실험 목록 조회
 */
export function getExperiments(): Experiment[] {
  return EXPERIMENTS;
}

/**
 * 활성화된 실험만 조회
 */
export function getActiveExperiments(): Experiment[] {
  return EXPERIMENTS.filter(isExperimentActive);
}

/**
 * 특정 실험 조회
 */
export function getExperiment(experimentId: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.id === experimentId);
}
