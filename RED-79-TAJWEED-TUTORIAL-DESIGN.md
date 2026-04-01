# RED-79: Interactive Tajweed Tutorial - Design Document

**Designer:** Leo 🎨  
**Date:** April 1, 2026  
**Status:** Design Complete  

---

## 📋 Overview

Interactive tutorial system for learning tajweed rules in Al-Muallim mobile app. Mobile-first design for iPhone/Android with visual examples using Quranic text.

### Design Goals
- ✅ Interactive UI for learning tajweed rules
- ✅ Visual examples with Quranic text
- ✅ Progress tracking visible to user
- ✅ 5-8 key tajweed rules
- ✅ Mobile-responsive design (375px - 428px width)
- ✅ Dark mode support
- ✅ RTL support for Arabic text
- ✅ Consistent with app's existing UI/UX

---

## 🎨 Design System

### Colors (Tajweed-Specific)

**Light Mode:**
```typescript
const tajweedColors = {
  // Rule colors (matching existing app)
  ghunnah: '#2196F3',     // Blue - nasal sounds
  madd: '#4CAF50',        // Green - elongation
  qalqala: '#FF9800',     // Orange - bouncing
  idgham: '#9C27B0',      // Purple - merging
  ikhfa: '#00BCD4',       // Cyan - hiding
  iqlab: '#E91E63',       // Pink - conversion
  waqf: '#FF5722',        // Deep Orange - stopping
  
  // UI colors (from existing theme)
  primary: '#10B981',     // App primary
  success: '#10B981',     // Completed
  warning: '#FF9800',     // In progress
  info: '#3B82F6',        // Information
}
```

**Dark Mode:**
Same colors with adjusted contrast for readability on dark backgrounds.

### Typography
```typescript
const typography = {
  // Arabic text (existing app uses system fonts)
  quran: {
    family: 'Amiri', // or 'Scheherazade New'
    size: 28, // Base size for Arabic text
    lineHeight: 48,
  },
  
  // UI text (existing app fonts)
  heading: 20,
  body: 16,
  caption: 14,
  small: 12,
}
```

### Spacing & Layout
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,  // Standard card padding
  lg: 24,
  xl: 32,
  
  // Border radius
  cardRadius: 12,  // Consistent with existing cards
  buttonRadius: 8,
  pillRadius: 20,
}
```

---

## 📱 Screen Designs

### 1. Tutorial Home Screen (TajweedTutorialHome)

**Purpose:** Entry point for tajweed learning, shows all available rules with progress

**Layout:**
```
┌─────────────────────────────────┐
│ ← Tajweed Rules          [?]   │ ← Header
├─────────────────────────────────┤
│                                 │
│ 📚 Master the Art of Tajweed  │ ← Hero section
│ Learn proper Quran recitation  │
│                                 │
├─────────────────────────────────┤
│ Overall Progress                │
│ ████████░░░░ 60% Complete      │ ← Progress bar
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🟢 Ghunnah           ✓ 100% ││ ← Rule cards
│ │ Nasalization with noon/meem ││
│ │ 5/5 lessons completed       ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🟣 Idgham            ◐  50% ││
│ │ Merging letters together    ││
│ │ 2/4 lessons completed       ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🔵 Ikhfa              ○   0%││
│ │ Hiding the pronunciation    ││
│ │ Not started                 ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🟢 Madd              ✓ 100% ││
│ │ Elongation of sounds        ││
│ │ 3/3 lessons completed       ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🟠 Qalqala           ◐  33% ││
│ │ Bouncing letters            ││
│ │ 1/3 lessons completed       ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🩵 Iqlab             ○   0% ││
│ │ Converting noon to ba       ││
│ │ Not started                 ││
│ └─────────────────────────────┘│
│                                 │
│ [Start Practice Session]        │ ← CTA button
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **Header:** Back button, title, help icon
- **HeroSection:** Motivational text with icon
- **OverallProgressBar:** Horizontal progress bar showing total completion
- **RuleCardList:** Scrollable list of rule cards
- **RuleCard:** Individual card for each tajweed rule
- **CTAButton:** Start practice session

**States:**
- **Not started:** Gray icon, "Not started" label, 0%
- **In progress:** Colored icon, progress percentage, lessons count
- **Completed:** Green checkmark, "Completed" label, 100%

---

### 2. Rule Explanation Screen (TajweedRuleDetail)

**Purpose:** Detailed explanation of a single tajweed rule with examples

