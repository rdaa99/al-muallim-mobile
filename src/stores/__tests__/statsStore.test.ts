import { useStatsStore } from '../statsStore';

// Mock the database module
jest.mock('@/services/database', () => ({
  getProgressStats: jest.fn().mockResolvedValue({
    total_verses: 995,
    total_learned: 100,
    total_mastered: 50,
    total_consolidating: 30,
    total_learning: 20,
    mastered: 50,
    consolidating: 30,
    learning: 20,
    streak_days: 5,
    longest_streak: 10,
    retention_rate: 0.85,
    verses_by_juz: [
      { juz_number: 29, total: 568, mastered: 30, consolidating: 20, learning: 10 },
      { juz_number: 30, total: 427, mastered: 20, consolidating: 10, learning: 10 },
    ],
    verses_by_surah: [
      { surah_number: 67, surah_name: 'Al-Mulk', total: 30, mastered: 15, consolidating: 10, learning: 5 },
    ],
    surahs: [],
    calendar: [],
    this_month: 50,
  }),
  getWeeklyReviewCounts: jest.fn().mockResolvedValue([5, 10, 8, 12, 7, 0, 0]),
  db: {
    execute: jest.fn().mockResolvedValue({
      rows: { _array: [] },
    }),
  },
}));

describe('useStatsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useStatsStore.setState({
      stats: null,
      weeklyData: [0, 0, 0, 0, 0, 0, 0],
      loading: false,
      error: null,
      lastRefresh: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useStatsStore.getState();

      expect(state.stats).toBeNull();
      expect(state.weeklyData).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastRefresh).toBeNull();
    });
  });

  describe('loadStats', () => {
    it('should set loading to true while loading', async () => {
      const { loadStats } = useStatsStore.getState();

      const promise = loadStats();
      expect(useStatsStore.getState().loading).toBe(true);

      await promise;
    });

    it('should load stats successfully', async () => {
      const { loadStats } = useStatsStore.getState();

      await loadStats();

      const state = useStatsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.stats).not.toBeNull();
      expect(state.stats?.total_verses).toBe(995);
      expect(state.stats?.total_learned).toBe(100);
      expect(state.stats?.streak_days).toBe(5);
      expect(state.lastRefresh).not.toBeNull();
    });

    it('should clear error on successful load', async () => {
      useStatsStore.setState({ error: 'Previous error' });
      const { loadStats } = useStatsStore.getState();

      await loadStats();

      expect(useStatsStore.getState().error).toBeNull();
    });
  });

  describe('loadWeeklyData', () => {
    it('should load weekly data successfully', async () => {
      const { loadWeeklyData } = useStatsStore.getState();

      await loadWeeklyData();

      const state = useStatsStore.getState();
      expect(state.weeklyData).toEqual([5, 10, 8, 12, 7, 0, 0]);
    });
  });

  describe('refreshAll', () => {
    it('should refresh all data', async () => {
      const { refreshAll } = useStatsStore.getState();

      await refreshAll();

      const state = useStatsStore.getState();
      expect(state.stats).not.toBeNull();
      expect(state.weeklyData).toEqual([5, 10, 8, 12, 7, 0, 0]);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useStatsStore.setState({ error: 'Test error' });
      const { clearError } = useStatsStore.getState();

      clearError();

      expect(useStatsStore.getState().error).toBeNull();
    });
  });
});
