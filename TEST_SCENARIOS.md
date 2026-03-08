# Test Scenarios Checklist - Al-Muallim v1.1

## Quick Reference for Manual Testing

---

## 🎯 Phase 1: Critical Path (Do First)

### Smoke Test - 5 Minutes
**Must pass before any other testing**

- [ ] **App Launch**
  - [ ] iOS Simulator: App opens without crash
  - [ ] Android Emulator: App opens without crash
  - [ ] Launch time < 2 seconds

- [ ] **Core Navigation**
  - [ ] Dashboard tab loads
  - [ ] Review tab loads
  - [ ] Settings tab loads
  - [ ] Tab switching smooth

- [ ] **Data Persistence**
  - [ ] Kill app → restart → data still there
  - [ ] Complete review → stats update

---

## 📱 Phase 2: Core Features (Day 1)

### A. Review System

#### A1. Daily Review Flow
```
Test: Complete today's review
- [ ] 0 verses → "No reviews today" message
- [ ] 1 verse → Review completes
- [ ] 10 verses → All complete
- [ ] Quality buttons work (Easy/Medium/Hard)
- [ ] Progress counter updates
- [ ] Stats update in dashboard
```

#### A2. Audio in Review
```
Test: Audio playback during review
- [ ] Play button loads audio < 2s
- [ ] Pause/Resume works
- [ ] Speed change works (0.75x, 1x, 1.25x)
- [ ] Repeat works (1x, 3x, 5x)
- [ ] Audio stops on next verse
- [ ] Offline audio works (after download)
```

#### A3. SRS Algorithm
```
Test: Verify SM-2 scheduling
- [ ] New verse → review tomorrow
- [ ] Easy review → interval increases
- [ ] Hard review → interval decreases
- [ ] Track 5 verses over 3 days
- [ ] Verify intervals match SM-2 formula
```

### B. Dashboard

#### B1. Stats Accuracy
```
Test: Complete 5 reviews, check stats
- [ ] Streak shows 1 day
- [ ] Mastered count correct
- [ ] Learning count correct
- [ ] Retention rate accurate
- [ ] Juz progress bars match
```

#### B2. Streak Tracking
```
Test: Use app 3 consecutive days
- [ ] Day 1: Streak = 1
- [ ] Day 2: Streak = 2
- [ ] Day 3: Streak = 3
- [ ] Miss day: Streak = 0
- [ ] Return: Streak = 1
```

### C. Settings

#### C1. Save & Persistence
```
Test: Change all settings
- [ ] Change learning mode
- [ ] Change daily verses
- [ ] Change session duration
- [ ] Navigate away → return
- [ ] All changes saved
- [ ] Restart app → settings persist
```

#### C2. Learning Modes
```
Test: Each mode behavior
- [ ] Active: New verses + reviews
- [ ] Revision Only: Only due reviews
- [ ] Paused: No activity
```

---

## 🎤 Phase 3: Recitation Features (Day 2-3)

### D. Surah Selection

#### D1. Browse & Search
```
Test: Find surahs
- [ ] All 114 surahs visible
- [ ] Search "Al-Fatiha" (AR) → found
- [ ] Search "L'ouverture" (FR) → found
- [ ] Search "The Opening" (EN) → found
- [ ] Filter by Juz 1 → correct surahs
- [ ] Sort by progress → correct order
```

### E. Mode Test (Progressive Reveal)

#### E1. Hint System
```
Test: Progressive reveal on Al-Fatiha 1:1
- [ ] Initial: Verse hidden
- [ ] Hint 1: First word shows
- [ ] Hint 2: First 3 words show
- [ ] Hint 3: Half verse shows
- [ ] Reveal All: Full verse shows
- [ ] Animations smooth
```

#### E2. Self-Evaluation
```
Test: Evaluate verse
- [ ] ✓ Perfect: Marks as perfect
- [ ] ✓ Good: Marks as good
- [ ] ⟲ Needs Work: Marks as needs work
- [ ] ✗ Failed: Marks as failed
- [ ] Stats reflect choice
```

