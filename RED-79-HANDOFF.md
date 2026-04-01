# RED-79: Design Handoff Document

**Designer:** Leo 🎨  
**Date:** April 1, 2026  
**Status:** Ready for Development  

---

## 📋 Overview

Interactive tajweed tutorial system for Al-Muallim mobile app. This document provides a comprehensive handoff from design to development.

### Design Files

All design specifications are located in the project workspace:

1. **RED-79-TAJWEED-TUTORIAL-DESIGN.md** - Complete design documentation
2. **RED-79-COMPONENT-SPECS.md** - Component specifications with TypeScript
3. **RED-79-WIREFRAMES.md** - Detailed wireframes for all screens
4. **RED-79-DESIGN-SYSTEM.md** - Visual design tokens and specifications

---

## 🎯 Design Goals

✅ **Interactive UI** for learning tajweed rules  
✅ **Visual examples** with Quranic text  
✅ **Progress tracking** visible to user  
✅ **5-8 key tajweed rules** (implemented: 7 rules)  
✅ **Mobile-responsive** design (375px - 428px)  
✅ **Dark mode** support  
✅ **RTL support** for Arabic text  
✅ **Consistent** with app's existing UI/UX  

---

## 📱 Screens to Implement

### 1. Tutorial Home Screen
- **File:** `src/screens/tajweed/TajweedTutorialHome.tsx`
- **Purpose:** Entry point showing all tajweed rules with progress
- **Wireframe:** See RED-79-WIREFRAMES.md → Screen 1
- **Components:** TajweedRuleCard, ProgressBar, HeroSection

### 2. Rule Detail Screen
- **File:** `src/screens/tajweed/TajweedRuleDetail.tsx`
- **Purpose:** Detailed explanation of a single tajweed rule
- **Wireframe:** See RED-79-WIREFRAMES.md → Screen 2
- **Components:** QuranicTextHighlight, AudioButton, DefinitionCard

### 3. Practice Screen
- **File:** `src/screens/tajweed/TajweedPractice.tsx`
- **Purpose:** Interactive practice with immediate feedback
- **Wireframe:** See RED-79-WIREFRAMES.md → Screen 3
- **Components:** WordSelectorButton, FeedbackBanner, QuranicTextHighlight

### 4. Progress Screen
- **File:** `src/screens/tajweed/TajweedProgress.tsx`
- **Purpose:** Track and celebrate learning progress
- **Wireframe:** See RED-79-WIREFRAMES.md → Screen 4
- **Components:** AchievementCard, StatsCard, ActivityFeed

---

## 🧩 Core Components

### Components to Create

All components should be created in: `src/components/tajweed/`

1. **TajweedRuleCard** - Rule card with progress
2. **QuranicTextHighlight** - Arabic text with tajweed colors
3. **WordSelectorButton** - Interactive word selection
4. **FeedbackBanner** - Success/error feedback
5. **ProgressBar** - Visual progress indicator
6. **AudioButton** - Audio playback control
7. **AchievementCard** - Achievement celebration
8. **StatsCard** - Statistics display

**Full specs:** See RED-79-COMPONENT-SPECS.md

---

## 🎨 Design System

### Colors

**Tajweed Rule Colors:**
- Ghunnah: `#2196F3` (Blue)
- Madd: `#4CAF50` (Green)
- Qalqala: `#FF9800` (Orange)
- Idgham: `#9C27B0` (Purple)
- Ikhfa: `#00BCD4` (Cyan)
- Iqlab: `#E91E63` (Pink)
- Waqf: `#FF5722` (Deep Orange)

**Semantic Colors:**
- Success: `#10B981`
- Warning: `#FF9800`
- Error: `#EF4444`
- Info: `#3B82F6`

**Full color system:** See RED-79-DESIGN-SYSTEM.md → Color System

### Typography

**Arabic Text:**
- Font: Amiri
- Size: 28px (medium), 32px (large)
- Line height: 48px

**UI Text:**
- Heading: 20px, semibold
- Body: 16px, regular
- Caption: 14px, regular
- Small: 12px, regular

**Full typography:** See RED-79-DESIGN-SYSTEM.md → Typography

### Spacing

**Base unit:** 16px

```
xs:  4px   |  sm:  8px   |  md: 16px
lg: 24px   |  xl: 32px   |  xxl: 48px
```

**Border radius:** 12px (cards), 8px (buttons)

**Full spacing system:** See RED-79-DESIGN-SYSTEM.md → Spacing System

---

## 🔧 Technical Implementation

### Navigation

Add to `App.tsx` navigation:

```typescript
<Tab.Screen
  name="TajweedTutorial"
  component={TajweedStack}
  options={{
    title: 'Tajweed',
    tabBarIcon: ({ color }) => (
      <Text style={{ fontSize: 20, color }}>🎓</Text>
    ),
  }}
/>
```

Or add to Dashboard as quick action.

### State Management

**Create:** `src/stores/tajweedStore.ts`

```typescript
interface TajweedStore {
  // State
  rules: TajweedRule[];
  progress: { [ruleId: string]: RuleProgress };
  currentLesson: string | null;
  
  // Actions
  loadRules: () => Promise<void>;
  updateProgress: (ruleId: string, lessonId: string, completed: boolean) => void;
  getCurrentLesson: (ruleId: string) => Lesson | null;
}
```

### Data Models

**File:** `src/types/tajweed.ts`

```typescript
interface TajweedRule {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'explanation' | 'practice';
  content: LessonContent;
}

interface LessonContent {
  definition?: string;
  rules?: string[];
  examples: Example[];
}

interface Example {
  text: string;
  translation: string;
  highlight: { start: number; end: number; type: string }[];
  audioUri?: string;
}
```

