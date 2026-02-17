import type { RoundResult, InvestorType, InvestorProfile } from '@domain/entities';
import { AssetProgressChart, type AssetDataPoint } from '@presentation/components';
import { investorDetails } from '@data/investorDetails';

export interface InvestmentAnalysisProps {
  gameResults: RoundResult[];
  finalBalance: number;
  bestPerformance: AssetDataPoint[] | undefined;
  initialBalance: number;
  investorType: InvestorType;
  profile: InvestorProfile;
  riskScore: number;
  rationalityScore: number;
  luckScore: number;
}

function getLuckLabel(luckScore: number): string {
  if (luckScore >= 50) return '대박 행운! 🍀🍀';
  if (luckScore >= 20) return '운 좋았어요 🍀';
  if (luckScore >= -20) return '평균적인 운';
  if (luckScore >= -50) return '운이 없었네요 😢';
  return '극심한 불운 😭';
}

export function InvestmentAnalysis({
  gameResults,
  finalBalance,
  bestPerformance,
  initialBalance,
  investorType,
  profile,
  riskScore,
  rationalityScore,
  luckScore,
}: InvestmentAnalysisProps) {
  const detail = investorDetails[investorType];
  const luckLabel = getLuckLabel(luckScore);

  return (
    <>
      {/* 자산 변화 그래프 */}
      <AssetProgressChart
        results={gameResults}
        currentBalance={finalBalance}
        bestPerformance={bestPerformance}
        height={180}
        animate={true}
        initialBalance={initialBalance}
      />

      {/* 유형 상세 설명 */}
      <div className="investor-detail-card">
        <div className="detail-header">
          <span className="detail-emoji">{profile.emoji}</span>
          <div className="detail-title-area">
            <h3 className="detail-type-name">{profile.name}</h3>
            <p className="detail-summary">{detail.summary}</p>
          </div>
        </div>

        <div className="detail-quote">
          <span className="quote-icon">&ldquo;</span>
          <p>{detail.quote}</p>
        </div>

        <div className="detail-style">
          <h4>💡 투자 스타일</h4>
          <p>{detail.style}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-section strengths">
            <h4>✅ 강점</h4>
            <ul>
              {detail.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="detail-section weaknesses">
            <h4>⚠️ 주의점</h4>
            <ul>
              {detail.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>

        <div className="detail-examples">
          <h4>🌟 이런 투자자들</h4>
          <div className="example-tags">
            {detail.examples.map((e, i) => (
              <span key={i} className="example-tag">{e}</span>
            ))}
          </div>
        </div>

        <div className="detail-investments">
          <h4>💰 어울리는 투자 (재미용)</h4>
          <div className="investment-tags">
            {detail.investments.map((inv, i) => (
              <span key={i} className="investment-tag">{inv}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 분석 */}
      <div className="analysis-section">
        <h2 className="section-title">투자 성향 분석</h2>

        <div className="stat-item">
          <div className="stat-header">
            <span className="stat-label">공격성</span>
            <span className="stat-value">{riskScore}%</span>
          </div>
          <div className="stat-bar">
            <div className="stat-fill risk" style={{ width: `${riskScore}%` }} />
          </div>
          <div className="stat-labels">
            <span>보수적</span>
            <span>공격적</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-header">
            <span className="stat-label">합리성</span>
            <span className="stat-value">{rationalityScore}%</span>
          </div>
          <div className="stat-bar">
            <div className="stat-fill rational" style={{ width: `${rationalityScore}%` }} />
          </div>
          <div className="stat-labels">
            <span>감정적</span>
            <span>합리적</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-header">
            <span className="stat-label">운</span>
            <span className="stat-value">{luckLabel}</span>
          </div>
          <div className="stat-bar luck-bar">
            <div
              className={`stat-fill luck ${luckScore >= 0 ? 'positive' : 'negative'}`}
              style={{
                width: `${Math.abs(luckScore) / 2}%`,
                marginLeft: luckScore >= 0 ? '50%' : `${50 - Math.abs(luckScore) / 2}%`
              }}
            />
            <div className="luck-center" />
          </div>
          <div className="stat-labels">
            <span>불운</span>
            <span>행운</span>
          </div>
        </div>
      </div>
    </>
  );
}