**Layout:**
```
┌─────────────────────────────────┐
│ ← Ghunnah (Nasalization)       │ ← Header
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🟢 What is Ghunnah?        ││ ← Definition card
│ │                             ││
│ │ Ghunnah is a nasal sound    ││
│ │ that comes from the nose    ││
│ │ cavity, lasting for 2       ││
│ │ counts (harakah).           ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ When to apply?              ││ ← Rules card
│ │                             ││
│ │ • When ن (noon) has shadda  ││
│ │ • When م (meem) has shadda  ││
│ │ • Duration: 2 harakah       ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Visual Example              ││ ← Example card
│ │                             ││
│ │     النّاس                   ││ ← Large Arabic text
│ │        ↑                     ││
│ │   Ghunnah here               ││
│ │                             ││
│ │ [🔊 Listen] [▶ Practice]    ││ ← Action buttons
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ More Examples               ││ ← Examples list
│ │                             ││
│ │ 1. الجنّة   (Al-Jannah)     ││
│ │ 2. الجنّة   (Al-Jannah)     ││
│ │ 3. أمّهم   (Ummuhum)        ││
│ └─────────────────────────────┘│
│                                 │
│ [Previous]  [Next: Practice]   │ ← Navigation
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **RuleHeader:** Back button, rule name, progress indicator
- **DefinitionCard:** Explanation of the rule
- **RulesCard:** When and how to apply
- **VisualExampleCard:** Large Quranic text with highlighting
- **AudioButton:** Listen to correct pronunciation
- **PracticeButton:** Navigate to practice screen
- **ExamplesList:** Additional examples with highlights
- **NavigationButtons:** Previous/Next

**Interactive Features:**
- Tap on Arabic word to hear pronunciation
- Audio button plays the rule demonstration
- Animated highlighting of the tajweed letter
- Swipeable examples carousel

---

### 3. Interactive Practice Screen (TajweedPractice)

**Purpose:** Hands-on practice with immediate feedback

**Layout:**
```
┌─────────────────────────────────┐
│ ← Practice: Ghunnah    [3/10]  │ ← Header with progress
├─────────────────────────────────┤
│                                 │
│ Find the letter with Ghunnah:  │ ← Instruction
│                                 │
│ ┌─────────────────────────────┐│
│ │                             ││
│ │   الْحَمْدُ لِلَّهِ رَبِّ   ││ ← Quranic text
│ │   الْعَالَمِينَ              ││
│ │                             ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Tap the word with Ghunnah:  ││ ← Interaction prompt
│ │                             ││
│ │ [الحمد] [لله] [ربّ]         ││ ← Word buttons
│ │ [العالمين]                   ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 💡 Hint                     ││ ← Hint card
│ │ Look for ن or م with shadda ││
│ └─────────────────────────────┘│
│                                 │
│ [Skip]  [🔊 Listen Again]       │ ← Actions
│                                 │
└─────────────────────────────────┘
```

**Feedback States:**

**Correct Answer:**
```
┌─────────────────────────────┐
│ ✅ Correct!                 │ ← Success banner
│                             │
│ The word "ربّ" has Ghunnah  │
│ on the ب with shadda        │
│                             │
│ [🔊 Listen] [Continue →]    │
└─────────────────────────────┘
```

**Incorrect Answer:**
```
┌─────────────────────────────┐
│ ❌ Not quite                │ ← Error banner
│                             │
│ Hint: Look for noon (ن) or  │
│ meem (م) with shadda symbol │
│                             │
│ [Try Again] [Show Answer]   │
└─────────────────────────────┘
```

**Components:**
- **PracticeHeader:** Rule name, current question, total questions
- **ProgressBar:** Visual progress through practice session
- **InstructionCard:** What to do
- **QuranicTextCard:** Large Arabic text display
- **WordSelector:** Interactive word buttons
- **HintCard:** Contextual hints
- **FeedbackCard:** Success/error feedback
- **ActionButtons:** Skip, listen, continue

**Gamification:**
- Points for correct answers
- Streak counter
- Encouraging messages
- Progress celebration animations

---

### 4. Progress & Completion Screen (TajweedProgress)

**Purpose:** Track and celebrate learning progress

**Layout:**
```
┌─────────────────────────────────┐
│ ← My Progress                   │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🏆 Achievement Unlocked!    ││ ← Celebration card
│ │                             ││
│ │ You completed Ghunnah!      ││
│ │ +50 XP earned               ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Your Stats                  ││ ← Stats card
│ │                             ││
│ │ Rules Mastered:  3/7        ││
│ │ Total Lessons:   12/20      ││
│ │ Practice Score:  85%        ││
│ │ Time Spent:      2h 30m     ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Skill Breakdown             ││ ← Skills radar
│ │                             ││
│ │ Ghunnah    ██████████ 100% ││
│ │ Madd       ████████░░  80% ││
│ │ Idgham     ██████░░░░  60% ││
│ │ Qalqala    ████░░░░░░  40% ││
│ │ Ikhfa      ██░░░░░░░░  20% ││
│ │ Iqlab      ░░░░░░░░░░   0% ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Recent Activity             ││ ← Activity feed
│ │                             ││
│ │ ✓ Completed Ghunnah lesson 3││
│ │ ✓ Scored 90% in Idgham test ││
│ │ ✓ Started Ikhfa tutorial    ││
│ └─────────────────────────────┘│
│                                 │
│ [Continue Learning]             │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **AchievementCard:** Celebration with animation
- **StatsCard:** Overall statistics
- **SkillBreakdown:** Progress bars per rule
- **ActivityFeed:** Recent actions
- **CTAButton:** Continue learning

