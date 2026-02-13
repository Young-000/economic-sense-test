import { investorProfiles } from '@domain/entities';
import { investorDetails } from '@data/investorDetails';
import { ContentLayout } from '@presentation/components';

export function InvestorTypesPage() {
  const types = Object.values(investorProfiles);

  return (
    <ContentLayout title="투자자 유형 가이드">
      <section>
        <h2>🎭 8가지 투자자 유형</h2>
        <p>
          돈 감각 테스트는 공격성, 합리성, 운 점수를 종합 분석하여
          8가지 투자자 유형 중 하나를 부여합니다. 같은 수익률이라도
          선택 패턴에 따라 전혀 다른 유형이 나올 수 있어요!
        </p>
      </section>

      {types.map((profile) => {
        const detail = investorDetails[profile.type];
        return (
          <section key={profile.type} className="type-detail-section">
            <div className="type-detail-header">
              <span className="type-detail-emoji">{profile.emoji}</span>
              <div>
                <h2>{profile.name}</h2>
                <span className="type-detail-tag">#{profile.tag}</span>
              </div>
            </div>

            <p>{profile.description}</p>

            <div className="type-detail-quote">
              <span>&ldquo;</span>
              {detail.quote.replace(/^"|"$/g, '')}
              <span>&rdquo;</span>
            </div>

            <h3>💡 투자 스타일</h3>
            <p>{detail.style}</p>

            <div className="type-detail-grid">
              <div>
                <h3>✅ 강점</h3>
                <ul>
                  {detail.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h3>⚠️ 주의점</h3>
                <ul>
                  {detail.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>

            <h3>🌟 이런 투자자들</h3>
            <div className="type-detail-tags">
              {detail.examples.map((e, i) => (
                <span key={i} className="tag-example">{e}</span>
              ))}
            </div>

            <h3>💰 어울리는 투자 (재미용)</h3>
            <div className="type-detail-tags">
              {detail.investments.map((inv, i) => (
                <span key={i} className="tag-investment">{inv}</span>
              ))}
            </div>
          </section>
        );
      })}
    </ContentLayout>
  );
}
