# RED-79: Component Specifications

**Designer:** Leo 🎨  
**Date:** April 1, 2026  

---

## Component Architecture

### 1. TajweedRuleCard Component

**File:** `src/components/tajweed/TajweedRuleCard.tsx`

**Purpose:** Display a single tajweed rule with progress tracking

**Props Interface:**
```typescript
interface TajweedRuleCardProps {
  rule: {
    id: string;
    name: string;              // "Ghunnah"
    arabicName: string;        // "الغُنَّة"
    description: string;       // "Nasalization with noon/meem"
    icon: string;              // Emoji or icon name
    color: string;             // "#2196F3"
    progress: number;          // 0-100
    lessonsCompleted: number;  // 2
    totalLessons: number;      // 4
    status: 'not_started' | 'in_progress' | 'completed';
  };
  onPress: () => void;
  colors: ThemeColors;
}
```

**Visual Structure:**
```
┌─────────────────────────────────────┐
│ [4px colored border]                │
│                                     │
│  ┌───┐  Ghunnah         ┌────────┐│
│  │ 🟢│  الغُنَّة         │ ◐ 50%  ││
│  └───┘                  └────────┘│
│                                     │
│  Nasalization with noon/meem       │
│                                     │
│  ████████████░░░░░░░░░░░░░░  50%  │
│  2 of 4 lessons completed          │
│                                     │
│  [Continue Learning →]              │
└─────────────────────────────────────┘
```

**States:**

