import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { checkUnlinkReferrer, clearAllUserData } from '@infrastructure/userIdentity';

// AIT: UNLINK referrer 처리 (연결 해제 시 모든 데이터 삭제)
if (checkUnlinkReferrer()) {
  void clearAllUserData();
  window.history.replaceState('', '', window.location.pathname);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
