# RED-79: Visual Design Specifications

**Designer:** Leo 🎨  
**Date:** April 1, 2026  

---

## Color System

### Primary App Colors (Existing)

```typescript
const appColors = {
  // Light Mode
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#10B981',    // App's primary green
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    card: '#FFFFFF',
  },
  
  // Dark Mode
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    primary: '#10B981',    // Same primary
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    card: '#1E293B',
  },
};
```

### Tajweed Rule Colors

**Standard Palette:**
```typescript
const tajweedColors = {
  // Primary tajweed colors
  ghunnah: {
    light: '#2196F3',     // Blue
    dark: '#42A5F5',      // Lighter blue for dark mode
    name: 'Ghunnah',
    icon: '🟢',
    description: 'Nasalization',
  },
  
  madd: {
    light: '#4CAF50',     // Green
    dark: '#66BB6A',      // Lighter green
    name: 'Madd',
    icon: '🟢',
    description: 'Elongation',
  },
  
  qalqala: {
    light: '#FF9800',     // Orange
    dark: '#FFB74D',      // Lighter orange
    name: 'Qalqala',
    icon: '🟠',
    description: 'Bouncing',
  },
  
  idgham: {
    light: '#9C27B0',     // Purple
    dark: '#BA68C8',      // Lighter purple
    name: 'Idgham',
    icon: '🟣',
    description: 'Merging',
  },
  
  ikhfa: {
    light: '#00BCD4',     // Cyan
    dark: '#4DD0E1',      // Lighter cyan
    name: 'Ikhfa',
    icon: '🔵',
    description: 'Hiding',
  },
  
  iqlab: {
    light: '#E91E63',     // Pink
    dark: '#F06292',      // Lighter pink
    name: 'Iqlab',
    icon: '🩵',
    description: 'Conversion',
  },
  
  waqf: {
    light: '#FF5722',     // Deep Orange
    dark: '#FF8A65',      // Lighter deep orange
    name: 'Waqf',
    icon: '🛑',
    description: 'Stopping',
  },
};
```

### Semantic Colors

```typescript
const semanticColors = {
  success: '#10B981',     // Green
  warning: '#FF9800',     // Orange
  error: '#EF4444',       // Red
  info: '#3B82F6',        // Blue
  
  // Background variations
  successLight: '#D1FAE5', // Light green
  warningLight: '#FEF3C7', // Light yellow
  errorLight: '#FEE2E2',   // Light red
  infoLight: '#DBEAFE',    // Light blue
};
```

### Gradient Colors

```typescript
const gradients = {
  primary: ['#10B981', '#059669'],
  achievement: ['#FFD700', '#FFA500'],
  progress: ['#3B82F6', '#8B5CF6'],
};
```

---

## Typography

### Font Families

```typescript
const fontFamilies = {
  // Arabic text (Quran)
  quran: {
    ios: 'Amiri',
    android: 'Amiri',
    fallback: 'System',
  },
  
  // UI text
  regular: {
    ios: 'System',
    android: 'Roboto',
  },
  
  // Emphasis
  medium: {
    ios: 'System',
    android: 'Roboto-Medium',
  },
  
  bold: {
    ios: 'System',
    android: 'Roboto-Bold',
  },
};
```

### Font Sizes

```typescript
const fontSizes = {
  // Arabic text
  quranLarge: 32,     // Hero Quranic text
  quranMedium: 28,    // Standard Quran display
  quranSmall: 24,     // Compact Quran text
  
  // UI text
  hero: 28,           // Large hero text
  heading1: 24,       // Screen titles
  heading2: 20,       // Section headers
  heading3: 18,       // Card headers
  body: 16,           // Body text
  caption: 14,        // Captions
  small: 12,          // Small text
  tiny: 10,           // Very small text
  
  // Buttons
  button: 16,         // Button text
  buttonSmall: 14,    // Small button text
};
```

### Line Heights

```typescript
const lineHeights = {
  quran: 48,          // Arabic text
  tight: 20,          // Tight spacing
  normal: 24,         // Normal spacing
  relaxed: 28,        // Relaxed spacing
};
```

### Font Weights