---

## 🧩 UI Components

### 1. TajweedRuleCard

```typescript
interface TajweedRuleCardProps {
  rule: {
    id: string;
    name: string;
    arabicName: string;
    description: string;
    icon: string;
    color: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
  };
  onPress: () => void;
}
```

**Visual Design:**
```
┌─────────────────────────────────┐
│ [Color Bar]                     │ ← Left border (4px)
│                                 │
│ [Icon] Rule Name       [Status] │ ← Title row
│                                 │
│ Description text here...        │ ← Subtitle
│                                 │
│ Progress: ████░░ 50%            │ ← Progress bar
│ 2/4 lessons                     │ ← Meta info
└─────────────────────────────────┘
```

**States:**
- **Not Started:** Gray border, "Start" button, 0% progress
- **In Progress:** Colored border, percentage badge, partial progress
- **Completed:** Green border, checkmark badge, 100% progress

---

### 2. QuranicTextHighlight

```typescript
interface QuranicTextHighlightProps {
  text: string;
  tajweedRules: Array<{
    start: number;
    end: number;
    type: 'ghunnah' | 'madd' | 'qalqala' | 'idgham' | 'ikhfa' | 'iqlab';
  }>;
  fontSize?: number;
  showTranslation?: boolean;
  translation?: string;
  onPress?: () => void;
}
```

**Visual Example:**
```
┌─────────────────────────────────┐
│                                 │
│   الْحَمْدُ لِلَّهِ رَبِّ      │ ← Arabic text
│      ▲                          │
│   [Highlighted in color]        │
│                                 │
│   "All praise is due to Allah"  │ ← Translation
│                                 │
└─────────────────────────────────┘
```

**Features:**
- Color-coded highlighting
- Tap to see rule name
- Long-press to hear pronunciation
- Translation toggle

---

### 3. ProgressBar

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  color: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}
```

**Variants:**
- **Horizontal:** Standard progress bar
- **Circular:** Percentage in circle
- **Segmented:** Multiple sections

---

### 4. WordSelectorButton

```typescript
interface WordSelectorButtonProps {
  word: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onPress: () => void;
}
```

**States:**
```
Default:   ┌──────────┐
           │  الحمد   │
           └──────────┘

Selected:  ┌──────────┐
           │  الحمد   │ ← Border highlight
           └──────────┘

Correct:   ┌──────────┐
           │ ✓الحمد   │ ← Green background
           └──────────┘

Incorrect: ┌──────────┐
           │ ✗الحمد   │ ← Red background
           └──────────┘
