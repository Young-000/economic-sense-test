/**
 * 배열 유틸리티 함수
 */

/**
 * Fisher-Yates 셔플 알고리즘으로 배열을 무작위로 섞음
 * @param array 원본 배열
 * @returns 새로운 셔플된 배열 (원본 불변)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
