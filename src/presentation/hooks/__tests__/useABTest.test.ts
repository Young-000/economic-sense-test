/**
 * useABTest 훅 테스트
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useABTest, useABTests } from '../useABTest';
import { forceVariant, EXPERIMENTS } from '@lib/abTest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock supabase
vi.mock('@lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

describe('useABTest', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return variant for active experiment', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      expect(result.current.variant).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return the same variant on re-render', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result, rerender } = renderHook(() => useABTest(activeExperiment.id));

      const variant1 = result.current.variant;
      rerender();
      const variant2 = result.current.variant;

      expect(variant1).toBe(variant2);
    });

    it('should return experiment info', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      expect(result.current.experiment).toBeDefined();
      expect(result.current.experiment?.id).toBe(activeExperiment.id);
    });

    it('should return null variant for unknown experiment', () => {
      const { result } = renderHook(() => useABTest('unknown_experiment'));

      expect(result.current.variant).toBeNull();
      expect(result.current.experiment).toBeUndefined();
    });
  });

  describe('isVariant helper', () => {
    it('should return true for matching variant', () => {
      const activeExperiment = EXPERIMENTS.find(
        (e) => e.isActive && e.variants.length > 1
      );
      if (!activeExperiment) return;

      // Force a specific variant
      forceVariant(activeExperiment.id, activeExperiment.variants[0].id);

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      expect(result.current.isVariant(activeExperiment.variants[0].id)).toBe(true);
      expect(result.current.isVariant(activeExperiment.variants[1].id)).toBe(false);
    });
  });

  describe('tracking functions', () => {
    it('should provide track function', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      expect(typeof result.current.track).toBe('function');
    });

    it('should call track without error', async () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      await act(async () => {
        await expect(
          result.current.track('test_event', { data: 'test' })
        ).resolves.not.toThrow();
      });
    });

    it('should provide trackConversion function', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      expect(typeof result.current.trackConversion).toBe('function');
    });

    it('should call trackConversion without error', async () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() => useABTest(activeExperiment.id));

      await act(async () => {
        await expect(
          result.current.trackConversion('purchase', 100)
        ).resolves.not.toThrow();
      });
    });
  });

  describe('options', () => {
    it('should track impression by default', async () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      // Note: We can't directly verify impression tracking without mocking supabase
      // But we can verify the hook doesn't throw
      const { result } = renderHook(() => useABTest(activeExperiment.id));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should respect trackImpression option', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() =>
        useABTest(activeExperiment.id, { trackImpression: false })
      );

      expect(result.current.variant).toBeDefined();
    });
  });
});

describe('useABTests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('multiple experiments', () => {
    it('should return variants for multiple experiments', () => {
      const activeExperiments = EXPERIMENTS.filter((e) => e.isActive);
      if (activeExperiments.length < 2) return;

      const ids = activeExperiments.slice(0, 2).map((e) => e.id);
      const { result } = renderHook(() => useABTests(ids));

      expect(result.current.isLoading).toBe(false);
      expect(Object.keys(result.current.variants).length).toBe(2);

      for (const id of ids) {
        expect(result.current.variants[id]).toBeDefined();
      }
    });

    it('should provide getVariant helper', () => {
      const activeExperiments = EXPERIMENTS.filter((e) => e.isActive);
      if (activeExperiments.length < 1) return;

      const ids = [activeExperiments[0].id];
      const { result } = renderHook(() => useABTests(ids));

      const variant = result.current.getVariant(ids[0]);
      expect(variant).toBe(result.current.variants[ids[0]]);
    });

    it('should provide isVariant helper', () => {
      const activeExperiment = EXPERIMENTS.find(
        (e) => e.isActive && e.variants.length > 1
      );
      if (!activeExperiment) return;

      // Force a specific variant
      forceVariant(activeExperiment.id, activeExperiment.variants[0].id);

      const { result } = renderHook(() => useABTests([activeExperiment.id]));

      expect(
        result.current.isVariant(activeExperiment.id, activeExperiment.variants[0].id)
      ).toBe(true);
      expect(
        result.current.isVariant(activeExperiment.id, activeExperiment.variants[1].id)
      ).toBe(false);
    });

    it('should provide track function', () => {
      const activeExperiments = EXPERIMENTS.filter((e) => e.isActive);
      if (activeExperiments.length < 1) return;

      const ids = [activeExperiments[0].id];
      const { result } = renderHook(() => useABTests(ids));

      expect(typeof result.current.track).toBe('function');
    });

    it('should call track without error', async () => {
      const activeExperiments = EXPERIMENTS.filter((e) => e.isActive);
      if (activeExperiments.length < 1) return;

      const ids = [activeExperiments[0].id];
      const { result } = renderHook(() => useABTests(ids));

      await act(async () => {
        await expect(
          result.current.track(ids[0], 'test_event', { data: 'test' })
        ).resolves.not.toThrow();
      });
    });
  });

  describe('handling invalid experiments', () => {
    it('should return null for unknown experiment ID', () => {
      const { result } = renderHook(() => useABTests(['unknown_experiment']));

      expect(result.current.variants['unknown_experiment']).toBeNull();
      expect(result.current.getVariant('unknown_experiment')).toBeNull();
    });

    it('should handle mix of valid and invalid IDs', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const { result } = renderHook(() =>
        useABTests([activeExperiment.id, 'invalid_id'])
      );

      expect(result.current.variants[activeExperiment.id]).toBeDefined();
      expect(result.current.variants['invalid_id']).toBeNull();
    });
  });
});
