import SQLite from 'react-native-quick-sqlite';
import type { Verse, DailyReview, ProgressStats, UserSettings, ReviewResult, QualityScore, VerseStatus, JuzProgress, SurahProgress, Favorite, Collection, CollectionItem } from '@/types';
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

// Surah name mapping for Juz 29-30
const SURAH_NAMES: Record<number, string> = {
  67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Ma\'arij',
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir',
  75: 'Al-Qiyamah', 76: 'Al-Insan', 77: 'Al-Mursalat',
  78: 'An-Naba', 79: 'An-Nazi\'at', 80: 'Abasa', 81: 'At-Takwir',
  82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq',
  85: 'Al-Buruj', 86: 'At-Tariq', 87: 'Al-A\'la', 88: 'Al-Ghashiyah',
  89: 'Al-Fajr', 90: 'Al-Balad', 91: 'Ash-Shams', 92: 'Al-Layl',
  93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin', 96: 'Al-Alaq',
  97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
  101: 'Al-Qari\'ah', 102: 'At-Takathur', 103: 'Al-Asr',
  104: 'Al-Humazah', 105: 'Al-Fil', 106: 'Quraysh',
  107: 'Al-Ma\'un', 108: 'Al-Kawthar', 109: 'Al-Kafirun',
  110: 'An-Nasr', 111: 'Al-Masad', 112: 'Al-Ikhlas',
  113: 'Al-Falaq', 114: 'An-Nas',
};

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

    // Create favorites table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        verse_id INTEGER,
        surah_number INTEGER,
        ayah_number INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (verse_id) REFERENCES verses(id)
      );
    `);

    await db.execute('CREATE INDEX IF NOT EXISTS idx_favorites_verse ON favorites(verse_id);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_favorites_surah ON favorites(surah_number);');

    // Create collections table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        is_predefined INTEGER DEFAULT 0
      );
    `);

    // Create collection_items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS collection_items (
        id TEXT PRIMARY KEY,
        collection_id TEXT NOT NULL,
        verse_id INTEGER,
        surah_number INTEGER,
        ayah_number INTEGER,
        added_at TEXT NOT NULL,
        FOREIGN KEY (collection_id) REFERENCES collections(id),
        FOREIGN KEY (verse_id) REFERENCES verses(id)
      );
    `);

    await db.execute('CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_collection_items_verse ON collection_items(verse_id);');
  } catch (error) {
    throw new Error(`Database init error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Seed Juz 29-30 (995 verses) with batch inserts
