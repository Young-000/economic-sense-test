/**
 * A/B 테스트 서비스 테스트
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getVariant,
  getVariants,
  getAllAssignments,
  forceVariant,
  clearAssignments,
  getUserId,
  getStoredAssignments,
  trackEvent,
  trackConversion,
  getExperiments,
  getActiveExperiments,
  getExperiment,
  EXPERIMENTS,
} from '../abTest';

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
vi.mock('../supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

describe('A/B Test Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('EXPERIMENTS', () => {
    it('should have at least one experiment defined', () => {
      expect(EXPERIMENTS.length).toBeGreaterThan(0);
    });

    it('should have unique IDs for all experiments', () => {
      const ids = EXPERIMENTS.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid variant weights that sum to ~100 for each experiment', () => {
      for (const experiment of EXPERIMENTS) {
        const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
        expect(totalWeight).toBeCloseTo(100, 0);
      }
    });

    it('should have all required properties for each experiment', () => {
      for (const experiment of EXPERIMENTS) {
        expect(experiment.id).toBeDefined();
        expect(experiment.name).toBeDefined();
        expect(experiment.description).toBeDefined();
        expect(experiment.variants).toBeDefined();
        expect(experiment.variants.length).toBeGreaterThan(0);
        expect(typeof experiment.isActive).toBe('boolean');
      }
    });
  });

  describe('getUserId', () => {
    it('should generate a new user ID if none exists', () => {
      const userId = getUserId();
      expect(userId).toBeDefined();
      expect(userId.startsWith('user_')).toBe(true);
    });

    it('should return the same user ID on subsequent calls', () => {
      const userId1 = getUserId();
      const userId2 = getUserId();
      expect(userId1).toBe(userId2);
    });

    it('should persist user ID to localStorage', () => {
      const userId = getUserId();
      const storedId = localStorage.getItem('economic-sense-user-id');
      expect(storedId).toBe(userId);
    });
  });

  describe('getVariant', () => {
    it('should return null for unknown experiment', () => {
      const variant = getVariant('unknown_experiment');
      expect(variant).toBeNull();
    });

    it('should return a valid variant for known experiment', () => {
      const experiment = EXPERIMENTS.find((e) => e.isActive);
      if (!experiment) return;

      const variant = getVariant(experiment.id);
      const validVariants = experiment.variants.map((v) => v.id);
      expect(validVariants).toContain(variant);
    });

    it('should return the same variant on subsequent calls', () => {
      const experiment = EXPERIMENTS.find((e) => e.isActive);
      if (!experiment) return;

      const variant1 = getVariant(experiment.id);
      const variant2 = getVariant(experiment.id);
      expect(variant1).toBe(variant2);
    });

    it('should save assignment to localStorage', () => {
      const experiment = EXPERIMENTS.find((e) => e.isActive);
      if (!experiment) return;

      getVariant(experiment.id);
      const assignments = getStoredAssignments();
      const assignment = assignments.find((a) => a.experimentId === experiment.id);

      expect(assignment).toBeDefined();
      expect(assignment?.variant).toBeDefined();
      expect(assignment?.assignedAt).toBeDefined();
    });

    it('should return first variant for inactive experiment', () => {
      const inactiveExperiment = EXPERIMENTS.find((e) => !e.isActive);
      if (!inactiveExperiment) return;

      const variant = getVariant(inactiveExperiment.id);
      expect(variant).toBe(inactiveExperiment.variants[0].id);
    });
  });

  describe('getVariants', () => {
    it('should return variants for multiple experiments', () => {
      const activeExperiments = EXPERIMENTS.filter((e) => e.isActive);
      if (activeExperiments.length < 2) return;

      const ids = activeExperiments.slice(0, 2).map((e) => e.id);
      const variants = getVariants(ids);

      expect(Object.keys(variants).length).toBe(2);
      for (const id of ids) {
        expect(variants[id]).toBeDefined();
      }
    });

    it('should handle mix of valid and invalid experiment IDs', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      const variants = getVariants([activeExperiment.id, 'invalid_id']);

      expect(variants[activeExperiment.id]).toBeDefined();
      expect(variants['invalid_id']).toBeNull();
    });
  });

  describe('getAllAssignments', () => {
    it('should return empty object when no assignments exist', () => {
      const assignments = getAllAssignments();
      expect(assignments).toEqual({});
    });

    it('should return all assigned variants', () => {
      const activeExperiments = EXPERIMENTS.filter((e) => e.isActive);
      if (activeExperiments.length < 2) return;

      // Assign variants
      for (const experiment of activeExperiments.slice(0, 2)) {
        getVariant(experiment.id);
      }

      const assignments = getAllAssignments();
      expect(Object.keys(assignments).length).toBe(2);
    });
  });

  describe('forceVariant', () => {
    it('should override variant for experiment', () => {
      const experiment = EXPERIMENTS.find(
        (e) => e.isActive && e.variants.length > 1
      );
      if (!experiment) return;

      const targetVariant = experiment.variants[1].id;
      forceVariant(experiment.id, targetVariant);

      const variant = getVariant(experiment.id);
      expect(variant).toBe(targetVariant);
    });

    it('should not set invalid variant', () => {
      const experiment = EXPERIMENTS.find((e) => e.isActive);
      if (!experiment) return;

      // First, get a valid variant
      const originalVariant = getVariant(experiment.id);

      // Try to force invalid variant
      forceVariant(experiment.id, 'invalid_variant');

      // Should still have original variant
      const variant = getVariant(experiment.id);
      expect(variant).toBe(originalVariant);
    });

    it('should not set variant for unknown experiment', () => {
      forceVariant('unknown_experiment', 'variant');
      const assignments = getAllAssignments();
      expect(assignments['unknown_experiment']).toBeUndefined();
    });
  });

  describe('clearAssignments', () => {
    it('should remove all assignments', () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      getVariant(activeExperiment.id);
      expect(getStoredAssignments().length).toBeGreaterThan(0);

      clearAssignments();
      expect(getStoredAssignments().length).toBe(0);
    });
  });

  describe('trackEvent', () => {
    it('should not throw when tracking event for assigned experiment', async () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      getVariant(activeExperiment.id);

      await expect(
        trackEvent(activeExperiment.id, 'test_event', { data: 'test' })
      ).resolves.not.toThrow();
    });

    it('should warn when tracking event for unassigned experiment', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await trackEvent('unassigned_experiment', 'test_event');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('trackConversion', () => {
    it('should not throw when tracking conversion', async () => {
      const activeExperiment = EXPERIMENTS.find((e) => e.isActive);
      if (!activeExperiment) return;

      getVariant(activeExperiment.id);

      await expect(
        trackConversion(activeExperiment.id, 'purchase', 100)
      ).resolves.not.toThrow();
    });
  });

  describe('getExperiments', () => {
    it('should return all experiments', () => {
      const experiments = getExperiments();
      expect(experiments).toBe(EXPERIMENTS);
    });
  });

  describe('getActiveExperiments', () => {
    it('should return only active experiments', () => {
      const activeExperiments = getActiveExperiments();
      for (const experiment of activeExperiments) {
        expect(experiment.isActive).toBe(true);
      }
    });

    it('should not include inactive experiments', () => {
      const activeExperiments = getActiveExperiments();
      const inactiveIds = EXPERIMENTS.filter((e) => !e.isActive).map((e) => e.id);

      for (const id of inactiveIds) {
        expect(activeExperiments.find((e) => e.id === id)).toBeUndefined();
      }
    });
  });

  describe('getExperiment', () => {
    it('should return experiment by ID', () => {
      const experiment = EXPERIMENTS[0];
      const result = getExperiment(experiment.id);
      expect(result).toBe(experiment);
    });

    it('should return undefined for unknown ID', () => {
      const result = getExperiment('unknown_id');
      expect(result).toBeUndefined();
    });
  });

  describe('Variant Distribution', () => {
    it('should distribute variants according to weights over many assignments', () => {
      // This test verifies that variant selection is working
      // We can't truly test randomness, but we can verify the mechanism
      const experiment = EXPERIMENTS.find(
        (e) => e.isActive && e.variants.length === 2
      );
      if (!experiment) return;

      const counts: Record<string, number> = {};
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        // Clear and reassign
        localStorageMock.clear();
        const variant = getVariant(experiment.id);
        if (variant) {
          counts[variant] = (counts[variant] || 0) + 1;
        }
      }

      // Verify all variants were selected at least once
      for (const v of experiment.variants) {
        expect(counts[v.id]).toBeGreaterThan(0);
      }
    });
  });
});
