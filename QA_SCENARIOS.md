# QA Scenarios — Al-Muallim Mobile

## Conventions

- **Prio** : P0 (bloquant), P1 (majeur), P2 (mineur), P3 (cosmétique)
- **Statut attendu** : le comportement correct
- **[BUG]** : comportement cassé identifié lors de l'audit

---

## 1. PREMIER LANCEMENT & ONBOARDING

### SC-1.1 — Installation fraiche (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Installer et lancer l'app pour la premiere fois | Splash/loading avec `ActivityIndicator` |
| 2 | Attendre l'init DB | Les 3 tables (verses, settings, review_history) sont creees |
| 3 | Attendre le seed | 995 versets inseres (Juz 29-30) |
| 4 | Navigation affichee | 4 onglets visibles : Revision, Stats, Audio, Parametres |
| 5 | Aller sur Dashboard | `total_verses=995`, `total_learned=0`, `streak=0`, weekly=[0,0,0,0,0,0,0] |

### SC-1.2 — Echec d'initialisation DB (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Simuler une erreur SQLite (disque plein, permissions) | Message d'erreur i18n `common.dbError` affiche en rouge |
| 2 | Verifier que l'app ne crash pas | Ecran d'erreur statique, pas de boucle infinie |

### SC-1.3 — Seed partiel interrompu (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Kill l'app pendant le seed (entre batch 1 et batch 20) | Transaction ROLLBACK, 0 versets en base |
| 2 | Relancer l'app | Seed recommence depuis zero, 995 versets a la fin |
| **[BUG]** | Si batch N echoue apres batch N-1 commit | ROLLBACK efface tout (bon), mais si count>0 le seed est skip (potentiel etat corrompu si le wrapper transaction echoue partiellement) |

### SC-1.4 — Double lancement simultane du seed (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Deux appels `seedDatabase()` en parallele | Un seul insere, l'autre detecte count>0 et skip |

---

## 2. SYSTEME DE REVISION (SM-2)

### SC-2.1 — Premiere revision d'un verset neuf (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Ouvrir l'onglet Revision | 20 versets affiches (status=new, next_review_date=NULL) |
| 2 | Voir le verset en arabe | Texte cache derriere "Touchez pour reveler" |
| 3 | Toucher pour reveler | Texte arabe affiche, bouton "Reveler la traduction" visible |
| 4 | Reveler la traduction | Traduction FR affichee sous le texte arabe |
| 5 | Repondre "Facile" (quality=5) | SM-2: interval=1, EF=2.6, rep=1, status=learning, next_review=demain |
| 6 | Verset suivant affiche | Index incremente, nouveau verset present |

### SC-2.2 — Scoring quality et transitions de statut (P0)
| Quality | Repetitions avant | Apres | Status apres | Interval |
|---------|-------------------|-------|--------------|----------|
| 5 (facile) | 0 | 1 | learning | 1 jour |
| 5 (facile) | 1 | 2 | consolidating | 6 jours |
| 5 (facile) | 4 | 5 | mastered | ~EF*prev |
| 3 (moyen) | 0 | 1 | learning | 1 jour |
| 1 (difficile) | 4 | 0 (reset) | learning | 1 jour |
| 0 (oublie) | 10 | 0 (reset) | learning | 1 jour |

### SC-2.3 — Ease Factor ne descend jamais sous 1.3 (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Repondre quality=0 dix fois de suite | EF calcule, toujours >= 1.3 |
| 2 | Verifier en DB | `ease_factor >= 1.3` pour ce verset |

### SC-2.4 — Completion de toutes les revisions du jour (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Reviser les 20 versets | Ecran de completion : "Felicitations !" |
| 2 | `completed_count` mis a jour | Egal au nombre de versets revises |
| 3 | Retourner sur Dashboard | Stats mises a jour (total_learned, streak potentiellement +1) |

### SC-2.5 — Skip d'un verset (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Appuyer sur "Passer ce verset" | Verset suivant affiche |
| 2 | Le verset skippe | Pas de review_history enregistre, le verset reste dans la queue |

### SC-2.6 — Aucun verset a reviser (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Tous les versets ont `next_review_date > today` | Message "Aucune revision aujourd'hui" |
| 2 | Bouton "Actualiser" visible | Recharge les versets, meme resultat |