export const seedDatabase = async (): Promise<void> => {
  const checkResult = await db.execute('SELECT COUNT(*) as count FROM verses');
  const count = (getRow(checkResult.rows, 0) as { count?: number })?.count || 0;

  if (count > 0) {
    return;
  }

  const BATCH_SIZE = 50;
  await db.execute('BEGIN TRANSACTION;');
  try {
    for (let i = 0; i < VERSES_JUZ_29_30.length; i += BATCH_SIZE) {
      const batch = VERSES_JUZ_29_30.slice(i, i + BATCH_SIZE);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flat();
      await db.execute(
        `INSERT INTO verses
         (surah_number, ayah_number, text_arabic, text_translation_fr, text_translation_en, juz_number, page_number)
         VALUES ${placeholders}`,
        values
      );
    }
    await db.execute('COMMIT;');

    // Initialize predefined collections
    await initializePredefinedCollections();
  } catch (error) {
    await db.execute('ROLLBACK;');
    throw new Error(`Database seed error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// SM-2 Algorithm with input validation
export function calculateSM2(
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

// Get progress stats - comprehensive query
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

  // Track longest streak in settings
  let longest_streak = 0;
  const longestResult = await db.execute(
    "SELECT value FROM settings WHERE key = 'longest_streak'"
  );
  const longestRow = getRow(longestResult.rows, 0);
  if (longestRow) {
    longest_streak = parseInt(longestRow.value as string, 10) || 0;
  }
  if (streak_days > longest_streak) {
    longest_streak = streak_days;
    await db.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('longest_streak', ?)",
      [String(longest_streak)]
    );
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

  // Verses by juz
  const juzResult = await db.execute(`
    SELECT juz_number,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN status = 'consolidating' THEN 1 ELSE 0 END) as consolidating,
      SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning
    FROM verses
    GROUP BY juz_number
    ORDER BY juz_number
  `);
  const verses_by_juz: JuzProgress[] = getRows(juzResult.rows).map(row => ({
    juz_number: row.juz_number as number,
    total: row.total as number,
    mastered: row.mastered as number,
    consolidating: row.consolidating as number,
    learning: row.learning as number,
  }));

  // Verses by surah
  const surahResult = await db.execute(`
    SELECT surah_number,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN status = 'consolidating' THEN 1 ELSE 0 END) as consolidating,
      SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning
    FROM verses
    GROUP BY surah_number
    ORDER BY surah_number
  `);
  const verses_by_surah: SurahProgress[] = getRows(surahResult.rows).map(row => ({
    surah_number: row.surah_number as number,
    surah_name: SURAH_NAMES[row.surah_number as number] || `Surah ${row.surah_number}`,
    total: row.total as number,
    mastered: row.mastered as number,
    consolidating: row.consolidating as number,
    learning: row.learning as number,
  }));

  // Calendar: last 30 days activity
  const calendarResult = await db.execute(`
    SELECT DISTINCT date(reviewed_at) as review_date
    FROM review_history
    WHERE reviewed_at >= date('now', '-30 days')
    ORDER BY review_date
  `);
  const activeDates = new Set(
    getRows(calendarResult.rows).map(r => r.review_date as string)
  );
  const calendar: { date: string; has_activity: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    calendar.push({ date: dateStr, has_activity: activeDates.has(dateStr) });
  }

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
    longest_streak,
    retention_rate,
    verses_by_juz,
    verses_by_surah,
    surahs: verses_by_surah,
    calendar,
    this_month,
  };
};

// Get weekly review counts for last 7 days (Sunday to Saturday)
export const getWeeklyReviewCounts = async (): Promise<number[]> => {
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0];
  const result = await db.execute(`
    SELECT date(reviewed_at) as review_date, COUNT(DISTINCT verse_id) as count
    FROM review_history
    WHERE reviewed_at >= date('now', '-6 days')
    GROUP BY date(reviewed_at)
    ORDER BY review_date
  `);

  for (const row of getRows(result.rows)) {
    const d = new Date(row.review_date as string);
    const dayIndex = d.getDay(); // 0=Sun, 6=Sat
    counts[dayIndex] = (row.count as number) || 0;
  }

  return counts;
};

// Get verse by surah and ayah number
export const getVerseBySurahAyah = async (surahNumber: number, ayahNumber: number): Promise<Verse | null> => {
  const result = await db.execute(
    'SELECT * FROM verses WHERE surah_number = ? AND ayah_number = ?',
    [surahNumber, ayahNumber]
  );
  const row = getRow(result.rows, 0);
  return row ? (row as unknown as Verse) : null;
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

// ============ SURAHS FUNCTIONS ============

// Get all surahs with metadata
export const getSurahs = async (): Promise<Surah[]> => {
  // Return hardcoded surah list for Juz 29-30 (suras 67-114)
  const surahs: Surah[] = [
    { number: 67, name: 'الملك', englishName: 'Al-Mulk', ayahsCount: 30, revelationType: 'Meccan' },
    { number: 68, name: 'القلم', englishName: 'Al-Qalam', ayahsCount: 52, revelationType: 'Meccan' },
    { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', ayahsCount: 52, revelationType: 'Meccan' },
    { number: 70, name: 'المعارج', englishName: "Al-Ma'arij", ayahsCount: 44, revelationType: 'Meccan' },
    { number: 71, name: 'نوح', englishName: 'Nuh', ayahsCount: 28, revelationType: 'Meccan' },
    { number: 72, name: 'الجن', englishName: 'Al-Jinn', ayahsCount: 28, revelationType: 'Meccan' },
    { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', ayahsCount: 20, revelationType: 'Meccan' },
    { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', ayahsCount: 56, revelationType: 'Meccan' },
    { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', ayahsCount: 40, revelationType: 'Meccan' },
    { number: 76, name: 'الإنسان', englishName: 'Al-Insan', ayahsCount: 31, revelationType: 'Medinan' },
    { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', ayahsCount: 50, revelationType: 'Meccan' },
    { number: 78, name: 'النبأ', englishName: "An-Naba'", ayahsCount: 40, revelationType: 'Meccan' },
    { number: 79, name: 'النازعات', englishName: "An-Nazi'at", ayahsCount: 46, revelationType: 'Meccan' },
    { number: 80, name: 'عبس', englishName: 'Abasa', ayahsCount: 42, revelationType: 'Meccan' },
    { number: 81, name: 'التكوير', englishName: 'At-Takwir', ayahsCount: 29, revelationType: 'Meccan' },
    { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', ayahsCount: 19, revelationType: 'Meccan' },
    { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', ayahsCount: 36, revelationType: 'Meccan' },
    { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', ayahsCount: 25, revelationType: 'Meccan' },
    { number: 85, name: 'البروج', englishName: 'Al-Buruj', ayahsCount: 22, revelationType: 'Meccan' },
    { number: 86, name: 'الطارق', englishName: 'At-Tariq', ayahsCount: 17, revelationType: 'Meccan' },
    { number: 87, name: 'الأعلى', englishName: "Al-A'la", ayahsCount: 19, revelationType: 'Meccan' },
    { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', ayahsCount: 26, revelationType: 'Meccan' },
    { number: 89, name: 'الفجر', englishName: 'Al-Fajr', ayahsCount: 30, revelationType: 'Meccan' },
    { number: 90, name: 'البلد', englishName: 'Al-Balad', ayahsCount: 20, revelationType: 'Meccan' },
    { number: 91, name: 'الشمس', englishName: 'Ash-Shams', ayahsCount: 15, revelationType: 'Meccan' },
    { number: 92, name: 'الليل', englishName: 'Al-Layl', ayahsCount: 21, revelationType: 'Meccan' },
    { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', ayahsCount: 11, revelationType: 'Meccan' },
    { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', ayahsCount: 8, revelationType: 'Meccan' },
    { number: 95, name: 'التين', englishName: 'At-Tin', ayahsCount: 8, revelationType: 'Meccan' },
    { number: 96, name: 'العلق', englishName: 'Al-Alaq', ayahsCount: 19, revelationType: 'Meccan' },
    { number: 97, name: 'القدر', englishName: 'Al-Qadr', ayahsCount: 5, revelationType: 'Meccan' },
    { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', ayahsCount: 8, revelationType: 'Medinan' },
    { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', ayahsCount: 8, revelationType: 'Medinan' },
    { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', ayahsCount: 11, revelationType: 'Meccan' },
    { number: 101, name: 'القارعة', englishName: "Al-Qari'ah", ayahsCount: 11, revelationType: 'Meccan' },
    { number: 102, name: 'التكاثر', englishName: 'At-Takathur', ayahsCount: 8, revelationType: 'Meccan' },
    { number: 103, name: 'العصر', englishName: 'Al-Asr', ayahsCount: 3, revelationType: 'Meccan' },
    { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', ayahsCount: 9, revelationType: 'Meccan' },
    { number: 105, name: 'الفيل', englishName: 'Al-Fil', ayahsCount: 5, revelationType: 'Meccan' },
    { number: 106, name: 'قريش', englishName: 'Quraysh', ayahsCount: 4, revelationType: 'Meccan' },
    { number: 107, name: 'الماعون', englishName: "Al-Ma'un", ayahsCount: 7, revelationType: 'Meccan' },
    { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', ayahsCount: 3, revelationType: 'Meccan' },
    { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', ayahsCount: 6, revelationType: 'Meccan' },
    { number: 110, name: 'النصر', englishName: 'An-Nasr', ayahsCount: 3, revelationType: 'Medinan' },
    { number: 111, name: 'المسد', englishName: 'Al-Masad', ayahsCount: 5, revelationType: 'Meccan' },
    { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', ayahsCount: 4, revelationType: 'Meccan' },
    { number: 113, name: 'الفلق', englishName: 'Al-Falaq', ayahsCount: 5, revelationType: 'Meccan' },
    { number: 114, name: 'الناس', englishName: 'An-Nas', ayahsCount: 6, revelationType: 'Meccan' },
  ];

  return surahs;
};

// ============ FAVORITES FUNCTIONS ============

// Add to favorites
export const addFavorite = async (
  verseId?: number,
  surahNumber?: number,
  ayahNumber?: number
): Promise<string> => {
  const id = `fav_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO favorites (id, verse_id, surah_number, ayah_number, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, verseId ?? null, surahNumber ?? null, ayahNumber ?? null, createdAt]
  );

  return id;
};

