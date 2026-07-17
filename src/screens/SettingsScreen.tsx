import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import {
  requestNotificationPermissions,
  scheduleRoutineReminder,
  cancelAllReminders,
  getScheduledReminders,
} from '../utils/notifications';
import { AppData } from '../types';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const TIME_OPTIONS_AM = [
  { label: '6:00 AM', hour: 6, minute: 0 },
  { label: '6:30 AM', hour: 6, minute: 30 },
  { label: '7:00 AM', hour: 7, minute: 0 },
  { label: '7:30 AM', hour: 7, minute: 30 },
  { label: '8:00 AM', hour: 8, minute: 0 },
  { label: '8:30 AM', hour: 8, minute: 30 },
  { label: '9:00 AM', hour: 9, minute: 0 },
];

const TIME_OPTIONS_PM = [
  { label: '8:00 PM', hour: 20, minute: 0 },
  { label: '8:30 PM', hour: 20, minute: 30 },
  { label: '9:00 PM', hour: 21, minute: 0 },
  { label: '9:30 PM', hour: 21, minute: 30 },
  { label: '10:00 PM', hour: 22, minute: 0 },
  { label: '10:30 PM', hour: 22, minute: 30 },
  { label: '11:00 PM', hour: 23, minute: 0 },
];

export default function SettingsScreen({ data, onUpdate }: Props) {
  const [amEnabled, setAmEnabled] = useState(false);
  const [pmEnabled, setPmEnabled] = useState(false);
  const [amTime, setAmTime] = useState(TIME_OPTIONS_AM[2]);
  const [pmTime, setPmTime] = useState(TIME_OPTIONS_PM[2]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkScheduled();
  }, []);

  const checkScheduled = async () => {
    const scheduled = await getScheduledReminders();
    setAmEnabled(scheduled.some(n => (n.content.title as string)?.includes('Morning')));
    setPmEnabled(scheduled.some(n => (n.content.title as string)?.includes('Evening')));
  };

  const toggleAM = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
      setHasPermission(true);
      await scheduleRoutineReminder(amTime.hour, amTime.minute, 'AM');
      setAmEnabled(true);
      Alert.alert('Reminder set!', `You'll be reminded at ${amTime.label} every day ☀️`);
    } else {
      const scheduled = await getScheduledReminders();
      for (const n of scheduled) {
        if ((n.content.title as string)?.includes('Morning')) {
          const { cancelScheduledNotificationAsync } = await import('expo-notifications');
          await cancelScheduledNotificationAsync(n.identifier);
        }
      }
      setAmEnabled(false);
    }
  };

  const togglePM = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
      setHasPermission(true);
      await scheduleRoutineReminder(pmTime.hour, pmTime.minute, 'PM');
      setPmEnabled(true);
      Alert.alert('Reminder set!', `You'll be reminded at ${pmTime.label} every day 🌙`);
    } else {
      const scheduled = await getScheduledReminders();
      for (const n of scheduled) {
        if ((n.content.title as string)?.includes('Evening')) {
          const { cancelScheduledNotificationAsync } = await import('expo-notifications');
          await cancelScheduledNotificationAsync(n.identifier);
        }
      }
      setPmEnabled(false);
    }
  };

  const totalSteps = data.routineSteps.length;
  const totalProducts = data.products.length;
  const totalEntries = data.journalEntries.length;
  const totalPhotos = data.progressPhotos.length;
  const totalDaysLogged = data.dailyLogs.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>My Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { emoji: '🔥', value: data.streak, label: 'Day Streak' },
              { emoji: '📅', value: totalDaysLogged, label: 'Days Logged' },
              { emoji: '✨', value: totalSteps, label: 'Routine Steps' },
              { emoji: '🧴', value: totalProducts, label: 'Products' },
              { emoji: '📓', value: totalEntries, label: 'Journal Entries' },
              { emoji: '🤳', value: totalPhotos, label: 'Photos' },
            ].map(stat => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          <Text style={styles.sectionSubtitle}>Get nudged to complete your routine</Text>

          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderEmoji}>☀️</Text>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>Morning Routine</Text>
                <Text style={styles.reminderSubtitle}>AM skincare reminder</Text>
              </View>
              <Switch
                value={amEnabled}
                onValueChange={toggleAM}
                trackColor={{ false: COLORS.border, true: COLORS.AM }}
                thumbColor={COLORS.white}
              />
            </View>
            {!amEnabled && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {TIME_OPTIONS_AM.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.timeChip, amTime.label === opt.label && styles.timeChipActive]}
                    onPress={() => setAmTime(opt)}
                  >
                    <Text style={[styles.timeChipText, amTime.label === opt.label && styles.timeChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderEmoji}>🌙</Text>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>Evening Routine</Text>
                <Text style={styles.reminderSubtitle}>PM skincare reminder</Text>
              </View>
              <Switch
                value={pmEnabled}
                onValueChange={togglePM}
                trackColor={{ false: COLORS.border, true: COLORS.PM }}
                thumbColor={COLORS.white}
              />
            </View>
            {!pmEnabled && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {TIME_OPTIONS_PM.map(opt => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[styles.timeChip, pmTime.label === opt.label && styles.timeChipActive]}
                    onPress={() => setPmTime(opt)}
                  >
                    <Text style={[styles.timeChipText, pmTime.label === opt.label && styles.timeChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutEmoji}>✨</Text>
            <Text style={styles.aboutName}>GlowRoutine</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutTagline}>Your daily skincare companion</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontSize: 22, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, ...FONTS.bold, color: COLORS.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  section: { marginBottom: SPACING.xl },
  statsCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md, gap: SPACING.sm },
  statItem: {
    width: '30%', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, ...FONTS.bold, color: COLORS.text, marginTop: 4 },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  reminderCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  reminderHeader: { flexDirection: 'row', alignItems: 'center' },
  reminderEmoji: { fontSize: 24, marginRight: SPACING.md },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: 15, ...FONTS.semiBold, color: COLORS.text },
  reminderSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  timeScroll: { marginTop: SPACING.sm },
  timeChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  timeChipActive: { backgroundColor: COLORS.primary },
  timeChipText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
  timeChipTextActive: { color: COLORS.white },
  aboutCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  aboutEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  aboutName: { fontSize: 20, ...FONTS.bold, color: COLORS.text },
  aboutVersion: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  aboutTagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
