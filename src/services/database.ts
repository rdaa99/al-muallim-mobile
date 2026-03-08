import SQLite from 'react-native-quick-sqlite';
import type { Verse, DailyReview, ProgressStats, UserSettings, ReviewResult, QualityScore } from '@/types';
import { VERSES_JUZ_29_30 } from '@/data/verses-juz-29-30';

// Open database
const db = SQLite.open({ name: 'almuallim.db' });

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

    console.log('Database initialized');
  } catch (error) {
    console.error('Database init error:', error);
    throw error;
  }
};

// Seed Juz 29-30 (995 verses)
export const seedDatabase = async (): Promise<void> => {
  // Check if database is already seeded
  const checkResult = await db.execute(`SELECT COUNT(*) as count FROM verses`);
  const count = checkResult.rows?.[0]?.count || 0;

  if (count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Insert all 995 verses from Juz 29-30
  for (const verse of VERSES_JUZ_29_30) {
    await db.execute(
      `INSERT INTO verses 
       (surah_number, ayah_number, text_arabic, text_translation_fr, text_translation_en, juz_number, page_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      verse
    );
  }

  console.log(`Database seeded with ${VERSES_JUZ_29_30.length} verses from Juz 29-30`);
};

// SM-2 Algorithm
function calculateSM2(verse: any, quality: number): { ease_factor: number; interval: number; repetitions: number } {
  let { ease_factor = 2.5, interval = 0, repetitions = 0 } = verse;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ease_factor);
    
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease_factor = Math.max(1.3, ease_factor);

  return { ease_factor, interval, repetitions };
}

// Get today's reviews
export const getTodayReview = async (): Promise<DailyReview> => {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await db.execute(
    `SELECT * FROM verses 
     WHERE (next_review_date IS NULL OR next_review_date <= ?) 
     AND status IN ('learning', 'consolidating', 'mastered', 'new')
     ORDER BY next_review_date ASC
     LIMIT 20`,
    [today]
  );
  
  // Get completed count from review history for today
  const historyResult = await db.execute(
    `SELECT COUNT(DISTINCT verse_id) as count FROM review_history WHERE date(reviewed_at) = ?`,
    [today]
  );
  
  const completedCount = historyResult.rows?.[0]?.count || 0;
  
  return {
    date: today,
    due_count: result.rows?.length || 0,
    completed_count: completedCount,
    verses: result.rows || [],
  };
};

// Submit review
export const submitReview = async (verseId: number, quality: QualityScore): Promise<ReviewResult> => {
  // Get verse
  const verseResult = await db.execute(
    `SELECT * FROM verses WHERE id = ?`,
    [verseId]
  );

  const verse = verseResult.rows?.[0];
  if (!verse) {
    throw new Error('Verse not found');
  }

  // Calculate new SRS values (SM-2 algorithm)
  const { ease_factor, interval, repetitions } = calculateSM2(verse, quality);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  // Determine status
  let status = verse.status;
  if (quality >= 3) {
    if (repetitions >= 5) status = 'mastered';
    else if (repetitions >= 2) status = 'consolidating';
    else status = 'learning';
  } else {
    status = 'learning';
  }

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
    [ease_factor, interval, repetitions, nextReview.toISOString(), new Date().toISOString(), status, verseId]
  );

  // Log review
  await db.execute(
    `INSERT INTO review_history (verse_id, quality, reviewed_at) VALUES (?, ?, ?)`,
    [verseId, quality, new Date().toISOString()]
  );

  return { 
    verse_id: verseId, 
    quality, 
    next_review_date: nextReview.toISOString(),
    status,
    interval,
    ease_factor,
    repetitions
  };
};

// Get progress stats
export const getProgressStats = async (): Promise<ProgressStats> => {
  const totalResult = await db.execute(`SELECT COUNT(*) as count FROM verses`);
  const total_verses = totalResult.rows?.[0]?.count || 0;

  const masteredResult = await db.execute(
    `SELECT COUNT(*) as count FROM verses WHERE status = 'mastered'`
  );
  const mastered = masteredResult.rows?.[0]?.count || 0;

  const consolidatingResult = await db.execute(
    `SELECT COUNT(*) as count FROM verses WHERE status = 'consolidating'`
  );
  const consolidating = consolidatingResult.rows?.[0]?.count || 0;

  const learningResult = await db.execute(
    `SELECT COUNT(*) as count FROM verses WHERE status = 'learning'`
  );
  const learning = learningResult.rows?.[0]?.count || 0;

  const total_learned = mastered + consolidating + learning;

  // Get streak (simplified - count consecutive days with at least one review)
  const streakResult = await db.execute(
    `SELECT date(reviewed_at) as review_date, COUNT(DISTINCT verse_id) as verses_reviewed
     FROM review_history 
     GROUP BY date(reviewed_at) 
     ORDER BY review_date DESC
     LIMIT 30`
  );
  
  let streak_days = 0;
  if (streakResult.rows && streakResult.rows.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if reviewed today or yesterday to maintain streak
    if (streakResult.rows[0].review_date === today || 
        streakResult.rows[0].review_date === yesterday) {
      streak_days = streakResult.rows.length;
    }
  }

  // Calculate retention rate (simplified)
  const retentionResult = await db.execute(
    `SELECT AVG(CASE WHEN quality >= 3 THEN 1 ELSE 0 END) as retention_rate
     FROM review_history
     WHERE reviewed_at >= date('now', '-30 days')`
  );
  const retention_rate = retentionResult.rows?.[0]?.retention_rate || 0.85;

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
    streak: streak_days,
    retention_rate,
    verses_by_juz: [],
    verses_by_surah: [],
    surahs: [],
    calendar: [],
    this_month: 0,
  };
};

// Get settings
export const getSettings = async (): Promise<UserSettings> => {
  const result = await db.execute(`SELECT * FROM settings`);
  
  // Default settings
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

  // Override with stored settings
  if (result.rows) {
    for (const row of result.rows) {
      try {
        defaultSettings[row.key as keyof UserSettings] = JSON.parse(row.value);
      } catch {
        defaultSettings[row.key as keyof UserSettings] = row.value as any;
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
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      [key, valueStr]
    );
  }
  
  return getSettings();
};

// Export database instance for advanced usage
export { db };
