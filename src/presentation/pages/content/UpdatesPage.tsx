import { ContentLayout } from '@presentation/components';

interface UpdateEntry {
  date: string;
  version: string;
  title: string;
  changes: string[];
}

const UPDATES: UpdateEntry[] = [
  {
    date: '2025.01',
    version: 'v2.0',
    title: '티어 시스템 & 시즌 이벤트',
    changes: [
      '7단계 티어 시스템 추가 (SS~F)',
      '시즌별 테마 및 특별 이벤트 도입',
      '투자자 유형 상세 분석 카드 추가',
      '번들 최적화 (html2canvas 동적 임포트)',
      '콘텐츠 페이지 및 가이드 추가',
    ],
  },
  {
    date: '2025.01',
    version: 'v1.5',
    title: '바이럴 & 소셜 기능',
    changes: [
      '친구 도전장 시스템 추가',
      '이미지 공유 기능 (결과 카드)',
      '플랫폼별 공유 문구 (카카오톡, 트위터, 인스타)',
      '소셜 증거 배너 (실시간 참여 현황)',
      '상위 N% 배지',
    ],
  },
  {
    date: '2025.01',
    version: 'v1.3',
    title: '업적 시스템',
    changes: [
      '50가지 업적 추가',
      '업적 카테고리: 마일스톤, 수익률, 연속, 전략, 운, 특별',
      '업적 달성 팝업 및 컨페티 효과',
      '프로그레스 기반 업적 목록 UI',
    ],
  },
  {
    date: '2024.12',
    version: 'v1.2',
    title: '극한 모드 & 랭킹',
    changes: [
      '극한 모드 추가 (5,000만원 시작)',
      'TOP 10 랭킹 시스템',
      '자산 변화 그래프',
      '최고 기록 비교 기능',
    ],
  },
  {
    date: '2024.12',
    version: 'v1.0',
    title: '정식 출시',
    changes: [
      '10라운드 투자 시뮬레이션 게임',
      '확률 기반 결과 시스템',
      '8가지 투자자 유형 분석',
      '공격성 / 합리성 / 운 점수 분석',
      '결과 공유 기능',
    ],
  },
];

export function UpdatesPage() {
  return (
    <ContentLayout title="업데이트 내역">
      <section>
        <p>
          돈 감각 테스트의 주요 업데이트 내역입니다.
          새로운 기능과 개선 사항을 확인해보세요!
        </p>
      </section>

      <div className="updates-timeline">
        {UPDATES.map((update, index) => (
          <div key={index} className="update-entry">
            <div className="update-header">
              <span className="update-version">{update.version}</span>
              <span className="update-date">{update.date}</span>
            </div>
            <h2 className="update-title">{update.title}</h2>
            <ul className="update-changes">
              {update.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ContentLayout>
  );
}
