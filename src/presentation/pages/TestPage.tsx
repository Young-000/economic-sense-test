import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../hooks/useTest';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionCard } from '../components/QuestionCard';
import { questions } from '@data/questions';

export function TestPage() {
  const navigate = useNavigate();
  const { currentIndex, answers, isComplete, progress, selectAnswer } = useTest();

  useEffect(() => {
    if (isComplete) {
      // 답변을 URL 파라미터로 전달
      const answersParam = answers.join('');
      navigate(`/result?answers=${answersParam}`);
    }
  }, [isComplete, answers, navigate]);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="test-page">
      <ProgressBar
        progress={progress}
        current={currentIndex + 1}
        total={10}
      />

      <div className="question-container">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onSelect={selectAnswer}
        />
      </div>
    </div>
  );
}
