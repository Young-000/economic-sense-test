import React from 'react';
import { useNavigate } from 'react-router-dom';

export function IntroPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/test');
  };

  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1 className="intro-title">경제감각 테스트</h1>
        <p className="intro-subtitle">
          10개의 질문으로 알아보는<br />
          나의 경제적 의사결정 유형
        </p>

        <div className="intro-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span className="feature-text">4가지 경제 지표 분석</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">16가지 캐릭터 유형</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⏱️</span>
            <span className="feature-text">약 2분 소요</span>
          </div>
        </div>

        <button className="start-button" onClick={handleStart}>
          테스트 시작하기
        </button>
      </div>
    </div>
  );
}
