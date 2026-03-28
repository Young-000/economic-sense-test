import type { TierGrade } from '@domain/entities';

const STORAGE_KEY = 'economic-sense-best-record';

export type BestRecord = {
  grade: TierGrade;
  tierName: string;
  tierColor: string;
  totalReturn: number;
  finalBalance: number;
};

export function getBestRecord(): BestRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BestRecord) : null;
  } catch {
    return null;
  }
}

export function saveBestRecord(record: BestRecord): void {
  const existing = getBestRecord();
  if (existing !== null && existing.totalReturn >= record.totalReturn) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage unavailable — silently ignore
  }
}
