/**
 * 라운드 결과 리액션 메시지
 * 게임 재미를 높이기 위한 상황별 코멘트
 */

export interface ReactionMessage {
  condition: (params: ReactionParams) => boolean;
  messages: string[];
}

export interface ReactionParams {
  outcome: number;
  expectedValue: number;
  winStreak: number;
  loseStreak: number;
  roundNumber: number;
  totalRounds: number;
  currentBalance: number;
  initialBalance: number;
}

// 우선순위 순서로 정렬 (첫 번째로 매칭되는 것 사용)
const reactionMessages: ReactionMessage[] = [
  // 퍼펙트 게임 진행 중
  {
    condition: ({ winStreak, roundNumber }) => winStreak >= 5 && roundNumber < 10,
    messages: [
      '🔥 불타오르네! 연승 중!',
      '⚡ 미다스의 손이 따로 없네!',
      '🚀 우주로 가는 중...',
      '💎 다이아몬드 핸즈!',
    ],
  },

  // 연패 중
  {
    condition: ({ loseStreak }) => loseStreak >= 3,
    messages: [
      '😢 괜찮아요, 다음엔 될 거예요...',
      '🥲 운이 잠시 쉬어가는 중',
      '💪 포기하지 마세요!',
      '🙏 반전을 기다리는 중...',
    ],
  },

  // 대박 수익
  {
    condition: ({ outcome }) => outcome >= 1_000_000,
    messages: [
      '🎉 대박!! 오늘 치킨 각!',
      '💰 부자 됐잖아!?',
      '🤑 돈이 돈을 벌어온다!',
      '🎊 주식으로 이랬으면...',
    ],
  },

  // 큰 손실
  {
    condition: ({ outcome }) => outcome <= -500_000,
    messages: [
      '😱 어머... 괜찮으세요?',
      '💸 돈이 날아갔어요...',
      '🫠 마음이 아프네요...',
      '☕ 커피 한 잔 하고 오세요',
    ],
  },

  // 예상보다 훨씬 좋은 결과
  {
    condition: ({ outcome, expectedValue }) => outcome > expectedValue + 300_000,
    messages: [
      '🍀 Lucky! 운이 따르네요!',
      '✨ 오늘 운세 대박!',
      '🌟 별이 빛나는 밤이에요',
      '🎰 잭팟!!',
    ],
  },

  // 예상보다 훨씬 나쁜 결과
  {
    condition: ({ outcome, expectedValue }) => outcome < expectedValue - 300_000,
    messages: [
      '😢 Unlucky... 운이 없었네요',
      '🎲 주사위의 배신...',
      '🌧️ 구름 낀 날이에요',
      '💔 기대값아 어딜 가니',
    ],
  },

  // 마지막 라운드
  {
    condition: ({ roundNumber, totalRounds }) => roundNumber === totalRounds - 1,
    messages: [
      '🏁 마지막 선택!',
      '⏰ 운명의 순간...',
      '🎯 신중하게!',
      '🔮 결과가 곧 나와요!',
    ],
  },

  // 첫 라운드
  {
    condition: ({ roundNumber }) => roundNumber === 0,
    messages: [
      '🚀 좋은 시작이에요!',
      '👍 첫 선택 완료!',
      '🎬 시작이 반이에요!',
    ],
  },

  // 원금 회복
  {
    condition: ({ currentBalance, initialBalance, outcome }) =>
      currentBalance >= initialBalance && currentBalance - outcome < initialBalance,
    messages: [
      '📈 원금 회복!',
      '🙌 돌아왔어요!',
      '💪 이제부터 수익이에요!',
    ],
  },

  // 원금 하락
  {
    condition: ({ currentBalance, initialBalance, outcome }) =>
      currentBalance < initialBalance && currentBalance - outcome >= initialBalance,
    messages: [
      '📉 원금 밑으로...',
      '😬 조금 아찔하네요',
      '🤞 다음엔 괜찮을 거예요',
    ],
  },

  // 손익 분기점
  {
    condition: ({ outcome }) => outcome === 0,
    messages: [
      '➡️ 무난하게 넘겼어요',
      '😐 본전이에요~',
      '🤷 나쁘지 않아요!',
    ],
  },

  // 소소한 수익
  {
    condition: ({ outcome }) => outcome > 0,
    messages: [
      '💚 수익!',
      '📈 조금씩 늘고 있어요',
      '😊 좋아요!',
      '👏 잘했어요!',
    ],
  },

  // 소소한 손실
  {
    condition: ({ outcome }) => outcome < 0,
    messages: [
      '💔 손실...',
      '📉 조금 줄었어요',
      '🥺 아쉽네요',
      '😅 괜찮아요!',
    ],
  },
];

/**
 * 상황에 맞는 리액션 메시지 반환
 */
export function getReactionMessage(params: ReactionParams): string {
  for (const reaction of reactionMessages) {
    if (reaction.condition(params)) {
      const randomIndex = Math.floor(Math.random() * reaction.messages.length);
      return reaction.messages[randomIndex];
    }
  }
  return '👀';
}

/**
 * 수익/손실에 따른 이모지 반환
 */
export function getOutcomeEmoji(outcome: number): string {
  if (outcome >= 1_000_000) return '🚀';
  if (outcome >= 500_000) return '🎉';
  if (outcome >= 100_000) return '💰';
  if (outcome > 0) return '📈';
  if (outcome === 0) return '➡️';
  if (outcome >= -100_000) return '📉';
  if (outcome >= -500_000) return '😢';
  return '💸';
}

/**
 * 운 결과에 따른 텍스트 반환
 */
export function getLuckText(outcome: number, expectedValue: number): string {
  const diff = outcome - expectedValue;
  if (diff > 500_000) return '🍀🍀 대박 행운!';
  if (diff > 200_000) return '🍀 Lucky!';
  if (diff > 50_000) return '✨ 운 좋았어요';
  if (diff >= -50_000) return '📊 기대값 수준';
  if (diff >= -200_000) return '😢 운이 없었어요';
  if (diff >= -500_000) return '😭 Unlucky';
  return '💀 극심한 불운';
}
