# Al-Muallim - Roadmap

## Vision
Application mobile de mémorisation du Quran avec système de révision espacée (SRS), 100% offline.

---

## Architecture

```
┌─────────────────────────────────┐
│   App Mobile (React Native)     │
│   - TypeScript                  │
│   - React Navigation            │
│   - Zustand (State)             │
└───────────┬─────────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│   SQLite Local Database         │
│   - 6236 versets embarqués      │
│   - SRS SM-2 Algorithm          │
│   - Settings & Stats            │
└─────────────────────────────────┘
```

**100% Offline** - Pas de backend, pas de serveur, tout en local.

---

## Releases

### v1.0 - MVP (Current Sprint 2)
**Goal:** App fonctionnelle complète 100% offline

| Feature | Status | Issue |
|---------|--------|-------|
| Setup React Native + TS | ✅ Done | RED-46 |
| Review Screen | ✅ Done | RED-47 |
| Dashboard Screen | ✅ Done | RED-48 |
| Settings Screen | ✅ Done | RED-49 |
| Audio Player (Al-Afasy) | ✅ Done | RED-50 |
| SQLite Local Storage | 🚧 In Progress | RED-52 |

**Target:** Fin Mars 2026

### v1.1 - Tarteel-Style Features (Sprint 5-6)
**Goal:** Répliquer l'expérience Tarteel avec toutes ses features

**Sprint 5 (April 2026) - Core Features:**

| Issue | Feature | Priority | Estimation |
|-------|---------|----------|------------|
| RED-57 | Mode Récitation Libre (Tarteel-style) | P2 | 11-12 days |
| RED-59 | Word-by-Word Breakdown | P2 | 3-4 days |
| RED-60 | Goals & Gamification | P2 | 4-5 days |
| RED-61 | Mistake Tracking & Analysis | P2 | 3-4 days |

**Sprint 6 (May 2026) - Advanced Features:**

| Issue | Feature | Priority | Estimation |
|-------|---------|----------|------------|
| RED-58 | Voice Recording & AI Feedback | P2 | 5-7 days |
| RED-62 | Focus Mode & Custom Collections | P3 | 2-3 days |

**Additional Features:**

| Issue | Feature | Priority | Sprint |
|-------|---------|----------|--------|
| RED-53 | Notifications Rappel | P2 | Sprint 5-6 |
| RED-54 | Multi-Reciters | P2 | Sprint 5-6 |
| RED-55 | Tajweed Highlighting | P3 | Sprint 6-7 |
| RED-56 | Export/Import Data | P2 | Sprint 5-6 |
| RED-63 | Social & Community | P3 | Future (v1.2) |

**Total Estimation:** 35-45 days (7-9 weeks)

### v1.2 - Polish (Sprint 6)
**Goal:** UX améliorée et stabilité

- [ ] Animations fluides
- [ ] Haptic feedback
- [ ] Dark/Light theme toggle
- [ ] Performance optimization
- [ ] Crash reporting

**Target:** Mai 2026

### v2.0 - Sync (Optional)
**Goal:** Synchronisation cloud (si demandé)

- [ ] Backend API (Node.js + PostgreSQL)
- [ ] Auth (Clerk/Auth0)
- [ ] Multi-device sync
- [ ] Web app companion

**Target:** Future

---

## Sprints

### Sprint 1: MVP Mobile (08/03/2026) ✅
**Duration:** 1 day
**Status:** Complete

**Completed:**
- ✅ RED-46: Setup React Native + TypeScript
- ✅ RED-47: Review Screen with SRS
- ✅ RED-48: Dashboard with stats
- ✅ RED-49: Settings screen
- ✅ RED-50: Audio player integration

**Deliverable:** App mobile fonctionnelle avec API backend externe

**Issues:** https://github.com/rdaa99/al-muallim-mobile/issues

---

### Sprint 2: Local Architecture (08/03/2026) 🚧
**Duration:** 1-2 days
**Status:** In Progress

**In Progress:**
- 🚧 RED-52: SQLite Local Storage

**Goals:**
- [ ] Migrate from external API to local SQLite
- [ ] Embed 6236 verses in app
- [ ] 100% offline functionality
- [ ] Remove backend dependency

**Deliverable:** App 100% offline, prête pour beta testing

---

### Sprint 3: Beta Testing (Planned)
**Duration:** 1 week
**Status:** Not Started

**Goals:**
- [ ] Internal testing (Reda)
- [ ] Fix bugs from testing
- [ ] Performance optimization
- [ ] Prepare for App Store

**Target:** Week of 15/03/2026

---

### Sprint 4: Release v1.0 (Planned)
**Duration:** 1 week
**Status:** Not Started

**Goals:**
- [ ] Final QA
- [ ] App Store submission (iOS)
- [ ] Play Store submission (Android)
- [ ] Marketing materials

**Target:** Week of 22/03/2026

---

## Tech Stack

### Mobile App
```
React Native    0.76
TypeScript      5.6
Navigation      React Navigation 7
State           Zustand
Database        SQLite (react-native-quick-sqlite)
Audio           react-native-sound / expo-av
Theme           Dark mode (default)
```

### Development
```
Node.js         18+
Package Manager npm
Testing         Jest + React Native Testing Library
CI/CD           GitHub Actions (future)
```

---

## Key Decisions

### 2026-03-08: SQLite Local > Backend API
**Decision:** Migrate from external backend to local SQLite database.

**Rationale:**
- App is personal, no multi-user sync needed
- 100% offline is better UX
- Simpler architecture
- No server costs
- Data privacy (everything on device)

**Trade-offs:**
- ❌ No sync between devices
- ❌ No web companion (without future work)
- ✅ No internet required
- ✅ No server maintenance
- ✅ Faster app performance

### 2026-03-08: React Native > Flutter
**Decision:** Use React Native with TypeScript.

**Rationale:**
- Reda's expertise in React/TypeScript
- Easier to find contributors
- Can reuse logic from prototype web app
- Better TypeScript support

### 2026-03-08: Mobile-First Strategy
**Decision:** Build mobile app first, web later (if needed).

**Rationale:**
- Primary use case is on-the-go review
- Mobile has better engagement
- Can always add web later using same data model

---

## Metrics & Goals

### User Success Metrics
- Daily active usage (streak tracking)
- Verses memorized per week
- Retention rate (SRS effectiveness)
- Session completion rate

### Technical Metrics
- App launch time < 2s
- Screen transition < 300ms
- Audio load time < 1s
- Offline functionality 100%

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Audio CDN unavailable | High | Low | Cache audio files locally |
| SQLite performance issues | Medium | Low | Index optimization, pagination |
| App Store rejection | High | Low | Follow guidelines, test thoroughly |
| User data loss | High | Low | Implement backup/export feature |

---

## Links

- **GitHub Mobile:** https://github.com/rdaa99/al-muallim-mobile
- **GitHub Backend (archived):** https://github.com/rdaa99/al-muallim
- **Linear Team:** Reda Labs (RED)
- **Docs:** See `/docs` folder

---

*Last Updated: 2026-03-08*
*Version: 1.0*
