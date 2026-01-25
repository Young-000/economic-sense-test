import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IntroPage, GamePage } from '@presentation/pages';
import { ExitConfirmDialog } from '@presentation/components';
import {
  isAppsInToss,
  addBackEventListener,
  setIosSwipeGestureEnabled,
  getSafeAreaInsets,
  closeApp,
} from '@lib/appsInToss';
import './styles/global.css';

// ResultPage는 html2canvas를 사용하므로 lazy loading으로 분리
const ResultPage = lazy(() => import('@presentation/pages/ResultPage').then(m => ({ default: m.ResultPage })));

export function App() {
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Safe Area Insets 초기값 계산 (렌더링 전 동기적으로)
  const safeAreaTop = useMemo(() => {
    if (!isAppsInToss()) return 0;
    return getSafeAreaInsets().top;
  }, []);

  useEffect(() => {
    if (!isAppsInToss()) return;

    // iOS 스와이프 뒤로가기 비활성화 (게임 중 실수로 종료 방지)
    setIosSwipeGestureEnabled(false);

    // 뒤로가기 이벤트 핸들러 등록 (X 버튼 및 안드로이드 뒤로가기)
    const cleanup = addBackEventListener(() => {
      setShowExitDialog(true);
    });

    return () => {
      cleanup();
      // 앱 종료 시 스와이프 다시 활성화
      setIosSwipeGestureEnabled(true);
    };
  }, []);

  const handleExitConfirm = async () => {
    setShowExitDialog(false);
    await closeApp();
  };

  const handleExitCancel = () => {
    setShowExitDialog(false);
  };

  return (
    <BrowserRouter>
      <div
        className="app"
        style={{
          paddingTop: safeAreaTop > 0 ? `${safeAreaTop}px` : undefined,
        }}
      >
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

        {/* 종료 확인 다이얼로그 */}
        <ExitConfirmDialog
          open={showExitDialog}
          onClose={handleExitCancel}
          onConfirm={handleExitConfirm}
        />
      </div>
    </BrowserRouter>
  );
}
