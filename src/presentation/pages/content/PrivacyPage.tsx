import { ContentLayout } from '@presentation/components';

export function PrivacyPage() {
  return (
    <ContentLayout title="개인정보처리방침">
      <p className="policy-updated">최종 수정일: 2025년 1월 1일</p>

      <section>
        <h2>1. 개인정보의 수집 및 이용 목적</h2>
        <p>
          돈 감각 테스트(이하 &ldquo;서비스&rdquo;)는 다음과 같은 목적으로
          최소한의 개인정보를 수집합니다.
        </p>
        <ul>
          <li><strong>랭킹 등록</strong>: 닉네임, 게임 결과(수익률, 투자자 유형) 저장</li>
          <li><strong>서비스 개선</strong>: 이용 통계 분석(Google Analytics)</li>
          <li><strong>광고 제공</strong>: 맞춤형 광고 표시(Google AdSense)</li>
        </ul>
      </section>

      <section>
        <h2>2. 수집하는 개인정보 항목</h2>
        <div className="table-wrapper" role="region" aria-label="수집 개인정보 항목" tabIndex={0}>
          <table>
            <thead>
              <tr><th>구분</th><th>수집 항목</th><th>보유 기간</th></tr>
            </thead>
            <tbody>
              <tr><td>랭킹</td><td>닉네임, 게임 결과</td><td>서비스 운영 기간</td></tr>
              <tr><td>분석</td><td>방문 기록, 페이지 조회</td><td>26개월 (GA4 기본)</td></tr>
              <tr><td>광고</td><td>쿠키, 광고 식별자</td><td>Google 정책에 따름</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          본 서비스는 회원가입을 요구하지 않으며, 이메일, 전화번호 등
          민감한 개인정보를 수집하지 않습니다.
        </p>
      </section>

      <section>
        <h2>3. 개인정보의 제3자 제공</h2>
        <p>서비스는 다음의 제3자 서비스를 이용합니다.</p>
        <ul>
          <li>
            <strong>Google Analytics 4</strong>: 서비스 이용 통계 수집.
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google 개인정보처리방침
            </a>
          </li>
          <li>
            <strong>Google AdSense</strong>: 광고 표시 및 수익화.
            쿠키를 사용하여 이전 방문 기록을 기반으로 광고를 게재합니다.
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
              Google 광고 정책
            </a>
          </li>
          <li>
            <strong>Supabase</strong>: 랭킹 데이터 저장.
            닉네임과 게임 결과만 저장하며, 암호화된 통신(HTTPS)을 사용합니다.
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
              Supabase 개인정보처리방침
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. 쿠키(Cookie) 사용</h2>
        <p>
          서비스는 사용자 경험 개선 및 광고 제공을 위해 쿠키를 사용합니다.
        </p>
        <ul>
          <li><strong>필수 쿠키</strong>: 서비스 정상 작동에 필요한 쿠키</li>
          <li><strong>분석 쿠키</strong>: Google Analytics를 통한 이용 통계</li>
          <li><strong>광고 쿠키</strong>: Google AdSense 맞춤형 광고</li>
        </ul>
        <p>
          쿠키 사용을 원하지 않는 경우, 브라우저 설정에서 쿠키를 차단할 수 있습니다.
          다만, 일부 서비스 기능이 제한될 수 있습니다.
        </p>
      </section>

      <section>
        <h2>5. 개인정보의 파기</h2>
        <p>
          수집된 개인정보는 수집 목적 달성 후 지체 없이 파기합니다.
          랭킹 데이터는 서비스 운영 기간 동안 보관되며, 서비스 종료 시
          모든 데이터를 삭제합니다.
        </p>
      </section>

      <section>
        <h2>6. 이용자의 권리</h2>
        <ul>
          <li>랭킹 데이터 삭제 요청 가능</li>
          <li>쿠키 수집 거부 가능 (브라우저 설정)</li>
          <li>Google 광고 개인 맞춤 설정 변경 가능 (
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              ads settings
            </a>
            )
          </li>
        </ul>
      </section>

      <section>
        <h2>7. 개인정보 보호 책임자</h2>
        <p>
          개인정보 처리에 관한 문의, 불만, 구제 요청은 아래로 연락주세요.
        </p>
        <p><strong>이메일</strong>: economic.sense.test@gmail.com</p>
      </section>

      <section>
        <h2>8. 개인정보처리방침 변경</h2>
        <p>
          본 개인정보처리방침은 법령이나 서비스 변경 사항을 반영하기 위해
          수정될 수 있습니다. 변경 시 서비스 내 공지를 통해 안내합니다.
        </p>
      </section>
    </ContentLayout>
  );
}