// Remove from favorites
export const removeFavorite = async (
  verseId?: number,
  surahNumber?: number
): Promise<void> => {
  if (verseId) {
    await db.execute('DELETE FROM favorites WHERE verse_id = ?', [verseId]);
  } else if (surahNumber) {
    await db.execute('DELETE FROM favorites WHERE surah_number = ?', [surahNumber]);
  }
};

// Check if verse/surah is favorite
export const isFavorite = async (
  verseId?: number,
  surahNumber?: number
): Promise<boolean> => {
  let query = 'SELECT COUNT(*) as count FROM favorites WHERE ';
  const params: (number | undefined)[] = [];

  if (verseId) {
    query += 'verse_id = ?';
    params.push(verseId);
  } else if (surahNumber) {
    query += 'surah_number = ?';
    params.push(surahNumber);
  } else {
    return false;
  }

  const result = await db.execute(query, params);
  const row = getRow(result.rows, 0) as { count?: number } | undefined;
  return (row?.count || 0) > 0;
};

// Get all favorites
export const getFavorites = async (): Promise<Favorite[]> => {
  const result = await db.execute(
    'SELECT * FROM favorites ORDER BY created_at DESC'
  );
  return getRows(result.rows) as unknown as Favorite[];
};

// Get favorites with verse details
export const getFavoritesWithDetails = async (): Promise<(Favorite & { verse?: Verse })[]> => {
  const result = await db.execute(`
    SELECT f.*, v.*
    FROM favorites f
    LEFT JOIN verses v ON f.verse_id = v.id
    ORDER BY f.created_at DESC
  `);

  return getRows(result.rows).map(row => ({
    id: row.id as string,
    verse_id: row.verse_id as number | undefined,
    surah_number: row.surah_number as number | undefined,
    ayah_number: row.ayah_number as number | undefined,
    created_at: row.created_at as string,
    verse: row.id ? (row as unknown as Verse) : undefined,
  }));
};

