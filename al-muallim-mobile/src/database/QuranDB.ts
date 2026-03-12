import * as SQLite from 'expo-sqlite';
import { QURAN_DATA } from '../data/quranData.generated';

const DB_NAME = 'quran.db';

export class QuranDatabase {
  private db!: SQLite.SQLiteDatabase;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    await this.createTables();
    await this.seedData();
  }

  private async createTables(): Promise<void> {
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS surahs (
        number INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        englishName TEXT NOT NULL,
        englishNameTranslation TEXT,
        revelationType TEXT,
        numberOfAyahs INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surahNumber INTEGER NOT NULL,
        verseNumber INTEGER NOT NULL,
        text TEXT NOT NULL,
        juz INTEGER,
        page INTEGER,
        FOREIGN KEY (surahNumber) REFERENCES surahs(number)
      );
      
      CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surahNumber);
      CREATE INDEX IF NOT EXISTS idx_verses_juz ON verses(juz);
    `);
  }

  private async seedData(): Promise<void> {
    // Check if data already exists
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM verses'
    );
    
    if (result && result.count > 0) {
      console.log(`✅ Database already seeded (${result.count} verses)`);
      return;
    }

    console.log(`🌱 Seeding ${QURAN_DATA.surahs.length} surahs and ${QURAN_DATA.verses.length} verses...`);

    // Seed surahs
    for (const surah of QURAN_DATA.surahs) {
      await this.db.runAsync(
        `INSERT INTO surahs (number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          surah.number,
          surah.name,
          surah.englishName,
          surah.englishNameTranslation,
          surah.revelationType,
          surah.numberOfAyahs,
        ]
      );
    }

    // Seed verses in batches (100 verses per transaction)
    const BATCH_SIZE = 100;
    for (let i = 0; i < QURAN_DATA.verses.length; i += BATCH_SIZE) {
      const batch = QURAN_DATA.verses.slice(i, i + BATCH_SIZE);
      
      await this.db.withTransactionAsync(async () => {
        for (const verse of batch) {
          await this.db.runAsync(
            `INSERT INTO verses (surahNumber, verseNumber, text, juz, page)
             VALUES (?, ?, ?, ?, ?)`,
            [verse.surahNumber, verse.verseNumber, verse.text, verse.juz, verse.page]
          );
        }
      });

      const progress = Math.min(i + BATCH_SIZE, QURAN_DATA.verses.length);
      const percent = ((progress / QURAN_DATA.verses.length) * 100).toFixed(1);
      console.log(`  ⏳ Progress: ${progress}/${QURAN_DATA.verses.length} (${percent}%)`);
    }

    console.log('✅ Database seeded successfully');
  }

  // Get all surahs
  async getSurahs() {
    return await this.db.getAllAsync<{
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: string;
      numberOfAyahs: number;
    }>('SELECT * FROM surahs ORDER BY number');
  }

  // Get single surah
  async getSurah(surahNumber: number) {
    return await this.db.getFirstAsync<{
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: string;
      numberOfAyahs: number;
    }>('SELECT * FROM surahs WHERE number = ?', [surahNumber]);
  }

  // Get verses by surah
  async getVersesBySurah(surahNumber: number) {
    return await this.db.getAllAsync<{
      id: number;
      surahNumber: number;
      verseNumber: number;
      text: string;
      juz: number;
      page: number;
    }>('SELECT * FROM verses WHERE surahNumber = ? ORDER BY verseNumber', [surahNumber]);
  }

  // Get verses by juz
  async getVersesByJuz(juzNumber: number) {
    return await this.db.getAllAsync<{
      id: number;
      surahNumber: number;
      verseNumber: number;
      text: string;
      juz: number;
      page: number;
    }>('SELECT id, surahNumber, verseNumber, text, juz, page FROM verses WHERE juz = ? ORDER BY surahNumber, verseNumber', [juzNumber]);
  }

  // Get single verse
  async getVerse(surahNumber: number, verseNumber: number) {
    return await this.db.getFirstAsync<{
      id: number;
      surahNumber: number;
      verseNumber: number;
      text: string;
      juz: number;
      page: number;
    }>(
      'SELECT * FROM verses WHERE surahNumber = ? AND verseNumber = ?',
      [surahNumber, verseNumber]
    );
  }

  // Search verses (basic text search)
  async searchVerses(query: string) {
    return await this.db.getAllAsync<{
      id: number;
      surahNumber: number;
      verseNumber: number;
      text: string;
      juz: number;
      page: number;
    }>(
      'SELECT id, surahNumber, verseNumber, text, juz, page FROM verses WHERE text LIKE ? ORDER BY surahNumber, verseNumber LIMIT 100',
      [`%${query}%`]
    );
  }

  // Get statistics
  async getStats() {
    const totalVerses = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM verses'
    );
    const totalSurahs = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM surahs'
    );
    return {
      totalVerses: totalVerses?.count || 0,
      totalSurahs: totalSurahs?.count || 0,
    };
  }
}

// Singleton instance
let quranDB: QuranDatabase | null = null;

export async function getQuranDB(): Promise<QuranDatabase> {
  if (!quranDB) {
    quranDB = new QuranDatabase();
    await quranDB.init();
  }
  return quranDB;
}