**Not Started:**
- Border: Gray (#94A3B8)
- Icon: Gray scale
- Badge: "Start" (primary color)
- Progress: 0%, gray bar
- Button: "Start Learning"

**In Progress:**
- Border: Rule color
- Icon: Colored
- Badge: Percentage badge (warning color)
- Progress: Partial, colored
- Button: "Continue Learning"

**Completed:**
- Border: Success green (#10B981)
- Icon: Checkmark overlay
- Badge: "✓ 100%" (success color)
- Progress: Full, green
- Button: "Review"

**Implementation:**
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts } from '@/context/FontSizeContext';

export const TajweedRuleCard: React.FC<TajweedRuleCardProps> = ({
  rule,
  onPress,
  colors,
}) => {
  const { fonts } = useFonts();
  
  const getBorderColor = () => {
    if (rule.status === 'completed') return colors.success || '#10B981';
    if (rule.status === 'in_progress') return rule.color;
    return colors.border;
  };
  
  const getBadgeStyle = () => {
    if (rule.status === 'completed') return styles.successBadge;
    if (rule.status === 'in_progress') return styles.warningBadge;
    return styles.infoBadge;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: getBorderColor(),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{rule.icon}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, { color: colors.text }]}>
            {rule.name}
          </Text>
          <Text style={[styles.arabicName, { color: colors.textSecondary }]}>
            {rule.arabicName}
          </Text>
        </View>
        <View style={[styles.badge, getBadgeStyle()]}>
          <Text style={styles.badgeText}>
            {rule.status === 'completed' ? '✓ 100%' : `${rule.progress}%`}
          </Text>
        </View>
      </View>
      
      {/* Description */}
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {rule.description}
      </Text>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${rule.progress}%`,
                backgroundColor: rule.status === 'completed' 
                  ? '#10B981' 
                  : rule.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {rule.lessonsCompleted} of {rule.totalLessons} lessons
        </Text>
      </View>
      
      {/* Action Button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text style={styles.buttonText}>
          {rule.status === 'not_started' && 'Start Learning'}
          {rule.status === 'in_progress' && 'Continue Learning'}
          {rule.status === 'completed' && 'Review'}
        </Text>
        <Text style={styles.buttonArrow}>→</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  arabicName: {
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successBadge: {
    backgroundColor: '#D1FAE5',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
  },
  infoBadge: {
    backgroundColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
```

---

### 2. QuranicTextHighlight Component

**File:** `src/components/tajweed/QuranicTextHighlight.tsx`

**Purpose:** Display Quranic text with tajweed color coding

**Props Interface:**
```typescript
interface TajweedHighlight {
  start: number;
  end: number;
  type: 'ghunnah' | 'madd' | 'qalqala' | 'idgham' | 'ikhfa' | 'iqlab' | 'waqf';
}

interface QuranicTextHighlightProps {
  text: string;                    // Arabic text
  tajweedRules: TajweedHighlight[];
  fontSize?: number;               // Default: 28
  showTranslation?: boolean;
  translation?: string;
  highlightedWord?: number;        // Index of word to highlight
  onPress?: (wordIndex: number) => void;
  colors: ThemeColors;
}
```

**Visual Example:**
```
┌─────────────────────────────────────┐
│                                     │
│   الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ  │
│      ▲         ▲                   │
│   [Blue]    [Purple]               │
│                                     │
│   "All praise is due to Allah,     │
│    Lord of the worlds"             │
│                                     │
│   [🔊 Listen]                       │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TAJWEED_COLORS = {
  ghunnah: '#2196F3',
  madd: '#4CAF50',
  qalqala: '#FF9800',
  idgham: '#9C27B0',
  ikhfa: '#00BCD4',
  iqlab: '#E91E63',
  waqf: '#FF5722',
};

export const QuranicTextHighlight: React.FC<QuranicTextHighlightProps> = ({
  text,
  tajweedRules,
  fontSize = 28,
  showTranslation = false,
  translation,
  highlightedWord,
  onPress,
  colors,
}) => {
  const renderColoredText = () => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Sort rules by start position
    const sortedRules = [...tajweedRules].sort((a, b) => a.start - b.start);
    
    sortedRules.forEach((rule, index) => {
      // Add text before the rule
      if (rule.start > currentIndex) {
        elements.push(
          <Text key={`text-${index}`} style={[styles.text, { fontSize }]}>
            {text.substring(currentIndex, rule.start)}
          </Text>
        );
      }
      
      // Add colored text
      elements.push(
        <Text
          key={`rule-${index}`}
          style={[
            styles.text,
            {
              fontSize,
              color: TAJWEED_COLORS[rule.type],
              fontWeight: '600',
            },
          ]}
        >
          {text.substring(rule.start, rule.end)}
        </Text>
      );
      
      currentIndex = rule.end;
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      elements.push(
        <Text key="text-end" style={[styles.text, { fontSize }]}>
          {text.substring(currentIndex)}
        </Text>
      );
    }
    
    return elements;
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.arabicContainer}>
        <Text style={[styles.arabicText, { fontSize }]}>
          {renderColoredText()}
        </Text>
      </View>
      
      {showTranslation && translation && (
        <Text style={[styles.translation, { color: colors.textSecondary }]}>
          {translation}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  arabicContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  arabicText: {
    fontFamily: 'Amiri',
    lineHeight: 48,
    writingDirection: 'rtl',
  },
  text: {
    color: '#000',
  },
  translation: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
```

---

### 3. WordSelectorButton Component

**File:** `src/components/tajweed/WordSelectorButton.tsx`

**Purpose:** Interactive button for selecting words in practice mode

**Props Interface:**
```typescript
interface WordSelectorButtonProps {
  word: string;
  wordIndex: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  disabled?: boolean;
  onPress: (wordIndex: number) => void;
  colors: ThemeColors;
}
```

**Visual States:**
```
Default:   ┌──────────┐
           │  الحمد   │  ← Border: gray
           └──────────┘

Selected:  ┌──────────┐
           │  الحمد   │  ← Border: primary, background: light
           └──────────┘

Correct:   ┌──────────┐
           │ ✓الحمد   │  ← Border: green, background: light green
           └──────────┘

Incorrect: ┌──────────┐
           │ ✗الحمد   │  ← Border: red, background: light red
           └──────────┘

Disabled:  ┌──────────┐
           │  الحمد   │  ← Opacity: 0.5
           └──────────┘
```

**Implementation:**
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export const WordSelectorButton: React.FC<WordSelectorButtonProps> = ({
  word,
  wordIndex,
  isSelected,
  isCorrect = false,
  isIncorrect = false,
  disabled = false,
  onPress,
  colors,
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  const getButtonStyle = () => {
    if (isCorrect) {
      return [styles.button, styles.correctButton, { borderColor: '#10B981' }];
    }
    if (isIncorrect) {
      return [styles.button, styles.incorrectButton, { borderColor: '#EF4444' }];
    }
    if (isSelected) {
      return [styles.button, styles.selectedButton, { borderColor: colors.primary }];
    }
    return [styles.button, { borderColor: colors.border }];
  };
  
  const getIcon = () => {
    if (isCorrect) return '✓ ';
    if (isIncorrect) return '✗ ';
    return '';
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={() => onPress(wordIndex)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.word, { opacity: disabled ? 0.5 : 1 }]}>
          {getIcon()}{word}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  selectedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  correctButton: {
    backgroundColor: '#D1FAE5',
  },
  incorrectButton: {
    backgroundColor: '#FEE2E2',
  },
  word: {
    fontSize: 20,
    fontFamily: 'Amiri',
    textAlign: 'center',
  },
});
```

---

### 4. FeedbackBanner Component

**File:** `src/components/tajweed/FeedbackBanner.tsx`

**Purpose:** Display success/error feedback in practice mode

**Props Interface:**
```typescript
interface FeedbackAction {
  label: string;
  onPress: () => void;
  icon?: string;
}

interface FeedbackBannerProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  actions?: FeedbackAction[];
  visible: boolean;
  onDismiss?: () => void;
}
```

**Visual Examples:**

**Success:**
```
┌─────────────────────────────────────┐
│ ✅ Correct!                         │
│                                     │
│ Great job! The word "ربّ" contains  │
│ Ghunnah on the ب with shadda.       │
│                                     │
│ [🔊 Listen] [Continue →]            │
└─────────────────────────────────────┘
```

**Error:**
```
┌─────────────────────────────────────┐
│ ❌ Not quite                        │
│                                     │
│ Look for the shadda symbol on noon  │
│ or meem letters.                    │
│                                     │
│ [Try Again] [Show Answer]           │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const FEEDBACK_CONFIG = {
  success: {
    icon: '✅',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    textColor: '#065F46',
  },
  error: {
    icon: '❌',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    textColor: '#991B1B',
  },
  info: {
    icon: 'ℹ️',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    textColor: '#1E40AF',
  },
};

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  type,
  title,
  message,
  actions,
  visible,
  onDismiss,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const config = FEEDBACK_CONFIG[type];
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.title, { color: config.textColor }]}>
          {title}
        </Text>
      </View>
      
      <Text style={[styles.message, { color: config.textColor }]}>
        {message}
      </Text>
      
      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                { borderColor: config.borderColor },
              ]}
              onPress={action.onPress}
            >
              {action.icon && (
                <Text style={styles.actionIcon}>{action.icon}</Text>
              )}
              <Text style={[styles.actionLabel, { color: config.textColor }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
    marginTop: 4,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

---

### 5. ProgressBar Component

**File:** `src/components/tajweed/ProgressBar.tsx`

**Purpose:** Visual progress indicator

**Props Interface:**
```typescript
interface ProgressBarProps {
  progress: number;        // 0-100
  color?: string;          // Default: primary
  height?: number;         // Default: 8
  showPercentage?: boolean;
  animated?: boolean;
  style?: any;
}
```

**Visual Variants:**

**Horizontal:**
```
████████████░░░░░░░░░░░░░░  50%
```

**Segmented (for lessons):**
```
[1] [2] [3] [4] [5]
 ✓   ✓   ✓   ○   ○
```

**Circular (for overall progress):**
```
    ╱─────╲
   │       │
   │  75%  │
   │       │
    ╲─────╱
```

**Implementation:**
```typescript
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#10B981',
  height = 8,
  showPercentage = true,
  animated = true,
  style,
}) => {
  const [widthAnim] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progress]);
  
  const width = animated ? widthAnim : progress;
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: `${width}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{progress}%</Text>
      )}
    </View>
  );
};

