import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';
import type { RoundResult } from '@domain/entities';
import { GAME_CONFIG } from '@domain/entities';
import { calculateFinalResult } from '@domain/usecases';
import { questions } from '@data/questions';

interface RankingEntry {
  name: string;
  returnRate: number;
  timestamp: number;
}

const RANKING_STORAGE_KEY = 'economic_sense_ranking';
const MAX_RANKING_ENTRIES = 100;

function loadRankings(): RankingEntry[] {
  try {
    const data = localStorage.getItem(RANKING_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveRanking(entry: RankingEntry): RankingEntry[] {
  const rankings = loadRankings();
  rankings.push(entry);
  rankings.sort((a, b) => b.returnRate - a.returnRate);
  const trimmed = rankings.slice(0, MAX_RANKING_ENTRIES);
  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

function getRank(returnRate: number, rankings: RankingEntry[]): number {
  const sorted = [...rankings].sort((a, b) => b.returnRate - a.returnRate);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].returnRate === returnRate) {
      return i + 1;
    }
  }
  return sorted.length + 1;
}

export function ResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [showRanking, setShowRanking] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');

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

  useEffect(() => {
    const loadedRankings = loadRankings();
    setRankings(loadedRankings);
  }, []);

  const handleRegisterRanking = useCallback(() => {
    if (!finalResult || !userName.trim()) return;

    const entry: RankingEntry = {
      name: userName.trim(),
      returnRate: finalResult.totalReturn,
      timestamp: Date.now(),
    };

    const updatedRankings = saveRanking(entry);
    setRankings(updatedRankings);
    setUserRank(getRank(finalResult.totalReturn, updatedRankings));
    setIsRegistered(true);
  }, [finalResult, userName]);

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

        {/* 랭킹 섹션 */}
        <div className="ranking-section">
          {!isRegistered ? (
            <div className="ranking-register">
              <h2 className="ranking-title">랭킹에 등록하기</h2>
              <div className="ranking-input-group">
                <input
                  type="text"
                  className="ranking-input"
                  placeholder="닉네임을 입력하세요"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={10}
                />
                <button
                  className="ranking-register-btn"
                  onClick={handleRegisterRanking}
                  disabled={!userName.trim()}
                >
                  등록하기
                </button>
              </div>
            </div>
          ) : (
            <div className="ranking-registered">
              <div className="ranking-success">
                <span className="ranking-success-icon">🎉</span>
                <span className="ranking-success-text">랭킹 등록 완료!</span>
              </div>
              <div className="ranking-current">
                현재 순위: <span className="ranking-number">{userRank}위</span>
              </div>
            </div>
          )}

          <button
            className="ranking-toggle"
            onClick={() => setShowRanking(!showRanking)}
          >
            랭킹 {showRanking ? '숨기기' : '보기'} {showRanking ? '▲' : '▼'}
          </button>

          {showRanking && rankings.length > 0 && (
            <div className="ranking-list">
              {rankings.slice(0, 10).map((entry, index) => (
                <div
                  key={`${entry.name}-${entry.timestamp}`}
                  className={`ranking-item ${isRegistered && entry.returnRate === totalReturn && entry.name === userName ? 'current-user' : ''}`}
                >
                  <span className="ranking-position">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <span className="ranking-name">{entry.name}</span>
                  <span className={`ranking-return ${entry.returnRate >= 0 ? 'positive' : 'negative'}`}>
                    {entry.returnRate >= 0 ? '+' : ''}{entry.returnRate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
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
