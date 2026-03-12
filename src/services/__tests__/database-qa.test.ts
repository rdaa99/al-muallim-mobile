/**
 * Database service QA tests
 *
 * Tests: initDatabase, seedDatabase, getTodayReview, getProgressStats,
 * getWeeklyReviewCounts, getVerseBySurahAyah, getSettings, updateSettings,
 * submitReview
 */

// Use the global jest.setup.js mock for react-native-quick-sqlite.
// database.ts calls SQLite.open() at module load time.
// We access that exact mock instance via mock.results[0].value.
import SQLite from 'react-native-quick-sqlite';
import {
  initDatabase,
  seedDatabase,
  getTodayReview,
  getProgressStats,
  getWeeklyReviewCounts,
  getVerseBySurahAyah,
  getSettings,
  updateSettings,
  submitReview,
} from '../database';

// Get the db mock that database.ts actually uses (first open() call)
const mockDb = (SQLite.open as jest.Mock).mock.results[0].value;
const mockExecute: jest.Mock = mockDb.execute;

beforeEach(() => {
  mockExecute.mockReset();
  mockExecute.mockReturnValue({ rows: [], insertId: 0 });
});

// ---------------------------------------------------------------------------
// SC-1.1 - initDatabase creates tables and indexes
// ---------------------------------------------------------------------------
describe('SC-1.1 - initDatabase', () => {
  it('creates verses, settings, and review_history tables', async () => {
    await initDatabase();

    const sqls = mockExecute.mock.calls.map((c: unknown[]) => (c[0] as string).trim());

    expect(sqls.some((s) => s.includes('CREATE TABLE IF NOT EXISTS verses'))).toBe(true);
    expect(sqls.some((s) => s.includes('CREATE TABLE IF NOT EXISTS settings'))).toBe(true);
    expect(sqls.some((s) => s.includes('CREATE TABLE IF NOT EXISTS review_history'))).toBe(true);
  });

  it('creates indexes on verses and review_history', async () => {
    await initDatabase();

    const sqls = mockExecute.mock.calls.map((c: unknown[]) => (c[0] as string).trim());

    expect(sqls.some((s) => s.includes('idx_verses_status'))).toBe(true);
    expect(sqls.some((s) => s.includes('idx_verses_next_review'))).toBe(true);
    expect(sqls.some((s) => s.includes('idx_verses_juz'))).toBe(true);
    expect(sqls.some((s) => s.includes('idx_verses_surah'))).toBe(true);
    expect(sqls.some((s) => s.includes('idx_review_history_date'))).toBe(true);
    expect(sqls.some((s) => s.includes('idx_review_history_verse'))).toBe(true);
  });

  it('wraps errors with descriptive message', async () => {
    mockExecute.mockImplementationOnce(() => {
      throw new Error('disk full');
    });

    await expect(initDatabase()).rejects.toThrow('Database init error: disk full');
  });
});

