import { ContentLayout } from '@presentation/components';

export function AboutPage() {
  return (
    <ContentLayout title="서비스 소개">
      <section>
        <h2>💸 돈 감각 테스트란?</h2>
        <p>
          돈 감각 테스트는 투자 시뮬레이션 기반의 경제 상식 퀴즈 게임입니다.
          가상의 자금을 받아 10번의 선택을 통해 자산을 운용하고,
          당신의 투자 성향과 경제적 감각을 분석합니다.
        </p>
      </section>

      <section>
        <h2>🎯 왜 만들었나요?</h2>
        <p>
          투자와 경제는 어렵고 딱딱한 주제입니다. 하지만 우리의 일상과
          밀접하게 연결되어 있죠. &ldquo;돈 감각 테스트&rdquo;는 이런 경제
          개념을 재미있는 게임으로 풀어내어, 누구나 쉽게 자신의 투자 성향을
          알아볼 수 있도록 기획되었습니다.
        </p>
        <p>
          MZ세대의 투자 관심이 높아지는 시대에, 실제 돈을 투자하기 전에
          자신이 어떤 투자 성향인지 미리 파악해보는 것은 매우 유용합니다.
        </p>
      </section>

      <section>
        <h2>✨ 게임 특징</h2>
        <ul>
          <li><strong>확률 기반 시뮬레이션</strong>: 각 선택지의 확률과 기대값이 명시되어, 실제 투자처럼 리스크와 리워드를 비교할 수 있습니다.</li>
          <li><strong>8가지 투자자 유형 분석</strong>: 공격성, 합리성, 운 점수를 종합하여 당신만의 투자자 유형을 분석합니다.</li>
          <li><strong>7단계 티어 시스템</strong>: SS부터 F까지, 수익률에 따라 등급을 부여합니다.</li>
          <li><strong>랭킹 & 업적</strong>: 다른 플레이어와 성적을 비교하고, 다양한 업적을 달성할 수 있습니다.</li>
          <li><strong>친구 대결</strong>: 친구에게 도전장을 보내 수익률 배틀을 펼칠 수 있습니다.</li>
          <li><strong>시즌 이벤트</strong>: 봄, 여름, 가을, 겨울 시즌과 설날, 추석 등 특별 이벤트가 진행됩니다.</li>
        </ul>
      </section>

      <section>
        <h2>🎮 게임 모드</h2>
        <div className="table-wrapper" role="region" aria-label="게임 모드 비교" tabIndex={0}>
          <table>
            <thead>
              <tr><th>모드</th><th>시작 자금</th><th>특징</th></tr>
            </thead>
            <tbody>
              <tr><td>💰 일반 모드</td><td>1,000만원</td><td>현실적인 경제 선택</td></tr>
              <tr><td>🔥 극한 모드</td><td>5,000만원</td><td>하이리스크 하이리턴</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>🔒 안전한 서비스</h2>
        <p>
          돈 감각 테스트는 완전 무료 서비스이며, 실제 돈이 사용되지 않습니다.
          게임 내 자산은 100% 가상 자금이므로 부담 없이 즐겨주세요.
          개인정보는 최소한만 수집하며, 닉네임 외에 별도의 회원가입이 필요하지 않습니다.
        </p>
      </section>

      <section>
        <h2>📬 문의</h2>
        <p>
          서비스 관련 문의사항이 있으시면 아래 이메일로 연락주세요.
        </p>
        <p><strong>이메일</strong>: economic.sense.test@gmail.com</p>
      </section>
    </ContentLayout>
  );
}
