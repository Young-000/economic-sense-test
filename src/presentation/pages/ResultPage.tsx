import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResult } from '../hooks/useResult';
import { ShareButton } from '../components/ShareButton';

export function ResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const answersParam = searchParams.get('answers') || '';
  const { scores, characterCode, character } = useResult(answersParam);

  if (!character || !scores) {
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

  return (
    <div className="result-page">
      <div className="result-content">
        <div className="result-header">
          <span className="result-label">당신의 경제 유형은</span>
          <h1 className="character-name">{character.name}</h1>
          <span className="character-code">{characterCode}</span>
        </div>

        <div className="character-description">
          <p>{character.description}</p>
        </div>

        <div className="scores-section">
          <h2 className="section-title">경제 지표 분석</h2>
          <div className="score-bars">
            <ScoreBar label="위험 회피" value={scores.riskAversion} leftLabel="도전적" rightLabel="신중한" />
            <ScoreBar label="손실 민감도" value={scores.lossAversion} leftLabel="담대한" rightLabel="민감한" />
            <ScoreBar label="시간 선호" value={scores.timeDiscount} leftLabel="즉각적" rightLabel="장기적" />
            <ScoreBar label="확률 인식" value={scores.probabilityWeight} leftLabel="낙관적" rightLabel="객관적" />
          </div>
        </div>

        <div className="traits-section">
          <div className="trait-box strength">
            <h3>강점</h3>
            <ul>
              {character.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="trait-box weakness">
            <h3>약점</h3>
            <ul>
              {character.weaknesses.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="advice-section">
          <h2 className="section-title">경제적 조언</h2>
          <p className="advice-text">{character.advice}</p>
        </div>

        <div className="action-buttons">
          <ShareButton characterName={character.name} characterCode={characterCode!} />
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}

function ScoreBar({ label, value, leftLabel, rightLabel }: ScoreBarProps) {
  return (
    <div className="score-bar-item">
      <div className="score-bar-header">
        <span className="score-label">{label}</span>
        <span className="score-value">{Math.round(value)}%</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${value}%` }} />
      </div>
      <div className="score-bar-labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
