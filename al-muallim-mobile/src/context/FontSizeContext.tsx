import React, { createContext, useContext, ReactNode } from 'react';
import { useUserStore } from '../store/userStore';

type FontSize = 'small' | 'medium' | 'large';

interface FontSizeContextValue {
  fontSize: FontSize;
  scale: (baseSize: number) => number;
  fonts: {
    caption: number;
    body: number;
    subheading: number;
    heading: number;
    title: number;
    hero: number;
  };
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

const fontConfigs = {
  small: {
    caption: 10,
    body: 12,
    subheading: 14,
    heading: 16,
    title: 20,
    hero: 24,
  },
  medium: {
    caption: 12,
    body: 14,
    subheading: 16,
    heading: 18,
    title: 24,
    hero: 28,
  },
  large: {
    caption: 14,
    body: 16,
    subheading: 18,
    heading: 20,
    title: 28,
    hero: 32,
  },
};

const scaleFactors = {
  small: 0.85,
  medium: 1,
  large: 1.15,
};

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const { settings } = useUserStore();
  const fontSize = settings.fontSize || 'medium';

  const value: FontSizeContextValue = {
    fontSize,
    fonts: fontConfigs[fontSize],
    scale: (baseSize: number) => Math.round(baseSize * scaleFactors[fontSize]),
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFonts() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFonts must be used within FontSizeProvider');
  }
  return context;
}
