import SQLite from 'react-native-quick-sqlite';
import type { Verse, DailyReview, ProgressStats, UserSettings, ReviewResult, QualityScore } from '@/types';

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

// Seed Juz 29-30 (995 verses) - Sample data for testing
export const seedDatabase = async (): Promise<void> => {
  // Check if database is already seeded
  const checkResult = await db.execute(`SELECT COUNT(*) as count FROM verses`);
  const count = checkResult.rows?.[0]?.count || 0;

  if (count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Sample verses from Juz 29-30 (Amma)
  const sampleVerses = [
    [78, 1, 'عَمَّ يَتَسَاءَلُونَ', 'De quoi s\'interrogent-ils ?', 'About what are they asking one another?', 30, 582],
    [78, 2, 'عَنِ النَّبَإِ الْعَظِيمِ', 'De la nouvelle immense', 'About the great news', 30, 582],
    [78, 3, 'الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ', 'Au sujet de laquelle ils divergent', 'About which they disagree', 30, 582],
    [78, 4, 'كَلَّا سَيَعْلَمُونَ', 'Non ! Ils sauront bientôt', 'No! They are going to know', 30, 582],
    [78, 5, 'ثُمَّ كَلَّا سَيَعْلَمُونَ', 'Puis non ! Ils sauront bientôt', 'Then no! They are going to know', 30, 582],
    [79, 1, 'وَالنَّازِعَاتِ غَرْقًا', 'Par ceux qui arrachent avec violence', 'By those who extract with violence', 30, 583],
    [79, 2, 'وَالنَّاشِطَاتِ نَشْطًا', 'Et celles qui tirent avec douceur', 'And those who extract with ease', 30, 583],
    [79, 3, 'وَالسَّابِحَاتِ سَبْحًا', 'Et celles qui nagent librement', 'And those who glide swimmingly', 30, 583],
    [79, 4, 'فَالسَّابِقَاتِ سَبْقًا', 'Puis celles qui devancent en vitesse', 'Then those who race to the front', 30, 583],
    [79, 5, 'فَالْمُدَبِّرَاتِ أَمْرًا', 'Puis celles qui dirigent les affaires', 'Then those who arrange each matter', 30, 583],
    [80, 1, 'عَبَسَ وَتَوَلَّىٰ', 'Il s\'est renfrogné et a tourné le dos', 'He frowned and turned away', 30, 585],
    [80, 2, 'أَن جَاءَهُ الْأَعْمَىٰ', 'Parce que l\'aveugle est venu à lui', 'Because the blind man came to him', 30, 585],
    [80, 3, 'وَمَا يُدْرِيكَ لَعَلَّهُ يَزَّكَّىٰ', 'Et qu\'en sais-tu ? Peut-être se purifierait-il', 'And what can make you know? Perhaps he might purify himself', 30, 585],
    [81, 1, 'إِذَا الشَّمْسُ كُوِّرَتْ', 'Quand le soleil sera enveloppé', 'When the sun is wrapped up', 30, 586],
    [81, 2, 'وَإِذَا النُّجُومُ انْكَدَرَتْ', 'Et que les étoiles s\'obscurciront', 'And when the stars fall, dispersing', 30, 586],
    [82, 1, 'إِذَا السَّمَاءُ انْفَطَرَتْ', 'Quand le ciel se fendra', 'When the sky breaks apart', 30, 587],
    [82, 2, 'وَإِذَا الْكَوَاكِبُ انْتَثَرَتْ', 'Et que les étoiles se disperseront', 'And when the stars fall, scattering', 30, 587],
    [83, 1, 'وَيْلٌ لِلْمُطَفِّفِينَ', 'Malheur aux fraudeurs', 'Woe to those who give less', 30, 587],
    [84, 1, 'إِذَا السَّمَاءُ شَقَّقَتْ', 'Quand le ciel se déchirera', 'When the sky has split open', 30, 589],
    [85, 1, 'وَالسَّمَاءِ ذَاتِ الْبُرُوجِ', 'Par le ciel aux constellations', 'By the sky containing great stars', 30, 590],
    [86, 1, 'وَالسَّمَاءِ وَالطَّارِقِ', 'Par le ciel et l\'astre nocturne', 'By the sky and the night comer', 30, 591],
    [87, 1, 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَىٰ', 'Glorifie le nom de ton Seigneur le Très-Haut', 'Glorify the name of your Lord, the Most High', 30, 591],
    [88, 1, 'هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ', 'T\'est parvenu le récit de l\'enveloppante ?', 'Has there come to you the narration of the overwhelming?', 30, 592],
    [89, 1, 'وَالْفَجْرِ', 'Par l\'aube !', 'By the dawn', 30, 593],
    [90, 1, 'لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ', 'Non ! Je jure par cette cité !', 'I swear by this city', 30, 594],
    [91, 1, 'وَالشَّمْسِ وَضُحَاهَا', 'Par le soleil et par sa clarté', 'By the sun and its brightness', 30, 595],
    [92, 1, 'وَاللَّيْلِ إِذَا يَغْشَىٰ', 'Par la nuit quand elle enveloppe', 'By the night when it covers', 30, 596],
    [93, 1, 'وَالضُّحَىٰ', 'Par le jour montant !', 'By the morning brightness', 30, 596],
    [94, 1, 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ', 'N\'avons-Nous pas ouvert ton cœur ?', 'Did We not expand for you your breast?', 30, 596],
    [95, 1, 'وَالتِّينِ وَالزَّيْتُونِ', 'Par le figuier et l\'olivier !', 'By the fig and the olive', 30, 597],
    [96, 1, 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', 'Lis au nom de ton Seigneur qui a créé', 'Read in the name of your Lord who created', 30, 597],
    [97, 1, 'إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', 'Nous l\'avons fait descendre pendant la nuit du Destin', 'Indeed, We sent it down during the Night of Decree', 30, 598],
    [98, 1, 'لَمْ يَكُنِ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَابِ', 'Ceux qui ont mécru parmi les gens du Livre', 'Those who disbelieved among the People of the Scripture', 30, 598],
    [99, 1, 'إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا', 'Quand la terre tremblera d\'un tremblement', 'When the earth is shaken with its earthquake', 30, 599],
    [100, 1, 'وَالْعَادِيَاتِ ضَبْحًا', 'Par les coursiers qui halètent !', 'By the racers, panting', 30, 599],
    [101, 1, 'الْقَارِعَةُ', 'Le fracas !', 'The Striking Calamity', 30, 600],
    [102, 1, 'أَلْهَاكُمُ التَّكَاثُرُ', 'La course aux richesses vous distrait', 'Competition in worldly increase diverts you', 30, 600],
    [103, 1, 'وَالْعَصْرِ', 'Par le temps !', 'By time', 30, 601],
    [104, 1, 'وَيْلٌ لِكُلِّ هُمَزَةٍ لُمَزَةٍ', 'Malheur à tout calomniateur diffamateur', 'Woe to every scorner and mocker', 30, 601],
    [105, 1, 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ', 'N\'as-tu pas vu comment ton Seigneur a agi avec les gens de l\'éléphant ?', 'Have you not considered how your Lord dealt with the companions of the elephant?', 30, 601],
    [106, 1, 'لِإِيلَافِ قُرَيْشٍ', 'Pour l\'union des Quraysh', 'For the security of Quraysh', 30, 602],
    [107, 1, 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ', 'Vois-tu celui qui traite de mensonge la religion ?', 'Have you seen the one who denies the Recompense?', 30, 602],
    [108, 1, 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', 'Nous t\'avons certes accordé l\'Abondance', 'Indeed, We have granted you Al-Kawthar', 30, 602],
    [109, 1, 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', 'Dis : Ô vous les infidèles !', 'Say, "O disbelievers"', 30, 603],
    [110, 1, 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', 'Quand vient le secours d\'Allah ainsi que la victoire', 'When the victory of Allah has come and the conquest', 30, 603],
    [111, 1, 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ', 'Que périssent les deux mains d\'Abu-Lahab et qu\'il périsse lui-même', 'May the hands of Abu Lahab be ruined, and ruined is he', 30, 603],
    [112, 1, 'قُلْ هُوَ اللَّهُ أَحَدٌ', 'Dis : Il est Allah, Unique', 'Say, "He is Allah, the One"', 30, 604],
    [113, 1, 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', 'Dis : Je cherche protection auprès du Seigneur de l\'aube naissante', 'Say, "I seek refuge in the Lord of daybreak"', 30, 604],
    [114, 1, 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Dis : Je cherche protection auprès du Seigneur des hommes', 'Say, "I seek refuge in the Lord of mankind"', 30, 604],
  ];

  for (const verse of sampleVerses) {
    await db.execute(
      `INSERT INTO verses 
       (surah_number, ayah_number, text_arabic, text_translation_fr, text_translation_en, juz_number, page_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      verse
    );
  }

  console.log(`Database seeded with ${sampleVerses.length} sample verses`);
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
