#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Helper to fetch JSON from URL
function fetchJson(url) {
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

async function fetchJuzWithTranslations(juzNumber) {
  console.log(`Fetching Juz ${juzNumber}...`);
  
  // Fetch Arabic text
  const arabicUrl = `https://api.alquran.cloud/v1/juz/${juzNumber}`;
  const arabicData = await fetchJson(arabicUrl);
  
  // Fetch French translation (Hamidullah)
  const frenchUrl = `https://api.alquran.cloud/v1/juz/${juzNumber}/fr.hamidullah`;
  const frenchData = await fetchJson(frenchUrl);
  
  // Fetch English translation (Asad)
  const englishUrl = `https://api.alquran.cloud/v1/juz/${juzNumber}/en.asad`;
  const englishData = await fetchJson(englishUrl);
  
  // Create a map for quick lookup
  const arabicVerses = arabicData.data.ayahs;
  const frenchVerses = frenchData.data.ayahs;
  const englishVerses = englishData.data.ayahs;
  
  console.log(`  Arabic: ${arabicVerses.length} verses`);
  console.log(`  French: ${frenchVerses.length} verses`);
  console.log(`  English: ${englishVerses.length} verses`);
  
  // Merge all data
  const verses = arabicVerses.map((v, i) => ({
    surah_number: v.surah.number,
    ayah_number: v.numberInSurah,
    text_arabic: v.text.trim(),
    text_translation_fr: frenchVerses[i]?.text.trim() || '',
    text_translation_en: englishVerses[i]?.text.trim() || '',
    juz_number: juzNumber,
    page_number: v.page,
  }));
  
  return verses;
}

function generateTypeScript(verses) {
  const versesCode = verses.map(v => 
    `  [${v.surah_number}, ${v.ayah_number}, '${escapeString(v.text_arabic)}', '${escapeString(v.text_translation_fr)}', '${escapeString(v.text_translation_en)}', ${v.juz_number}, ${v.page_number}]`
  ).join(',\n');
  
  return `// Auto-generated from AlQuran Cloud API
// Juz 29-30: ${verses.length} verses
// Generated: ${new Date().toISOString()}

export const VERSES_JUZ_29_30: Array<[
  surah_number: number,
  ayah_number: number,
  text_arabic: string,
  text_translation_fr: string,
  text_translation_en: string,
  juz_number: number,
  page_number: number
]> = [
${versesCode}
];

// Stats
export const VERSES_STATS = {
  total: ${verses.length},
  juz29: ${verses.filter(v => v.juz_number === 29).length},
  juz30: ${verses.filter(v => v.juz_number === 30).length},
  surahs: ${new Set(verses.map(v => v.surah_number)).size},
};
`;
}

function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

async function main() {
  console.log('Fetching all verses from AlQuran Cloud API...\n');
  
  // Fetch both Juz
  const juz29 = await fetchJuzWithTranslations(29);
  const juz30 = await fetchJuzWithTranslations(30);
  
  // Combine
  const allVerses = [...juz29, ...juz30];
  
  console.log(`\nTotal verses: ${allVerses.length}`);
  
  // Validate surah range
  const surahs = [...new Set(allVerses.map(v => v.surah_number))].sort((a, b) => a - b);
  console.log(`Surahs: ${surahs[0]} to ${surahs[surahs.length - 1]} (${surahs.length} surahs)`);
  
  // Generate TypeScript file
  const tsCode = generateTypeScript(allVerses);
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'verses-juz-29-30.ts');
  fs.writeFileSync(outputPath, tsCode, 'utf-8');
  
  console.log(`\nGenerated: ${outputPath}`);
  console.log('Done!');
}

main().catch(console.error);
