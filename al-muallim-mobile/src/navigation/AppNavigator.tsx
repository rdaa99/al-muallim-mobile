import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AudioPlayerScreen } from '../screens/AudioPlayerScreen';
import { RecitationScreen } from '../screens/RecitationScreen';
import { WordBreakdownScreen } from '../screens/WordBreakdownScreen';
import { FocusModeScreen } from '../screens/FocusModeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon = '';

          switch (route.name) {
            case 'Dashboard':
              icon = '📊';
              break;
            case 'AudioPlayer':
              icon = '🎧';
              break;
            case 'Settings':
              icon = '⚙️';
              break;
          }

          return <span style={{ fontSize: size }}>{icon}</span>;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Tableau de bord' }}
      />
      <Tab.Screen
        name="AudioPlayer"
        component={AudioPlayerScreen}
        options={{ tabBarLabel: 'Audio' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Paramètres' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Recitation" component={RecitationScreen} />
        <Stack.Screen name="WordBreakdown" component={WordBreakdownScreen} />
        <Stack.Screen name="FocusMode" component={FocusModeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
