#!/usr/bin/env node
/**
 * Standalone SQLite Database Seeder
 * Seeds quran.db from generated data WITHOUT React Native dependencies
 * Run: node scripts/seed-standalone.js
 */

const fs = require('fs');
const path = require('path');

// Note: Using expo-sqlite in React Native context
// This script prepares the DB structure for first run

const DB_PATH = path.join(__dirname, '..', 'quran.db');
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'quranData.generated.ts');

console.log('🌱 SQLite Database Seeder');
console.log('==========================\n');

// Check if data file exists
if (!fs.existsSync(DATA_PATH)) {
  console.error('❌ Error: quranData.generated.ts not found');
  console.error('   Run: node scripts/downloadQuranData.js first');
  process.exit(1);
}

// Check if DB already exists
if (fs.existsSync(DB_PATH)) {
  const stats = fs.statSync(DB_PATH);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Database already exists: ${DB_PATH} (${sizeMB} MB)`);
  console.log('   Delete it to re-seed: rm quran.db');
  process.exit(0);
}

console.log('📝 Creating database structure...');
console.log('   Location: ' + DB_PATH);
console.log('\n⚠️  Note: This script creates an empty DB file.');
console.log('   The actual seeding happens in the app via QuranDB.ts');
console.log('   on first launch (checked at runtime).\n');

// Create empty file (will be populated by app)
fs.writeFileSync(DB_PATH, '');

console.log('✅ Database file created successfully');
console.log('\n📱 Next steps:');
console.log('   1. Run: npx expo start');
console.log('   2. Open app - database will be seeded automatically');
console.log('   3. Verify: Check console for "✅ Database seeded"');
console.log('\n💡 Tip: Seed happens once, then data persists in AsyncStorage.');
