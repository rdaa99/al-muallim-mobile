import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ReviewScreen } from '@/screens/ReviewScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { initDatabase, seedDatabase } from './src/services/database';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  useEffect(() => {
    const setup = async () => {
      try {
        console.log('Initializing database...');
        await initDatabase();
        await seedDatabase();
        console.log('Database ready!');
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };
    setup();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
          tabBarStyle: {
            backgroundColor: '#1E293B',
            borderTopColor: '#334155',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#64748B',
        }}
      >
        <Tab.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            title: 'Révision',
            tabBarLabel: 'Révision',
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Tableau de bord',
            tabBarLabel: 'Stats',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Paramètres',
            tabBarLabel: 'Paramètres',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
