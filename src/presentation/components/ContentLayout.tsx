import type { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdBanner } from './AdBanner';
import { SiteFooter } from './SiteFooter';

interface ContentLayoutProps {
  title: string;
  children: ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  const navigate = useNavigate();

  return (
    <main className="content-page">
      <header className="content-header">
        <button
          className="content-back-btn"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          ← 뒤로
        </button>
        <h1 className="content-title">{title}</h1>
      </header>

      <div className="content-body">
        {children}
      </div>

      <div className="content-cta">
        <Link to="/" className="cta-button">
          💸 테스트 하러가기
        </Link>
      </div>

      <AdBanner className="content-ad" />
      <SiteFooter />
    </main>
  );
}
