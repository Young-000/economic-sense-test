import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect, type Ref } from 'react';
import { Confetti, NewAchievementsPopup, ShareImageCard, CoinBalance, CoinParticle, MissionToast } from '@presentation/components';
import type { Achievement } from '@data/achievementService';
import { useResultData } from '@presentation/hooks/useResultData';
import { useShareImage } from '@presentation/hooks/useShareImage';
import { useFullScreenAd } from '@presentation/hooks/useFullScreenAd';
import { canShowRewardedAd, recordRewardedAdShown } from '@domain/services/adFrequencyService';
import {
  rewardGameComplete,
  rewardHighTier,
  rewardRewardedAd,
  rewardShareResult,
  getBalance,
  EXCHANGE_RATE,
} from '@domain/services/coinService';
import {
  incrementGameCount,
  updateBestTier,
  checkMissions,
  type MissionCompletionResult,
} from '@domain/services/missionService';
import { exchangeForTossPoints } from '@domain/services/exchangeService';
import { getCachedUserId } from '@infrastructure/userIdentity';
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
  const [coinRewardAmount, setCoinRewardAmount] = useState<number | null>(null);
  const [showAdBonus, setShowAdBonus] = useState(false);
  const [missionCompletions, setMissionCompletions] = useState<MissionCompletionResult[]>([]);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeMessage, setExchangeMessage] = useState<string | null>(null);
  const [hasShared, setHasShared] = useState(false);

  const {
    finalResult, gameResults, bestPerformance,
    initialBalance, gameMode, isNewRecord,
  } = useResultData();

  const {
    shareCardRef, isGeneratingImage, showShareModal,
    shareImageUrl, shareImageBlob,
    handleGenerateShareImage, handleShareText, handleCloseShareModal,
  } = useShareImage(finalResult);

  const { isAdSupported, isAdLoading, loadAndShowAd } = useFullScreenAd();

  // 게임 완료 시 코인 보상 + 미션 업데이트
  useEffect(() => {
    if (!finalResult) return;

    // 게임 카운트 증가
    incrementGameCount();

    // 티어 업데이트
    updateBestTier(finalResult.tier.grade);

    // 코인 보상
    let totalReward = 0;
    rewardGameComplete();
    totalReward = totalReward + 5;

    // 고티어 보너스 (S, SS)
    const highTiers = ['S', 'S+', 'SS', 'SS+'];
    if (highTiers.includes(finalResult.tier.grade)) {
      rewardHighTier();
      totalReward = totalReward + 10;
    }

    setCoinRewardAmount(totalReward);

    // 미션 체크
    const results = checkMissions();
    if (results.length > 0) {
      setTimeout(() => {
        setMissionCompletions(results);
      }, 1500);
    }
  }, [finalResult]);

  const handleAchievementsUnlocked = useCallback((achievements: Achievement[]) => {
    setNewAchievements(achievements);
    setShowAchievementPopup(true);
  }, []);

  const handleWatchAd = useCallback(() => {
    if (!canShowRewardedAd()) return;

    loadAndShowAd({
      onRewarded: () => {
        recordRewardedAdShown();
        rewardRewardedAd();
        setShowAdBonus(true);
        setTimeout(() => setShowAdBonus(false), 1500);
      },
      onError: (err) => {
        console.warn('[ResultPage] Rewarded ad error:', err.message);
      },
    });
  }, [loadAndShowAd]);

  const handleShareWithReward = useCallback(() => {
    handleShareText();
    if (!hasShared) {
      rewardShareResult();
      setHasShared(true);
    }
  }, [handleShareText, hasShared]);

  const handleExchange = useCallback(async () => {
    const balance = getBalance();
    const pointsToExchange = Math.floor(balance / EXCHANGE_RATE);
    if (pointsToExchange <= 0) {
      setExchangeMessage('교환할 코인이 부족합니다');
      return;
    }

    const userKey = getCachedUserId();
    if (!userKey) {
      setExchangeMessage('로그인이 필요합니다');
      return;
    }

    setIsExchanging(true);
    setExchangeMessage(null);

    // TODO: 실제 프로모션 코드로 교체
    const result = await exchangeForTossPoints(
      'ECONOMIC_SENSE_EXCHANGE',
      pointsToExchange,
      userKey,
    );

    setIsExchanging(false);

    if (result.success) {
      setExchangeMessage(result.message);
    } else {
      setExchangeMessage(result.error);
    }
  }, []);

  const handleDismissMissionToast = useCallback(() => {
    setMissionCompletions([]);
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

      {missionCompletions.length > 0 && (
        <MissionToast completions={missionCompletions} onDismiss={handleDismissMissionToast} />
      )}

      {showAchievementPopup && (
        <NewAchievementsPopup
          achievements={newAchievements}
          onClose={() => setShowAchievementPopup(false)}
        />
      )}

      <div className="result-content">
        <ResultHero tier={tier} isNewRecord={isNewRecord} />
        <InvestorTypeCard profile={profile} />

        {/* 코인 보상 섹션 */}
        <div className="coin-reward-section">
          <CoinBalance showExchangeInfo />
          {coinRewardAmount !== null && (
            <CoinParticle
              amount={coinRewardAmount}
              onComplete={() => setCoinRewardAmount(null)}
            />
          )}
          {showAdBonus && (
            <CoinParticle amount={20} isGold onComplete={() => setShowAdBonus(false)} />
          )}
        </div>

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

        {/* 보상형 광고 */}
        {isAdSupported && canShowRewardedAd() && (
          <div className="rewarded-ad-section">
            <button
              className="rewarded-ad-button"
              onClick={handleWatchAd}
              disabled={isAdLoading}
              type="button"
            >
              {isAdLoading ? '광고 로딩...' : '광고 보고 +20 coin 받기'}
            </button>
          </div>
        )}

        {/* 교환 섹션 */}
        <div className="exchange-section">
          <h3 className="exchange-title">포인트 교환소</h3>
          <p className="exchange-rate-info">{EXCHANGE_RATE}coin = 1P</p>
          <button
            className="exchange-button"
            onClick={handleExchange}
            disabled={isExchanging || getBalance() < EXCHANGE_RATE}
            type="button"
          >
            {isExchanging ? '교환 중...' : '토스포인트로 교환'}
          </button>
          {exchangeMessage && (
            <p className="exchange-message">{exchangeMessage}</p>
          )}
        </div>

        <div className="action-buttons">
          <div className="share-buttons">
            <button className="share-image-button" onClick={handleGenerateShareImage} disabled={isGeneratingImage}>
              {isGeneratingImage ? '생성 중...' : (<>이미지로 공유</>)}
            </button>
          </div>
          <button className="share-button" onClick={handleShareWithReward}>
            텍스트로 공유하기 {!hasShared && '(+5 coin)'}
          </button>
          <button className="retry-button" onClick={() => navigate('/')}>다시 도전하기</button>
        </div>
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
