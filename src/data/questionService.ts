/**
 * 질문 서비스 - Supabase에서 질문 시나리오 가져오기
 */

import { supabase, isSupabaseConfigured } from '@lib/supabase';
import type { Question, Option } from '@domain/entities';
import { shuffle } from '@lib/arrayUtils';
import { formatMoney } from '@lib/formatUtils';

// DB에서 가져온 시나리오 타입
interface DBScenario {
  id: number;
  type: 'earning' | 'spending';
  category_code: string;
  category_name: string;
  category_emoji: string;
  amount_size: 'small' | 'medium' | 'large';
  min_amount: number;
  max_amount: number;
  typical_amount: number;
  amount_label: string;
  situation: string;
  option_a_label: string;
  option_a_description: string;
  option_a_outcomes: DBOutcome[];
  option_b_label: string;
  option_b_description: string;
  option_b_outcomes: DBOutcome[];
  normalized_max_ev: number;
  is_active: boolean;
}

interface DBOutcome {
  probability: number;
  value: number;  // 천원 단위 (e.g., -8 = -8,000원)
}

// 중첩 조인 타입 정의
interface AmountRangeRow {
  size: 'small' | 'medium' | 'large';
  min_amount: number;
  max_amount: number;
  typical_amount: number;
  label_ko: string;
  question_categories: QuestionCategoryRow | QuestionCategoryRow[];
}

interface QuestionCategoryRow {
  type: 'earning' | 'spending';
  code: string;
  name_ko: string;
  emoji: string;
}

// Supabase 조인 결과 타입 (question_scenarios + amount_ranges + question_categories)
interface QuestionScenarioRow {
  id: number;
  situation: string;
  option_a_label: string;
  option_a_description: string;
  option_a_outcomes: DBOutcome[];
  option_b_label: string;
  option_b_description: string;
  option_b_outcomes: DBOutcome[];
  normalized_max_ev: number;
  is_active: boolean;
  // Supabase !inner 조인 결과는 단일 객체 또는 배열일 수 있음
  amount_ranges: AmountRangeRow | AmountRangeRow[];
}

// DB 값은 천원 단위로 저장됨 (value * 1000 = 원)
const BASE_SCALE = 1_000;

// description 업데이트
const updateDescription = (opt: Option): Option => {
  const outcomes = opt.outcomes;
  if (outcomes.length === 1) {
    const v = outcomes[0].value;
    if (v === 0) return opt;
    return {
      ...opt,
      description: `확정 ${formatMoney(v)}원`,
    };
  } else if (outcomes.length === 2) {
    const [o1, o2] = outcomes;
    return {
      ...opt,
      description: `${Math.round(o1.probability * 100)}%로 ${formatMoney(o1.value)}원, ${Math.round(o2.probability * 100)}%로 ${formatMoney(o2.value)}원`,
    };
  }
  return opt;
};

// DB 시나리오를 Question으로 변환
const convertToQuestion = (scenario: DBScenario, index: number): Question => {
  // DB에서 가져온 outcomes를 Option으로 변환 (천원 → 원 변환)
  const optionA: Option = {
    label: scenario.option_a_label,
    description: scenario.option_a_description,
    outcomes: scenario.option_a_outcomes.map(o => ({
      probability: o.probability,
      value: o.value * BASE_SCALE, // 천원 → 원
    })),
  };

  const optionB: Option = {
    label: scenario.option_b_label,
    description: scenario.option_b_description,
    outcomes: scenario.option_b_outcomes.map(o => ({
      probability: o.probability,
      value: o.value * BASE_SCALE, // 천원 → 원
    })),
  };

  return {
    id: index + 1,
    situation: scenario.situation,
    optionA: updateDescription(optionA),
    optionB: updateDescription(optionB),
  };
};

/**
 * Supabase에서 질문 시나리오 가져오기
 */
export async function fetchQuestionsFromDB(): Promise<Question[] | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, using fallback questions');
    return null;
  }

  try {
    // question_scenarios 테이블과 관련 테이블 조인하여 가져오기
    const { data, error } = await supabase
      .from('question_scenarios')
      .select(`
        id,
        situation,
        option_a_label,
        option_a_description,
        option_a_outcomes,
        option_b_label,
        option_b_description,
        option_b_outcomes,
        normalized_max_ev,
        is_active,
        amount_ranges!inner (
          size,
          min_amount,
          max_amount,
          typical_amount,
          label_ko,
          question_categories!inner (
            type,
            code,
            name_ko,
            emoji
          )
        )
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching questions:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('No questions found in DB');
      return null;
    }

    // 데이터 변환 (타입 안전한 매핑)
    // Supabase 조인 결과가 배열 또는 단일 객체일 수 있으므로 처리
    const scenarios: DBScenario[] = (data as QuestionScenarioRow[]).map((row) => {
      const amountRange = Array.isArray(row.amount_ranges)
        ? row.amount_ranges[0]
        : row.amount_ranges;
      const category = Array.isArray(amountRange.question_categories)
        ? amountRange.question_categories[0]
        : amountRange.question_categories;

      return {
        id: row.id,
        type: category.type,
        category_code: category.code,
        category_name: category.name_ko,
        category_emoji: category.emoji,
        amount_size: amountRange.size,
        min_amount: amountRange.min_amount,
        max_amount: amountRange.max_amount,
        typical_amount: amountRange.typical_amount,
        amount_label: amountRange.label_ko,
        situation: row.situation,
        option_a_label: row.option_a_label,
        option_a_description: row.option_a_description,
        option_a_outcomes: row.option_a_outcomes,
        option_b_label: row.option_b_label,
        option_b_description: row.option_b_description,
        option_b_outcomes: row.option_b_outcomes,
        normalized_max_ev: row.normalized_max_ev,
        is_active: row.is_active,
      };
    });

    // 랜덤으로 10개 선택
    const shuffled = shuffle(scenarios);
    const selected = shuffled.slice(0, 10);

    // Question으로 변환
    return selected.map(convertToQuestion);
  } catch (err) {
    console.error('Failed to fetch questions from DB:', err);
    return null;
  }
}

/**
 * 질문 개수 가져오기 (DB에서 몇 개 있는지 확인)
 */
export async function getQuestionCount(): Promise<number> {
  if (!isSupabaseConfigured || !supabase) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('question_scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error('Error getting question count:', error);
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}
