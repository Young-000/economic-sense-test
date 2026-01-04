import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import type { RoundResult } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';
import { calculateFinalResult } from '@domain/usecases';
import { questions } from '@data/questions';

export function ResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const finalResult = useMemo(() => {
    try {
      const dataParam = searchParams.get('data');
      if (!dataParam) return null;

      const results: RoundResult[] = JSON.parse(decodeURIComponent(dataParam));
      if (!results || results.length !== GAME_CONFIG.TOTAL_ROUNDS) return null;

      return calculateFinalResult(results, questions);
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!finalResult) {
    return (
      <div className="result-page">
        <div className="result-error">
          <p>결과를 찾을 수 없습니다.</p>
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  const { profile, finalBalance, totalReturn, riskScore, rationalityScore, luckScore } = finalResult;

  const formatBalance = (value: number) => {
    if (value >= 100_000_000) {
      return `${(value / 100_000_000).toFixed(2)}억원`;
    }
    return `${Math.round(value / 10_000).toLocaleString()}만원`;
  };

  const getReturnClass = () => {
    if (totalReturn >= 50) return 'return-great';
    if (totalReturn >= 0) return 'return-good';
    if (totalReturn >= -30) return 'return-bad';
    return 'return-terrible';
  };

  const getLuckLabel = () => {
    if (luckScore >= 50) return '대박 행운! 🍀🍀';
    if (luckScore >= 20) return '운 좋았어요 🍀';
    if (luckScore >= -20) return '평균적인 운';
    if (luckScore >= -50) return '운이 없었네요 😢';
    return '극심한 불운 😭';
  };

  const handleShare = async () => {
    const shareText = `🎯 경제감각 시뮬레이션 결과\n\n` +
      `${profile.emoji} ${profile.name}\n` +
      `💰 최종 자산: ${formatBalance(finalBalance)}\n` +
      `📈 수익률: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%\n` +
      `"${profile.tag}"\n\n` +
      `나도 해보기 👉`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '경제감각 테스트',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // 무시
      }
    }

    try {
      await navigator.clipboard.writeText(shareText + ' ' + window.location.origin);
      alert('결과가 복사되었습니다!');
    } catch {
      alert(shareText);
    }
  };

  return (
    <div className="result-page">
      <div className="result-content">
        {/* 투자자 유형 */}
        <div className="investor-type-card">
          <span className="type-emoji">{profile.emoji}</span>
          <h1 className="type-name">{profile.name}</h1>
          <span className="type-tag">#{profile.tag}</span>
        </div>

        {/* 최종 자산 */}
        <div className="final-balance-card">
          <span className="balance-label">최종 자산</span>
          <span className="balance-value">{formatBalance(finalBalance)}</span>
          <span className={`return-value ${getReturnClass()}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </span>
          <p className="initial-note">
            (시작: {formatBalance(GAME_CONFIG.INITIAL_BALANCE)})
          </p>
        </div>

        {/* 설명 */}
        <div className="description-card">
          <p>{profile.description}</p>
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
              <span className="stat-value">{getLuckLabel()}</span>
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

        {/* 버튼 */}
        <div className="action-buttons">
          <button className="share-button" onClick={handleShare}>
            결과 공유하기
          </button>
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 도전하기
          </button>
        </div>
      </div>
    </div>
  );
}
