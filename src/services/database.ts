import SQLite from 'react-native-quick-sqlite';
import type { Verse, DailyReview, ProgressStats, UserSettings, ReviewResult, QualityScore, VerseStatus } from '@/types';
import { VERSES_JUZ_29_30 } from '@/data/verses-juz-29-30';

// Open database
const db = SQLite.open({ name: 'almuallim.db' });

// Helper to safely get row from SQLite result set
function getRow(rows: unknown, index: number): Record<string, unknown> | undefined {
  if (!rows) {return undefined;}
  const r = rows as { _array?: Record<string, unknown>[]; item?: (i: number) => Record<string, unknown> };
  if (r._array) {return r._array[index];}
  if (typeof r.item === 'function') {return r.item(index);}
  if (Array.isArray(rows)) {return (rows as Record<string, unknown>[])[index];}
  return undefined;
}

function getRows(rows: unknown): Record<string, unknown>[] {
  if (!rows) {return [];}
  const r = rows as { _array?: Record<string, unknown>[] };
  if (r._array) {return r._array;}
  if (Array.isArray(rows)) {return rows as Record<string, unknown>[];}
  return [];
}

function getRowCount(rows: unknown): number {
  if (!rows) {return 0;}
  const r = rows as { _array?: unknown[]; length?: number };
  if (r._array) {return r._array.length;}
  if (typeof r.length === 'number') {return r.length;}
  return 0;
}