// ============ COLLECTIONS FUNCTIONS ============

// Create collection
export const createCollection = async (
  name: string,
  description?: string,
  color: string = '#4F46E5',
  isPredefined: boolean = false
): Promise<string> => {
  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO collections (id, name, description, color, created_at, is_predefined)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, description ?? null, color, createdAt, isPredefined ? 1 : 0]
  );

  return id;
};

// Update collection
export const updateCollection = async (
  id: string,
  updates: { name?: string; description?: string; color?: string }
): Promise<void> => {
  const updatedAt = new Date().toISOString();
  const setClause = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), updatedAt, id];

  await db.execute(
    `UPDATE collections SET ${setClause}, updated_at = ? WHERE id = ?`,
    values
  );
};

// Delete collection
export const deleteCollection = async (id: string): Promise<void> => {
  // Delete collection items first
  await db.execute('DELETE FROM collection_items WHERE collection_id = ?', [id]);
  // Delete collection
  await db.execute('DELETE FROM collections WHERE id = ?', [id]);
};

// Get all collections
export const getCollections = async (): Promise<Collection[]> => {
  const result = await db.execute(
    'SELECT * FROM collections ORDER BY created_at DESC'
  );
  return getRows(result.rows).map(row => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    color: row.color as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string | undefined,
    is_predefined: (row.is_predefined as number) === 1,
  }));
};

