import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { IntroPage, GamePage } from '@presentation/pages';
import './styles/global.css';

// ResultPage는 html2canvas를 사용하므로 lazy loading으로 분리
const ResultPage = lazy(() => import('@presentation/pages/ResultPage').then(m => ({ default: m.ResultPage })));

// 콘텐츠 페이지 lazy loading
const AboutPage = lazy(() => import('@presentation/pages/content/AboutPage').then(m => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('@presentation/pages/content/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@presentation/pages/content/TermsPage').then(m => ({ default: m.TermsPage })));
const GuidePage = lazy(() => import('@presentation/pages/content/GuidePage').then(m => ({ default: m.GuidePage })));
const TierGuidePage = lazy(() => import('@presentation/pages/content/TierGuidePage').then(m => ({ default: m.TierGuidePage })));
const InvestorTypesPage = lazy(() => import('@presentation/pages/content/InvestorTypesPage').then(m => ({ default: m.InvestorTypesPage })));
const TipsPage = lazy(() => import('@presentation/pages/content/TipsPage').then(m => ({ default: m.TipsPage })));
const FaqPage = lazy(() => import('@presentation/pages/content/FaqPage').then(m => ({ default: m.FaqPage })));
const UpdatesPage = lazy(() => import('@presentation/pages/content/UpdatesPage').then(m => ({ default: m.UpdatesPage })));
const RankingGuidePage = lazy(() => import('@presentation/pages/content/RankingGuidePage').then(m => ({ default: m.RankingGuidePage })));

const ContentFallback = (
  <div className="loading-state" role="status" aria-live="polite">
    <span className="loading-emoji" aria-hidden="true">📄</span>
    <p>페이지 로딩 중...</p>
  </div>
);

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
              <Suspense fallback={<div className="loading-state" role="status" aria-live="polite"><span className="loading-emoji" aria-hidden="true">📊</span><p>결과 로딩 중...</p></div>}>
                <ResultPage />
              </Suspense>
            }
          />
          {/* 콘텐츠 페이지 */}
          <Route path="/about" element={<Suspense fallback={ContentFallback}><AboutPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={ContentFallback}><PrivacyPage /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={ContentFallback}><TermsPage /></Suspense>} />
          <Route path="/guide" element={<Suspense fallback={ContentFallback}><GuidePage /></Suspense>} />
          <Route path="/guide/tiers" element={<Suspense fallback={ContentFallback}><TierGuidePage /></Suspense>} />
          <Route path="/guide/types" element={<Suspense fallback={ContentFallback}><InvestorTypesPage /></Suspense>} />
          <Route path="/guide/tips" element={<Suspense fallback={ContentFallback}><TipsPage /></Suspense>} />
          <Route path="/guide/ranking" element={<Suspense fallback={ContentFallback}><RankingGuidePage /></Suspense>} />
          <Route path="/faq" element={<Suspense fallback={ContentFallback}><FaqPage /></Suspense>} />
          <Route path="/updates" element={<Suspense fallback={ContentFallback}><UpdatesPage /></Suspense>} />
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
