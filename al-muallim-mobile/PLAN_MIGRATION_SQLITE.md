# 🔧 PLAN D'ACTION - MIGRATION SQLITE ONLY

**Date** : 12/03/2026  
**Priorité** : 🔴 CRITIQUE (bloque release)  
**Estimation** : 1-2 jours  
**Assigné** : Alex

---

## 🎯 OBJECTIF

**Réduire le bundle size de 2.0 MB → 1.2 MB** en supprimant `quranData.generated.ts` du bundle JavaScript.

**Gain attendu** :
- ✅ -800 KB bundle size
- ✅ +2-3s temps de chargement
- ✅ -5 MB mémoire runtime
- ✅ Conformité App Store

---

## 📋 PLAN D'EXÉCUTION

### Phase 1 : Script de Seed Autonome (30 min)

#### Étape 1.1 : Créer script seed-standalone.js
```javascript
// scripts/seed-standalone.js
// Script Node.js pour seed DB sans React Native

const SQLite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Charger les données
const quranData = require('../src/data/quranData.generated.ts');

// Créer DB
const db = new SQLite('quran.db');

// Créer tables
db.exec(`
  CREATE TABLE IF NOT EXISTS surahs (...);
  CREATE TABLE IF NOT EXISTS verses (...);
  CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surahNumber);
  CREATE INDEX IF NOT EXISTS idx_verses_juz ON verses(juz);
`);

// Seed surahs
const insertSurah = db.prepare(`
  INSERT INTO surahs (number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs)
  VALUES (@number, @name, @englishName, @englishNameTranslation, @revelationType, @numberOfAyahs)
`);

const insertVerses = db.transaction((verses) => {
  for (const verse of verses) {
    insertVerse.run(verse);
  }
});

// Exécuter seed
console.log('🌱 Seeding database...');
insertSurahs(quranData.surahs);
insertVerses(quranData.verses);
console.log('✅ Database seeded successfully');

db.close();
```

#### Étape 1.2 : Ajouter au package.json
```json
{
  "scripts": {
    "seed:db": "node scripts/seed-standalone.js",
    "prebuild": "npm run seed:db",
    "build": "expo build"
  }
}
```

---

### Phase 2 : Modifier QuranDB.ts (20 min)

#### Étape 2.1 : Supprimer import JSON
```typescript
// ❌ AVANT
import { QURAN_DATA } from '../data/quranData.generated';

// ✅ APRÈS
// Plus d'import - données déjà en DB
```

#### Étape 2.2 : Vérifier si DB existe
```typescript
private async seedData(): Promise<void> {
  // Check if data already exists
  const result = await this.db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM verses'
  );
  
  if (result && result.count > 0) {
    console.log(`✅ Database already seeded (${result.count} verses)`);
    return; // ✅ Déjà seedée, ne pas re-seed
  }

  // ❌ SUPPRIMER le bloc de seed depuis JSON
  // Les données sont déjà seedées par script prebuild
}
```

---

### Phase 3 : Configurer Metro Bundler (15 min)

#### Étape 3.1 : Exclure fichier du bundle
```javascript
// metro.config.js
module.exports = {
  // ... existing config
  resolver: {
    blacklistRE: /quranData\.generated\.ts$/,
  },
};
```

#### Étape 3.2 : Vérifier .gitignore
```gitignore
# Database files (seeded in prebuild)
*.db
al-muallim-mobile/quran.db

# Generated data (not needed in bundle)
src/data/quranData.generated.ts
```

---

### Phase 4 : Tests & Validation (30 min)

#### Étape 4.1 : Tester flow complet
```bash
# 1. Clean build
rm -rf node_modules
npm install

# 2. Seed database
npm run seed:db

# 3. Verify DB
sqlite3 quran.db "SELECT COUNT(*) FROM verses;"
# Expected: 6236

# 4. Build app
npm run build

# 5. Check bundle size
# Bundle should be ~1.2 MB (not 2.0 MB)
```

#### Étape 4.2 : Tests fonctionnels
```typescript
// Tests critiques:
- Charger sourate 1 (Al-Fatiha) ✅
- Charger sourate 114 (An-Nas) ✅
- Naviguer entre sourates ✅
- Modes récitation (4 modes) ✅
- Performance (temps chargement < 500ms) ✅
```

---

### Phase 5 : Documentation (15 min)

#### Étape 5.1 : Mettre à jour README
```markdown
## Setup

1. Install dependencies:
   \`npm install\`

2. Seed database (auto on first build):
   \`npm run seed:db\`

3. Start app:
   \`npx expo start\`

**Note**: Database is seeded automatically during \`npm run build\`.
```

#### Étape 5.2 : Mettre à jour AUDIT.md
```markdown
## 🔴 CRITICAL ISSUE - FIXED

**Bundle size** : 2.0 MB → 1.2 MB ✅

**Status**: ✅ RESOLVED
```

---

## ✅ CRITÈRES DE SUCCÈS

### Must Have
- [ ] Bundle size < 1.5 MB
- [ ] App démarre sans crash
- [ ] Charger n'importe quelle sourate
- [ ] Temps chargement < 1s
- [ ] 0 erreur TypeScript
- [ ] Tests E2E passent

### Nice to Have
- [ ] Temps chargement < 500ms
- [ ] Bundle size < 1.3 MB
- [ ] DB seed en < 5s

---

## 🚨 RISQUES & MITIGATION

### Risque 1 : DB non seedée en production
**Mitigation** : Check au runtime + fallback message

### Risque 2 : Corrupt DB file
**Mitigation** : Check integrity au démarrage + re-seed si nécessaire

### Risque 3 : Metro bundler inclut quand même
**Mitigation** : Vérifier bundle size après build

---

## 📅 TIMELINE

```
Jour 1 - Matin (2h)
├─ Créer seed-standalone.js ✅
├─ Modifier QuranDB.ts ✅
└─ Configurer Metro ✅

Jour 1 - Après-midi (2h)
├─ Tests complets ✅
├─ Validation bundle size ✅
└─ Fix bugs éventuels ✅

Jour 2 - Matin (1h)
├─ Documentation ✅
├─ Update AUDIT.md ✅
└─ Preparation release ✅
```

**Total estimé** : 4-5 heures

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant
```
Bundle size: 2.0 MB
Startup time: +3s
Memory: ~5 MB
```

### Après
```
Bundle size: 1.2 MB (-40%)
Startup time: +0.5s (-83%)
Memory: ~2 MB (-60%)
```

---

## 🎯 COMMANDES UTILES

```bash
# Vérifier bundle size
npx expo build --web --analyze

# Vérifier DB
sqlite3 quran.db "SELECT COUNT(*) FROM verses;"

# Clean tout
rm -rf node_modules quran.db && npm install && npm run seed:db

# Test performance
npx expo start --web --no-dev --minify
```

---

## 📝 NOTES

- ✅ Pas de breaking changes pour l'utilisateur
- ✅ Fonctionne en web + mobile
- ✅ Rétrocompatible avec version actuelle
- ✅ Pas de migration données utilisateur nécessaire

---

**Plan créé par** : Alex  
**Approuvé par** : En attente validation Reda  
**Date début** : 13/03/2026 (demain)

---

** STATUT**: 🟡 EN ATTENTE VALIDATION
