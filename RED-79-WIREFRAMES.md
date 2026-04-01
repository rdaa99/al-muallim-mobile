# RED-79: Interactive Wireframes

**Designer:** Leo 🎨  
**Date:** April 1, 2026  

---

## Overview

This document contains detailed wireframes for all tajweed tutorial screens. These wireframes represent the visual structure and layout at mobile scale (375px width).

---

## Screen 1: Tutorial Home Screen

**File:** `src/screens/tajweed/TajweedTutorialHome.tsx`

```
┌─────────────────────────────────────────┐
│ Status Bar (iOS)                        │
├─────────────────────────────────────────┤
│ ← Tajweed Rules               [?]      │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐│
│ │           📚                         ││
│ │                                     ││
│ │   Master the Art of Tajweed        ││
│ │   Learn proper Quran recitation    ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ Overall Progress                        │
│ ████████████████░░░░░░░░░░░░░░  60%    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🟢] Ghunnah              [✓ 100%]  ││
│ │     Nasalization with noon/meem     ││
│ │     ████████████████████████  100%  ││
│ │     5/5 lessons completed           ││
│ │                                     ││
│ │     [Review →]                      ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🟣] Idgham               [◐  50%]  ││
│ │     Merging letters together        ││
│ │     ████████████░░░░░░░░░░  50%     ││
│ │     2/4 lessons completed           ││
│ │                                     ││
│ │     [Continue Learning →]           ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🔵] Ikhfa                 [○   0%] ││
│ │     Hiding the pronunciation        ││
│ │     ░░░░░░░░░░░░░░░░░░░░░░   0%     ││
│ │     Not started                     ││
│ │                                     ││
│ │     [Start Learning →]              ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🟢] Madd                 [✓ 100%]  ││
│ │     Elongation of sounds            ││
│ │     ████████████████████████  100%  ││
│ │     3/3 lessons completed           ││
│ │                                     ││
│ │     [Review →]                      ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🟠] Qalqala              [◐  33%]  ││
│ │     Bouncing letters                ││
│ │     ████████░░░░░░░░░░░░░░  33%     ││
│ │     1/3 lessons completed           ││
│ │                                     ││
│ │     [Continue Learning →]           ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🩵] Iqlab                [○   0%] ││
│ │     Converting noon to ba           ││
│ │     ░░░░░░░░░░░░░░░░░░░░░░   0%     ││
│ │     Not started                     ││
│ │                                     ││
│ │     [Start Learning →]              ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │[🛑] Waqf                 [○   0%] ││
│ │     Rules for stopping on words     ││
│ │     ░░░░░░░░░░░░░░░░░░░░░░   0%     ││
│ │     Not started                     ││
│ │                                     ││
│ │     [Start Learning →]              ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │   [Start Practice Session]          ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│                                         │
│ Home Bar Indicator                      │
└─────────────────────────────────────────┘
```

**Key Elements:**
1. **Hero Section** - Motivational intro
2. **Overall Progress** - Global completion tracker
3. **Rule Cards** - Individual tajweed rules with progress
4. **CTA Button** - Start practice session

**Dimensions:**
- Card width: 343px (375 - 16*2 padding)
- Card padding: 16px
- Card margin: 8px vertical
- Icon size: 48x48px
- Border radius: 12px

---

## Screen 2: Rule Detail Screen (Ghunnah Example)

**File:** `src/screens/tajweed/TajweedRuleDetail.tsx`

```
┌─────────────────────────────────────────┐
│ Status Bar (iOS)                        │
├─────────────────────────────────────────┤
│ ← Ghunnah                    1/5  [🔊]  │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ What is Ghunnah?                    ││
│ │                                     ││
│ │ Ghunnah is a nasal sound that       ││
│ │ comes from the nose cavity,         ││
│ │ lasting for 2 counts (harakah).     ││
│ │                                     ││
│ │ [Icon: 👃]                          ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ When to apply?                      ││
│ │                                     ││
│ │ • When ن (noon) has shadda  نّ      ││
│ │ • When م (meem) has shadda مّ       ││
│ │ • Duration: 2 harakah               ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Visual Example                      ││
│ │                                     ││
│ │         النّاس                       ││
│ │            ↑                         ││
│ │     [Blue highlight]                ││
│ │                                     ││
│ │ The noon with shadda creates        ││
│ │ a nasal sound lasting 2 beats       ││
│ │                                     ││
│ │ [🔊 Listen]  [▶ Practice]           ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ More Examples                       ││
│ │                                     ││
│ │ 1. الجنّة   (Al-Jannah)             ││
│ │         ↑                           ││
│ │                                     ││
│ │ 2. أمّهم   (Ummuhum)                ││
│ │       ↑                             ││
│ │                                     ││
│ │ 3. إنّما   (Innama)                 ││
│ │      ↑                              ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 💡 Pro Tip                          ││
│ │                                     ││
│ │ The ghunnah should come from        ││
│ │ your nose, not your throat.         ││
│ │ Try pinching your nose while        ││
│ │ making the sound!                   ││
│ └─────────────────────────────────────┘│
│                                         │
│                                         │
│ [← Previous]      [Next: Practice →]   │
│                                         │
│ Home Bar Indicator                      │
└─────────────────────────────────────────┘
```

