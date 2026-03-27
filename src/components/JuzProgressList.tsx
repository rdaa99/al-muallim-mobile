import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { ThemeColors } from '../context/ThemeContext';
import type { JuzProgress } from '../types';

interface JuzProgressListProps {
  data: JuzProgress[];
  colors?: ThemeColors;
}

export const JuzProgressList: React.FC<JuzProgressListProps> = ({
  data,
  colors,
}) => {
  const textColor = colors?.text || '#333';
  const labelColor = colors?.textSecondary || '#666';
  const barBgColor = colors?.border || '#e0e0e0';

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: labelColor }]}>
          No Juz data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {data.map((juz) => {
          const totalLearned = juz.mastered + juz.consolidating + juz.learning;
          const progressPercent = juz.total > 0 ? (totalLearned / juz.total) * 100 : 0;
          const masteredPercent = juz.total > 0 ? (juz.mastered / juz.total) * 100 : 0;
          const consolidatingPercent = juz.total > 0 ? (juz.consolidating / juz.total) * 100 : 0;
          const learningPercent = juz.total > 0 ? (juz.learning / juz.total) * 100 : 0;

          return (
            <View key={juz.juz_number} style={styles.juzCard}>
              <View style={styles.juzHeader}>
                <Text style={[styles.juzNumber, { color: textColor }]}>
                  Juz {juz.juz_number}
                </Text>
                <Text style={[styles.juzProgress, { color: labelColor }]}>
                  {Math.round(progressPercent)}%
                </Text>
              </View>

              {/* Progress bar */}
              <View style={[styles.progressBarBg, { backgroundColor: barBgColor }]}>
                {masteredPercent > 0 && (
                  <View
                    style={[
                      styles.progressBarSection,
                      styles.masteredSection,
                      { width: `${masteredPercent}%` },
                    ]}
                  />
                )}
                {consolidatingPercent > 0 && (
                  <View
                    style={[
                      styles.progressBarSection,
                      styles.consolidatingSection,
                      { width: `${consolidatingPercent}%` },
                    ]}
                  />
                )}
                {learningPercent > 0 && (
                  <View
                    style={[
                      styles.progressBarSection,
                      styles.learningSection,
                      { width: `${learningPercent}%` },
                    ]}
                  />
                )}
              </View>

              {/* Stats */}
              <View style={styles.juzStats}>
                <View style={styles.statItem}>
                  <View style={[styles.statDot, styles.masteredDot]} />
                  <Text style={[styles.statText, { color: labelColor }]}>
                    {juz.mastered}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statDot, styles.consolidatingDot]} />
                  <Text style={[styles.statText, { color: labelColor }]}>
                    {juz.consolidating}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statDot, styles.learningDot]} />
                  <Text style={[styles.statText, { color: labelColor }]}>
                    {juz.learning}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  juzCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  juzHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  juzNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  juzProgress: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressBarSection: {
    height: '100%',
  },
  masteredSection: {
    backgroundColor: '#6BCB77',
  },
  consolidatingSection: {
    backgroundColor: '#FFD93D',
  },
  learningSection: {
    backgroundColor: '#4D96FF',
  },
  juzStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  masteredDot: {
    backgroundColor: '#6BCB77',
  },
  consolidatingDot: {
    backgroundColor: '#FFD93D',
  },
  learningDot: {
    backgroundColor: '#4D96FF',
  },
  statText: {
    fontSize: 11,
  },
});
