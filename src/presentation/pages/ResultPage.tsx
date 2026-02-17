import { useNavigate } from 'react-router-dom';
import { useState, useCallback, type Ref } from 'react';
import { Confetti, NewAchievementsPopup, ShareImageCard, AdBanner } from '@presentation/components';
import type { Achievement } from '@data/achievementService';
import { useResultData } from '@presentation/hooks/useResultData';
import { useShareImage } from '@presentation/hooks/useShareImage';
import {
  ResultHero,
  InvestorTypeCard,
  AssetSummaryCard,
  ChallengeBanner,
  ViralCTASection,
  RankingSection,
  InvestmentAnalysis,
  AchievementSection,
  ShareModal,
} from '@presentation/components/result';

export function ResultPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);

  const {
    finalResult, gameResults, bestPerformance,
    initialBalance, gameMode, isNewRecord,
  } = useResultData();

  const {
    shareCardRef, isGeneratingImage, showShareModal,
    shareImageUrl, shareImageBlob,
    handleGenerateShareImage, handleShareText, handleCloseShareModal,
  } = useShareImage(finalResult);

  const handleAchievementsUnlocked = useCallback((achievements: Achievement[]) => {
    setNewAchievements(achievements);
    setShowAchievementPopup(true);
  }, []);

  if (!finalResult) {
    return (
      <div className="result-page">
        <div className="result-error">
          <p>결과를 찾을 수 없습니다.</p>
          <button className="retry-button" onClick={() => navigate('/')}>
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  const { profile, tier, finalBalance, totalReturn, riskScore, rationalityScore, luckScore, investorType } = finalResult;

  return (
    <div className="result-page">
      <Confetti active={isNewRecord || newAchievements.length > 0} count={60} duration={3500} />

      {showAchievementPopup && (
        <NewAchievementsPopup
          achievements={newAchievements}
          onClose={() => setShowAchievementPopup(false)}
        />
      )}

      <div className="result-content">
        <ResultHero tier={tier} isNewRecord={isNewRecord} />
        <InvestorTypeCard profile={profile} />
        <AssetSummaryCard
          finalBalance={finalBalance}
          initialBalance={initialBalance}
          totalReturn={totalReturn}
        />

        <ChallengeBanner totalReturn={totalReturn} myProfile={profile} />
        <ViralCTASection
          finalResult={finalResult}
          nickname={nickname}
          onShareImage={handleGenerateShareImage}
          isGeneratingImage={isGeneratingImage}
        />
        <RankingSection
          finalBalance={finalBalance}
          totalReturn={totalReturn}
          investorType={investorType}
          riskScore={riskScore}
          rationalityScore={rationalityScore}
          luckScore={luckScore}
          gameResults={gameResults}
          initialBalance={initialBalance}
          nickname={nickname}
          onNicknameChange={setNickname}
        />
        <InvestmentAnalysis
          gameResults={gameResults}
          finalBalance={finalBalance}
          bestPerformance={bestPerformance?.history}
          initialBalance={initialBalance}
          investorType={investorType}
          profile={profile}
          riskScore={riskScore}
          rationalityScore={rationalityScore}
          luckScore={luckScore}
        />
        <AchievementSection
          finalResult={finalResult}
          gameResults={gameResults}
          initialBalance={initialBalance}
          gameMode={gameMode}
          onAchievementsUnlocked={handleAchievementsUnlocked}
        />
        <div className="action-buttons">
          <div className="share-buttons">
            <button className="share-image-button" onClick={handleGenerateShareImage} disabled={isGeneratingImage}>
              {isGeneratingImage ? '생성 중...' : (<><span className="button-icon">📸</span>이미지로 공유</>)}
            </button>
          </div>
          <button className="share-button" onClick={handleShareText}>텍스트로 공유하기</button>
          <button className="retry-button" onClick={() => navigate('/')}>다시 도전하기</button>
        </div>
        <AdBanner className="result-ad" />
      </div>
      <div className="share-image-wrapper">
        <ShareImageCard
          ref={shareCardRef as Ref<HTMLDivElement>}
          profile={profile}
          tier={tier}
          finalBalance={finalBalance}
          initialBalance={initialBalance}
          totalReturn={totalReturn}
          riskScore={riskScore}
          rationalityScore={rationalityScore}
          luckScore={luckScore}
        />
      </div>
      <ShareModal
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        profile={profile}
        finalResult={finalResult}
        shareImageUrl={shareImageUrl}
        shareImageBlob={shareImageBlob}
      />
    </div>
  );
}