// Segmented variant
export const SegmentedProgressBar: React.FC<{
  completed: number;
  total: number;
  color?: string;
}> = ({ completed, total, color = '#10B981' }) => {
  const segments = Array.from({ length: total }, (_, i) => i);
  
  return (
    <View style={styles.segmentedContainer}>
      {segments.map((index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: index < completed ? color : '#E2E8F0',
            },
          ]}
        >
          <Text style={styles.segmentNumber}>{index + 1}</Text>
        </View>
      ))}
    </View>
  );
};

// Circular variant
export const CircularProgressBar: React.FC<{
  progress: number;
  size?: number;
  color?: string;
}> = ({ progress, size = 120, color = '#10B981' }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.circularTextContainer}>
        <Text style={styles.circularProgressText}>{progress}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  percentage: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  segment: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  circularTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
});
```

---

### 6. AudioButton Component

**File:** `src/components/tajweed/AudioButton.tsx`

**Purpose:** Audio playback control for tajweed examples

**Props Interface:**
```typescript
interface AudioButtonProps {
  audioUri: string;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  colors: ThemeColors;
}
```

**Visual States:**
```
Default:   ┌──────────┐
           │ 🔊 Listen│
           └──────────┘

Playing:   ┌──────────┐
           │ ▶ Playing│  ← Pulsing animation
           └──────────┘

