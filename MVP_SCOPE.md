# MVP Scope - Juz 29 & 30 Only

## Décision

**Date:** 08/03/2026
**Scope MVP:** Juz 29-30 uniquement (pas tout le Quran)

---

## 📊 Comparaison

| Metric | Full Quran | MVP (Juz 29-30) | Savings |
|--------|-----------|----------------|---------|
| **Versets** | 6,236 | ~995 | 84% |
| **Sourates** | 114 | 48 | 58% |
| **DB Size** | ~5 MB | ~800 KB | 84% |
| **Install Time** | ~10 sec | ~2 sec | 80% |
| **Testing Time** | 3-4 days | 2-3 days | 25% |

---

## 🎯 Pourquoi Juz 29-30 ?

### Avantages

**1. Allègement App**
- 85% moins de data
- Installation plus rapide
- DB plus légère = queries plus rapides

**2. Focus Testing**
- 48 sourates vs 114
- Tests plus rapides
- Moins de cas à couvrir

**3. Usage Réel**
- Juz 30 = le plus révisé (courtes sourates)
- Juz 29 = très populaire aussi
- Commencer par les plus utilisées

**4. MVP Gérable**
- Scope réaliste
- Livraison plus rapide
- Feedback plus tôt

---

## 📖 Contenu MVP

### Juz 29 (Sourates 67-77)
```
67. Al-Mulk (30 versets)
68. Al-Qalam (52 versets)
69. Al-Haqqah (52 versets)
70. Al-Ma'arij (44 versets)
71. Nuh (28 versets)
72. Al-Jinn (28 versets)
73. Al-Muzzammil (20 versets)
74. Al-Muddaththir (56 versets)
75. Al-Qiyamah (40 versets)
76. Al-Insan (31 versets)
77. Al-Mursalat (50 versets)

Total: 11 sourates, 431 versets
```

### Juz 30 (Sourates 78-114)
```
78. An-Naba (40 versets)
79. An-Nazi'at (46 versets)
80. Abasa (42 versets)
81. At-Takwir (29 versets)
82. Al-Infitar (19 versets)
83. Al-Mutaffifin (36 versets)
84. Al-Inshiqaq (25 versets)
85. Al-Buruj (22 versets)
86. At-Tariq (17 versets)
87. Al-A'la (19 versets)
88. Al-Ghashiyah (26 versets)
89. Al-Fajr (30 versets)
90. Al-Balad (20 versets)
91. Ash-Shams (15 versets)
92. Al-Lail (21 versets)
93. Ad-Dhuha (11 versets)
94. Ash-Sharh (8 versets)
95. At-Tin (8 versets)
96. Al-Alaq (19 versets)
97. Al-Qadr (5 versets)
98. Al-Bayyinah (8 versets)
99. Az-Zalzalah (8 versets)
100. Al-Adiyat (11 versets)
101. Al-Qari'ah (11 versets)
102. At-Takathur (8 versets)
103. Al-Asr (3 versets)
104. Al-Humazah (9 versets)
105. Al-Fil (5 versets)
106. Quraysh (4 versets)
107. Al-Ma'un (7 versets)
108. Al-Kawthar (3 versets)
109. Al-Kafirun (6 versets)
110. An-Nasr (3 versets)
111. Al-Masad (5 versets)
112. Al-Ikhlas (4 versets)
113. Al-Falaq (5 versets)
114. An-Nas (6 versets)

Total: 37 sourates, 564 versets
```

### Récapitulatif
```
Juz 29: 11 sourates, 431 versets
Juz 30: 37 sourates, 564 versets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:  48 sourates, 995 versets
        (16% du Quran complet)
```

---

## 🗺️ Plan Future Expansion

### v1.0 (MVP)
- ✅ Juz 29-30 (995 versets)
- ✅ Core features
- ✅ Offline mode

### v1.1 (Features)
- ✅ Tarteel-style recitation
- ✅ Voice recording
- ✅ Gamification
- ✅ Still Juz 29-30 only

### v1.2 (Expansion)
- [ ] Add Juz 1-5 (optionnel)
- [ ] Download on-demand
- [ ] User choisit Juz

### v2.0 (Full)
- [ ] Tout le Quran (6236 versets)
- [ ] Multi-device sync
- [ ] Cloud backup

---

## 💾 Technical Implementation

### DB Seeding
```sql
-- Seed Juz 29-30 only
INSERT INTO verses (
  surah_number,
  ayah_number,
  text_arabic,
  text_translation_fr,
  text_translation_en,
  juz_number,
  page_number
)
SELECT * FROM quran_data
WHERE juz_number IN (29, 30);

-- Result: 995 rows inserted
```

### File Size
```
SQLite DB (Juz 29-30):
- Verses data: ~600 KB
- Indexes: ~150 KB
- Settings/stats: ~50 KB
━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~800 KB

vs Full Quran:
Total: ~5 MB

Savings: 84%
```

### App Package Size
```
iOS IPA:
- Code: ~15 MB
- Assets: ~5 MB
- DB (Juz 29-30): ~0.8 MB
━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~21 MB

vs Full:
Total: ~25 MB

Savings: 16%
```

---

## ✅ Testing Scope Réduit

### Avant (Full Quran)
- 114 sourates à tester
- 6236 versets dans DB
- Edge cases: longues sourates (286 versets)

### Après (Juz 29-30)
- 48 sourates à tester ✅
- 995 versets dans DB ✅
- Edge cases simples ✅

**Gain:** Tests 2-3 jours au lieu de 3-4 jours

---

## 🎯 Benefits Résumé

| Bénéfice | Impact |
|----------|--------|
| App 85% plus légère | ⭐⭐⭐⭐⭐ |
| Install 80% plus rapide | ⭐⭐⭐⭐⭐ |
| Tests 25% plus rapides | ⭐⭐⭐⭐ |
| Focus sur populaires | ⭐⭐⭐⭐⭐ |
| MVP scope réaliste | ⭐⭐⭐⭐⭐ |
| Livraison plus tôt | ⭐⭐⭐⭐ |

---

## 📱 User Experience

### First Install
```
1. Download app: 21 MB (vs 25 MB)
2. Install: 2 sec (vs 10 sec)
3. First launch: instant
4. Start using: 48 sourates disponibles
```

### Future (v1.2+)
```
Settings → "Télécharger plus de Juz"
- [ ] Juz 1-10 (500 versets)
- [ ] Juz 11-20 (1000 versets)
- [ ] Juz 21-28 (800 versets)

User choisit ce qu'il veut.
```

---

## 🚀 Implementation

### Issue: RED-64
**Title:** Seed Juz 29-30 Only (MVP Scope)
**Priority:** P1
**Estimation:** 1-2 jours

### Tasks
1. Créer seed script
2. Filtrer data source pour Juz 29-30
3. Tester avec 995 versets
4. Valider performance

---

## 📝 Notes

**Pourquoi pas Juz Amma seul?**
- Juz 30 = Juz Amma = 37 sourates
- Ajouter Juz 29 = +11 sourates populaires
- Bonne introduction au MVP

**Pourquoi pas tout?**
- Trop lourd pour MVP
- Testing trop long
- Focus qualité > quantité
- Peut ajouter après

---

## ✅ Conclusion

**MVP Juz 29-30 = Meilleur choix pour:**
- App légère
- Tests rapides
- Focus qualité
- Livraison rapide
- Feedback utilisateur tôt

**Future expansion facile avec download on-demand.**

---

*Decision Date: 2026-03-08*  
*Scope: 48 surahs, ~995 verses (Juz 29-30)*  
*Savings: 85% data, 80% install time*
