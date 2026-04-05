/**
 * MissionPanel - 미션 트랙 카드 가로 스크롤 패널
 */

import { useMemo } from 'react';
import { getMissionDisplayData, getCompletedMissionCount, type MissionDisplayData } from '@domain/services/missionService';

function MissionCard({ mission }: { mission: MissionDisplayData }): JSX.Element {
  const progressPercent = mission.target > 0
    ? Math.min(100, Math.round((mission.progress / mission.target) * 100))
    : 0;

  return (
    <div className={`mission-card ${mission.isCompleted ? 'completed' : ''}`}>
      <div className="mission-card-header">
        <span className="mission-emoji">{mission.trackEmoji}</span>
        <span className="mission-track-name">{mission.trackName}</span>
        {!mission.isCompleted && (
          <span className="mission-level">Lv.{mission.currentLevel}</span>
        )}
        {mission.isCompleted && (
          <span className="mission-complete-badge">CLEAR</span>
        )}
      </div>
      <p className="mission-description">{mission.description}</p>
      {!mission.isCompleted && (
        <>
          <div className="mission-progress-bar">
            <div
              className="mission-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mission-progress-info">
            <span className="mission-progress-text">
              {mission.progress}/{mission.target}
            </span>
            <span className="mission-reward">+{mission.reward} 코인</span>
          </div>
        </>
      )}
    </div>
  );
}

export function MissionPanel(): JSX.Element {
  const missions = useMemo(() => getMissionDisplayData(), []);
  const completedCount = useMemo(() => getCompletedMissionCount(), []);

  return (
    <div className="mission-panel">
      <div className="mission-panel-header">
        <h3 className="mission-panel-title">Missions</h3>
        {completedCount > 0 && (
          <span className="mission-completed-count">
            {completedCount}개 완료
          </span>
        )}
      </div>
      <div className="mission-cards-scroll">
        {missions.map(mission => (
          <MissionCard key={mission.trackId} mission={mission} />
        ))}
      </div>
    </div>
  );
}
