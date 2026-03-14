# 📋 User Stories - Al-Muallim

**Dernière mise à jour** : 14/03/2026

---

## 🎯 SPRINT ACTUEL (v1.2)

### ✅ **US-001 : Onglet Coran avec lecture progressive**
**En tant que** utilisateur  
**Je veux** un onglet dédié pour lire le Coran  
**Afin de** pratiquer la lecture et la mémorisation

**Critères d'acceptation** :
- ✅ 4e onglet "Coran" dans la navigation
- ✅ Liste des 114 sourates
- ✅ Titre sourate en haut
- ✅ Versets vides au départ (écran blanc)
- ✅ Apparition progressive (tap pour révéler)
- ✅ Couleurs tajwid (bleu, vert, orange, violet)
- ✅ Bismillah affiché (sauf sourate 9 et 1)

**Priorité** : P0 (Must Have)  
**Effort** : M (5 points)  
**Status** : ✅ DONE

---

### ✅ **US-002 : Révision style Tarteel**
**En tant que** utilisateur  
**Je veux** réviser avec un écran vide  
**Afin de** tester ma mémorisation (rappel actif)

**Critères d'acceptation** :
- ✅ Écran complètement vide au départ
- ✅ Juste le titre de la sourate
- ✅ Option "Révéler le texte" si besoin
- ✅ Option "Révéler traduction" si besoin
- ✅ Interface minimaliste
- ✅ Boutons de notation (SM-2)

**Priorité** : P0 (Must Have)  
**Effort** : S (3 points)  
**Status** : ✅ DONE

---

### ✅ **US-003 : Audio fonctionnel**
**En tant que** utilisateur  
**Je veux** écouter la récitation des versets  
**Afin de** améliorer ma prononciation

**Critères d'acceptation** :
- ✅ Audio lecture/pause/stop
- ✅ Progression (slider)
- ✅ Loop mode
- ✅ Speed control (0.5x - 2x)
- ✅ Fonctionne offline (après premier chargement)

**Priorité** : P0 (Must Have)  
**Effort** : M (5 points)  
**Status** : ✅ DONE (expo-av)

---

## 🚀 PROCHAINES FEATURES (v1.3+)

### 🔴 **P0 - CRITIQUE**

#### **US-004 : Sélection sourate intuitive**
**En tant que** utilisateur  
**Je veux** sélectionner facilement une sourate  
**Afin de** commencer ma révision rapidement

**Critères d'acceptation** :
- [ ] Liste des 114 sourates avec nom arabe + français
- [ ] Recherche par nom
- [ ] Filtrer par Juz (1-30)
- [ ] Filtrer par type (Makki/Madani)
- [ ] Indicateur de progression (versets mémorisés)
- [ ] Accès rapide aux favoris

**Priorité** : P0  
**Effort** : M (5 points)  
**Dépendances** : Database query optimization

---

#### **US-005 : Planification apprentissage**
**En tant que** utilisateur  
**Je veux** planifier mes sessions d'apprentissage  
**Afin de** progresser régulièrement

**Critères d'acceptation** :
- [ ] Définir objectif quotidien (X versets)
- [ ] Mode "Journée" : Nouveaux versets + Révision
- [ ] Rappels notifications (optionnel)
- [ ] Calendrier de progression
- [ ] Streak tracking

**Priorité** : P0  
**Effort** : L (8 points)  
**Dépendances** : Notification system

---

### 🟡 **P1 - IMPORTANT**

#### **US-006 : Stats détaillées**
**En tant que** utilisateur  
**Je veux** voir mes statistiques détaillées  
**Afin de** suivre ma progression

**Critères d'acceptation** :
- [ ] Graphique progression temporelle
- [ ] Taux de réussite par sourate
- [ ] Temps moyen par verset
- [ ] Courbe de mémorisation (SM-2)
- [ ] Export données (CSV/PDF)

**Priorité** : P1  
**Effort** : M (5 points)

---

#### **US-007 : Mode Focus (Pomodoro)**
**En tant que** utilisateur  
**Je veux** un mode focus avec timer  
**Afin de** rester concentré pendant ma révision

**Critères d'acceptation** :
- [ ] Timer configurable (5-60 min)
- [ ] Session break reminders
- [ ] Stats temps concentré
- [ ] Mode "Ne pas déranger"
- [ ] Sons ambiance (optionnel)

**Priorité** : P1  
**Effort** : S (3 points)

---

#### **US-008 : Favoris et collections**
**En tant que** utilisateur  
**Je veux** créer des collections personnalisées  
**Afin de** réviser des versets spécifiques

**Critères d'acceptation** :
- [ ] Marquer versets comme favoris
- [ ] Créer collections personnalisées
- [ ] Ajouter tags (ex: "Difficile", "Prophètes")
- [ ] Réviser par collection
- [ ] Partager collection (export)

**Priorité** : P1  
**Effort** : M (5 points)

---

### 🟢 **P2 - NICE-TO-HAVE**

#### **US-009 : Tajweed rules intégrées**
**En tant que** utilisateur  
**Je veux** apprendre les règles de tajwid  
**Afin de** améliorer ma récitation

**Critères d'acceptation** :
- [ ] Légende des couleurs (bleu = ghunna, etc.)
- [ ] Tutoriel interactif règles tajwid
- [ ] Quiz tajwid
- [ ] Exemples audio pour chaque règle
- [ ] Mode "Practice tajwid"