// ---------------------------------------------------------------------------
// SC-1.3 - seedDatabase batch insert
// ---------------------------------------------------------------------------
describe('SC-1.3 - seedDatabase', () => {
  it('inserts verses in batches when table is empty', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)')) {
        return { rows: { _array: [{ count: 0 }] } };
      }
      return { rows: [], insertId: 1 };
    });

    await seedDatabase();

    const sqls = mockExecute.mock.calls.map((c: unknown[]) => (c[0] as string).trim());

    expect(sqls.some((s) => s.includes('BEGIN TRANSACTION'))).toBe(true);
    expect(sqls.some((s) => s.includes('COMMIT'))).toBe(true);

    const insertCalls = sqls.filter((s) => s.includes('INSERT INTO verses'));
    expect(insertCalls.length).toBe(Math.ceil(995 / 50));
  });

  it('skips seeding when verses already exist (idempotent)', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)')) {
        return { rows: { _array: [{ count: 995 }] } };
      }
      return { rows: [], insertId: 1 };
    });

    await seedDatabase();

    const sqls = mockExecute.mock.calls.map((c: unknown[]) => (c[0] as string).trim());

    expect(sqls.filter((s) => s.includes('INSERT INTO verses')).length).toBe(0);
    expect(sqls.some((s) => s.includes('BEGIN TRANSACTION'))).toBe(false);
  });

  it('rolls back on insert error', async () => {
    let insertCount = 0;
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)')) {
        return { rows: { _array: [{ count: 0 }] } };
      }
      if (sql.includes('INSERT INTO verses')) {
        insertCount++;
        if (insertCount === 3) {
          throw new Error('insert failed');
        }
      }
      return { rows: [], insertId: 1 };
    });

    await expect(seedDatabase()).rejects.toThrow('Database seed error: insert failed');

    const sqls = mockExecute.mock.calls.map((c: unknown[]) => (c[0] as string).trim());
    expect(sqls.some((s) => s.includes('ROLLBACK'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SC-4.1 - getTodayReview
// ---------------------------------------------------------------------------
describe('SC-4.1 - getTodayReview', () => {
  const fakeVerse = {
    id: 1,
    surah_number: 67,
    ayah_number: 1,
    text_arabic: 'test',
    juz_number: 29,
    status: 'learning',
    ease_factor: 2.5,
    interval: 1,
    repetitions: 1,
    next_review_date: new Date().toISOString().split('T')[0],
  };

  it('returns due verses and completed count', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM verses')) {
        return { rows: { _array: [fakeVerse] } };
      }
      if (sql.includes('COUNT(DISTINCT verse_id)')) {
        return { rows: { _array: [{ count: 5 }] } };
      }
      return { rows: [] };
    });

    const review = await getTodayReview();

    expect(review.date).toBe(new Date().toISOString().split('T')[0]);
    expect(review.due_count).toBe(1);
    expect(review.completed_count).toBe(5);
    expect(review.verses).toHaveLength(1);
    expect(review.verses[0]).toEqual(fakeVerse);
  });

  it('returns due_count=0 when no verses are due', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('COUNT(DISTINCT verse_id)')) {
        return { rows: { _array: [{ count: 0 }] } };
      }
      return { rows: [] };
    });

    const review = await getTodayReview();

    expect(review.due_count).toBe(0);
    expect(review.completed_count).toBe(0);
    expect(review.verses).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SC-4.4 - getProgressStats comprehensive