**Key Elements:**
1. **Header** - Title, lesson progress, audio button
2. **Definition Card** - What the rule is
3. **Rules Card** - When and how to apply
4. **Visual Example Card** - Large Arabic text with highlighting
5. **Examples List** - Additional examples
6. **Pro Tip Card** - Helpful hint
7. **Navigation** - Previous/Next buttons

**Interactive Features:**
- Tap on Arabic word → Hear pronunciation
- Audio button → Play full demonstration
- Swipe through examples → Carousel
- Practice button → Navigate to practice screen

---

## Screen 3: Interactive Practice Screen

**File:** `src/screens/tajweed/TajweedPractice.tsx`

```
┌─────────────────────────────────────────┐
│ Status Bar (iOS)                        │
├─────────────────────────────────────────┤
│ ← Practice: Ghunnah    [3/10]   [Exit]  │
├─────────────────────────────────────────┤
│                                         │
│ Progress                                │
│ ██████░░░░░░░░░░░░░░░░░░░░  30%        │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Find the word with Ghunnah:         ││
│ │                                     ││
│ │ Look for ن or م with shadda symbol  ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │   الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ   ││
│ │                                     ││
│ │   "All praise is due to Allah,      ││
│ │    Lord of the worlds"              ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ Select the word with Ghunnah:          │
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ الحمد   │ │  الله   │ │  ربّ    │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│ ┌─────────┐                            │
│ │العالمين │                            │
│ └─────────┘                            │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 💡 Hint                             ││
│ │                                     ││
│ │ Look for a ن or م letter with a     ││
│ │ small "w" symbol (shadda) above it  ││
│ │                                     ││
│ │ [Show Me]                           ││
│ └─────────────────────────────────────┘│
│                                         │
│                                         │
│ [Skip]          [🔊 Listen Again]       │
│                                         │
│ Home Bar Indicator                      │
└─────────────────────────────────────────┘
```

### Correct Answer Feedback

```
┌─────────────────────────────────────────┐
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ ✅ Correct!                         ││
│ │                                     ││
│ │ Great job! The word "ربّ" contains  ││
│ │ Ghunnah on the ب with shadda.       ││
│ │                                     ││
│ │ The nasal sound comes from the      ││
│ │ nose and lasts for 2 harakah.       ││
│ │                                     ││
│ │ [🔊 Listen]       [Continue →]      ││
│ └─────────────────────────────────────┘│
│                                         │
│                                         │
│   الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ   │
│                  ↑                      │
│           [Green highlight]             │
│                                         │
│                                         │
│ Score: 3/3 (100%)  🔥 Streak: 3        │
│                                         │
│                                         │
│              [Next →]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Incorrect Answer Feedback

```
┌─────────────────────────────────────────┐
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ ❌ Not quite                        ││
│ │                                     ││
│ │ Look for the shadda symbol ( ّ )    ││
│ │ above a ن (noon) or م (meem)        ││
│ │ letter.                             ││
│ │                                     ││
│ │ Hint: It's NOT on the first word!   ││
│ │                                     ││
│ │ [Try Again]     [Show Answer]       ││
│ └─────────────────────────────────────┘│
│                                         │
│                                         │
│   الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ   │
│         ✗                              │
│   [Red on "الحمد"]                     │
│                                         │
│                                         │
│ Score: 2/3 (67%)   ⚠️ Streak: 0        │
│                                         │
│                                         │
│              [Next →]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
1. **Header** - Rule name, question number, exit button
2. **Progress Bar** - Visual progress through practice
3. **Instruction Card** - What to find/do
4. **Quranic Text Card** - Large Arabic display
5. **Word Buttons** - Interactive selection
6. **Hint Card** - Contextual help
7. **Feedback Banner** - Success/error feedback (overlay)
8. **Action Buttons** - Skip, listen, continue