```typescript
const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

---

## Spacing System

### Base Units

```typescript
const spacing = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px - Base unit
  lg: 24,     // 24px
  xl: 32,     // 32px
  xxl: 48,    // 48px
  
  // Component-specific
  cardPadding: 16,
  screenPadding: 16,
  buttonPadding: 12,
  iconPadding: 8,
};
```

### Layout Spacing

```typescript
const layoutSpacing = {
  // Screen margins
  screenHorizontal: 16,
  screenVertical: 20,
  
  // Card margins
  cardVertical: 8,
  cardHorizontal: 16,
  
  // Element gaps
  elementGap: 8,
  sectionGap: 16,
  headerGap: 12,
  
  // Safe areas
  statusBarHeight: 44,    // iPhone X+
  homeIndicator: 34,      // iPhone X+
  tabBarHeight: 60,
  headerHeight: 56,
};
```

---

## Border Radius

```typescript
const borderRadius = {
  // Small elements
  xs: 4,      // Tags, badges
  sm: 8,      // Buttons, small cards
  md: 12,     // Standard cards
  lg: 16,     // Large cards
  xl: 20,     // Pills, large buttons
  xxl: 24,    // Extra large cards
  
  // Special
  circle: 999,    // Circular elements
  pill: 20,       // Pill-shaped buttons
  
  // Component-specific
  card: 12,
  button: 8,
  input: 8,
  modal: 16,
  cardLarge: 16,
};
```

---

## Shadows & Elevation

### Shadow Styles

```typescript
const shadows = {
  // Small shadow (cards)
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Medium shadow (modals)
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Large shadow (overlay)
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Card shadow
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};
```

### Elevation Levels

```typescript
const elevation = {
  level0: 0,    // No elevation
  level1: 2,    // Subtle lift
  level2: 4,    // Cards
  level3: 8,    // Raised cards
  level4: 12,   // Modals
  level5: 16,   // Dialogs
};
```

---

## Iconography

### Icon Sizes

```typescript
const iconSizes = {
  tiny: 16,      // Inline icons
  small: 20,     // Tab bar icons
  medium: 24,    // Standard icons
  large: 32,     // Feature icons
  xlarge: 48,    // Hero icons
  xxlarge: 64,   // Large feature icons
  
  // Emoji icons (tajweed)
  emoji: 24,     // Standard emoji
  emojiLarge: 32, // Large emoji
};
```

### Icon Set

**Tajweed Icons (Emoji):**
- 🟢 Ghunnah (Green circle)
- 🟠 Qalqala (Orange circle)
- 🟣 Idgham (Purple circle)
- 🔵 Ikhfa (Blue circle)
- 🩵 Iqlab (Light blue circle)
- 🛑 Waqf (Stop sign)

**UI Icons (Emoji):**
- 📚 Tutorial/Learning
- 🎯 Practice
- 🏆 Achievement
- ✓ Completed/Correct
- ✗ Incorrect
- 🔊 Audio/Listen
- → Next/Forward
- ← Previous/Back
- ? Help
- ✕ Close

---

## Animation Specifications

### Timing

```typescript
const animationTiming = {
  // Durations
  instant: 100,     // Instant feedback
  fast: 200,        // Quick transitions
  normal: 300,      // Standard animations
  slow: 500,        // Deliberate animations
  verySlow: 800,    // Emphasis animations
  
  // Easing
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: {
    tension: 100,
    friction: 10,
  },
};
```

### Animation Types

**Button Press:**
```typescript
const buttonPress = {
  scale: 0.95,
  duration: 100,
  easing: 'ease-out',
};
```

**Card Fade In:**
```typescript
const cardFadeIn = {
  opacity: [0, 1],
  duration: 300,
  easing: 'ease-out',
};
```

**Progress Bar Fill:**
```typescript
const progressBarFill = {
  width: ['0%', '100%'],
  duration: 500,
  easing: 'ease-out',
};
```

**Success Pulse:**
```typescript
const successPulse = {
  scale: [1, 1.1, 1],
  duration: 600,
  iteration: 'infinite',
};
```

**Confetti Celebration:**
```typescript
const confetti = {
  particles: 50,
  duration: 2000,
  colors: ['#10B981', '#3B82F6', '#FF9800', '#9C27B0'],
};
```

---

## Component Specifications

### Cards

**Standard Card:**
```typescript
const cardStyles = {
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    ...shadows.small,
  },
};
```

**Rule Card:**
```typescript
const ruleCardStyles = {
  container: {
    ...cardStyles.container,
    borderLeftWidth: 4,
    borderLeftColor: tajweedColor,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
```

### Buttons

**Primary Button:**
```typescript
const primaryButton = {
  container: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
};
```

**Secondary Button:**
```typescript
const secondaryButton = {
  container: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
};
```

### Progress Bars

**Horizontal:**
```typescript
const horizontalProgress = {
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
};
```

**Circular:**
```typescript
const circularProgress = {
  size: 120,
  strokeWidth: 8,
  backgroundColor: colors.border,
  progressColor: colors.primary,
};
```

---

## Grid System

### Responsive Breakpoints

```typescript
const breakpoints = {
  small: 320,    // iPhone SE
  medium: 375,   // iPhone 14
  large: 428,    // iPhone 14 Pro Max
  tablet: 768,   // iPad Mini
};
```

### Column System

```typescript
const columns = {
  small: 4,      // 4 columns for small screens
  medium: 6,     // 6 columns for medium screens
  large: 8,      // 8 columns for large screens
  tablet: 12,    // 12 columns for tablets
};
```

### Grid Spacing

```typescript
const gridSpacing = {
  gutter: 16,    // Space between columns
  margin: 16,    // Outer margin
};
```

---

## Accessibility

### Touch Targets

```typescript
const touchTargets = {
  minimum: 44,   // 44x44px minimum
  comfortable: 48, // 48x48px comfortable
  large: 56,     // 56x56px for primary actions
};
```

### Color Contrast

```typescript
const contrastRequirements = {
  textNormal: 4.5,   // 4.5:1 for normal text
  textLarge: 3.0,    // 3:1 for large text
  uiComponents: 3.0, // 3:1 for UI components
};
```

### Focus Indicators

```typescript
const focusIndicator = {
  borderWidth: 2,
  borderColor: colors.primary,
  borderRadius: 8,
  padding: 2,
};
```

---

## Motion & Gestures

### Swipe Gestures

**Horizontal Swipe:**
```typescript
const horizontalSwipe = {
  threshold: 50,     // Minimum distance
  velocity: 0.3,     // Minimum velocity
};
```

**Vertical Swipe:**
```typescript
const verticalSwipe = {
  threshold: 100,    // Minimum distance
  velocity: 0.5,     // Minimum velocity
};
```

### Scroll Behavior

```typescript
const scrollConfig = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  bounces: true,
  overScrollMode: 'always',
};
```

---

## Z-Index Layers

```typescript
const zIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  overlay: 100,
  modal: 1000,
  tooltip: 2000,
  toast: 3000,
};
```

---

## Dark Mode Adjustments

### Color Brightness Adjustment

For dark mode, increase brightness of tajweed colors by approximately 15-20%:

```typescript
const adjustForDarkMode = (color: string): string => {
  // Convert hex to HSL
  // Increase lightness by 15-20%
  // Convert back to hex
  // Return adjusted color
};
```

### Background Opacity

```typescript
const darkModeOverlays = {
  lightOverlay: 'rgba(255, 255, 255, 0.05)',
  mediumOverlay: 'rgba(255, 255, 255, 0.1)',
  heavyOverlay: 'rgba(255, 255, 255, 0.2)',
};
```

---

## Platform-Specific Adjustments

### iOS

```typescript
const iOSAdjustments = {
  // Use SF Symbols for icons
  // Native navigation transitions
  // Haptic feedback
  // Blur effects
};
```

### Android

```typescript
const androidAdjustments = {
  // Material Design icons
  // Shared element transitions
  // Ripple effects
  // Elevation shadows
};
```

---

## Export Assets

### Icon Sizes

```typescript
const iconExports = {
  // iOS
  '@1x': 24,
  '@2x': 48,
  '@3x': 72,
  
  // Android
  'mdpi': 24,
  'hdpi': 36,
  'xhdpi': 48,
  'xxhdpi': 72,
  'xxxhdpi': 96,
};
```

### Image Assets

```typescript
const imageAssets = {
  // Achievement badges
  achievement: {
    width: 120,
    height: 120,
    format: 'png',
  },
  
  // Tutorial illustrations
  tutorial: {
    width: 300,
    height: 200,
    format: 'png',
  },
};
```

---

## Design Tokens Summary

All design tokens are consolidated in:

**File:** `src/styles/tokens.ts`

```typescript
export const tokens = {
  colors: { ...appColors, ...tajweedColors, ...semanticColors },
  typography: { families: fontFamilies, sizes: fontSizes, weights: fontWeights },
  spacing: { ...spacing, ...layoutSpacing },
  borderRadius: { ...borderRadius },
  shadows: { ...shadows },
  icons: { sizes: iconSizes },
  animation: { timing: animationTiming },
  accessibility: { touchTargets, contrastRequirements },
};

export type Tokens = typeof tokens;
```

---

**Document Version:** 1.0  
**Last Updated:** April 1, 2026  
**Designer:** Leo 🎨