// ---------------------------------------------------------------------------
describe('SC-4.4 - getProgressStats', () => {
  function setupProgressMocks(overrides: Record<string, unknown> = {}) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

    const defaults: Record<string, unknown> = {
      statusRow: { total: 995, mastered: 100, consolidating: 200, learning: 300 },
      streakDates: [
        { review_date: today },
        { review_date: yesterday },
        { review_date: twoDaysAgo },
      ],
      longestStreak: null as { value: string } | null,
      retentionRow: { total: 50, passed: 40 },
      monthCount: { count: 25 },
      juzRows: [
        { juz_number: 29, total: 564, mastered: 50, consolidating: 100, learning: 150 },
        { juz_number: 30, total: 431, mastered: 50, consolidating: 100, learning: 150 },
      ],
      surahRows: [
        { surah_number: 67, total: 30, mastered: 5, consolidating: 10, learning: 15 },
      ],
      calendarDates: [{ review_date: today }],
      ...overrides,
    };

    mockExecute.mockImplementation((sql: string) => {
      // Status counts (aggregate from verses, not grouped)
      if (sql.includes("status = 'mastered'") && sql.includes('FROM verses') && !sql.includes('GROUP BY')) {
        return { rows: { _array: [defaults.statusRow] } };
      }
      // Streak dates
      if (sql.includes('DISTINCT date(reviewed_at) as review_date') && sql.includes('LIMIT 60')) {
        return { rows: { _array: defaults.streakDates } };
      }
      // Longest streak setting read
      if (sql.includes("key = 'longest_streak'")) {
        return {
          rows: { _array: defaults.longestStreak ? [defaults.longestStreak] : [] },
        };
      }
      // INSERT OR REPLACE longest_streak
      if (sql.includes('INSERT OR REPLACE') && sql.includes('longest_streak')) {
        return { rows: [] };
      }
      // Retention
      if (sql.includes('quality >= 3') && sql.includes('review_history')) {
        return { rows: { _array: [defaults.retentionRow] } };
      }
      // Month count
      if (sql.includes('start of month')) {
        return { rows: { _array: [defaults.monthCount] } };
      }
      // Juz grouping
      if (sql.includes('GROUP BY juz_number')) {
        return { rows: { _array: defaults.juzRows } };
      }
      // Surah grouping
      if (sql.includes('GROUP BY surah_number')) {
        return { rows: { _array: defaults.surahRows } };
      }
      // Calendar dates (30 days)
      if (sql.includes('-30 days') && sql.includes('DISTINCT date(reviewed_at)')) {
        return { rows: { _array: defaults.calendarDates } };
      }

      return { rows: [] };
    });

    return defaults;
  }

  it('returns correct status counts', async () => {
    setupProgressMocks();
    const stats = await getProgressStats();

    expect(stats.total_verses).toBe(995);
    expect(stats.mastered).toBe(100);
    expect(stats.consolidating).toBe(200);
    expect(stats.learning).toBe(300);
    expect(stats.total_learned).toBe(600);
    expect(stats.total_mastered).toBe(100);
    expect(stats.total_consolidating).toBe(200);
    expect(stats.total_learning).toBe(300);
  });

  it('calculates streak from consecutive dates', async () => {
    setupProgressMocks();
    const stats = await getProgressStats();

    expect(stats.streak_days).toBe(3);
  });

  it('returns streak_days=0 when no recent reviews', async () => {
    setupProgressMocks({ streakDates: [] });
    const stats = await getProgressStats();

    expect(stats.streak_days).toBe(0);
  });

  it('persists longest_streak and returns it', async () => {
    setupProgressMocks({ longestStreak: { value: '10' } });
    const stats = await getProgressStats();

    // Current streak is 3, longest stored is 10 => keeps 10
    expect(stats.longest_streak).toBe(10);
  });

  it('updates longest_streak when current exceeds stored', async () => {
    setupProgressMocks({ longestStreak: { value: '1' } });
    await getProgressStats();

    const insertCalls = mockExecute.mock.calls.filter(
      (c: unknown[]) =>
        (c[0] as string).includes('INSERT OR REPLACE') &&
        (c[0] as string).includes('longest_streak'),
    );
    expect(insertCalls.length).toBe(1);
    expect(insertCalls[0][1]).toEqual([String(3)]);
  });

  it('calculates retention_rate from review history', async () => {
    setupProgressMocks({ retentionRow: { total: 100, passed: 80 } });
    const stats = await getProgressStats();

    expect(stats.retention_rate).toBe(0.8);
  });

  it('returns retention_rate=0 when no reviews in last 30 days', async () => {
    setupProgressMocks({ retentionRow: { total: 0, passed: 0 } });
    const stats = await getProgressStats();

    expect(stats.retention_rate).toBe(0);
  });

  it('returns verses_by_juz with correct structure', async () => {
    setupProgressMocks();
    const stats = await getProgressStats();

    expect(stats.verses_by_juz).toHaveLength(2);
    expect(stats.verses_by_juz[0]).toEqual({
      juz_number: 29,
      total: 564,
      mastered: 50,
      consolidating: 100,
      learning: 150,
    });
  });

  it('returns verses_by_surah with surah_name', async () => {
    setupProgressMocks();
    const stats = await getProgressStats();

    expect(stats.verses_by_surah).toHaveLength(1);
    expect(stats.verses_by_surah[0].surah_name).toBe('Al-Mulk');
    expect(stats.verses_by_surah[0].surah_number).toBe(67);
  });

  it('returns surahs alias matching verses_by_surah', async () => {
    setupProgressMocks();
    const stats = await getProgressStats();

    expect(stats.surahs).toEqual(stats.verses_by_surah);
  });

  it('returns calendar with 30 entries', async () => {
    setupProgressMocks();
    const stats = await getProgressStats();

    expect(stats.calendar).toHaveLength(30);
    stats.calendar.forEach((entry) => {
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('has_activity');
    });
  });

  it('marks today as active in calendar when review exists', async () => {
    const today = new Date().toISOString().split('T')[0];
    setupProgressMocks({ calendarDates: [{ review_date: today }] });
    const stats = await getProgressStats();

    const todayEntry = stats.calendar.find((e) => e.date === today);
    expect(todayEntry?.has_activity).toBe(true);
  });

  it('returns this_month count', async () => {
    setupProgressMocks({ monthCount: { count: 42 } });
    const stats = await getProgressStats();

    expect(stats.this_month).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// SC-4.3 - getWeeklyReviewCounts
// ---------------------------------------------------------------------------
describe('SC-4.3 - getWeeklyReviewCounts', () => {
  it('returns array of 7 numbers with correct day indices', async () => {
    const wednesday = new Date();
    while (wednesday.getDay() !== 3) {
      wednesday.setDate(wednesday.getDate() - 1);
    }
    const wedStr = wednesday.toISOString().split('T')[0];

    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('GROUP BY date(reviewed_at)')) {
        return {
          rows: { _array: [{ review_date: wedStr, count: 12 }] },
        };
      }
      return { rows: [] };
    });

    const counts = await getWeeklyReviewCounts();

    expect(counts).toHaveLength(7);
    expect(counts[3]).toBe(12);
    expect(counts.filter((c) => c === 0)).toHaveLength(6);
  });

  it('returns all zeros when no reviews', async () => {
    mockExecute.mockReturnValue({ rows: [] });

    const counts = await getWeeklyReviewCounts();

    expect(counts).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('handles multiple days of data', async () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayIdx = today.getDay();

    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayIdx = yesterday.getDay();

    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('GROUP BY date(reviewed_at)')) {
        return {
          rows: {
            _array: [
              { review_date: yesterdayStr, count: 5 },
              { review_date: todayStr, count: 8 },
            ],
          },
        };
      }
      return { rows: [] };
    });

    const counts = await getWeeklyReviewCounts();

    expect(counts[todayIdx]).toBe(8);
    expect(counts[yesterdayIdx]).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// SC-3.6 - getVerseBySurahAyah
// ---------------------------------------------------------------------------
describe('SC-3.6 - getVerseBySurahAyah', () => {
  it('returns verse when found', async () => {
    const verse = {
      id: 1,
      surah_number: 67,
      ayah_number: 1,
      text_arabic: 'bismillah',
      juz_number: 29,
      status: 'new',
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
    };

    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('surah_number = ?')) {
        return { rows: { _array: [verse] } };
      }
      return { rows: [] };
    });

    const result = await getVerseBySurahAyah(67, 1);

    expect(result).toEqual(verse);
  });

  it('returns null when verse not found', async () => {
    mockExecute.mockReturnValue({ rows: [] });

    const result = await getVerseBySurahAyah(999, 999);

    expect(result).toBeNull();
  });

  it('passes correct parameters to the query', async () => {
    mockExecute.mockReturnValue({ rows: [] });

    await getVerseBySurahAyah(78, 5);

    const matchingCall = mockExecute.mock.calls.find(
      (c: unknown[]) => (c[0] as string).includes('surah_number = ?'),
    );
    expect(matchingCall).toBeDefined();
    expect(matchingCall![1]).toEqual([78, 5]);
  });
});

