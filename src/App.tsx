import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IntroPage, GamePage, ResultPage } from '@presentation/pages';
import { ExitConfirmDialog } from '@presentation/components';
import {
  isAppsInToss,
  addBackEventListener,
  setIosSwipeGestureEnabled,
  getSafeAreaInsets,
  closeApp,
} from '@lib/appsInToss';
import './styles/global.css';

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
          <Route path="/result" element={<ResultPage />} />
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
