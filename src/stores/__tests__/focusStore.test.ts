import { useFocusStore, selectProgress, selectFormattedTime, selectIsTimerRunning, selectIsPaused } from '../focusStore';
import { act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('focusStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useFocusStore.setState({
        phase: 'idle',
        timeRemaining: 1500, // 25 min
        totalTime: 1500,
        config: {
          focusDuration: 25,
          breakDuration: 5,
          autoStartBreak: false,
          soundEnabled: true,
          vibrationEnabled: true,
          zenMode: false,
        },
        currentSession: null,
        sessionHistory: [],
        completedPomodoros: 0,
        currentVerse: null,
        versesReviewed: 0,
        qualityScores: [],
        timerInterval: null,
      });
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useFocusStore.getState();
      
      expect(state.phase).toBe('idle');
      expect(state.timeRemaining).toBe(1500);
      expect(state.totalTime).toBe(1500);
      expect(state.config.focusDuration).toBe(25);
      expect(state.config.breakDuration).toBe(5);
      expect(state.completedPomodoros).toBe(0);
      expect(state.versesReviewed).toBe(0);
      expect(state.qualityScores).toEqual([]);
    });
  });

  describe('setConfig', () => {
    it('should update config', () => {
      act(() => {
        useFocusStore.getState().setConfig({ focusDuration: 30 });
      });
      
      const state = useFocusStore.getState();
      expect(state.config.focusDuration).toBe(30);
    });

    it('should update timer when idle and focusDuration changes', () => {
      act(() => {
        useFocusStore.getState().setConfig({ focusDuration: 45 });
      });
      
      const state = useFocusStore.getState();
      expect(state.timeRemaining).toBe(2700); // 45 * 60
      expect(state.totalTime).toBe(2700);
    });

    it('should not update timer when running', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      act(() => {
        useFocusStore.getState().setConfig({ focusDuration: 45 });
      });
      
      const state = useFocusStore.getState();
      expect(state.totalTime).toBe(1500); // Still 25 min
    });
  });

  describe('startFocus', () => {
    it('should start focus phase', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      const state = useFocusStore.getState();
      expect(state.phase).toBe('focus');
      expect(state.currentSession).not.toBeNull();
      expect(state.currentSession?.focusDuration).toBe(25);
    });

    it('should create a session with correct initial values', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      const session = useFocusStore.getState().currentSession;
      expect(session?.id).toMatch(/^focus_/);
      expect(session?.startedAt).toBeDefined();
      expect(session?.duration).toBe(0);
      expect(session?.versesReviewed).toBe(0);
    });
  });

  describe('pause/resume', () => {
    it('should pause focus timer', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      act(() => {
        useFocusStore.getState().pause();
      });
      
      expect(useFocusStore.getState().phase).toBe('paused');
    });

    it('should resume from paused', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      act(() => {
        useFocusStore.getState().pause();
      });
      
      act(() => {
        useFocusStore.getState().resume();
      });
      
      expect(useFocusStore.getState().phase).toBe('focus');
    });

    it('should not pause when idle', () => {
      act(() => {
        useFocusStore.getState().pause();
      });
      
      expect(useFocusStore.getState().phase).toBe('idle');
    });
  });

  describe('startBreak', () => {
    it('should start break phase', () => {
      act(() => {
        useFocusStore.getState().startBreak();
      });
      
      const state = useFocusStore.getState();
      expect(state.phase).toBe('break');
      expect(state.timeRemaining).toBe(300); // 5 * 60
    });

    it('should increment completed pomodoros', () => {
      act(() => {
        useFocusStore.getState().startBreak();
      });
      
      expect(useFocusStore.getState().completedPomodoros).toBe(1);
    });
  });

  describe('tick', () => {
    it('should decrement time remaining', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      const initialTime = useFocusStore.getState().timeRemaining;
      
      act(() => {
        useFocusStore.getState().tick();
      });
      
      expect(useFocusStore.getState().timeRemaining).toBe(initialTime - 1);
    });

    it('should transition to completed when focus timer reaches 0', () => {
      act(() => {
        useFocusStore.getState().startFocus();
        useFocusStore.setState({ timeRemaining: 1 });
      });
      
      act(() => {
        useFocusStore.getState().tick();
      });
      
      expect(useFocusStore.getState().phase).toBe('completed');
    });
  });

  describe('reset', () => {
    it('should reset to idle state', () => {
      act(() => {
        useFocusStore.getState().startFocus();
        useFocusStore.getState().recordQuality(3);
      });
      
      act(() => {
        useFocusStore.getState().reset();
      });
      
      const state = useFocusStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.timeRemaining).toBe(1500);
      expect(state.currentSession).toBeNull();
      expect(state.versesReviewed).toBe(0);
    });

    it('should save session to history if verses were reviewed', () => {
      act(() => {
        useFocusStore.getState().startFocus();
        useFocusStore.getState().recordQuality(3);
        useFocusStore.getState().recordQuality(5);
      });
      
      act(() => {
        useFocusStore.getState().reset();
      });
      
      const state = useFocusStore.getState();
      expect(state.sessionHistory.length).toBe(1);
      expect(state.sessionHistory[0].versesReviewed).toBe(2);
    });
  });

  describe('recordQuality', () => {
    it('should add quality score', () => {
      act(() => {
        useFocusStore.getState().recordQuality(3);
      });
      
      const state = useFocusStore.getState();
      expect(state.qualityScores).toContain(3);
      expect(state.versesReviewed).toBe(1);
    });

    it('should accumulate multiple scores', () => {
      act(() => {
        useFocusStore.getState().recordQuality(3);
        useFocusStore.getState().recordQuality(5);
        useFocusStore.getState().recordQuality(4);
      });
      
      const state = useFocusStore.getState();
      expect(state.qualityScores).toEqual([3, 5, 4]);
      expect(state.versesReviewed).toBe(3);
    });
  });

  describe('skip', () => {
    it('should skip from focus to break', () => {
      act(() => {
        useFocusStore.getState().startFocus();
      });
      
      act(() => {
        useFocusStore.getState().skip();
      });
      
      expect(useFocusStore.getState().phase).toBe('break');
    });

    it('should skip from break to idle', () => {
      act(() => {
        useFocusStore.getState().startBreak();
      });
      
      act(() => {
        useFocusStore.getState().skip();
      });
      
      expect(useFocusStore.getState().phase).toBe('idle');
    });
  });

  describe('endSession', () => {
    it('should end session and return it', () => {
      act(() => {
        useFocusStore.getState().startFocus();
        useFocusStore.getState().recordQuality(3);
        useFocusStore.getState().recordQuality(5);
      });
      
      let session: ReturnType<typeof useFocusStore.getState>['currentSession'] = null;
      act(() => {
        session = useFocusStore.getState().endSession();
      });
      
      expect(session).not.toBeNull();
      expect(session?.versesReviewed).toBe(2);
      expect(session?.avgQuality).toBe(4); // (3 + 5) / 2
      
      const state = useFocusStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.currentSession).toBeNull();
      expect(state.sessionHistory.length).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return zeros when no sessions', () => {
      const stats = useFocusStore.getState().getStats();
      
      expect(stats.totalFocusTime).toBe(0);
      expect(stats.totalVerses).toBe(0);
      expect(stats.avgQuality).toBe(0);
      expect(stats.totalPomodoros).toBe(0);
    });

    it('should calculate stats from session history', () => {
      // Create a session
      act(() => {
        useFocusStore.setState({
          sessionHistory: [
            {
              id: 'test1',
              startedAt: '2024-01-01T10:00:00Z',
              endedAt: '2024-01-01T10:25:00Z',
              duration: 1500,
              versesReviewed: 10,
              qualityScores: [3, 4, 5, 3, 4, 5, 4, 3, 5, 4],
              avgQuality: 4,
              focusDuration: 25,
              breakDuration: 5,
              completedPomodoros: 1,
            },
            {
              id: 'test2',
              startedAt: '2024-01-02T10:00:00Z',
              endedAt: '2024-01-02T10:25:00Z',
              duration: 1500,
              versesReviewed: 8,
              qualityScores: [4, 5, 4, 5, 4, 5, 4, 5],
              avgQuality: 4.5,
              focusDuration: 25,
              breakDuration: 5,
              completedPomodoros: 1,
            },
          ],
        });
      });
      
      const stats = useFocusStore.getState().getStats();
      
      expect(stats.totalFocusTime).toBe(3000);
      expect(stats.totalVerses).toBe(18);
      expect(stats.totalPomodoros).toBe(2);
    });
  });

  describe('selectors', () => {
    it('selectProgress should calculate correct percentage', () => {
      act(() => {
        useFocusStore.setState({ totalTime: 100, timeRemaining: 75 });
      });
      
      const progress = selectProgress(useFocusStore.getState());
      expect(progress).toBe(25);
    });

    it('selectFormattedTime should format time correctly', () => {
      act(() => {
        useFocusStore.setState({ timeRemaining: 125 }); // 2:05
      });
      
      const formatted = selectFormattedTime(useFocusStore.getState());
      expect(formatted).toBe('02:05');
    });

    it('selectIsTimerRunning should return true for focus/break phases', () => {
      act(() => {
        useFocusStore.setState({ phase: 'focus' });
      });
      expect(selectIsTimerRunning(useFocusStore.getState())).toBe(true);
      
      act(() => {
        useFocusStore.setState({ phase: 'break' });
      });
      expect(selectIsTimerRunning(useFocusStore.getState())).toBe(true);
      
      act(() => {
        useFocusStore.setState({ phase: 'idle' });
      });
      expect(selectIsTimerRunning(useFocusStore.getState())).toBe(false);
    });

    it('selectIsPaused should return true only for paused phase', () => {
      act(() => {
        useFocusStore.setState({ phase: 'paused' });
      });
      expect(selectIsPaused(useFocusStore.getState())).toBe(true);
      
      act(() => {
        useFocusStore.setState({ phase: 'focus' });
      });
      expect(selectIsPaused(useFocusStore.getState())).toBe(false);
    });
  });
});