#### E3. Complete Surah
```
Test: Complete Al-Fatiha in Test mode
- [ ] All 7 verses accessible
- [ ] Can navigate back/forward
- [ ] Can use hints on each
- [ ] Can evaluate each
- [ ] Completion message shows
- [ ] Progress saved
```

### F. Mode Learning

#### F1. Full Verse Display
```
Test: Learning mode features
- [ ] Full verse visible
- [ ] Translation toggle works
- [ ] Transliteration toggle works
- [ ] Tajweed colors show
```

#### F2. Audio Controls
```
Test: Audio in Learning mode
- [ ] Play/Pause/Stop work
- [ ] Speed 0.5x, 0.75x, 1x, 1.25x, 1.5x
- [ ] Repeat 1x, 3x, 5x, ∞
- [ ] Auto-next option works
```

#### F3. Word Analysis
```
Test: Tap word → see details
- [ ] Tap any word
- [ ] Card shows with:
  - [ ] Translation
  - [ ] Transliteration
  - [ ] Grammar info
  - [ ] Audio pronunciation
  - [ ] Add to vocab button
```

### G. Mode Flow

#### G1. Continuous Playback
```
Test: Auto-scroll mode
- [ ] Enable auto-scroll
- [ ] Verses advance automatically
- [ ] Smooth scrolling
- [ ] Pause auto-scroll works
- [ ] Manual scroll works
- [ ] Tap verse → jump to it
```

#### G2. Bookmark & Resume
```
Test: Position persistence
- [ ] Bookmark verse 5
- [ ] Exit surah
- [ ] Re-enter surah
- [ ] Position restored to verse 5
```

### H. Mode Hifz

#### H1. Progressive Unlock
```
Test: Memorization mode
- [ ] Set show first 5 verses
- [ ] Verses 1-5 visible, rest hidden
- [ ] Complete 1-5
- [ ] Unlock 6-10
- [ ] Continue progressively
```

### I. Mistake Tracking

#### I1. Mark Mistakes
```
Test: Error tracking
- [ ] Tap word → mark mistake
- [ ] Choose type (wrong/missing/extra)
- [ ] Mistake shows in UI
- [ ] Complete verse → summary shows
- [ ] Dashboard reflects errors
```

---

## 🎮 Phase 4: Gamification (Day 3)

### J. Goals

#### J1. Set & Track Goals
```
Test: Goal system
- [ ] Set 10 verses/day
- [ ] Complete 5 → 50% shows
- [ ] Complete 10 → 100% + celebration
- [ ] Stats update
- [ ] Streak increments
```

### K. Achievements

#### K1. Unlock Badges
```
Test: Achievement triggers
- [ ] Complete 1st verse → "First Verse" badge
- [ ] 7-day streak → "Week Warrior" badge
- [ ] Complete surah → "Surah Master" badge
- [ ] Badges show in profile
- [ ] Notification shows
```

---

## 🔌 Phase 5: Offline & Edge Cases (Day 4)

### L. Offline Mode

#### L1. Full Offline Test
```
Test: Airplane mode
- [ ] Enable airplane mode
- [ ] Kill app
- [ ] Launch app
- [ ] Complete review ✓
- [ ] View dashboard ✓
- [ ] Recite surah ✓
- [ ] Change settings ✓
- [ ] 100% functional offline
```

#### L2. Data Persistence
```
Test: Data survives restart
- [ ] Complete 5 reviews
- [ ] Force kill app
- [ ] Restart device
- [ ] Launch app
- [ ] All 5 reviews saved
- [ ] Stats intact
```

### M. Edge Cases

#### M1. Empty State
```
Test: Fresh install
- [ ] Uninstall app
- [ ] Reinstall
- [ ] Launch
- [ ] Friendly empty messages
- [ ] No crashes
- [ ] Guidance shows
```

