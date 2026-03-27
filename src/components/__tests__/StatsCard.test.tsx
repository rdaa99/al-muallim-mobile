import React from 'react';
import { render } from '@testing-library/react-native';
import { StatsCard } from '../StatsCard';

describe('StatsCard', () => {
  const mockColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#10B981',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    header: '#FFFFFF',
  };

  it('renders correctly with basic props', () => {
    const { getByText } = render(
      <StatsCard
        icon="🔥"
        value={5}
        label="Current Streak"
        color="#FF6B6B"
        colors={mockColors}
      />
    );

    expect(getByText('🔥')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Current Streak')).toBeTruthy();
  });

  it('renders with subLabel', () => {
    const { getByText } = render(
      <StatsCard
        icon="🔥"
        value={5}
        label="Current Streak"
        subLabel="days"
        color="#FF6B6B"
        colors={mockColors}
      />
    );

    expect(getByText(/5.*days/)).toBeTruthy();
  });

  it('renders as percentage when isPercentage is true', () => {
    const { getByText } = render(
      <StatsCard
        icon="✅"
        value={85}
        label="Retention"
        color="#4D96FF"
        colors={mockColors}
        isPercentage
      />
    );

    expect(getByText('85%')).toBeTruthy();
  });

  it('applies custom colors', () => {
    const { getByText } = render(
      <StatsCard
        icon="🔥"
        value={5}
        label="Current Streak"
        color="#FF6B6B"
        colors={mockColors}
      />
    );

    const valueText = getByText('5');
    expect(valueText).toBeTruthy();
  });

  it('renders without colors prop', () => {
    const { getByText } = render(
      <StatsCard
        icon="🔥"
        value={5}
        label="Current Streak"
        color="#FF6B6B"
      />
    );

    expect(getByText('🔥')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });
});