**Gamification:**
- Score counter
- Streak counter
- Encouraging messages
- Progress celebration

---

## Screen 4: Progress & Completion Screen

**File:** `src/screens/tajweed/TajweedProgress.tsx`

```
┌─────────────────────────────────────────┐
│ Status Bar (iOS)                        │
├─────────────────────────────────────────┤
│ ← My Progress                           │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐│
│ │           🏆                         ││
│ │                                     ││
│ │     Achievement Unlocked!           ││
│ │                                     ││
│ │   You completed Ghunnah mastery!    ││
│ │                                     ││
│ │      +50 XP earned                  ││
│ │                                     ││
│ │   [Share Achievement]               ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Your Stats                          ││
│ │                                     ││
│ │ ┌─────────┐  ┌─────────┐          ││
│ │ │ Rules   │  │ Lessons │          ││
│ │ │Mastered │  │Completed│          ││
│ │ │  3/7    │  │  12/20  │          ││
│ │ └─────────┘  └─────────┘          ││
│ │                                     ││
│ │ ┌─────────┐  ┌─────────┐          ││
│ │ │Practice │  │ Time    │          ││
│ │ │ Score   │  │ Spent   │          ││
│ │ │  85%    │  │ 2h 30m  │          ││
│ └─────────┘  └─────────┘          ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Skill Breakdown                     ││
│ │                                     ││
│ │ Ghunnah   ████████████████████ 100%││
│ │ Madd      ████████████████░░░░  80%││
│ │ Idgham    ████████████░░░░░░░░  60%││
│ │ Qalqala   ████████░░░░░░░░░░░░  40%││
│ │ Ikhfa     ████░░░░░░░░░░░░░░░░  20%││
│ │ Iqlab     ░░░░░░░░░░░░░░░░░░░░   0%││
│ │ Waqf      ░░░░░░░░░░░░░░░░░░░░   0%││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Recent Activity                     ││
│ │                                     ││
│ │ ✓ Completed Ghunnah lesson 3       ││
│ │   2 hours ago                       ││
│ │                                     ││
│ │ ✓ Scored 90% in Idgham test        ││
│ │   5 hours ago                       ││
│ │                                     ││
│ │ ✓ Started Ikhfa tutorial           ││
│ │   Yesterday                         ││
│ │                                     ││
│ │ 🎯 Earned "Quick Learner" badge    ││
│ │   2 days ago                        ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │                                     ││
│ │   [Continue Learning]               ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│                                         │
│                                         │
│ Home Bar Indicator                      │
└─────────────────────────────────────────┘
```

**Key Elements:**
1. **Achievement Card** - Celebration with animation
2. **Stats Grid** - 2x2 grid of key metrics
3. **Skill Breakdown** - Progress bars per rule
4. **Activity Feed** - Timeline of recent actions
5. **CTA Button** - Continue learning

---

## Screen 5: Settings Integration

**Navigation to Tutorial:**

Add to Dashboard quick actions or Settings screen:

```
┌─────────────────────────────────────────┐
│                                         │
│ Quick Actions                           │
│                                         │
│ ┌─────────┐ ┌─────────┐               │
│ │  📖     │ │  🎯     │               │
│ │Continue │ │ Review  │               │
│ └─────────┘ └─────────┘               │
│                                         │
│ ┌─────────┐ ┌─────────┐               │
│ │  🎧     │ │  📊     │               │
│ │ Listen  │ │  Stats  │               │
│ └─────────┘ └─────────┘               │
│                                         │
│ ┌─────────┐ ┌─────────┐               │
│ │  🎓     │ │  ⚙️     │               │
│ │Tajweed  │ │Settings │               │
│ │Tutorial │ │         │               │
│ └─────────┘ └─────────┘               │
│                                         │
└─────────────────────────────────────────┘
```

---

## Component Variations

### Card States

**Not Started:**
```
┌─────────────────────────────────────┐
│[⚫] Rule Name             [○   0%] │
│    Description here...              │
│    ░░░░░░░░░░░░░░░░░░░░░░   0%      │
│    Not started                      │
│    [Start Learning →]               │
└─────────────────────────────────────┘
```

**In Progress:**
```
┌─────────────────────────────────────┐
│[🟢] Rule Name             [◐  50%] │
│    Description here...              │
│    ████████████░░░░░░░░░░  50%      │
│    2/4 lessons completed            │
│    [Continue Learning →]            │
└─────────────────────────────────────┘
```

