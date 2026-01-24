/**
 * DB 시나리오 데이터 수정 스크립트
 *
 * 실행 방법:
 * 1. .env.local에 SUPABASE_SERVICE_ROLE_KEY 추가
 * 2. npx tsx scripts/fix-scenarios.ts
 *
 * 또는 Supabase 대시보드에서 직접 SQL 실행:
 * supabase/migrations/005_fix_scenarios_data.sql
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 필수 환경 변수가 없습니다:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (Dashboard > Settings > API > service_role)');
  console.error('\n📋 대안: Supabase Dashboard에서 직접 SQL 실행');
  console.error('   1. https://supabase.com/dashboard/project/ayibvijmjygujjieueny');
  console.error('   2. SQL Editor > New query');
  console.error('   3. supabase/migrations/005_fix_scenarios_data.sql 내용 붙여넣기');
  console.error('   4. Run 버튼 클릭');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: 'economic_sense_test' },
});

// 올바른 시나리오 데이터 (003_realistic_scenarios.sql 기반)
const correctScenarios = [
  // 소비 시나리오 (SPENDING) - 음수 EV
  {
    situation: '🍜 점심 메뉴 고민 중',
    option_a_label: '8천원 단골집',
    option_a_description: '익숙한 맛, 확실한 만족',
    option_a_outcomes: [{ probability: 1, value: -8 }],
    option_b_label: '1.5만원 신상 맛집',
    option_b_description: '50% 대만족, 50% 실망',
    option_b_outcomes: [
      { probability: 0.5, value: -8 },
      { probability: 0.5, value: -15 },
    ],
    normalized_max_ev: -8.0,
  },
  {
    situation: '☕ 커피 한 잔의 선택',
    option_a_label: '편의점 커피',
    option_a_description: '2천원으로 카페인 충전',
    option_a_outcomes: [{ probability: 1, value: -2 }],
    option_b_label: '프리미엄 카페',
    option_b_description: '70% 만족, 30% 그냥 그럼',
    option_b_outcomes: [
      { probability: 0.7, value: -5 },
      { probability: 0.3, value: -7 },
    ],
    normalized_max_ev: -2.0,
  },
  {
    situation: '📱 핸드폰 케이스가 깨졌다',
    option_a_label: '1만원 저렴이',
    option_a_description: '그냥 보호만 되면 됨',
    option_a_outcomes: [{ probability: 1, value: -10 }],
    option_b_label: '5만원 브랜드 케이스',
    option_b_description: '60% 오래 씀, 40% 금방 질림',
    option_b_outcomes: [
      { probability: 0.6, value: -30 },
      { probability: 0.4, value: -50 },
    ],
    normalized_max_ev: -10.0,
  },
  // 수익 시나리오 (INCOME) - 양수 EV
  {
    situation: '💰 보너스 300만원 지급!',
    option_a_label: '적금에 예치',
    option_a_description: '연 4% 이자 확정',
    option_a_outcomes: [{ probability: 1, value: 120 }],
    option_b_label: '주식에 투자',
    option_b_description: '60% 수익 20%, 40% 손실 5%',
    option_b_outcomes: [
      { probability: 0.6, value: 600 },
      { probability: 0.4, value: -150 },
    ],
    normalized_max_ev: 300.0,
  },
  {
    situation: '💼 연봉 협상 기회!',
    option_a_label: '확정 200만원 인상',
    option_a_description: '안전하게 연봉 인상',
    option_a_outcomes: [{ probability: 1, value: 2000 }],
    option_b_label: '성과급 도전',
    option_b_description: '70% 400만원, 30% 무산',
    option_b_outcomes: [
      { probability: 0.7, value: 4000 },
      { probability: 0.3, value: 0 },
    ],
    normalized_max_ev: 2800.0,
  },
  // 투자/도박 시나리오 (MIXED)
  {
    situation: '📈 친구가 "이 코인 무조건 오른다"',
    option_a_label: '무시하기',
    option_a_description: '내 돈은 안전하게',
    option_a_outcomes: [{ probability: 1, value: 0 }],
    option_b_label: '100만원 투자',
    option_b_description: '20% 대박 4배, 80% 80% 손실',
    option_b_outcomes: [
      { probability: 0.2, value: 4000 },
      { probability: 0.8, value: -800 },
    ],
    normalized_max_ev: 160.0,
  },
  {
    situation: '📉 내 주식이 -30% 됐다...',
    option_a_label: '손절하기',
    option_a_description: '30만원 확정 손실',
    option_a_outcomes: [{ probability: 1, value: -300 }],
    option_b_label: '존버하기',
    option_b_description: '40% 반등 50%, 60% 추가 하락',
    option_b_outcomes: [
      { probability: 0.4, value: 500 },
      { probability: 0.6, value: -500 },
    ],
    normalized_max_ev: -100.0,
  },
];

async function fixScenarios() {
  console.log('🔧 시나리오 데이터 수정 시작...\n');

  // 1. 기존 시나리오 삭제
  console.log('1️⃣ 기존 시나리오 삭제 중...');
  const { error: deleteError } = await supabase
    .from('question_scenarios')
    .delete()
    .gte('id', 0); // 모든 레코드 삭제

  if (deleteError) {
    console.error('❌ 삭제 실패:', deleteError.message);
    console.log('\n💡 Service Role Key가 올바른지 확인하세요.');
    return;
  }
  console.log('✅ 기존 시나리오 삭제 완료\n');

  // 2. 새 시나리오 삽입
  console.log('2️⃣ 올바른 시나리오 삽입 중...');

  // amount_ranges 조회
  const { data: ranges, error: rangesError } = await supabase
    .from('amount_ranges')
    .select('id, category_id, size');

  if (rangesError || !ranges?.length) {
    console.error('❌ amount_ranges 조회 실패:', rangesError?.message);
    return;
  }

  // 첫 번째 range_id 사용 (임시)
  const defaultRangeId = ranges[0].id;

  for (const scenario of correctScenarios) {
    const { error: insertError } = await supabase.from('question_scenarios').insert({
      amount_range_id: defaultRangeId,
      ...scenario,
    });

    if (insertError) {
      console.error(`❌ 삽입 실패 (${scenario.situation}):`, insertError.message);
    } else {
      console.log(`✅ ${scenario.situation}`);
    }
  }

  // 3. 확인
  const { count } = await supabase
    .from('question_scenarios')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✨ 완료! 총 ${count}개 시나리오 등록됨`);
  console.log(
    '\n⚠️ 참고: 이 스크립트는 샘플 데이터만 포함합니다.',
    '\n   전체 데이터는 Supabase Dashboard에서',
    '\n   005_fix_scenarios_data.sql을 실행하세요.',
  );
}

fixScenarios();