// ---------------------------------------------------------------------------
// SC-5.4 - getSettings / updateSettings
// ---------------------------------------------------------------------------
describe('SC-5.4 - getSettings', () => {
  it('returns default settings when table is empty', async () => {
    mockExecute.mockReturnValue({ rows: [] });

    const settings = await getSettings();

    expect(settings).toEqual({
      learning_mode: 'active',
      focus_juz_start: 29,
      focus_juz_end: 30,
      evaluation_day: 1,
      learning_capacity: 10,
      daily_new_lines: 3,
      direction: 'desc',
      session_duration: 15,
      preferred_reciter: 'abdul_basit',
    });
  });

  it('merges stored settings over defaults', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM settings')) {
        return {
          rows: {
            _array: [
              { key: 'learning_mode', value: '"revision_only"' },
              { key: 'daily_new_lines', value: '5' },
              { key: 'session_duration', value: '30' },
            ],
          },
        };
      }
      return { rows: [] };
    });

    const settings = await getSettings();

    expect(settings.learning_mode).toBe('revision_only');
    expect(settings.daily_new_lines).toBe(5);
    expect(settings.session_duration).toBe(30);
    expect(settings.focus_juz_start).toBe(29);
    expect(settings.preferred_reciter).toBe('abdul_basit');
  });

  it('handles non-JSON string values', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM settings')) {
        return {
          rows: {
            _array: [{ key: 'preferred_reciter', value: 'mishary_alafasy' }],
          },
        };
      }
      return { rows: [] };
    });

    const settings = await getSettings();

    expect(settings.preferred_reciter).toBe('mishary_alafasy');
  });
});

