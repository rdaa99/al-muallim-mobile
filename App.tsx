import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FontSizeProvider } from './src/context/FontSizeContext';
import { ReviewScreen } from '@/screens/ReviewScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AudioPlayerScreen } from '@/screens/AudioPlayerScreen';
import { QuranScreen } from '@/screens/QuranScreen';
import { SurahListScreen } from '@/screens/SurahListScreen';
import { PlanningScreen } from '@/screens/PlanningScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { FocusModeScreen } from '@/screens/FocusModeScreen';
import { CollectionsScreen } from '@/screens/CollectionsScreen';
import { CollectionDetailScreen } from '@/screens/CollectionDetailScreen';
import { initDatabase, seedDatabase } from './src/services/database';
import type { RootTabParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator();

const CollectionsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CollectionsList" 
      component={CollectionsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CollectionDetail" 
      component={CollectionDetailScreen}
      options={({ route }) => ({
        title: 'Collection',
        headerShown: true,
      })}
    />
  </Stack.Navigator>
);

const AppContent: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await seedDatabase();
        setDbReady(true);
      } catch {
        setDbError(t('common.dbError', 'Database initialization error'));
      }
    };
    setup();
  }, [t]);

  if (dbError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: '#EF4444', fontSize: 16, textAlign: 'center' }}>{dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >
        <Tab.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            title: t('common.review'),
            tabBarLabel: t('common.review'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\uD83D\uDCD6'}</Text>,
          }}
        />
        <Tab.Screen
          name="Focus"
          component={FocusModeScreen}
          options={{
            title: t('common.focus', 'Focus'),
            tabBarLabel: t('common.focus', 'Focus'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\u23F1\uFE0F'}</Text>,
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: t('common.dashboard'),
            tabBarLabel: t('common.dashboard'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\uD83D\uDCCA'}</Text>,
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: t('common.stats'),
            tabBarLabel: t('common.stats'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\uD83D\uDCC8'}</Text>,
          }}
        />
        <Tab.Screen
          name="SurahList"
          component={SurahListScreen}
          options={{
            title: t('common.quran'),
            tabBarLabel: t('common.quran'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\uD83D\uDCD6'}</Text>,
          }}
        />
        <Tab.Screen
          name="AudioPlayer"
          component={AudioPlayerScreen}
          options={{
            title: t('common.audio'),
            tabBarLabel: t('common.audio'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\uD83C\uDFA7'}</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('common.settings'),
            tabBarLabel: t('common.settings'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\u2699\uFE0F'}</Text>,
          }}
        />
        <Tab.Screen
          name="Collections"
          component={CollectionsStack}
          options={{
            title: t('collections.title', 'Collections'),
            tabBarLabel: t('collections.title', 'Collections'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{'\uD83D\uDDC2\uFE0F'}</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <AppContent />
      </FontSizeProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default App;
