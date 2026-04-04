import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { IntroPage, GamePage } from '@presentation/pages';
import { ErrorBoundary } from '@presentation/components';
import { graniteEvent, closeView } from '@apps-in-toss/web-framework';
import './styles/global.css';

// ResultPage는 html2canvas를 사용하므로 lazy loading으로 분리
const ResultPage = lazy(() => import('@presentation/pages/ResultPage').then(m => ({ default: m.ResultPage })));

/** 홈 버튼 이벤트 — 메인 화면으로 이동 */
function HomeEventHandler(): null {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = graniteEvent.addEventListener('homeEvent', {
      onEvent: () => {
        if (location.pathname === '/') return;
        navigate('/', { replace: true });
      },
      onError: (error) => {
        console.warn('[HomeEvent] error:', error);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}

/** 뒤로가기 이벤트 — 첫 화면이면 앱 종료, 아니면 뒤로 이동 */
function BackEventHandler(): null {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        if (location.pathname === '/') {
          closeView();
        } else {
          navigate(-1);
        }
      },
      onError: (error) => {
        console.warn('[BackEvent] error:', error);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [location.pathname, navigate]);

  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <HomeEventHandler />
        <BackEventHandler />
        <div className="app">
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route
              path="/result"
              element={
                <Suspense fallback={<div className="loading-state"><p>결과 로딩 중...</p></div>}>
                  <ResultPage />
                </Suspense>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
