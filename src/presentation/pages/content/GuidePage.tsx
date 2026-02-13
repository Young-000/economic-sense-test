import { Link } from 'react-router-dom';
import { GAME_MODE_CONFIG } from '@domain/entities';
import { ContentLayout } from '@presentation/components';

export function GuidePage() {
  return (
    <ContentLayout title="게임 가이드">
      <section>
        <h2>🎮 플레이 방법</h2>
        <p>
          돈 감각 테스트는 총 10라운드로 진행됩니다. 매 라운드마다 두 가지
          투자 선택지가 주어지고, 각 선택의 확률과 결과가 표시됩니다.
        </p>
        <ol>
          <li><strong>게임 시작</strong>: 일반 모드 또는 극한 모드를 선택합니다.</li>
          <li><strong>선택</strong>: 매 라운드 두 가지 옵션(A 또는 B) 중 하나를 선택합니다.</li>
          <li><strong>결과 확인</strong>: 선택의 결과가 확률에 따라 결정됩니다.</li>
          <li><strong>10라운드 후</strong>: 최종 자산, 투자자 유형, 티어 등급이 공개됩니다.</li>
        </ol>
      </section>

      <section>
        <h2>📊 게임 모드</h2>
        <div className="table-wrapper" role="region" aria-label="게임 모드 비교" tabIndex={0}>
          <table>
            <thead>
              <tr><th>항목</th><th>{GAME_MODE_CONFIG.normal.emoji} 일반 모드</th><th>{GAME_MODE_CONFIG.extreme.emoji} 극한 모드</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>시작 자금</td>
                <td>{(GAME_MODE_CONFIG.normal.initialBalance / 10_000).toLocaleString()}만원</td>
                <td>{(GAME_MODE_CONFIG.extreme.initialBalance / 10_000).toLocaleString()}만원</td>
              </tr>
              <tr><td>라운드 수</td><td>{GAME_MODE_CONFIG.normal.totalRounds}라운드</td><td>{GAME_MODE_CONFIG.extreme.totalRounds}라운드</td></tr>
              <tr><td>특징</td><td>{GAME_MODE_CONFIG.normal.description}</td><td>{GAME_MODE_CONFIG.extreme.description}</td></tr>
              <tr><td>추천 대상</td><td>처음 하는 분</td><td>자신 있는 도전가</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>🧮 기대값이란?</h2>
        <p>
          각 선택지에는 <strong>기대값(Expected Value)</strong>이 표시됩니다.
          기대값은 각 결과의 금액에 해당 확률을 곱한 합계입니다.
        </p>
        <p>
          <strong>예시</strong>: 선택지 A가 &ldquo;70% 확률로 +100만원, 30% 확률로 -50만원&rdquo;이라면,
          기대값은 (0.7 &times; 100) + (0.3 &times; -50) = <strong>+55만원</strong>입니다.
        </p>
        <p>
          기대값이 높을수록 평균적으로 유리한 선택이지만, 높은 리스크를 수반할 수
          있습니다. 반대로 기대값이 낮더라도 안정적인 선택이 있을 수 있습니다.
        </p>
      </section>

      <section>
        <h2>📈 점수 계산 방식</h2>
        <p>게임이 끝나면 세 가지 점수가 분석됩니다.</p>
        <ul>
          <li>
            <strong>공격성 (Risk Score)</strong>: 높은 리스크 선택지를 얼마나
            자주 골랐는지 측정합니다. 0%에 가까울수록 보수적, 100%에 가까울수록
            공격적입니다.
          </li>
          <li>
            <strong>합리성 (Rationality Score)</strong>: 기대값이 높은 선택지를
            얼마나 자주 골랐는지 측정합니다. 높을수록 수학적으로 유리한 선택을
            한 것입니다.
          </li>
          <li>
            <strong>운 점수 (Luck Score)</strong>: 실제 결과가 기대값 대비
            얼마나 좋았는지 측정합니다. 양수면 운이 좋았고, 음수면 운이
            나빴다는 뜻입니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>🏅 투자자 유형 결정</h2>
        <p>
          공격성, 합리성, 운 점수의 조합에 따라 8가지 투자자 유형 중 하나가
          결정됩니다. 같은 결과라도 선택 패턴에 따라 다른 유형이 나올 수
          있습니다!
        </p>
        <p>
          자세한 유형 설명은 <Link to="/guide/types">투자자 유형 가이드</Link>를
          확인하세요.
        </p>
      </section>
    </ContentLayout>
  );
}
