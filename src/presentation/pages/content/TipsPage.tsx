import { ContentLayout } from '@presentation/components';

export function TipsPage() {
  return (
    <ContentLayout title="고득점 꿀팁">
      <section>
        <h2>🎯 기대값 활용 전략</h2>
        <p>
          기대값(Expected Value)은 투자 의사결정의 핵심 지표입니다.
          각 선택지의 기대값을 비교하여 평균적으로 유리한 선택을 할 수 있습니다.
        </p>
        <h3>기대값 계산법</h3>
        <p>
          기대값 = (확률1 &times; 금액1) + (확률2 &times; 금액2)
        </p>
        <p>
          <strong>실전 예시</strong>: 선택지 A &ldquo;60% +200만원, 40% -100만원&rdquo;
          vs 선택지 B &ldquo;80% +80만원, 20% -30만원&rdquo;
        </p>
        <ul>
          <li>A의 기대값: (0.6 &times; 200) + (0.4 &times; -100) = <strong>+80만원</strong></li>
          <li>B의 기대값: (0.8 &times; 80) + (0.2 &times; -30) = <strong>+58만원</strong></li>
          <li>기대값만 보면 A가 유리하지만, A는 40% 확률로 -100만원 손실 위험!</li>
        </ul>
      </section>

      <section>
        <h2>🛡️ 리스크 관리</h2>
        <p>
          높은 수익을 노리는 것도 중요하지만, 큰 손실을 피하는 것이 더
          중요할 수 있습니다. 자산이 크게 줄면 회복하기가 매우 어렵습니다.
        </p>
        <h3>핵심 원칙</h3>
        <ul>
          <li>
            <strong>손실 비대칭</strong>: -50% 손실 후 원금 회복에는 +100%
            수익이 필요합니다. 손실을 피하는 것이 수학적으로 유리합니다.
          </li>
          <li>
            <strong>자산이 적을 때 보수적으로</strong>: 남은 자산이 적으면
            안정적인 선택지를 고르는 것이 좋습니다.
          </li>
          <li>
            <strong>자산이 많을 때 공격적으로</strong>: 충분한 여유가 있다면
            높은 기대값의 공격적 선택도 시도해볼 만합니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>🔥 극한 모드 공략</h2>
        <p>
          극한 모드는 5,000만원의 높은 시작 자금과 함께 더 극단적인 선택지가
          등장합니다. 변동성이 크므로 더 신중한 전략이 필요합니다.
        </p>
        <ul>
          <li>초반에 큰 손실을 피하는 것이 최우선</li>
          <li>중반 이후 여유 자금이 있으면 공격적으로 전환</li>
          <li>확률이 매우 낮은 대박 선택지는 주의 (기대값 확인 필수)</li>
        </ul>
      </section>

      <section>
        <h2>📊 모드별 전략 비교</h2>
        <div className="table-wrapper" role="region" aria-label="모드별 전략 비교" tabIndex={0}>
          <table>
            <thead>
              <tr><th>전략</th><th>일반 모드</th><th>극한 모드</th></tr>
            </thead>
            <tbody>
              <tr><td>초반</td><td>기대값 중심 선택</td><td>안전 선택 우선</td></tr>
              <tr><td>중반</td><td>밸런스 유지</td><td>상황에 따라 조절</td></tr>
              <tr><td>후반</td><td>리드 유지 또는 역전</td><td>가진 게 없으면 올인</td></tr>
              <tr><td>목표</td><td>꾸준한 수익</td><td>대박 또는 생존</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>💎 SS 등급 달성 비법</h2>
        <ol>
          <li>
            <strong>기대값 &gt; 0인 선택을 꾸준히</strong>: 매 라운드 기대값이
            높은 선택을 하면 장기적으로 수익률이 올라갑니다.
          </li>
          <li>
            <strong>운이 좋을 때 과감하게</strong>: 연속 수익을 내고 있다면
            조금 더 공격적인 선택도 괜찮습니다.
          </li>
          <li>
            <strong>여러 번 플레이</strong>: 같은 전략이라도 확률에 따라
            결과가 달라집니다. 꾸준히 도전하면 SS 등급에 도달할 수 있습니다!
          </li>
          <li>
            <strong>업적도 챙기기</strong>: 다양한 플레이 스타일로 업적을
            달성하며 게임을 더 재밌게 즐겨보세요.
          </li>
        </ol>
      </section>

      <section>
        <h2>⚠️ 흔한 실수</h2>
        <ul>
          <li><strong>감정적 선택</strong>: 연속 손실 후 무리하게 공격적인 선택을 하면 더 큰 손실로 이어질 수 있습니다.</li>
          <li><strong>확률 무시</strong>: 당첨금만 보고 확률을 무시하면 기대값이 낮은 선택을 하게 됩니다.</li>
          <li><strong>과도한 보수</strong>: 항상 안전한 선택만 하면 수익률이 낮아 높은 티어를 달성하기 어렵습니다.</li>
        </ul>
      </section>
    </ContentLayout>
  );
}
