import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AudioPlayerScreen } from '../screens/AudioPlayerScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
};
