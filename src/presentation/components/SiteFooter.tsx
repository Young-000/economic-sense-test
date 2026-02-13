import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <nav className="footer-nav" aria-label="사이트 링크">
        <div className="footer-section" role="group" aria-labelledby="footer-service-title">
          <span id="footer-service-title" className="footer-section-title">서비스</span>
          <Link to="/about">소개</Link>
          <Link to="/terms">이용약관</Link>
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <div className="footer-section" role="group" aria-labelledby="footer-guide-title">
          <span id="footer-guide-title" className="footer-section-title">가이드</span>
          <Link to="/guide">게임 가이드</Link>
          <Link to="/guide/tiers">티어 등급</Link>
          <Link to="/guide/types">투자자 유형</Link>
          <Link to="/guide/tips">고득점 꿀팁</Link>
        </div>
        <div className="footer-section" role="group" aria-labelledby="footer-more-title">
          <span id="footer-more-title" className="footer-section-title">더보기</span>
          <Link to="/guide/ranking">랭킹 & 업적</Link>
          <Link to="/updates">업데이트</Link>
        </div>
      </nav>
      <p className="footer-copy">&copy; {new Date().getFullYear()} 돈 감각 테스트. All rights reserved.</p>
    </footer>
  );
}
