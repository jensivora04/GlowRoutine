import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppData } from './src/types';
import { loadData, saveData } from './src/utils/storage';
import { COLORS } from './src/utils/theme';
import RoutineScreen from './src/screens/RoutineScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

type TabIconProps = { focused: boolean; color: string };

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
    </View>
  );
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  const handleUpdate = useCallback(async (newData: AppData) => {
    setData(newData);
    await saveData(newData);
  }, []);

  if (!data) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>✨</Text>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>GlowRoutine</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textLight,
            tabBarLabelStyle: styles.tabLabel,
          }}
        >
          <Tab.Screen
            name="Routine"
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
            }}
          >
            {() => <RoutineScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>

          <Tab.Screen
            name="Products"
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="🧴" focused={focused} />,
            }}
          >
            {() => <ProductsScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>

          <Tab.Screen
            name="Journal"
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="📓" focused={focused} />,
            }}
          >
            {() => <JournalScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>

          <Tab.Screen
            name="Progress"
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="🤳" focused={focused} />,
            }}
          >
            {() => <ProgressScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>

          <Tab.Screen
            name="Settings"
            options={{
              tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
            }}
          >
            {() => <SettingsScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  loadingEmoji: { fontSize: 48 },
  loadingText: { fontSize: 22, color: COLORS.primaryDark, fontWeight: '700' },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