### Audio Integration

Use existing audio infrastructure from `src/services/audio.ts`

```typescript
// Play tajweed example audio
const playTajweedExample = async (audioUri: string) => {
  const sound = new Audio.Sound();
  await sound.loadAsync({ uri: audioUri });
  await sound.playAsync();
};
```

---

## 📊 Data Requirements

### Tajweed Rules Data

**File:** `src/utils/tajweedRules.ts`

Pre-populate with 7 tajweed rules:
1. Ghunnah (Nasalization)
2. Madd (Elongation)
3. Qalqala (Bouncing)
4. Idgham (Merging)
5. Ikhfa (Hiding)
6. Iqlab (Conversion)
7. Waqf (Stopping)

Each rule needs:
- 3-5 explanation lessons
- 10+ practice examples
- Audio files for pronunciation
- Quranic verses with highlighting

### Progress Tracking

Store in SQLite database:

```sql
CREATE TABLE tajweed_progress (
  id INTEGER PRIMARY KEY,
  rule_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES tajweed_rules(id)
);
```

---

## 🎬 Animations

### Required Animations

1. **Progress Bar Fill** - Smooth fill animation (500ms)
2. **Success Pulse** - Pulse effect on correct answer
3. **Card Fade In** - Fade in when appearing (300ms)
4. **Confetti** - Celebration on achievement unlock
5. **Button Press** - Scale down on press (100ms)

**Full specs:** See RED-79-DESIGN-SYSTEM.md → Animation Specifications

### Animation Libraries

Use React Native Animated API or React Native Reanimated

---

## 🧪 Testing Requirements

### Unit Tests

- [ ] Component rendering tests
- [ ] Progress calculation tests
- [ ] Tajweed highlighting logic tests
- [ ] Audio playback tests

### Integration Tests

- [ ] Navigation flow tests
- [ ] Progress persistence tests
- [ ] Audio playback across screens
- [ ] Dark mode switching

### E2E Tests

- [ ] Complete tutorial flow
- [ ] Practice session completion
- [ ] Achievement unlocking
- [ ] Progress tracking

### Accessibility Tests

- [ ] Screen reader compatibility
- [ ] Touch target sizes (44x44px minimum)
- [ ] Color contrast ratios (4.5:1 minimum)
- [ ] Focus indicators

---

## 📝 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create tajweed types and interfaces
- [ ] Set up tajweed store
- [ ] Create base components (Card, Button, ProgressBar)
- [ ] Implement QuranicTextHighlight component

### Phase 2: Core Screens (Week 2)
- [ ] Implement Tutorial Home screen
- [ ] Implement Rule Detail screen
- [ ] Create tajweed rules data
- [ ] Add navigation

### Phase 3: Interactive Features (Week 3)
- [ ] Implement Practice screen
- [ ] Create WordSelectorButton component
- [ ] Implement FeedbackBanner
- [ ] Add audio integration

### Phase 4: Progress & Polish (Week 4)
- [ ] Implement Progress screen
- [ ] Add achievement system
- [ ] Implement animations
- [ ] Dark mode support
- [ ] RTL support

### Phase 5: Testing & QA (Week 5)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Bug fixes

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All screens implemented
- [ ] All components created
- [ ] All animations working
- [ ] Audio files integrated
- [ ] Tests passing
- [ ] Accessibility verified
- [ ] Dark mode working
- [ ] RTL layout correct
- [ ] Performance optimized
- [ ] No critical bugs

### Launch Day
- [ ] Deploy to production
- [ ] Monitor crash reports
- [ ] Monitor user engagement
- [ ] Gather user feedback
- [ ] Prepare for iteration

---

## 📚 Resources

### Design Files
- RED-79-TAJWEED-TUTORIAL-DESIGN.md - Main design doc
- RED-79-COMPONENT-SPECS.md - Component specifications
- RED-79-WIREFRAMES.md - Wireframes
- RED-79-DESIGN-SYSTEM.md - Design tokens

### External Resources
- [Tajweed Rules Reference](https://quran.com/tajweed)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Animated API](https://reactnative.dev/docs/animated)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Existing Code References
- Theme system: `src/context/ThemeContext.tsx`
- Font sizes: `src/context/FontSizeContext.tsx`
- Audio player: `src/components/AudioPlayer.tsx`
- Quran screen: `src/screens/QuranScreen.tsx`

---

## 👥 Contacts

**Designer:** Leo 🎨  
**Project:** Al-Muallim Mobile  
**Issue:** RED-79  

---

## 📈 Success Metrics

### User Engagement
- Tutorial completion rate > 70%
- Average practice score > 80%
- Return to practice > 3x per week
- Time spent in tutorial > 5 minutes

### Learning Outcomes
- Correct identification rate > 85%
- Rule retention after 7 days > 75%
- User self-reported improvement > 90%

### App Quality
- Screen load time < 1 second
- Audio playback start < 500ms
- Zero critical bugs
- Accessibility score 100%
- User satisfaction > 4.5/5

---

## 🎉 Conclusion

This design provides a complete, interactive tajweed tutorial system that:
- ✅ Fits seamlessly into the existing Al-Muallim app
- ✅ Provides engaging, interactive learning experiences
- ✅ Tracks progress and motivates users
- ✅ Supports both light and dark modes
- ✅ Is accessible to all users
- ✅ Is mobile-first and responsive

All design specifications, wireframes, and component specs are ready for implementation. The development team can now begin building the feature using this comprehensive design handoff.

**Let's make tajweed learning fun and accessible for everyone! 🎓✨**

---

**Document Version:** 1.0  
**Last Updated:** April 1, 2026  
**Designer:** Leo 🎨  
**Status:** ✅ Ready for Development