// Initialize schema
export const initDatabase = async (): Promise<void> => {
  try {
    // Create verses table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surah_number INTEGER NOT NULL,
        ayah_number INTEGER NOT NULL,
        text_arabic TEXT NOT NULL,
        text_translation_fr TEXT,
        text_translation_en TEXT,
        juz_number INTEGER NOT NULL,
        page_number INTEGER,
        status TEXT DEFAULT 'new',
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review_date TEXT,
        last_reviewed_at TEXT
      );
    `);

    // Create indexes for common queries
    await db.execute('CREATE INDEX IF NOT EXISTS idx_verses_status ON verses(status);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_verses_next_review ON verses(next_review_date);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_verses_juz ON verses(juz_number);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_number);');

    // Create settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Create review_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS review_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        reviewed_at TEXT NOT NULL,
        FOREIGN KEY (verse_id) REFERENCES verses(id)
      );
    `);

    await db.execute('CREATE INDEX IF NOT EXISTS idx_review_history_date ON review_history(reviewed_at);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_review_history_verse ON review_history(verse_id);');
  } catch (error) {
    throw new Error(`Database init error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Seed Juz 29-30 (995 verses) with transaction
export const seedDatabase = async (): Promise<void> => {
  const checkResult = await db.execute('SELECT COUNT(*) as count FROM verses');
  const count = (getRow(checkResult.rows, 0) as { count?: number })?.count || 0;

  if (count > 0) {
    return;
  }

  // Use transaction for batch insert
  await db.execute('BEGIN TRANSACTION;');
  try {
    for (const verse of VERSES_JUZ_29_30) {
      await db.execute(
        `INSERT INTO verses
         (surah_number, ayah_number, text_arabic, text_translation_fr, text_translation_en, juz_number, page_number)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        verse
      );
    }
    await db.execute('COMMIT;');
  } catch (error) {
    await db.execute('ROLLBACK;');
    throw new Error(`Database seed error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// SM-2 Algorithm with input validation
function calculateSM2(
  verse: { ease_factor?: number; interval?: number; repetitions?: number },
  quality: QualityScore
): { ease_factor: number; interval: number; repetitions: number } {
  if (quality < 0 || quality > 5) {
    throw new Error(`Invalid quality score: ${quality}`);
  }

  let { ease_factor = 2.5, interval = 0, repetitions = 0 } = verse;

  if (quality >= 3) {
    if (repetitions === 0) {interval = 1;}
    else if (repetitions === 1) {interval = 6;}
    else {interval = Math.round(interval * ease_factor);}

    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease_factor = Math.max(1.3, ease_factor);

  return { ease_factor, interval, repetitions };
}

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get today's reviews
export const getTodayReview = async (): Promise<DailyReview> => {
  const today = getTodayDate();

  // Compare date portion only using date() function for consistency
  const result = await db.execute(
    `SELECT * FROM verses
     WHERE (next_review_date IS NULL OR date(next_review_date) <= ?)
     AND status IN ('learning', 'consolidating', 'mastered', 'new')
     ORDER BY
       CASE status WHEN 'learning' THEN 1 WHEN 'consolidating' THEN 2 WHEN 'new' THEN 3 ELSE 4 END,
       next_review_date ASC
     LIMIT 20`,
    [today]
  );

  // Get completed count from review history for today
  const historyResult = await db.execute(
    'SELECT COUNT(DISTINCT verse_id) as count FROM review_history WHERE date(reviewed_at) = ?',
    [today]
  );

  const completedCount = (getRow(historyResult.rows, 0) as { count?: number })?.count || 0;

  return {
    date: today,
    due_count: getRowCount(result.rows),
    completed_count: completedCount,
    verses: getRows(result.rows) as unknown as Verse[],
  };
};

// Submit review
export const submitReview = async (verseId: number, quality: QualityScore): Promise<ReviewResult> => {
  const verseResult = await db.execute(
    'SELECT * FROM verses WHERE id = ?',
    [verseId]
  );

  const verse = getRow(verseResult.rows, 0);
  if (!verse) {
    throw new Error('Verse not found');
  }

  // Calculate new SRS values (SM-2 algorithm)
  const { ease_factor, interval, repetitions } = calculateSM2(
    {
      ease_factor: verse.ease_factor as number,
      interval: verse.interval as number,
      repetitions: verse.repetitions as number,
    },
    quality
  );

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  const nextReviewDate = nextReview.toISOString().split('T')[0];

  // Determine status
  let status: VerseStatus;
  if (quality >= 3) {
    if (repetitions >= 5) {status = 'mastered';}
    else if (repetitions >= 2) {status = 'consolidating';}
    else {status = 'learning';}
  } else {
    status = 'learning';
  }

  const now = new Date().toISOString();

  // Update verse
  await db.execute(
    `UPDATE verses SET
       ease_factor = ?,
       interval = ?,
       repetitions = ?,
       next_review_date = ?,
       last_reviewed_at = ?,
       status = ?
     WHERE id = ?`,
    [ease_factor, interval, repetitions, nextReviewDate, now, status, verseId]
  );

  // Log review
  await db.execute(
    'INSERT INTO review_history (verse_id, quality, reviewed_at) VALUES (?, ?, ?)',
    [verseId, quality, now]
  );

  return {
    verse_id: verseId,
    quality,
    next_review_date: nextReviewDate,
    status,
    interval,
    ease_factor,
    repetitions,
  };
};

// Get progress stats - single optimized query
export const getProgressStats = async (): Promise<ProgressStats> => {
  // Single query for all status counts
  const statusResult = await db.execute(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN status = 'consolidating' THEN 1 ELSE 0 END) as consolidating,
      SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning
    FROM verses
  `);

  const statusRow = getRow(statusResult.rows, 0) as {
    total?: number; mastered?: number; consolidating?: number; learning?: number;
  } | undefined;

  const total_verses = statusRow?.total || 0;
  const mastered = statusRow?.mastered || 0;
  const consolidating = statusRow?.consolidating || 0;
  const learning = statusRow?.learning || 0;
  const total_learned = mastered + consolidating + learning;

  // Get streak - count actual consecutive days
  const streakResult = await db.execute(
    `SELECT DISTINCT date(reviewed_at) as review_date
     FROM review_history
     ORDER BY review_date DESC
     LIMIT 60`
  );

  let streak_days = 0;
  const streakRows = getRows(streakResult.rows);
  if (streakRows.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstReviewDate = new Date(streakRows[0].review_date as string);
    firstReviewDate.setHours(0, 0, 0, 0);

    // Check if most recent review is today or yesterday
    const diffDays = Math.floor((today.getTime() - firstReviewDate.getTime()) / 86400000);
    if (diffDays <= 1) {
      streak_days = 1;
      // Count consecutive days backwards
      for (let i = 1; i < streakRows.length; i++) {
        const currentDate = new Date(streakRows[i - 1].review_date as string);
        const prevDate = new Date(streakRows[i].review_date as string);
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000);
        if (dayDiff === 1) {
          streak_days++;
        } else {
          break;
        }
      }
    }
  }

  // Calculate retention rate
  const retentionResult = await db.execute(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN quality >= 3 THEN 1 ELSE 0 END) as passed
     FROM review_history
     WHERE reviewed_at >= date('now', '-30 days')`
  );
  const retentionRow = getRow(retentionResult.rows, 0) as { total?: number; passed?: number } | undefined;
  const retentionTotal = retentionRow?.total || 0;
  const retention_rate = retentionTotal > 0 ? (retentionRow?.passed || 0) / retentionTotal : 0;

  // Reviews this month
  const monthResult = await db.execute(
    `SELECT COUNT(DISTINCT verse_id) as count FROM review_history
     WHERE reviewed_at >= date('now', 'start of month')`
  );
  const this_month = (getRow(monthResult.rows, 0) as { count?: number })?.count || 0;

  return {
    total_verses,
    total_learned,
    total_mastered: mastered,
    total_consolidating: consolidating,
    total_learning: learning,
    mastered,
    consolidating,
    learning,
    streak_days,
    retention_rate,
    verses_by_juz: [],
    verses_by_surah: [],
    surahs: [],
    calendar: [],
    this_month,
  };
};

// Get settings
export const getSettings = async (): Promise<UserSettings> => {
  const result = await db.execute('SELECT * FROM settings');

  const defaultSettings: UserSettings = {
    learning_mode: 'active',
    focus_juz_start: 29,
    focus_juz_end: 30,
    evaluation_day: 1,
    learning_capacity: 10,
    daily_new_lines: 3,
    direction: 'desc',
    session_duration: 15,
    preferred_reciter: 'abdul_basit',
  };

  const settingsRows = getRows(result.rows);
  for (const row of settingsRows) {
    const key = row.key as string;
    const value = row.value as string;
    if (key in defaultSettings) {
      try {
        (defaultSettings as unknown as Record<string, unknown>)[key] = JSON.parse(value);
      } catch {
        (defaultSettings as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  return defaultSettings;
};

// Update settings
export const updateSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  for (const [key, value] of Object.entries(settings)) {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    await db.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, valueStr]
    );
  }

  return getSettings();
};

// Export database instance for advanced usage
export { db };
