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
  hasDailyShareToday,
  getBalance,
  EXCHANGE_RATE,
  COIN_REWARDS,
  exchangeCoinsForPoints,
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
  // Exchange disabled (준비 중) - keeping code for future use
  const [, setIsExchanging] = useState(false);
  const [, setExchangeMessage] = useState<string | null>(null);
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
    totalReward = totalReward + COIN_REWARDS.GAME_COMPLETE;

    // 고티어 보너스 (S, SS)
    const highTiers = ['S', 'S+', 'SS', 'SS+'];
    if (highTiers.includes(finalResult.tier.grade)) {
      rewardHighTier();
      totalReward = totalReward + COIN_REWARDS.HIGH_TIER;
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

  const canEarnShareReward = !hasShared && !hasDailyShareToday();

  const handleShareWithReward = useCallback(() => {
    handleShareText();
    if (canEarnShareReward) {
      rewardShareResult();
      setHasShared(true);
    }
  }, [handleShareText, canEarnShareReward]);

  // 
  
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

    const PROD_CODE = '01KMATK7D77QHW1PKD9B8DCZK2';
    const promotionCode = import.meta.env.DEV ? `TEST_${PROD_CODE}` : PROD_CODE;
    const result = await exchangeForTossPoints(
      promotionCode,
      pointsToExchange,
      userKey,
    );

    setIsExchanging(false);

    if (result.success) {
      // 교환 성공 시 코인 차감
      exchangeCoinsForPoints(pointsToExchange);
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
        {/* 1. 결과 히어로 + 투자자 타입 */}
        <ResultHero tier={tier} isNewRecord={isNewRecord} />
        <InvestorTypeCard profile={profile} />

        {/* 2. 자산 변화 (핵심 정보) */}
        <AssetSummaryCard
          finalBalance={finalBalance}
          initialBalance={initialBalance}
          totalReturn={totalReturn}
        />

        {/* 3. 코인 보상 (컴팩트) */}
        <div className="coin-reward-section">
          <CoinBalance showExchangeInfo />
          {coinRewardAmount !== null && (
            <CoinParticle
              amount={coinRewardAmount}
              onComplete={() => setCoinRewardAmount(null)}
            />
          )}
          {showAdBonus && (
            <CoinParticle amount={COIN_REWARDS.REWARDED_AD} isGold onComplete={() => setShowAdBonus(false)} />
          )}
        </div>

        {/* 4. 보상형 광고 — 명확한 CTA */}
        {isAdSupported && canShowRewardedAd() && (
          <button
            className="rewarded-ad-button"
            onClick={handleWatchAd}
            disabled={isAdLoading}
            type="button"
          >
            {isAdLoading ? '광고 로딩...' : `광고 보고 +${COIN_REWARDS.REWARDED_AD}코인 받기`}
          </button>
        )}

        {/* 5. 토스포인트 교환 (활성화) */}
        <div className="exchange-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>코인 교환소</span>
            <span style={{ fontSize: '12px', color: '#888' }}>{EXCHANGE_RATE}코인 = 1P</span>
          </div>
          <button
            className="exchange-button"
            disabled={getBalance() < EXCHANGE_RATE}
            type="button"
            onClick={handleExchange}
          >
            {getBalance() >= EXCHANGE_RATE
              ? `${Math.floor(getBalance() / EXCHANGE_RATE) * EXCHANGE_RATE}코인 → ${Math.floor(getBalance() / EXCHANGE_RATE)}P 교환하기`
              : `${EXCHANGE_RATE}코인 모으면 교환 가능`}
          </button>
          <p style={{ fontSize: '10px', color: '#999', marginTop: '6px', textAlign: 'center' }}>
            본 프로모션은 사전 고지 없이 중단될 수 있습니다
          </p>
        </div>

        {/* 6. 랭킹 (컴팩트) */}
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

        {/* 7. 액션 버튼 */}
        <div className="action-buttons">
          <button className="share-button" onClick={handleShareWithReward}>
            결과 공유하기 {canEarnShareReward && `(+${COIN_REWARDS.SHARE_RESULT}코인)`}
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
