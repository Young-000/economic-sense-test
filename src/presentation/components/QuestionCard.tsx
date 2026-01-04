import React from 'react';
import type { Question, AnswerChoice } from '@domain/entities';

interface QuestionCardProps {
  question: Question;
  onSelect: (answer: AnswerChoice) => void;
}

export function QuestionCard({ question, onSelect }: QuestionCardProps) {
  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">Q{question.id}</span>
        <span className="question-type">{getTypeLabel(question.type)}</span>
      </div>

      <h2 className="question-title">어떤 것을 선택하시겠어요?</h2>

      <div className="options-container">
        <button
          className="option-button option-a"
          onClick={() => onSelect('A')}
        >
          <span className="option-label">{question.optionA.label}</span>
          <span className="option-description">{question.optionA.description}</span>
        </button>

        <div className="option-divider">VS</div>

        <button
          className="option-button option-b"
          onClick={() => onSelect('B')}
        >
          <span className="option-label">{question.optionB.label}</span>
          <span className="option-description">{question.optionB.description}</span>
        </button>
      </div>
    </div>
  );
}

function getTypeLabel(type: Question['type']): string {
  const labels: Record<Question['type'], string> = {
    risk: '위험 판단',
    loss: '손실 판단',
    time: '시간 판단',
    probability: '확률 판단',
  };
  return labels[type];
}
