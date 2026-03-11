# E2E Test Scenarios - Al-Muallim
**Version**: 1.0
**Date**: 2026-03-10
**Author**: Alex (Main Agent)

---

## 📋 Table of Contents

1. [Smoke Tests](#smoke-tests)
2. [Navigation Tests](#navigation-tests)
3. [Dashboard Tests](#dashboard-tests)
4. [Audio Player Tests](#audio-player-tests)
5. [Settings Tests](#settings-tests)
6. [Data Persistence Tests](#persistence-tests)
7. [Edge Cases](#edge-cases)
8. [Accessibility Tests](#accessibility-tests)

---

## 🔥 Smoke Tests (P0)

### TEST-SMOKE-001: App Load
**Priority**: P0
**Type**: Smoke
**Description**: L'application se charge sans erreur

**Steps**:
1. Ouvrir http://localhost:19006
2. Attendre 5 secondes

**Expected**:
- ✅ Page blanche → contenu affiché
- ✅ Pas d'erreur console
- ✅ Titre "Al-Muallim" visible
- ✅ Dashboard affiché par défaut

---

### TEST-SMOKE-002: Tab Navigation Basic
**Priority**: P0
**Type**: Smoke
**Description**: Navigation entre les 3 tabs fonctionne

**Steps**:
1. Cliquer sur tab "Audio"
2. Cliquer sur tab "Paramètres"
3. Cliquer sur tab "Tableau de bord"

**Expected**:
- ✅ Chaque tab s'affiche
- ✅ Indicateur actif se déplace
- ✅ Contenu change pour chaque tab

---

### TEST-SMOKE-003: Language Change
**Priority**: P0
**Type**: Smoke
**Description**: Changement de langue fonctionne

**Steps**:
1. Aller dans Paramètres
2. Cliquer "Langue de l'application"
3. Sélectionner "English"
4. Vérifier texte dashboard

**Expected**:
- ✅ Picker s'ouvre
- ✅ Langue change
- ✅ Texte UI mis à jour

---

## 🧭 Navigation Tests (P1)

### TEST-NAV-001: Tab Switch Rapid
**Priority**: P1
**Type**: Functional
**Description**: Changement rapide de tabs

**Steps**:
1. Cliquer Dashboard
2. Immédiatement cliquer Audio
3. Immédiatement cliquer Settings
4. Immédiatement cliquer Dashboard
5. Répéter 5 fois rapidement

**Expected**:
- ✅ Aucun crash
- ✅ UI reste responsive
- ✅ Bon tab affiché à la fin

---

### TEST-NAV-002: Tab State Preservation
**Priority**: P1
**Type**: Functional
**Description**: L'état est préservé entre les tabs

**Steps**:
1. Aller dans Audio
2. Cliquer Play (sélectionner Sourate 1)
3. Aller dans Settings
4. Changer mode sombre ON
5. Retourner dans Audio

**Expected**:
- ✅ Sourate 1 toujours affichée
- ✅ Mode pause/play préservé

---

## 📊 Dashboard Tests (P1)

### TEST-DASH-001: Initial Stats Display
**Priority**: P1
**Type**: Functional
**Description**: Stats initiales affichées correctement

**Steps**:
1. Charger l'app
2. Vérifier Dashboard

**Expected**:
- ✅ "0" jours consécutifs
- ✅ "0" record
- ✅ "0 / 114" sourates
- ✅ "0 / 6236" versets
- ✅ "0 / 10" versets jour
- ✅ Tous les pourcentages à 0%

---

### TEST-DASH-002: Quick Actions Presence
**Priority**: P1
**Type**: Functional
**Description**: Les 4 actions rapides sont présentes

**Steps**:
1. Vérifier section "Actions rapides"

**Expected**:
- ✅ Bouton "Continuer" avec icône 📖
- ✅ Bouton "Réviser" avec icône 🎯
- ✅ Bouton "Écouter" avec icône 🎧
- ✅ Bouton "Stats" avec icône 📊

---

### TEST-DASH-003: Week Progress Chart
**Priority**: P1
**Type**: Functional
**Description**: Graphique semaine affiché

**Steps**:
1. Vérifier section "Progression cette semaine"

**Expected**:
- ✅ 7 jours affichés (Dim-Sam)
- ✅ Barres vides (nouvelle install)
- ✅ Labels jours lisibles

---

## 🎧 Audio Player Tests (P1)

### TEST-AUDIO-001: Initial State
**Priority**: P1
**Type**: Functional
**Description**: État initial du lecteur audio

**Steps**:
1. Aller dans Audio

**Expected**:
- ✅ "Aucune sourate" affiché
- ✅ "Sélectionnez une sourate"
- ✅ Bouton Play (▶) visible
- ✅ Slider à 0:00 / 0:00
- ✅ Récitateur par défaut affiché

---

### TEST-AUDIO-002: Play Button Triggers Surah Selection
**Priority**: P1
**Type**: Functional
**Description**: Play sélectionne automatiquement Sourate 1

**Steps**:
1. Aller dans Audio
2. Cliquer Play (▶)

**Expected**:
- ✅ Sourate 1 sélectionnée
- ✅ "الفاتحة" affiché
- ✅ "Al-Fatiha" affiché
- ✅ "Verset 1 / 7" affiché
- ✅ Bouton change en Pause (⏸)

---

### TEST-AUDIO-003: Speed Control
**Priority**: P1
**Type**: Functional
**Description**: Contrôle de vitesse de lecture

**Steps**:
1. Aller dans Audio
2. Cliquer Play
3. Cliquer "Vitesse: 1x"
4. Sélectionner "1.5x"

**Expected**:
- ✅ Dropdown s'ouvre avec 6 options
- ✅ Options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- ✅ Sélection 1.5x fonctionne
- ✅ Label "Vitesse: 1.5x"
- ✅ Dropdown se ferme

---

### TEST-AUDIO-004: Speed Options Complete
**Priority**: P1
**Type**: Functional
**Description**: Toutes les vitesses fonctionnent

**Steps**:
1. Ouvrir dropdown vitesse
2. Tester chaque vitesse: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x

**Expected**:
- ✅ Chaque vitesse sélectionnable
- ✅ Label mis à jour pour chaque
- ✅ Dropdown se ferme après sélection

---

### TEST-AUDIO-005: Audio Options Buttons
**Priority**: P1
**Type**: Functional
**Description**: Boutons options audio présents

**Steps**:
1. Aller dans Audio
2. Vérifier les 3 boutons options

**Expected**:
- ✅ Bouton "Répéter" (🔄) visible
- ✅ Bouton "Texte" (📜) visible
- ✅ Bouton "Playlist" (📑) visible

---

### TEST-AUDIO-006: Previous/Next Buttons
**Priority**: P1
**Type**: Functional
**Description**: Boutons navigation verset

**Steps**:
1. Aller dans Audio
2. Cliquer Play
3. Vérifier boutons Previous/Next

**Expected**:
- ✅ Bouton "⏮ Précédent" visible
- ✅ Bouton "⏭ Suivant" visible
- ✅ Boutons cliquables

---

## ⚙️ Settings Tests (P1)

### TEST-SET-001: Language Picker
**Priority**: P1
**Type**: Functional
**Description**: Picker de langue fonctionne

**Steps**:
1. Aller dans Paramètres
2. Cliquer "Langue de l'application"
3. Vérifier options
4. Sélectionner chaque langue

**Expected**:
- ✅ 3 options: العربية, English, Français
- ✅ Checkmark sur langue actuelle
- ✅ Sélection met à jour l'UI
- ✅ Dropdown se ferme

---

### TEST-SET-002: Language Change French
**Priority**: P1
**Type**: Functional
**Description**: Changement vers Français

**Steps**:
1. Aller dans Paramètres
2. Changer langue → Français
3. Vérifier Dashboard

**Expected**:
- ✅ "🇫🇷 Français" affiché
- ✅ Dashboard en français
- ✅ Tous les labels traduits

---

### TEST-SET-003: Language Change English
**Priority**: P1
**Type**: Functional
**Description**: Changement vers Anglais

**Steps**:
1. Aller dans Paramètres
2. Changer langue → English
3. Vérifier Dashboard

**Expected**:
- ✅ "🇬🇧 English" affiché
- ✅ Dashboard en anglais
- ✅ Tous les labels traduits

---

### TEST-SET-004: Language Change Arabic
**Priority**: P1
**Type**: Functional
**Description**: Changement vers Arabe

**Steps**:
1. Aller dans Paramètres
2. Changer langue → العربية
3. Vérifier Dashboard

**Expected**:
- ✅ "🇸🇦 العربية" affiché
- ✅ Dashboard en arabe
- ✅ RTL activé (si supporté)

---

### TEST-SET-005: Dark Mode Toggle
**Priority**: P1
**Type**: Functional
**Description**: Activation mode sombre

**Steps**:
1. Aller dans Paramètres
2. Cliquer switch "Mode sombre"
3. Vérifier changement visuel

**Expected**:
- ✅ Switch passe à ON
- ✅ Fond devient sombre
- ✅ Texte reste lisible
- ✅ Tous les éléments en dark mode

---

### TEST-SET-006: Font Size Picker
**Priority**: P1
**Type**: Functional
**Description**: Sélection taille texte

**Steps**:
1. Aller dans Paramètres
2. Cliquer "Taille du texte"
3. Sélectionner "Grande"
4. Vérifier changement

**Expected**:
- ✅ 3 options: Petite, Moyenne, Grande
- ✅ Checkmark sur "Moyenne" par défaut
- ✅ Sélection "Grande" fonctionne
- ✅ Texte agrandi dans toute l'app

---

### TEST-SET-007: Notifications Toggle
**Priority**: P1
**Type**: Functional
**Description**: Toggle notifications

**Steps**:
1. Aller dans Paramètres
2. Cliquer switch "Rappels quotidiens"

**Expected**:
- ✅ Switch passe à OFF
- ✅ Heure du rappel disparaît (ou grisé)
- ✅ Nouveau clic → ON

---

### TEST-SET-008: Reciter Display
**Priority**: P2
**Type**: Functional
**Description**: Affichage récitateur

**Steps**:
1. Aller dans Paramètres
2. Vérifier section "Récitation"

**Expected**:
- ✅ "Récitateur" label visible
- ✅ "Abdul Basit Abdul Samad" affiché
- ✅ Icône 🎙️ visible

---

### TEST-SET-009: Version Display
**Priority**: P2
**Type**: Functional
**Description**: Numéro de version affiché

**Steps**:
1. Aller dans Paramètres
2. Vérifier section "À propos"

**Expected**:
- ✅ Section "À propos" visible
- ✅ "Version" label
- ✅ "1.0.0" affiché

---

## 💾 Persistence Tests (P2)

### TEST-PERSIST-001: Settings Persist After Reload
**Priority**: P2
**Type**: Functional
**Description**: Les settings sont sauvegardés

**Steps**:
1. Aller dans Paramètres
2. Activer mode sombre
3. Changer langue → English
4. Changer taille → Grande
5. Recharger la page (F5)
6. Vérifier Paramètres

**Expected**:
- ✅ Mode sombre toujours ON
- ✅ Langue toujours English
- ✅ Taille toujours Grande

---

### TEST-PERSIST-002: Audio State Persists
**Priority**: P2
**Type**: Functional
**Description**: État audio sauvegardé

**Steps**:
1. Aller dans Audio
2. Cliquer Play (Sourate 1)
3. Changer vitesse → 2x
4. Aller dans Dashboard
5. Retourner dans Audio

**Expected**:
- ✅ Sourate 1 toujours affichée
- ✅ Vitesse toujours 2x

---

## ⚠️ Edge Cases (P2)

### TEST-EDGE-001: Rapid Clicking
**Priority**: P2
**Type**: Edge Case
**Description**: clics rapides ne crashent pas

**Steps**:
1. Cliquer 20 fois rapidement sur tab Audio
2. Cliquer 20 fois rapidement sur Play

**Expected**:
- ✅ App reste stable
- ✅ Dernière action prise en compte
- ✅ Pas d'erreur console

---

### TEST-EDGE-002: Multiple Dropdowns
**Priority**: P2
**Type**: Edge Case
**Description**: Un seul dropdown ouvert à la fois

**Steps**:
1. Aller dans Paramètres
2. Ouvrir picker Langue
3. Sans fermer, cliquer picker Taille

**Expected**:
- ✅ Picker Langue se ferme
- ✅ Picker Taille s'ouvre
- ✅ Un seul dropdown visible

---

### TEST-EDGE-003: Window Resize
**Priority**: P2
**Type**: Edge Case
**Description**: Resize ne casse pas l'UI

**Steps**:
1. Ouvrir app en plein écran
2. Réduire fenêtre à 320px largeur
3. Réduire fenêtre à 200px hauteur
4. Restaurer taille normale

**Expected**:
- ✅ UI s'adapte
- ✅ Pas de débordement
- ✅ Texte reste lisible
- ✅ Tous les éléments accessibles

---

## ♿ Accessibility Tests (P2)

### TEST-A11Y-001: Tab Navigation
**Priority**: P2
**Type**: Accessibility
**Description**: Navigation au clavier

**Steps**:
1. Appuyer Tab 10 fois
2. Vérifier focus visible

**Expected**:
- ✅ Focus se déplace entre éléments
- ✅ Focus visible (outline)
- ✅ Tab order logique

---

### TEST-A11Y-002: Color Contrast Dark Mode
**Priority**: P2
**Type**: Accessibility
**Description**: Contraste suffisant en dark mode

**Steps**:
1. Activer mode sombre
2. Vérifier lisibilité texte

**Expected**:
- ✅ Texte lisible sur fond sombre
- ✅ Contraste suffisant (WCAG AA)
- ✅ Icônes visibles

---

## 📊 Test Summary Template

| Category | Total | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Smoke | 3 | - | - | - |
| Navigation | 2 | - | - | - |
| Dashboard | 3 | - | - | - |
| Audio | 6 | - | - | - |
| Settings | 9 | - | - | - |
| Persistence | 2 | - | - | - |
| Edge Cases | 3 | - | - | - |
| Accessibility | 2 | - | - | - |
| **TOTAL** | **30** | **-** | **-** | **-** |

---

## 🎯 Priorities

- **P0 (Smoke)**: Must pass for release
- **P1 (Functional)**: Core features
- **P2 (Secondary)**: Nice to have

---

**Next Step**: Exécuter tous les tests et remplir le tableau de résultats