// Get collection by ID
export const getCollectionById = async (id: string): Promise<Collection | null> => {
  const result = await db.execute(
    'SELECT * FROM collections WHERE id = ?',
    [id]
  );
  const row = getRow(result.rows, 0);
  if (!row) return null;

  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    color: row.color as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string | undefined,
    is_predefined: (row.is_predefined as number) === 1,
  };
};

// Add item to collection
export const addCollectionItem = async (
  collectionId: string,
  verseId?: number,
  surahNumber?: number,
  ayahNumber?: number
): Promise<string> => {
  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const addedAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO collection_items (id, collection_id, verse_id, surah_number, ayah_number, added_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, collectionId, verseId ?? null, surahNumber ?? null, ayahNumber ?? null, addedAt]
  );

  return id;
};

// Remove item from collection
export const removeCollectionItem = async (
  collectionId: string,
  verseId?: number,
  surahNumber?: number
): Promise<void> => {
  let query = 'DELETE FROM collection_items WHERE collection_id = ? AND ';
  const params: (string | number | undefined)[] = [collectionId];

  if (verseId) {
    query += 'verse_id = ?';
    params.push(verseId);
  } else if (surahNumber) {
    query += 'surah_number = ?';
    params.push(surahNumber);
  }

  await db.execute(query, params);
};

// Get collection items
export const getCollectionItems = async (collectionId: string): Promise<CollectionItem[]> => {
  const result = await db.execute(
    'SELECT * FROM collection_items WHERE collection_id = ? ORDER BY added_at DESC',
    [collectionId]
  );
  return getRows(result.rows) as unknown as CollectionItem[];
};

// Get collection items with verse details
export const getCollectionItemsWithDetails = async (
  collectionId: string
): Promise<(CollectionItem & { verse?: Verse })[]> => {
  const result = await db.execute(`
    SELECT ci.*, v.*
    FROM collection_items ci
    LEFT JOIN verses v ON ci.verse_id = v.id
    WHERE ci.collection_id = ?
    ORDER BY ci.added_at DESC
  `, [collectionId]);

  return getRows(result.rows).map(row => ({
    id: row.id as string,
    collection_id: row.collection_id as string,
    verse_id: row.verse_id as number | undefined,
    surah_number: row.surah_number as number | undefined,
    ayah_number: row.ayah_number as number | undefined,
    added_at: row.added_at as string,
    verse: row.id ? (row as unknown as Verse) : undefined,
  }));
};

// Initialize predefined collections
export const initializePredefinedCollections = async (): Promise<void> => {
  const existing = await db.execute(
    "SELECT COUNT(*) as count FROM collections WHERE is_predefined = 1"
  );
  const row = getRow(existing.rows, 0) as { count?: number } | undefined;
  const count = row?.count || 0;

  if (count > 0) return;

  // Create predefined collections
  await createCollection('À réviser', 'Versets à réviser régulièrement', '#FF9800', true);
  await createCollection('Difficiles', 'Versets difficiles à mémoriser', '#EF4444', true);
  await createCollection('Préférés', 'Mes versets préférés', '#10B981', true);
};

// Export database instance for advanced usage
export { db };