```

---

### 5. FeedbackBanner

```typescript
interface FeedbackBannerProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    onPress: () => void;
  }>;
}
```

**Success:**
```
┌─────────────────────────────────┐
│ ✅ Correct!                     │ ← Green background
│                                 │
│ Great job! The word "ربّ"       │
│ contains Ghunnah.               │
│                                 │
│ [🔊 Listen] [Continue →]        │
└─────────────────────────────────┘
```

**Error:**
```
┌─────────────────────────────────┐
│ ❌ Not quite                    │ ← Red background
│                                 │
│ Look for the shadda symbol on   │
│ noon or meem letters.           │
│                                 │
│ [Try Again] [Show Answer]       │
└─────────────────────────────────┘
```

---

## 📐 Wireframes

### Mobile Layouts (375px - iPhone SE)

**Tutorial Home:**
- Safe area: 44px top, 34px bottom
- Content area: 297px visible
- Scrollable list
- Fixed bottom CTA button (optional)

**Rule Detail:**
- Scrollable content
- Sticky header with progress
- Floating action buttons
- Max 4 cards visible

**Practice Screen:**
- Fixed header with progress
- Scrollable middle content
- Fixed bottom actions
- Modal feedback overlays

**Progress Screen:**
- Full scrollable content
- Achievement card at top
- Stats sections
- Activity feed at bottom

---

## 🎯 Key Tajweed Rules (5-8 Rules)

### 1. Ghunnah (Nasalization) 🟢
- **Color:** Blue (#2196F3)
- **Icon:** 🟢
- **Description:** Nasal sound from nose cavity
- **Letters:** ن (noon) and م (meem) with shadda
- **Duration:** 2 harakah
- **Examples:** النّاس, الجنّة, أمّهم

### 2. Madd (Elongation) 🟢
- **Color:** Green (#4CAF50)
- **Icon:** 🟢
- **Description:** Prolonging the sound
- **Letters:** آ, و, ي with madd sign
- **Duration:** 4-6 harakah
- **Examples:** الرحمن, السماء

### 3. Qalqala (Bouncing) 🟠
- **Color:** Orange (#FF9800)
- **Icon:** 🟠
- **Description:** Bouncing echo sound
- **Letters:** ق, ط, ب, ج, د
- **Duration:** Short and sharp
- **Examples:** قلب, طلب

### 4. Idgham (Merging) 🟣
- **Color:** Purple (#9C27B0)
- **Icon:** 🟣
- **Description:** Merging two letters
- **Letters:** ن followed by ي, و, م, ن, ل, ر
- **Duration:** Seamless transition
- **Examples:** من يعمل, من ورائهم

### 5. Ikhfa (Hiding) 🔵
- **Color:** Cyan (#00BCD4)
- **Icon:** 🔵
- **Description:** Hiding the noon sound
- **Letters:** ن followed by ت, ث, ج, د, ذ, ز, س, ش, ص, ض, ط, ظ, ف, ق, ك
- **Duration:** 2 harakah with nasalization
- **Examples:** منتحين, من خير

### 6. Iqlab (Conversion) 🩵
- **Color:** Pink (#E91E63)
- **Icon:** 🩵
- **Description:** Converting noon to meem
- **Letters:** ن followed by ب
- **Duration:** 2 harakah
- **Examples:** من بعد, سميع بصير

### 7. Waqf (Stopping) 🛑
- **Color:** Deep Orange (#FF5722)
- **Icon:** 🛑
- **Description:** Rules for stopping on words
- **Symbols:** م, لا, ج, قلى, صلى
- **Duration:** N/A
- **Examples:** علام (stop), لام (don't stop)

---

## ✨ Animation & Micro-interactions

### Page Transitions
- Slide right-to-left for next screens
- Slide left-to-right for back navigation
- Fade in for modal overlays

### Progress Animations
- Progress bar fills smoothly (300ms)
- Circular progress rotates and fills
- Confetti for achievements

### Interactive Elements
- Button press: Scale down to 0.95
- Word selection: Highlight pulse
- Correct answer: Green flash + checkmark
- Incorrect answer: Red shake + X mark

### Audio Feedback
- Play button: Pulse animation
- Listening state: Waveform visualization
- Success: Positive chime
- Error: Gentle error sound

---

## 🌙 Dark Mode Support

All screens support dark mode with:
- Dark backgrounds (#0F172A, #1E293B)
- Light text (#F8FAFC)
- Adjusted contrast for readability
- Tajweed colors remain the same (with slight brightness adjustment)

**Color Adjustments:**
```typescript
const darkModeAdjustments = {
  ghunnah: '#42A5F3',  // Lighter blue
  madd: '#66BB6A',     // Lighter green
  qalqala: '#FFB74D',  // Lighter orange
  idgham: '#BA68C8',   // Lighter purple
  ikhfa: '#4DD0E1',    // Lighter cyan
  iqlab: '#F06292',    // Lighter pink
}
```

---

## 🔄 User Flows

### Flow 1: New User Learning Path
```
Dashboard → Tajweed Tutorial Home → 
Rule 1: Ghunnah (Detail) → 
Rule 1: Practice (3 exercises) → 
Rule 1 Complete → 
Progress Screen → 
Next Rule...
```

### Flow 2: Returning User
```
Dashboard → Tajweed Tutorial Home → 
Continue where left off (Idgham) → 
Rule Detail (review) → 
Practice (continue) → 
Progress Update
```

### Flow 3: Quick Practice
```
Dashboard → Quick Practice Button → 
Random Rule Practice (5 questions) → 
Results Screen → 
Dashboard
```

---

## 📏 Responsive Design

### Breakpoints
- **Small:** 320px - 375px (iPhone SE, iPhone Mini)
- **Medium:** 376px - 428px (iPhone 14 Pro Max)
- **Large:** 429px+ (iPhone 14 Pro Max, Android tablets)

### Adaptive Layouts
- **Small:** Single column, compact cards
- **Medium:** Standard layout
- **Large:** Larger fonts, more padding, side-by-side elements

---

## 🎨 Design Tokens

```typescript
const designTokens = {
  // Colors
  colors: {
    primary: '#10B981',
    secondary: '#3B82F6',
    success: '#10B981',
    warning: '#FF9800',
    error: '#EF4444',
    
    // Tajweed
    tajweed: {
      ghunnah: '#2196F3',
      madd: '#4CAF50',
      qalqala: '#FF9800',
      idgham: '#9C27B0',
      ikhfa: '#00BCD4',
      iqlab: '#E91E63',
      waqf: '#FF5722',
    },
  },
  
  // Typography
  fonts: {
    quran: {
      family: 'Amiri',
      size: 28,
      lineHeight: 48,
    },
    heading: 20,
    body: 16,
    caption: 14,
    small: 12,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 20,
    circle: 999,
  },
  
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};
```

---

## ✅ Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- All text meets 4.5:1 contrast ratio
- UI elements meet 3:1 contrast ratio
- Tajweed colors tested for readability

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Adequate spacing between buttons
- Clear visual feedback on press

**Screen Reader Support:**
- Semantic headings for navigation
- Descriptive labels for all elements
- Announcements for progress updates
- Clear error messages

**Visual Accessibility:**
- Clear focus indicators
- Sufficient font sizes
- High contrast mode option
- Reduced motion option

---

## 📦 Component Library Structure

```
src/
├── components/
│   ├── tajweed/
│   │   ├── TajweedRuleCard.tsx
│   │   ├── QuranicTextHighlight.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── WordSelectorButton.tsx
│   │   ├── FeedbackBanner.tsx
│   │   ├── AchievementCard.tsx
│   │   └── AudioButton.tsx
│   └── ...
├── screens/
│   ├── tajweed/
│   │   ├── TajweedTutorialHome.tsx
│   │   ├── TajweedRuleDetail.tsx
│   │   ├── TajweedPractice.tsx
│   │   └── TajweedProgress.tsx
│   └── ...
├── types/
│   └── tajweed.ts
└── utils/
    └── tajweedRules.ts