Paused:    ┌──────────┐
           │ ⏸ Paused │
           └──────────┘
```

**Implementation:**
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';

export const AudioButton: React.FC<AudioButtonProps> = ({
  audioUri,
  size = 'medium',
  label = 'Listen',
  onPlayStart,
  onPlayEnd,
  colors,
}) => {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [pulseAnim] = React.useState(new Animated.Value(1));
  
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const stopPulse = () => {
    pulseAnim.setValue(1);
  };
  
  const playSound = async () => {
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );
    
    setSound(newSound);
    setIsPlaying(true);
    startPulse();
    onPlayStart?.();
    
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
        stopPulse();
        onPlayEnd?.();
      }
    });
  };
  
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      stopPulse();
    }
  };
  
  const handlePress = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound();
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 16 };
    }
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          getSizeStyles(),
        ]}
        onPress={handlePress}
      >
        <Text style={styles.icon}>
          {isPlaying ? '⏸' : '🔊'}
        </Text>
        <Text style={styles.label}>
          {isPlaying ? 'Playing...' : label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
    color: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

---

## Utility Functions

### Tajweed Rules Data

**File:** `src/utils/tajweedRules.ts`

```typescript
export interface TajweedRule {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'explanation' | 'practice';
  content: any;
}

export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 'ghunnah',
    name: 'Ghunnah',
    arabicName: 'الغُنَّة',
    description: 'Nasalization with noon/meem',
    icon: '🟢',
    color: '#2196F3',
    lessons: [
      {
        id: 'ghunnah-1',
        title: 'What is Ghunnah?',
        type: 'explanation',
        content: {
          definition: 'Ghunnah is a nasal sound...',
          rules: ['When noon has shadda', 'When meem has shadda'],
          examples: [
            { text: 'النّاس', highlight: [3, 5], translation: 'Mankind' },
          ],
        },
      },
      // More lessons...
    ],
  },
  // More rules...
];
```

### Tajweed Color Utilities

**File:** `src/utils/tajweedColors.ts`

```typescript
export const TAJWEED_COLORS = {
  ghunnah: '#2196F3',
  madd: '#4CAF50',
  qalqala: '#FF9800',
  idgham: '#9C27B0',
  ikhfa: '#00BCD4',
  iqlab: '#E91E63',
  waqf: '#FF5722',
};

export function getTajweedColor(ruleType: string): string {
  return TAJWEED_COLORS[ruleType] || '#000000';
}

export function applyTajweedHighlighting(
  text: string,
  tajweedRules: TajweedHighlight[]
): React.ReactNode[] {
  // Implementation for rendering colored text
  // See QuranicTextHighlight component
}
```

---

## Testing Checklist

### Component Tests
- [ ] TajweedRuleCard renders all states correctly
- [ ] QuranicTextHighlight applies colors properly
- [ ] WordSelectorButton handles all interactions
- [ ] FeedbackBanner shows correct feedback types
- [ ] ProgressBar animates smoothly
- [ ] AudioButton plays/pauses correctly

### Integration Tests
- [ ] Navigation between tutorial screens
- [ ] Progress tracking updates correctly
- [ ] Audio playback works across screens
- [ ] Dark mode switches smoothly
- [ ] RTL layout displays correctly

### Accessibility Tests
- [ ] Screen reader reads all elements
- [ ] Touch targets meet 44x44px minimum
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Animations respect reduced motion

---

**Document Version:** 1.0  
**Last Updated:** April 1, 2026  
**Designer:** Leo 🎨