#### M2. Large Data
```
Test: 1000+ reviews
- [ ] Seed 1000 reviews
- [ ] Navigate app
- [ ] Performance acceptable
- [ ] Queries < 500ms
- [ ] UI responsive
```

#### M3. Network Issues
```
Test: Network interruption
- [ ] Start audio download
- [ ] Cut network mid-download
- [ ] Error message shows
- [ ] Re-enable network
- [ ] Retry works
```

#### M4. Low Storage
```
Test: Storage warnings
- [ ] Fill device (simulate)
- [ ] Try download audio
- [ ] Warning shows
- [ ] App doesn't crash
```

---

## ⚡ Phase 6: Performance (Day 4)

### N. Speed Tests

#### N1. Launch Time
```
Test: Cold start
- [ ] Kill app
- [ ] Launch
- [ ] Time to interactive
- [ ] iPhone 15 Pro: < 1s
- [ ] iPhone SE: < 2s
- [ ] Pixel 7: < 1.5s
```

#### N2. Screen Transitions
```
Test: Navigation speed
- [ ] Tab switch: < 300ms
- [ ] Modal open: < 150ms
- [ ] Verse transition: < 100ms
- [ ] All smooth 60fps
```

#### N3. Audio Load
```
Test: Audio start time
- [ ] Cached: < 1s
- [ ] WiFi: < 2s
- [ ] 4G: < 3s
- [ ] 3G: < 5s
```

### O. Memory & Battery

#### O1. Memory Usage
```
Test: RAM consumption
- [ ] Launch: < 100MB
- [ ] 30min use: < 200MB
- [ ] Peak: < 300MB
- [ ] No leaks after 1 hour
```

#### O2. Battery Drain
```
Test: Power consumption
- [ ] 30min usage
- [ ] Battery drain < 5%
- [ ] Background drain minimal
```

---

## 🔒 Phase 7: Security & Accessibility (Day 5)

### P. Privacy

#### P1. Data Security
```
Test: Data stays local
- [ ] Check network traffic
- [ ] 0 external requests (offline app)
- [ ] All data in SQLite
- [ ] No sensitive data in logs
```

### Q. Accessibility

#### Q1. Screen Reader
```
Test: VoiceOver/TalkBack
- [ ] Enable screen reader
- [ ] All buttons read
- [ ] Text reads correctly
- [ ] Navigation logical
```

#### Q2. Large Text
```
Test: Dynamic Type
- [ ] Set max font size
- [ ] All text readable
- [ ] Layout doesn't break
- [ ] No content cut off
```

---

## 📊 Test Summary

### Pass/Fail Tracking

```
Feature              | iOS | Android | Notes
---------------------|-----|---------|-------
Smoke Test           | [ ] | [ ]     |
Review System        | [ ] | [ ]     |
Dashboard            | [ ] | [ ]     |
Settings             | [ ] | [ ]     |
Recitation Modes     | [ ] | [ ]     |
Voice Recording      | [ ] | [ ]     |
Word Analysis        | [ ] | [ ]     |
Gamification         | [ ] | [ ]     |
Offline Mode         | [ ] | [ ]     |
Performance          | [ ] | [ ]     |
Security             | [ ] | [ ]     |
Accessibility        | [ ] | [ ]     |
```

### Critical Issues Found

```
# | Priority | Description | Status
--|----------|-------------|--------
1 | P0/P1    |             | [ ]
2 | P0/P1    |             | [ ]
3 | P1/P2    |             | [ ]
```

---

## 🚀 Release Readiness

### Final Checklist

- [ ] All P0 issues resolved
- [ ] All P1 issues resolved
- [ ] Smoke test passes (iOS + Android)
- [ ] Core features work offline
- [ ] Performance acceptable
- [ ] No critical bugs
- [ ] Data persists correctly
- [ ] Store assets ready

### Sign-off

**Tester:** _______________
**Date:** _______________
**Build:** _______________
**Ready for Beta:** [ ] Yes [ ] No
**Ready for Prod:** [ ] Yes [ ] No

---

**Print this checklist for manual testing**