describe('SC-5.4 - updateSettings', () => {
  it('calls INSERT OR REPLACE for each setting', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM settings')) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    await updateSettings({
      learning_mode: 'paused',
      daily_new_lines: 7,
    });

    const insertCalls = mockExecute.mock.calls.filter(
      (c: unknown[]) => (c[0] as string).includes('INSERT OR REPLACE INTO settings'),
    );

    expect(insertCalls.length).toBe(2);

    const params = insertCalls.map((c: unknown[]) => c[1]);
    expect(params).toContainEqual(['learning_mode', 'paused']);
    expect(params).toContainEqual(['daily_new_lines', '7']);
  });

  it('returns updated settings after write', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM settings')) {
        return {
          rows: { _array: [{ key: 'session_duration', value: '45' }] },
        };
      }
      return { rows: [] };
    });

    const result = await updateSettings({ session_duration: 45 });

    expect(result.session_duration).toBe(45);
  });

  it('serializes non-string values as JSON', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM settings')) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    await updateSettings({ focus_juz_start: 30 });

    const insertCall = mockExecute.mock.calls.find(
      (c: unknown[]) =>
        (c[0] as string).includes('INSERT OR REPLACE') &&
        Array.isArray(c[1]) &&
        c[1][0] === 'focus_juz_start',
    );

    expect(insertCall).toBeDefined();
    expect(insertCall![1][1]).toBe('30');
  });
});

// ---------------------------------------------------------------------------
// submitReview
// ---------------------------------------------------------------------------
describe('submitReview', () => {
  it('updates verse SRS fields and logs review', async () => {
    const existingVerse = {
      id: 42,
      surah_number: 67,
      ayah_number: 1,
      text_arabic: 'test',
      juz_number: 29,
      status: 'learning',
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
    };

    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM verses WHERE id')) {
        return { rows: { _array: [existingVerse] } };
      }
      return { rows: [], insertId: 1 };
    });

    const result = await submitReview(42, 4);

    expect(result.verse_id).toBe(42);
    expect(result.quality).toBe(4);
    expect(result.status).toBe('learning');
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    expect(typeof result.next_review_date).toBe('string');
    expect(typeof result.ease_factor).toBe('number');

    const updateCall = mockExecute.mock.calls.find(
      (c: unknown[]) => (c[0] as string).includes('UPDATE verses SET'),
    );
    expect(updateCall).toBeDefined();

    const historyCall = mockExecute.mock.calls.find(
      (c: unknown[]) => (c[0] as string).includes('INSERT INTO review_history'),
    );
    expect(historyCall).toBeDefined();
  });

  it('throws when verse not found', async () => {
    mockExecute.mockReturnValue({ rows: [] });

    await expect(submitReview(9999, 3)).rejects.toThrow('Verse not found');
  });
});