### SC-2.7 — Overflow d'intervalle apres beaucoup de revisions (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Verset avec EF=3.5 revise 20 fois quality=5 | Interval ~7665 jours (21 ans) |
| 2 | L'app ne crash pas | Date `next_review_date` valide meme si lointaine |

### SC-2.8 — Quality score non-entier (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | API call avec quality=3.7 | Calcul SM-2 fonctionne (pas de validation stricte int) |
| **[BUG]** | L'UI ne propose que 1,3,5 mais le type accepte 0-5 float | Ajouter validation `Math.round()` ou type strict |

---

## 3. LECTEUR AUDIO

### SC-3.1 — Lecture basique (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Ouvrir l'onglet Audio | Sourate Al-Fatiha affichee, verset 1/7 |
| 2 | Appuyer Play | Loading indicator, puis lecture audio |
| 3 | Slider de progression | Se deplace en temps reel |
| 4 | Appuyer Pause | Audio en pause, slider fixe |
| 5 | Appuyer Play | Reprend a la position actuelle |

### SC-3.2 — Changement de vitesse (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Pendant la lecture, appuyer sur "Vitesse: 1x" | Options affichees : 0.5, 0.75, 1, 1.25, 1.5, 2 |
| 2 | Selectionner 0.5x | `setPlaybackSpeed(0.5)` appele, audio ralentit |
| 3 | Selectionner 2x | Audio accelere immediatement |
| 4 | Verifier label | "Vitesse: 2x" affiche |

### SC-3.3 — Boucle / Repetition (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Activer la repetition | Bouton surligne, texte "Repetition activee" |
| 2 | Laisser le verset se terminer | Audio recommence au debut automatiquement |
| 3 | Desactiver la repetition | Le verset se termine, passe au suivant |

### SC-3.4 — Navigation entre versets (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Verset 1, appuyer Suivant | Verset 2 charge et joue |
| 2 | Appuyer Precedent | Retour au verset 1 |
| 3 | Verset 1, appuyer Precedent | Bouton desactive (opacity 0.3) |
| 4 | Verset 7 (dernier), appuyer Suivant | Bouton desactive |

### SC-3.5 — Auto-avance en fin de piste (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Laisser un verset finir (sans boucle) | Passe automatiquement au verset suivant |
| 2 | Dernier verset (7/7) se termine | Audio s'arrete (stop) |

### SC-3.6 — Affichage du texte du verset (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Appuyer sur "Texte" | Texte arabe + traduction charges depuis la DB |
| 2 | Changer de verset | Texte mis a jour automatiquement |
| 3 | Verset non present en DB (surah 1 hors Juz 29-30) | Affiche "Chargement..." (fallback) |
| **[BUG]** | Al-Fatiha (surah 1) n'est pas dans le seed Juz 29-30 | `getVerseBySurahAyah(1,1)` retourne null → affiche le texte de loading indefiniment |

### SC-3.7 — Erreur reseau audio (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Couper le reseau, appuyer Play | Message d'erreur affiche |
| 2 | Reactiver le reseau, appuyer Play | Retry automatique, lecture reprend |

### SC-3.8 — Changement rapide de verset pendant le chargement (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Appuyer Play verset 1, immediatement Suivant | Premier audio cleanup (`stop` + `release`), nouveau charge |
| 2 | Pas de leak memoire | `soundRef.current` pointe vers le nouveau Sound |

### SC-3.9 — Recitateur selectionne ignore (P1) [BUG]
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Dans Parametres, selectionner "Abdurrahman As-Sudais" | Setting sauvegarde |
| 2 | Aller sur Audio, jouer un verset | URL toujours `ar.alafasy` |
| **[BUG]** | Le recitateur selectionne n'est pas utilise dans l'URL audio | L'URL devrait utiliser le reciter ID du setting |

---

## 4. DASHBOARD & STATISTIQUES

