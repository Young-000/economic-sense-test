import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IntroPage, GamePage } from '@presentation/pages';
import './styles/global.css';

// ResultPage는 html2canvas를 사용하므로 lazy loading으로 분리
const ResultPage = lazy(() => import('@presentation/pages/ResultPage').then(m => ({ default: m.ResultPage })));

export function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route
            path="/result"
            element={
              <Suspense fallback={<div className="loading-state"><span className="loading-emoji">📊</span><p>결과 로딩 중...</p></div>}>
                <ResultPage />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
