import React, { useEffect, useState, useCallback, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppData } from './src/types';
import { loadData, saveData } from './src/utils/storage';
import { COLORS, FONTS, RADIUS, SPACING } from './src/utils/theme';
import HomeScreen from './src/screens/HomeScreen';
import RoutineScreen from './src/screens/RoutineScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import MasksScreen from './src/screens/MasksScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:     { active: '🏠', inactive: '🏡' },
  Routine:  { active: '✨', inactive: '✦' },
  Products: { active: '🧴', inactive: '🧴' },
  Masks:    { active: '🎭', inactive: '🎭' },
  Journal:  { active: '📓', inactive: '📒' },
  Progress: { active: '📈', inactive: '📊' },
  Settings: { active: '⚙️', inactive: '⚙️' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons = TAB_ICONS[name] ?? { active: '●', inactive: '○' };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
      <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.55 }}>
        {focused ? icons.active : icons.inactive}
      </Text>
    </View>
  );
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const navRef = useRef<any>(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  const handleUpdate = useCallback(async (newData: AppData) => {
    setData(newData);
    await saveData(newData);
  }, []);

  const navigateTo = useCallback((tab: string) => {
    navRef.current?.navigate(tab);
  }, []);

  if (!data) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>🌸</Text>
        <Text style={styles.loadingName}>GlowRoutine</Text>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer ref={navRef}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textLight,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabItem,
          })}
        >
          <Tab.Screen name="Home">
            {() => <HomeScreen data={data} onUpdate={handleUpdate} onNavigate={navigateTo} />}
          </Tab.Screen>
          <Tab.Screen name="Routine">
            {() => <RoutineScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>
          <Tab.Screen name="Products">
            {() => <ProductsScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>
          <Tab.Screen name="Masks">
            {() => <MasksScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>
          <Tab.Screen name="Journal">
            {() => <JournalScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>
          <Tab.Screen name="Progress">
            {() => <ProgressScreen data={data} onUpdate={handleUpdate} />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
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
    alignItems: 'center', justifyContent: 'center',
  },
  loadingEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  loadingName: { fontSize: 28, ...FONTS.bold, color: COLORS.primaryDark, letterSpacing: -0.5 },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 14,
    paddingTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 0,
  },
  tabItem: {
    paddingTop: 2,
  },
});
