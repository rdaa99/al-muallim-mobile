# Bug Tracker - Al-Muallim v1.1

## Template de Rapport

```markdown
## Bug #[NUMBER]

**Titre:** [Description courte]
**Priorité:** P0 / P1 / P2 / P3
**Platform:** iOS / Android / Both
**Date:** YYYY-MM-DD

**Description:**
[Description détaillée du bug]

**Étapes pour reproduire:**
1. 
2. 
3. 

**Comportement attendu:**
[Ce qui devrait se passer]

**Comportement actuel:**
[Ce qui se passe]

**Environnement:**
- Device: [ex: iPhone 15 Pro]
- OS: [ex: iOS 17.2]
- App Version: [ex: 1.1.0]
- Network: [ex: WiFi]

**Screenshots/Videos:**
[Attach files]

**Logs:**
```
[Paste relevant logs]
```

**Status:** Open / In Progress / Fixed / Verified
**Assigned:** [Agent name]
**GitHub Issue:** [Link]
```

---

## Priority Definitions

### P0 - Critical (Blocker)
- App crash on launch
- Data loss
- Security vulnerability
- **Action:** Fix immediately, block release

### P1 - High
- Core feature broken
- Major UX issue
- Performance degradation
- **Action:** Fix before release

### P2 - Medium
- Feature partially broken
- Minor UX issue
- Workaround available
- **Action:** Fix in next sprint

### P3 - Low
- Cosmetic issue
- Nice to have improvement
- **Action:** Backlog

---

## Active Bugs

### Bug #001 - [Example]

**Titre:** App crash on Android when playing audio
**Priorité:** P1
**Platform:** Android
**Date:** 2026-03-08

**Description:**
App crashes after tapping play button on audio player. Crash happens on Android 12+, not on Android 11.

**Étapes:**
1. Open app
2. Go to Review tab
3. Tap play audio
4. Crash

**Comportement attendu:** Audio plays
**Comportement actuel:** App crashes

**Environnement:**
- Device: Pixel 7
- OS: Android 14
- App Version: 1.1.0
- Network: WiFi

**Status:** Open
**Assigned:** David (dev-fullstack-agent)
**GitHub Issue:** #45

---

## Bug Log

| # | Title | Priority | Platform | Status | Date |
|---|-------|----------|----------|--------|------|
| 001 | [Template] | P1 | Android | Open | 2026-03-08 |

---

## Testing Session Log

### Session 2026-03-08

**Tester:** Reda
**Duration:** 2 hours
**Build:** v1.1.0 (beta-1)
**Devices:**
- iPhone 15 Pro (iOS 17.2)
- Pixel 7 (Android 14)

**Tests Executed:**
- [ ] Smoke test
- [ ] Core features
- [ ] Recitation modes
- [ ] Offline mode
- [ ] Performance

**Bugs Found:** 0

**Notes:**
- App performs well on both platforms
- No major issues found
- Ready for beta testing

---

## Release Checklist

### v1.1.0 Beta Release

**Target Date:** 2026-04-15

**Critical (P0/P1) Bugs:**
- [ ] 0 open P0 bugs
- [ ] 0 open P1 bugs

**High Priority (P2) Bugs:**
- [ ] < 5 open P2 bugs
- [ ] All P2 bugs have fix date

**Performance:**
- [ ] Launch time < 2s
- [ ] No memory leaks
- [ ] Battery drain < 5%/hour

**Features:**
- [ ] All v1.1 features functional
- [ ] Offline mode 100%
- [ ] Data persistence works

**Store Readiness:**
- [ ] Screenshots captured
- [ ] App description written
- [ ] Privacy policy linked
- [ ] Version number correct

**Sign-off:**
- [ ] Reda tested and approved
- [ ] All P0/P1 resolved
- [ ] Ready for TestFlight / Play Console Beta

---

## Regression Testing

### Before Each Release

**Quick Regression (30 min):**
- [ ] Smoke test
- [ ] Review flow
- [ ] Audio playback
- [ ] Offline mode
- [ ] Settings save

**Full Regression (2 hours):**
- [ ] All features in TESTING.md
- [ ] All edge cases
- [ ] Performance tests
- [ ] Security tests
- [ ] Accessibility tests

---

## Bug Metrics

### Weekly Report

**Week of:** YYYY-MM-DD

**Bugs Found:** 0
**Bugs Fixed:** 0
**Bugs Open:** 0

**By Priority:**
- P0: 0
- P1: 0
- P2: 0
- P3: 0

**By Platform:**
- iOS: 0
- Android: 0
- Both: 0

**Bugs Aging:**
- < 1 week: 0
- 1-2 weeks: 0
- > 2 weeks: 0

---

## Bug Tracking Workflow

```
1. Find Bug
   ↓
2. Create Report (this file)
   ↓
3. Create GitHub Issue
   ↓
4. Assign to Agent
   ↓
5. Agent fixes
   ↓
6. Tester verifies
   ↓
7. Close Issue
   ↓
8. Update this file
```

---

## Common Issues & Solutions

### Audio Not Playing
**Cause:** Permission not granted or audio not downloaded
**Solution:** Check permissions, download audio first

### App Crashes on Launch
**Cause:** Corrupted data or missing dependencies
**Solution:** Clear app data, reinstall

### Stats Not Updating
**Cause:** Database not refreshing
**Solution:** Pull to refresh on Dashboard

### Offline Mode Fails
**Cause:** Audio not cached
**Solution:** Download audio while online

---

*Update this file after each testing session*
