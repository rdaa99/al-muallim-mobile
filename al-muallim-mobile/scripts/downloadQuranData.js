#!/usr/bin/env node
/**
 * Seed Script: Download and insert full Quran (6236 verses)
 * Uses: https://alquran.cloud/api
 */

const https = require('https');
const fs = require('fs');

const API_BASE = 'https://api.alquran.cloud/v1';
const EDITION = 'quran-uthmani'; // Arabic text with diacritics

// Fetch JSON from API
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Fetch all surahs metadata
async function fetchSurahs() {
  console.log('📡 Fetching surahs metadata...');
  const response = await fetchJSON(`${API_BASE}/surah`);
  
  if (response.code !== 200) {
    throw new Error('Failed to fetch surahs');
  }
  
  console.log(`✅ Fetched ${response.data.length} surahs`);
  return response.data;
}

// Fetch all verses for a surah with retry
async function fetchVerses(surahNumber, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, attempt * 300)); // Delay between retries
      
      const response = await fetchJSON(`${API_BASE}/surah/${surahNumber}/${EDITION}`);
      
      if (response.code !== 200) {
        throw new Error(`API returned ${response.code}`);
      }
      
      return response.data.ayahs;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to fetch verses for surah ${surahNumber} after ${retries} attempts: ${error.message}`);
      }
      process.stdout.write(` ⚠️ R${attempt}`);
    }
  }
}

// Generate TypeScript data file
async function generateDataFile() {
  console.log('\n🚀 Starting Quran data generation...\n');
  
  // Fetch surahs
  const surahs = await fetchSurahs();
  
  // Prepare data structure
  const quranData = {
    surahs: surahs.map(s => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      revelationType: s.revelationType,
      numberOfAyahs: s.numberOfAyahs
    })),
    verses: []
  };
  
  // Fetch all verses (progress tracking)
  console.log('\n📖 Fetching verses (114 surahs)...\n');
  
  for (let i = 0; i < surahs.length; i++) {
    const surah = surahs[i];
    const verses = await fetchVerses(surah.number);
    
    verses.forEach(v => {
      quranData.verses.push({
        surahNumber: surah.number, // Add surahNumber explicitly
        verseNumber: v.numberInSurah,
        text: v.text,
        juz: v.juz,
        page: v.page
      });
    });
    
    // Progress indicator
    const progress = ((i + 1) / surahs.length * 100).toFixed(1);
    process.stdout.write(
      `\r  ⏳ Progress: ${i + 1}/${surahs.length} surahs (${quranData.verses.length} verses) [${progress}%]`
    );
  }
  
  console.log('\n\n✅ All verses fetched\n');
  
  // Write to file
  const outputPath = './src/data/quranData.generated.ts';
  const fileContent = `// Auto-generated Quran data (${quranData.verses.length} verses)
// Generated at: ${new Date().toISOString()}
// Source: https://alquran.cloud

export const QURAN_DATA = ${JSON.stringify(quranData, null, 2)};

export type QuranData = typeof QURAN_DATA;
`;
  
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  
  console.log(`\n🎉 SUCCESS! Generated:`);
  console.log(`  • ${quranData.surahs.length} surahs`);
  console.log(`  • ${quranData.verses.length} verses`);
  console.log(`  • File: ${outputPath}`);
  console.log(`  • Size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB\n`);
}

// Run
generateDataFile().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
