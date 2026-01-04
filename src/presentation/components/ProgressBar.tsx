import React from 'react';

interface ProgressBarProps {
  /** 진행률 (0-100) */
  progress: number;
  /** 현재 질문 번호 (1-10) */
  current: number;
  /** 총 질문 수 */
  total: number;
}

export function ProgressBar({ progress, current, total }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-text">
        <span className="progress-current">{current}</span>
        <span className="progress-divider">/</span>
        <span className="progress-total">{total}</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
