import type { CSSProperties } from 'react';
import { TIER_THRESHOLDS } from '@domain/entities';
import { ContentLayout } from '@presentation/components';

export function TierGuidePage() {
  return (
    <ContentLayout title="티어 등급 가이드">
      <section>
        <h2>🏆 티어 시스템이란?</h2>
        <p>
          돈 감각 테스트는 최종 수익률에 따라 SS부터 F까지 7단계 등급을
          부여합니다. 높은 등급일수록 달성하기 어렵고, 희소한 등급입니다.
        </p>
      </section>

      <section>
        <h2>📊 티어 등급 상세</h2>
        <div className="tier-guide-list">
          {TIER_THRESHOLDS.map((tier) => (
            <div
              key={tier.grade}
              className="tier-guide-card"
              style={{ '--tier-card-color': tier.color, '--tier-card-bg': tier.bgColor } as CSSProperties}
            >
              <div className="tier-guide-grade">
                <span className="tier-guide-letter" style={{ color: tier.color }}>
                  {tier.grade}
                </span>
              </div>
              <div className="tier-guide-info">
                <h3 style={{ color: tier.color }}>{tier.name}</h3>
                <p className="tier-guide-desc">{tier.description}</p>
                <div className="tier-guide-meta">
                  <span className="tier-guide-condition">
                    {tier.minReturn === -Infinity
                      ? '수익률 -60% 미만'
                      : `수익률 ${tier.minReturn >= 0 ? '+' : ''}${tier.minReturn}% 이상`}
                  </span>
                  <span className="tier-guide-rarity">
                    상위 약 {tier.rarity}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>💡 등급 올리는 팁</h2>
        <ul>
          <li>
            <strong>기대값을 활용하세요</strong>: 기대값이 양수인 선택지를
            꾸준히 고르면 평균적으로 좋은 결과를 얻을 수 있습니다.
          </li>
          <li>
            <strong>리스크 관리</strong>: 높은 수익도 중요하지만, 큰 손실을
            피하는 것도 중요합니다. 자산이 크게 줄면 회복이 어렵습니다.
          </li>
          <li>
            <strong>운도 실력</strong>: 같은 전략이라도 결과가 다를 수 있습니다.
            여러 번 플레이하면 실력에 맞는 등급에 수렴합니다.
          </li>
          <li>
            <strong>극한 모드 도전</strong>: 더 높은 시작 자금으로 더 큰 변동성을
            경험할 수 있습니다. SS 등급을 노린다면 극한 모드도 시도해보세요!
          </li>
        </ul>
      </section>

      <section>
        <h2>🎯 SS 등급 달성하려면?</h2>
        <p>
          SS 등급(금손 중의 금손)은 전체 플레이어의 약 {TIER_THRESHOLDS[0].rarity}%만
          달성하는 전설적인 등급입니다. 수익률 +{TIER_THRESHOLDS[0].minReturn}% 이상이
          필요하며, 높은 합리성과 운이 모두 필요합니다.
        </p>
        <p>
          꾸준히 기대값 높은 선택을 하면서 운이 따라주면 달성할 수 있습니다.
          포기하지 말고 도전해보세요!
        </p>
      </section>
    </ContentLayout>
  );
}
