import { ContentLayout } from '@presentation/components';

export function RankingGuidePage() {
  return (
    <ContentLayout title="랭킹 & 업적 가이드">
      <section>
        <h2>🏆 랭킹 시스템</h2>
        <p>
          돈 감각 테스트의 랭킹은 최종 수익률 기준으로 순위가 매겨집니다.
          게임 결과 화면에서 닉네임을 입력하면 전체 랭킹에 등록됩니다.
        </p>

        <h3>랭킹 등록 방법</h3>
        <ol>
          <li>게임을 완료합니다 (10라운드).</li>
          <li>결과 화면에서 닉네임을 입력합니다.</li>
          <li>&ldquo;등록하기&rdquo; 버튼을 누릅니다.</li>
          <li>TOP 10 랭킹에서 자신의 순위를 확인합니다.</li>
        </ol>

        <h3>랭킹 규칙</h3>
        <ul>
          <li>닉네임: 한글, 영문, 숫자만 사용 가능 (최대 20자)</li>
          <li>정렬 기준: 최종 수익률 (높은 순)</li>
          <li>동일 수익률: 먼저 등록한 플레이어 우선</li>
          <li>모든 모드의 결과가 같은 랭킹에 포함됩니다</li>
        </ul>
      </section>

      <section>
        <h2>📊 상위 N% 시스템</h2>
        <p>
          게임 결과 화면에서 &ldquo;상위 N%&rdquo; 배지를 확인할 수 있습니다.
          전체 플레이어의 수익률과 비교하여 자신의 위치를 알 수 있습니다.
        </p>
        <div className="table-wrapper" role="region" aria-label="상위 N% 배지 기준" tabIndex={0}>
          <table>
            <thead>
              <tr><th>배지</th><th>조건</th><th>의미</th></tr>
            </thead>
            <tbody>
              <tr><td>🏆</td><td>상위 10%</td><td>최상위권 성적</td></tr>
              <tr><td>🥈</td><td>상위 30%</td><td>우수한 성적</td></tr>
              <tr><td>🥉</td><td>상위 50%</td><td>평균 이상</td></tr>
              <tr><td>📊</td><td>상위 50% 초과</td><td>아직 성장 중</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>🏅 업적 시스템</h2>
        <p>
          돈 감각 테스트에는 50가지 이상의 업적이 있습니다.
          특정 조건을 충족하면 자동으로 해금되며, 결과 화면에서 확인할 수 있습니다.
        </p>

        <h3>업적 카테고리</h3>
        <div className="table-wrapper" role="region" aria-label="업적 카테고리" tabIndex={0}>
          <table>
            <thead>
              <tr><th>카테고리</th><th>설명</th><th>예시</th></tr>
            </thead>
            <tbody>
              <tr><td>🎮 마일스톤</td><td>게임 횟수 기반</td><td>첫 걸음 (1게임), 베테랑 (10게임)</td></tr>
              <tr><td>💰 수익률</td><td>수익률 달성</td><td>금손 (+50%), 원금 2배 (+100%)</td></tr>
              <tr><td>🔥 연속</td><td>연속 수익/손실</td><td>3연승, 5연승</td></tr>
              <tr><td>🧠 전략</td><td>선택 패턴</td><td>올인 전략, 분산 투자</td></tr>
              <tr><td>🍀 운</td><td>운 점수 관련</td><td>행운의 손, 불운의 아이콘</td></tr>
              <tr><td>⭐ 특별</td><td>특수 조건</td><td>시즌 이벤트, 도전 승리</td></tr>
            </tbody>
          </table>
        </div>

        <h3>업적 등급</h3>
        <div className="table-wrapper" role="region" aria-label="업적 등급" tabIndex={0}>
          <table>
            <thead>
              <tr><th>등급</th><th>색상</th><th>난이도</th></tr>
            </thead>
            <tbody>
              <tr><td>🥉 브론즈</td><td>갈색</td><td>쉬움</td></tr>
              <tr><td>🥈 실버</td><td>은색</td><td>보통</td></tr>
              <tr><td>🥇 골드</td><td>금색</td><td>어려움</td></tr>
              <tr><td>💎 다이아</td><td>파란색</td><td>매우 어려움</td></tr>
              <tr><td>🏆 레전더리</td><td>보라색</td><td>전설</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>💡 업적 달성 팁</h2>
        <ul>
          <li>
            <strong>다양한 전략으로 플레이</strong>: 업적은 공격적, 보수적,
            균형 잡힌 플레이 등 다양한 스타일에 분포되어 있습니다.
          </li>
          <li>
            <strong>꾸준히 플레이</strong>: 마일스톤 업적은 게임 횟수에 따라
            해금됩니다. 50게임 달성 시 &ldquo;전설의 투자자&rdquo; 업적!
          </li>
          <li>
            <strong>극단적인 결과도 업적</strong>: 큰 손실도 업적 조건이 될 수
            있습니다. 모든 플레이가 의미 있어요!
          </li>
          <li>
            <strong>시즌 이벤트 참여</strong>: 특별 시즌(설날, 추석 등)에
            플레이하면 시즌 한정 업적을 달성할 수 있습니다.
          </li>
        </ul>
      </section>
    </ContentLayout>
  );
}