```

---

## 🎯 Success Metrics

### User Engagement
- Tutorial completion rate > 70%
- Average practice score > 80%
- Return to practice > 3x per week

### Learning Outcomes
- Correct identification rate > 85%
- Rule retention after 7 days > 75%
- User self-reported improvement > 90%

### App Quality
- Screen load time < 1 second
- Audio playback start < 500ms
- Zero critical bugs
- Accessibility score 100%

---

## 📝 Implementation Notes

### Navigation
- Add to main navigation as new tab or dashboard section
- Use stack navigator for rule detail and practice
- Integrate with existing theme system

### State Management
- Track progress in user store
- Persist completed lessons locally
- Sync with backend when online

### Audio Integration
- Use existing audio player infrastructure
- Pre-load audio files for smooth playback
- Support offline mode

### Performance
- Lazy load tutorial screens
- Cache Quranic text and audio
- Optimize image assets

---

## 🚀 Next Steps

1. **Review & Approval:** Share design with stakeholders
2. **Prototyping:** Create interactive prototype in Figma
3. **User Testing:** Test with 5-10 users
4. **Iteration:** Refine based on feedback
5. **Handoff:** Provide specs to developers
6. **Development:** Implement screens and components
7. **QA Testing:** Verify all features work correctly
8. **Launch:** Release to users with progress tracking

---

## 📎 Appendix

### Design Files
- Figma link: [To be created]
- Component library: [To be created]
- Asset exports: [To be created]

### Research References
- Tajweed rules: Quran.com tajweed documentation
- Color coding: Existing app implementation
- User feedback: User research notes

### Related Issues
- RED-78: Audio player implementation
- RED-80: Multi-reciter support
- Existing tajweed color system in QuranScreen

---

**Document Version:** 1.0  
**Last Updated:** April 1, 2026  
**Designer:** Leo 🎨