### SC-4.1 — Streak : comptage jours consecutifs (P0)
| Scenario | Jours avec reviews | Streak attendu |
|----------|-------------------|----------------|
| Reviews aujourd'hui seulement | [today] | 1 |
| Reviews hier + aujourd'hui | [today, yesterday] | 2 |
| Reviews hier mais pas aujourd'hui | [yesterday] | 1 |
| Pas de reviews depuis 3 jours | [3 days ago] | 0 |
| 7 jours consecutifs | [today..6 days ago] | 7 |
| Trou au milieu | [today, yesterday, 3 days ago] | 2 (casse a J-3) |

### SC-4.2 — Longest streak persiste (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Atteindre un streak de 5 jours | `longest_streak=5` sauvegarde dans settings |
| 2 | Casser le streak (pas de review pendant 2 jours) | `streak_days=0`, `longest_streak=5` (inchange) |
| 3 | Nouveau streak de 3 jours | `streak_days=3`, `longest_streak=5` (toujours l'ancien) |
| 4 | Nouveau streak de 7 jours | `streak_days=7`, `longest_streak=7` (mis a jour) |

### SC-4.3 — Weekly Progress (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Reviser 5 versets aujourd'hui (mercredi) | Bar de mercredi = 5 |
| 2 | Les 6 autres jours sans reviews | Bars a 0 |
| 3 | En langue arabe | Barres inversees (RTL), jours en arabe |

### SC-4.4 — Taux de retention (P1)
| Scenario | Reviews 30j | Passed (quality>=3) | Retention |
|----------|-------------|---------------------|-----------|
| Debutant, pas de reviews | 0 | 0 | 0% |
| Tout facile | 100 | 100 | 100% |
| Moitie/moitie | 50 | 25 | 50% |
| Vieux reviews (>30j) | non comptes | - | - |

### SC-4.5 — Stats par Juz (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | `getProgressStats()` | `verses_by_juz` contient 2 entrees (Juz 29, Juz 30) |
| 2 | Chaque entree | `juz_number`, `total`, `mastered`, `consolidating`, `learning` |
| 3 | Somme des totaux | = 995 |

### SC-4.6 — Calendrier d'activite (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | `getProgressStats()` | `calendar` = 30 entrees (J-29 a aujourd'hui) |
| 2 | Jour avec au moins 1 review | `has_activity: true` |
| 3 | Jour sans review | `has_activity: false` |

### SC-4.7 — Actions rapides navigation (P1)
| Bouton | Action attendue |
|--------|----------------|
| Continuer | Navigate vers Review |
| Reviser | Navigate vers Review |
| Ecouter | Navigate vers AudioPlayer |
| Stats | Recharge `loadStats()` (reste sur Dashboard) |

---

## 5. PARAMETRES

### SC-5.1 — Changement de langue (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Selectionner "English" | Toute l'UI passe en anglais immediatement |
| 2 | Selectionner "العربية" | UI en arabe, layout RTL sur Dashboard |
| 3 | Selectionner "Francais" | Retour au francais |
| 4 | Fermer et rouvrir l'app | Langue persistee (AsyncStorage) |

### SC-5.2 — Mode sombre / clair (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Activer le mode sombre | Background=#0F172A, texte=#F8FAFC |
| 2 | Desactiver | Background=#F8FAFC, texte=#1E293B |
| 3 | Verifier tous les ecrans | Couleurs coherentes partout (cards, tabs, headers) |
| 4 | Fermer/rouvrir | Theme persiste |

### SC-5.3 — Flash of wrong theme au demarrage (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Preference user = dark, systeme = light | Au demarrage, bref flash de theme light possible |
| 2 | AsyncStorage charge | Theme passe a dark |
| **[BUG]** | Race condition : system scheme (sync) vs user pref (async) | Flash visible sur appareils lents |

### SC-5.4 — Debounce sauvegarde (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Glisser le slider "Nouveaux versets/jour" de 3 a 8 rapidement | Aucune sauvegarde pendant le glissement |
| 2 | Arreter de glisser | Apres 1s, sauvegarde avec valeur finale (8) |
| 3 | Banniere "Sauvegarde..." | Visible brievement |
| 4 | Toast "Parametres sauvegardes" | Affiche apres succes |

### SC-5.5 — Navigation pendant la sauvegarde (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Changer un parametre puis quitter l'ecran en <1s | Timer debounce annule (cleanup useEffect) |
| **[BUG]** | La sauvegarde est perdue | Le parametre n'est pas persiste |

### SC-5.6 — Parametres sans effet [BUG] (P0)
| Parametre | Stocke | Effet reel |
|-----------|--------|------------|
| `learning_mode` | Oui (SQLite) | **Aucun** — `getTodayReview()` ne le consulte jamais |
| `focus_juz_start/end` | Oui | **Aucun** — pas de filtre juz dans les queries |
| `direction` | Oui | **Aucun** — l'ordre est hardcode (status, date) |
| `preferred_reciter` | Oui | **Aucun** — URL audio hardcode `ar.alafasy` |
| `daily_new_lines` | Oui | **Aucun** — limite hardcode a 20 |
| `session_duration` | Oui | **Aucun** — pas de timer |
| `learning_capacity` | Oui | **Aucun** — pas de limite verifiee |

---

## 6. i18n & RTL

### SC-6.1 — Couverture des traductions (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Passer chaque ecran en `fr` | Aucun texte brut anglais visible |
| 2 | Passer en `en` | Aucun texte brut francais visible |
| 3 | Passer en `ar` | Aucun texte brut latin (sauf noms propres) |
| 4 | Chercher des fallbacks `t('key', 'fallback')` | Chaque fallback doit correspondre a la cle FR |

### SC-6.2 — Layout RTL complet (P1)
| Element | Comportement RTL attendu | Statut actuel |
|---------|--------------------------|---------------|
| Dashboard greeting | `textAlign: 'right'` | OK (dynamique) |
| Dashboard direction container | `direction: 'rtl'` | OK |
| WeeklyProgress barres | Inversees (Sam a Dim) | OK |
| WeeklyProgress labels | Jours en arabe | OK |
| Settings sliders | Toujours LTR | Limitation native |
| ReviewScreen | Pas de RTL global | **Manquant** |
| AudioPlayerScreen | Pas de RTL global | **Manquant** |
| Navigation tabs | Toujours LTR | Limitation React Navigation |

### SC-6.3 — Texte arabe long (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Afficher un long verset (ex: Ayat Al-Kursi) | Texte wrap correctement |
| 2 | Traduction longue | Pas de debordement, scroll si necessaire |
| 3 | `writingDirection: 'rtl'` sur le texte arabe | Correct dans tous les ecrans |

---

## 7. NAVIGATION & LIFECYCLE

### SC-7.1 — Tab switching rapide (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Appuyer rapidement sur chaque onglet | Pas de crash, pas de double-render |
| 2 | Audio en cours, switcher vers Review | Audio continue (pas de stop automatique) |
| 3 | Revenir sur Audio | Etat preserve (position, isPlaying) |

### SC-7.2 — Icones des onglets (P3)
| Onglet | Icone attendue | Couleur active | Couleur inactive |
|--------|---------------|----------------|-----------------|
| Revision | 📖 | colors.primary (#10B981) | colors.textSecondary |
| Stats | 📊 | colors.primary | colors.textSecondary |
| Audio | 🎧 | colors.primary | colors.textSecondary |
| Parametres | ⚙️ | colors.primary | colors.textSecondary |

### SC-7.3 — Background / Foreground (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Mettre l'app en arriere-plan pendant une revision | Etat preserve |
| 2 | Revenir a l'app | Reprend exactement ou on etait |
| 3 | Audio en cours, passer en background | Audio continue en arriere-plan |
| 4 | Revenir | UI synchronisee avec la position audio |

### SC-7.4 — Deep link / app kill (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | En pleine revision, kill l'app | Reviews non soumis perdus (attendu) |
| 2 | Relancer | Reviews du jour recharges depuis la DB |
| 3 | Reviews deja soumis | Refletes dans `completed_count` |

---

## 8. PERFORMANCE & MEMOIRE

### SC-8.1 — Seed de 995 versets (P1)
| Metrique | Attendu |
|----------|---------|
| Temps d'insertion (batch 50) | < 2 secondes |
| Comparaison ancien seed (1 par 1) | ~20x plus rapide |
| Taille DB apres seed | ~ 500KB - 1MB |

### SC-8.2 — Fuite memoire audio (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Jouer 50 versets a la suite | RAM stable (pas de croissance lineaire) |
| 2 | Verifier `sound.release()` | Appele a chaque changement de piste |
| 3 | Quitter l'ecran Audio | `clearInterval` + `stop` + `release` appeles |

### SC-8.3 — Requetes DB lourdes (P2)
| Requete | Attendu |
|---------|---------|
| `getProgressStats()` (7 queries) | < 100ms |
| `getWeeklyReviewCounts()` | < 50ms |
| `getTodayReview()` (2 queries) | < 50ms |
| `seedDatabase()` (995 rows, batch 50) | < 2s |

---

## 9. ACCESSIBILITE

### SC-9.1 — Labels d'accessibilite (P2)
| Element | `accessibilityLabel` | `accessibilityRole` |
|---------|----------------------|---------------------|
| Play/Pause | "Lecture" / "Pause" (i18n) | button |
| Suivant/Precedent | "Suivant" / "Precedent" | button |
| Titre Audio | `t('audio.title')` | header |
| Vitesse | "Vitesse: Nx" | button |
| Options vitesse | "Nx" chacune | button + state.selected |

### SC-9.2 — Contraste couleurs (P2)
| Combinaison | Ratio | WCAG |
|-------------|-------|------|
| Dark: text (#F8FAFC) sur bg (#0F172A) | ~17:1 | AAA |
| Light: text (#1E293B) sur bg (#F8FAFC) | ~14:1 | AAA |
| Dark: textSecondary (#94A3B8) sur bg (#0F172A) | ~5:1 | AA |
| Dark: textSecondary (#94A3B8) sur surface (#1E293B) | ~4:1 | **Limite AA** |

### SC-9.3 — Taille des cibles tactiles (P2)
| Element | Taille min | Attendu (WCAG) |
|---------|-----------|----------------|
| Boutons audio | 44x44 | OK |
| Boutons review | `minWidth: 44, minHeight: 44` | OK |
| Options vitesse | ~50x36 | Limite |

---

## 10. CAS LIMITES CRITIQUES

### SC-10.1 — Timezone et streak (P1)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Reviser a 23:59 UTC+1 | Review comptee pour "aujourd'hui" local |
| 2 | Reviser a 00:01 UTC+1 (lendemain) | Review comptee pour "demain" |
| **[BUG]** | `getTodayDate()` utilise `new Date().toISOString()` (UTC) | Si l'utilisateur est en UTC+5, une review a 22:00 local = 17:00 UTC = meme jour. Mais a 01:00 local = 20:00 UTC J-1 = jour precedent en UTC. Le streak peut etre incorrect. |

### SC-10.2 — Revue de 995 versets en un jour (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | `getTodayReview()` retourne max 20 | Seulement 20 visibles |
| 2 | Apres avoir fait les 20, recharger | 20 nouveaux versets due |
| 3 | Repeter | Tous les 995 peuvent etre revises en plusieurs sessions |

### SC-10.3 — Base de donnees corrompue (P0)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Fichier DB corrompu | `initDatabase()` echoue |
| 2 | Ecran d'erreur affiche | Message i18n, pas de crash |
| 3 | Pas de solution de recovery automatique | L'utilisateur doit reinstaller |

### SC-10.4 — Petit ecran (< 360px width) (P2)
| Etape | Action | Attendu |
|-------|--------|---------|
| 1 | Lancer sur un petit ecran | `isSmallScreen` detecte |
| 2 | AudioPlayer | `paddingBottom: 100`, `paddingVertical: 20` |
| 3 | Tous les boutons | Restent cliquables (minWidth/minHeight 44) |

---

## MATRICE DE PRIORITE

| Priorite | Nombre | Exemples |
|----------|--------|----------|
| P0 (Bloquant) | 6 | DB init, SM-2 correctness, vitesse audio, DB corrompue, parametres sans effet, changement langue |
| P1 (Majeur) | 14 | Streak, weekly progress, auto-avance audio, reciteur ignore, debounce save, timezone |
| P2 (Mineur) | 12 | Flash theme, RTL incomplet, fuite memoire, accessibilite, petit ecran |
| P3 (Cosmetique) | 2 | Icones tabs, contraste secondaire |