**Completed:**
```
┌─────────────────────────────────────┐
│[✓] Rule Name              [✓ 100%] │
│    Description here...              │
│    ████████████████████████  100%   │
│    Completed                        │
│    [Review →]                       │
└─────────────────────────────────────┘
```

### Button States

**Primary Button:**
```
┌────────────────────────┐
│  Start Learning    →   │  ← Primary color background
└────────────────────────┘
```

**Secondary Button:**
```
┌────────────────────────┐
│  Skip                  │  ← Transparent, border only
└────────────────────────┘
```

**Icon Button:**
```
┌──────┐
│  🔊  │  ← Square or circular
└──────┘
```

### Progress Indicators

**Horizontal:**
```
████████████░░░░░░░░░░░░░░  50%
```

**Segmented:**
```
[1] [2] [3] [4] [5] [6] [7] [8]
 ✓   ✓   ✓   ○   ○   ○   ○   ○
```

**Circular:**
```
      ╱─────╲
     │       │
     │  75%  │
     │       │
      ╲─────╱
```

### Feedback Banners

**Success:**
```
┌────────────────────────────────────┐
│ ✅ Correct!                        │
│                                    │
│ Great job! Your answer is right.  │
│                                    │
│ [🔊 Listen]       [Continue →]    │
└────────────────────────────────────┘
```

**Error:**
```
┌────────────────────────────────────┐
│ ❌ Not quite                       │
│                                    │
│ The correct answer is different.  │
│                                    │
│ [Try Again]     [Show Answer]     │
└────────────────────────────────────┘
```

**Info:**
```
┌────────────────────────────────────┐
│ ℹ️ Tip                             │
│                                    │
│ Remember to look for the shadda   │
│ symbol above the letter.          │
│                                    │
│              [Got it]              │
└────────────────────────────────────┘
```

---

## Interaction Flows

### Flow 1: Learning a New Rule
```
Tutorial Home
    ↓ (tap rule card)
Rule Detail (Lesson 1)
    ↓ (scroll/next)
Rule Detail (Lesson 2)
    ↓ (scroll/next)
Rule Detail (Lesson 3)
    ↓ (tap "Practice")
Practice Screen
    ↓ (complete 10 questions)
Progress Screen (Completion)
    ↓ (tap "Continue Learning")
Tutorial Home (next rule)
```

### Flow 2: Quick Practice
```
Tutorial Home
    ↓ (tap "Start Practice Session")
Practice Screen (Random Rule)
    ↓ (complete 5 questions)
Results Screen
    ↓ (tap "Done")
Tutorial Home
```

### Flow 3: Reviewing Completed Rule
```
Tutorial Home
    ↓ (tap completed rule)
Rule Detail (Overview)
    ↓ (tap "Practice")
Practice Screen (Refresher)
    ↓ (complete 5 questions)
Progress Screen (Update)
```

---

## Responsive Considerations

### Small Screen (320px - iPhone SE)
- Reduce padding to 12px
- Smaller font sizes (14px body)
- Stack buttons vertically
- Reduce icon sizes to 40x40px

### Medium Screen (375px - iPhone 14)
- Standard padding (16px)
- Standard font sizes (16px body)
- Horizontal button layout
- Standard icon sizes (48x48px)

### Large Screen (428px - iPhone 14 Pro Max)
- Increased padding to 20px
- Larger font sizes (18px body)
- More generous spacing
- Larger icon sizes (56x56px)

---

## Dark Mode Variations

All wireframes support dark mode with:
- Dark backgrounds (#0F172A, #1E293B)
- Light text (#F8FAFC, #94A3B8)
- Slightly brighter tajweed colors for contrast
- Maintained color coding for rules

**Dark Mode Example:**
```
┌─────────────────────────────────────┐
│ Dark Background                     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Dark Card (#1E293B)             ││
│ │                                 ││
│ │ Light Text (#F8FAFC)            ││
│ │                                 ││
│ │ Tajweed colors (brighter)       ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Accessibility Annotations

### Touch Targets
- All buttons: Minimum 44x44px
- Word selector buttons: 44x44px
- Card tap areas: Full card height

### Contrast Ratios
- All text: 4.5:1 minimum
- UI elements: 3:1 minimum
- Tajweed colors: Tested for readability

### Screen Reader Labels
- All cards: "Rule name, status, progress"
- Buttons: "Action description"
- Progress bars: "X percent complete"
- Arabic text: "Arabic: [transliteration]"

---

**Document Version:** 1.0  
**Last Updated:** April 1, 2026  
**Designer:** Leo 🎨