**Priorité** : P2  
**Effort** : L (8 points)

---

#### **US-010 : Multi-récitateur**
**En tant que** utilisateur  
**Je veux** choisir parmi plusieurs récitateurs  
**Afin de** varier les styles de récitation

**Critères d'acceptation** :
- [ ] Liste récitateurs (Al-Afasy, Sudais, Husary, etc.)
- [ ] Prévisualisation audio
- [ ] Téléchargement offline
- [ ] Gestion espace stockage
- [ ] Favoris récitateur

**Priorité** : P2  
**Effort** : M (5 points)

---

#### **US-011 : Traductions multiples**
**En tant que** utilisateur  
**Je veux** voir plusieurs traductions  
**Afin de** mieux comprendre le sens

**Critères d'acceptation** :
- [ ] Choix traduction (FR: Hamidullah, EN: Yusuf Ali, etc.)
- [ ] Affichage parallèle (AR + FR + EN)
- [ ] Mode comparaison
- [ ] Tafsir intégré (optionnel)

**Priorité** : P2  
**Effort** : M (5 points)

---

### ⚪ **P3 - FUTURE**

#### **US-012 : Gamification avancée**
**En tant que** utilisateur  
**Je veux** des badges et récompenses  
**Afin de** rester motivé

**Critères d'acceptation** :
- [ ] 20+ achievements (First Surah, Week Warrior, etc.)
- [ ] Niveaux (Débutant → Hafiz)
- [ ] Classement (optionnel, anonyme)
- [ ] Challenges hebdomadaires
- [ ] Partage achievements

**Priorité** : P3  
**Effort** : L (8 points)

---

#### **US-013 : Social features**
**En tant que** utilisateur  
**Je veux** partager ma progression  
**Afin de** motiver mes proches

**Critères d'acceptation** :
- [ ] Partager stats (image)
- [ ] Groupes d'étude
- [ ] Competitions amicales
- [ ] Messages d'encouragement
- [ ] Leaderboard privé

**Priorité** : P3  
**Effort** : XL (13 points)

---

#### **US-014 : IA Feedback**
**En tant que** utilisateur  
**Je veux** un feedback sur ma récitation  
**Afin de** corriger mes erreurs

**Critères d'acceptation** :
- [ ] Enregistrement vocal
- [ ] Analyse tajwid automatique
- [ ] Détection erreurs prononciation
- [ ] Suggestions d'amélioration
- [ ] Historique progression

**Priorité** : P3  
**Effort** : XL (13 points)

---

#### **US-015 : Mode hors-ligne complet**
**En tant que** utilisateur  
**Je veux** utiliser l'app 100% offline  
**Afin de** réviser n'importe où

**Critères d'acceptation** :
- [ ] Télécharger toutes les données au setup
- [ ] Gestion stockage intelligent
- [ ] Sync quand online
- [ ] Indicateur "Offline ready"
- [ ] Mode économie données

**Priorité** : P3  
**Effort** : M (5 points)

---

## 📊 ROADMAP SUGGÉRÉE

### **v1.2 (Actuelle)** ✅
- US-001 : Onglet Coran
- US-002 : Révision Tarteel
- US-003 : Audio corrigé

### **v1.3 (Sprint 6)**
- US-004 : Sélection sourate intuitive
- US-005 : Planification apprentissage

### **v1.4 (Sprint 7)**
- US-006 : Stats détaillées
- US-007 : Mode Focus
- US-008 : Favoris et collections

### **v1.5 (Sprint 8)**
- US-009 : Tajweed rules
- US-010 : Multi-récitateur
- US-011 : Traductions multiples

### **v2.0 (Future)**
- US-012 : Gamification avancée
- US-013 : Social features
- US-014 : IA Feedback
- US-015 : Mode hors-ligne complet

---

## 📈 PRIORISATION

### **Critères de priorisation** :
1. **Valeur utilisateur** : Impact sur l'expérience
2. **Effort** : Temps de développement
3. **Dépendances** : Besoin d'autres features
4. **Risque** : Complexité technique

### **Matrice Effort/Valeur** :

```
         HAUTE VALEUR
              ↑
    P0        │        P1
  (Quick      │     (Important
   Wins)      │      Features)
──────────────┼──────────────→
    P2        │        P3
  (Nice to    │     (Future
   Have)      │      Features)
              ↓
         BASSE VALEUR
```

---

## 🎯 PROCHAINES ACTIONS

### **Immédiat (Cette semaine)** :
1. ✅ Tester v1.2 (APK)
2. ✅ Valider US-001, US-002, US-003
3. [ ] Collecter feedback utilisateur

### **Court terme (Semaine prochaine)** :
1. [ ] Implémenter US-004 (Sélection sourate)
2. [ ] Implémenter US-005 (Planification)
3. [ ] Préparer release v1.3

### **Moyen terme (2-4 semaines)** :
1. [ ] Stats détaillées (US-006)
2. [ ] Mode Focus (US-007)
3. [ ] Favoris (US-008)

---

**Total US** : 15  
**US terminées** : 3 (20%)  
**US en cours** : 0  
**US à faire** : 12 (80%)

**Estimation totale** : ~75 points  
**Points réalisés** : 13 points (17%)

---

*Dernière mise à jour : 14/03/2026*
