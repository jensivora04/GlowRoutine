import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, SHADOW } from '../utils/theme';
import { AppData } from '../types';
import { todayString } from '../utils/storage';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
  onNavigate?: (tab: string) => void;
}

const MOODS = [
  { key: 'great', emoji: '😊', label: 'Glowing ✨', sub: 'Your skin is thriving!' },
  { key: 'good',  emoji: '🙂', label: 'Looking Good', sub: 'Keep up the routine!' },
  { key: 'okay',  emoji: '😐', label: 'Doing Okay',  sub: 'Hydrate & rest up 💧' },
  { key: 'bad',   emoji: '😔', label: 'Needs TLC',   sub: 'Be gentle with yourself 🌿' },
];

const SCHEDULE_WED_SUN: Record<number, { wednesday: string; sunday: string }> = {
  1: { wednesday: 'Mediheal Madecassoside', sunday: 'Biodance' },
  2: { wednesday: 'Goodal Vita C', sunday: 'Abib Gummy Madecassoside' },
  3: { wednesday: 'Mediheal Collagen', sunday: 'Medicube' },
  4: { wednesday: 'PRMR Mega Shot', sunday: 'Mediheal Vita C' },
  5: { wednesday: 'Biodance', sunday: 'Abib Gummy Heartleaf' },
  6: { wednesday: 'Mediheal Madecassoside', sunday: 'Goodal Vita C' },
  7: { wednesday: 'Medicube', sunday: 'Mediheal Collagen' },
  8: { wednesday: 'Biodance', sunday: 'PRMR Mega Shot' },
  9: { wednesday: 'Abib Gummy Madecassoside', sunday: 'Mediheal Vita C' },
  10: { wednesday: 'Mediheal Madecassoside', sunday: 'Biodance' },
  11: { wednesday: 'Goodal Vita C', sunday: 'Medicube' },
  12: { wednesday: 'Mediheal Collagen', sunday: 'Abib Gummy Heartleaf' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { greeting: 'Good Morning', emoji: '🌸', timeOfDay: 'AM' as const };
  if (h < 17) return { greeting: 'Good Afternoon', emoji: '☀️', timeOfDay: 'AM' as const };
  return { greeting: 'Good Evening', emoji: '🌙', timeOfDay: 'PM' as const };
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

function WaterRing({ current, total }: { current: number; total: number }) {
  const pct = Math.min(current / total, 1);
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: COLORS.border,
      }} />
      {/* Simple fill indicator using border coloring trick */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke,
        borderTopColor: COLORS.primary,
        borderRightColor: pct >= 0.25 ? COLORS.primary : COLORS.border,
        borderBottomColor: pct >= 0.5 ? COLORS.primary : COLORS.border,
        borderLeftColor: pct >= 0.75 ? COLORS.primary : COLORS.border,
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 16, ...FONTS.bold, color: COLORS.text }}>{current}/{total}</Text>
        <Text style={{ fontSize: 9, color: COLORS.textSecondary, ...FONTS.medium }}>glasses</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ data, onUpdate, onNavigate }: Props) {
  const today = todayString();
  const { greeting, emoji, timeOfDay } = getGreeting();
  const dayOfWeek = new Date().getDay(); // 0=Sun, 3=Wed

  const todayLog = data.dailyLogs.find(l => l.date === today);
  const completedToday = todayLog?.completedSteps ?? [];
  const todaySteps = data.routineSteps
    .filter(s => s.timeOfDay === timeOfDay)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);
  const doneCount = todaySteps.filter(s => completedToday.includes(s.id)).length;

  const waterLog = data.waterLogs.find(l => l.date === today);
  const waterGlasses = waterLog?.glasses ?? 0;

  const todayJournal = data.journalEntries.find(e => e.date === today);
  const todayMood = todayJournal ? MOODS.find(m => m.key === todayJournal.mood) : null;
  const displayMood = todayMood ?? MOODS[0];

  // Mask for today
  const maskWeek = Math.min(Math.floor(data.maskLogs.length / 2) + 1, 12);
  const todayMaskName = dayOfWeek === 3
    ? SCHEDULE_WED_SUN[maskWeek]?.wednesday
    : dayOfWeek === 0
    ? SCHEDULE_WED_SUN[maskWeek]?.sunday
    : null;
  const maskLogged = data.maskLogs.some(l => l.date === today);

  const addWater = useCallback(() => {
    if (waterGlasses >= 8) return;
    const newGlasses = waterGlasses + 1;
    const newLogs = waterLog
      ? data.waterLogs.map(l => l.date === today ? { ...l, glasses: newGlasses } : l)
      : [...data.waterLogs, { date: today, glasses: newGlasses }];
    onUpdate({ ...data, waterLogs: newLogs });
  }, [data, today, waterGlasses, waterLog, onUpdate]);

  const removeWater = useCallback(() => {
    if (waterGlasses <= 0) return;
    const newGlasses = waterGlasses - 1;
    const newLogs = data.waterLogs.map(l => l.date === today ? { ...l, glasses: newGlasses } : l);
    onUpdate({ ...data, waterLogs: newLogs });
  }, [data, today, waterGlasses, onUpdate]);

  const toggleStep = useCallback((stepId: string) => {
    const logs = [...data.dailyLogs];
    const idx = logs.findIndex(l => l.date === today);
    if (idx >= 0) {
      const cur = logs[idx].completedSteps;
      logs[idx] = {
        ...logs[idx],
        completedSteps: cur.includes(stepId) ? cur.filter(id => id !== stepId) : [...cur, stepId],
      };
    } else {
      logs.push({ date: today, completedSteps: [stepId] });
    }
    onUpdate({ ...data, dailyLogs: logs });
  }, [data, today, onUpdate]);

  const QUICK_ACTIONS = [
    { emoji: '✨', label: 'Routine', tab: 'Routine' },
    { emoji: '🧴', label: 'Products', tab: 'Products' },
    { emoji: '🎭', label: 'Masks', tab: 'Masks' },
    { emoji: '📓', label: 'Journal', tab: 'Journal' },
    { emoji: '🤳', label: 'Progress', tab: 'Progress' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>GlowRoutine <Text style={styles.appNameHeart}>♡</Text></Text>
            <Text style={styles.appTagline}>for your best skin days ✦</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakPill}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNum}>{data.streak}</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>J</Text></View>
          </View>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText}>{greeting}, J {emoji}</Text>
          <Text style={styles.greetingDate}>{getFormattedDate()}</Text>
        </View>

        {/* ── Mood Card ── */}
        <View style={[styles.card, styles.moodCard]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Today's Mood</Text>
            <Text style={styles.moodTitle}>{displayMood.label}</Text>
            <Text style={styles.moodSub}>{displayMood.sub}</Text>
          </View>
          <Text style={styles.moodEmoji}>{displayMood.emoji === '😊' ? '☁️' : displayMood.emoji}</Text>
        </View>

        {/* ── Today's Routine ── */}
        <View style={[styles.card, styles.routineCard]}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>Today's Routine</Text>
            <TouchableOpacity onPress={() => onNavigate?.('Routine')}>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.routineProgress}>
            <View style={[styles.routineBar, { width: `${todaySteps.length ? (doneCount / todaySteps.length) * 100 : 0}%` }]} />
          </View>
          <Text style={styles.routineSubtext}>{doneCount}/{todaySteps.length} steps done · {timeOfDay === 'AM' ? '☀️ Morning' : '🌙 Evening'}</Text>
          <View style={styles.stepsList}>
            {todaySteps.map(step => {
              const done = completedToday.includes(step.id);
              return (
                <TouchableOpacity key={step.id} style={styles.stepRow} onPress={() => toggleStep(step.id)} activeOpacity={0.7}>
                  <View style={[styles.stepCheck, done && styles.stepCheckDone]}>
                    {done && <Text style={styles.stepCheckMark}>✓</Text>}
                  </View>
                  <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Mask + Water ── */}
        <View style={styles.rowCards}>
          {/* Mask Card */}
          <View style={[styles.halfCard, styles.maskCard]}>
            <Text style={styles.cardLabel}>Today's Mask</Text>
            {todayMaskName ? (
              <>
                <Text style={styles.maskName}>{todayMaskName}</Text>
                <Text style={styles.maskSub}>Sheet Mask · ~18 min</Text>
                {!maskLogged && (
                  <TouchableOpacity onPress={() => onNavigate?.('Masks')} style={styles.maskBtn}>
                    <Text style={styles.maskBtnText}>Log Use</Text>
                  </TouchableOpacity>
                )}
                {maskLogged && <Text style={styles.maskDone}>✓ Done today!</Text>}
              </>
            ) : (
              <>
                <Text style={styles.maskNoDay}>😴</Text>
                <Text style={styles.maskNoDayText}>Not today</Text>
                <Text style={styles.maskSub}>Wed & Sun only</Text>
              </>
            )}
          </View>

          {/* Water Card */}
          <View style={[styles.halfCard, styles.waterCard]}>
            <Text style={styles.cardLabel}>Water Intake 💧</Text>
            <WaterRing current={waterGlasses} total={8} />
            <View style={styles.waterBtns}>
              <TouchableOpacity style={styles.waterBtn} onPress={removeWater}>
                <Text style={styles.waterBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.waterBtn, styles.waterBtnAdd]} onPress={addWater}>
                <Text style={[styles.waterBtnText, { color: COLORS.white }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity key={action.tab} style={styles.quickAction} onPress={() => onNavigate?.(action.tab)}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Stats Strip ── */}
        <View style={styles.statsStrip}>
          {[
            { label: 'Products', value: data.products.length, emoji: '🧴' },
            { label: 'Journal', value: data.journalEntries.length, emoji: '📓' },
            { label: 'Photos', value: data.progressPhotos.length, emoji: '🤳' },
            { label: 'Masks Used', value: data.maskLogs.length, emoji: '🎭' },
          ].map(stat => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  appName: { fontSize: 26, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5 },
  appNameHeart: { color: COLORS.primary, fontSize: 22 },
  appTagline: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  streakFire: { fontSize: 14 },
  streakNum: { fontSize: 14, ...FONTS.bold, color: COLORS.primaryDark },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 15, ...FONTS.bold },

  greetingRow: { paddingVertical: SPACING.sm },
  greetingText: { fontSize: 22, ...FONTS.bold, color: COLORS.text },
  greetingDate: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.text },
  cardLabel: { fontSize: 11, ...FONTS.semiBold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  viewAll: { fontSize: 13, color: COLORS.primary, ...FONTS.semiBold },

  moodCard: { backgroundColor: COLORS.primaryLighter, flexDirection: 'row', alignItems: 'center' },
  moodTitle: { fontSize: 20, ...FONTS.bold, color: COLORS.text, marginBottom: 4 },
  moodSub: { fontSize: 13, color: COLORS.textSecondary },
  moodEmoji: { fontSize: 52, marginLeft: SPACING.md },

  routineCard: {},
  routineProgress: {
    height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full,
    overflow: 'hidden', marginBottom: 6,
  },
  routineBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  routineSubtext: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  stepsList: { gap: SPACING.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCheckDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepCheckMark: { color: COLORS.white, fontSize: 12, ...FONTS.bold },
  stepLabel: { fontSize: 14, color: COLORS.text, ...FONTS.medium },
  stepLabelDone: { color: COLORS.textLight, textDecorationLine: 'line-through' },

  rowCards: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  halfCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.md, ...SHADOW.sm,
  },
  maskCard: { backgroundColor: COLORS.card2 },
  maskName: { fontSize: 13, ...FONTS.bold, color: COLORS.text, marginBottom: 3, lineHeight: 18 },
  maskSub: { fontSize: 11, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  maskBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  maskBtnText: { color: COLORS.white, fontSize: 11, ...FONTS.semiBold },
  maskDone: { fontSize: 12, color: COLORS.success, ...FONTS.semiBold, marginTop: 4 },
  maskNoDay: { fontSize: 24, marginBottom: 2 },
  maskNoDayText: { fontSize: 13, ...FONTS.semiBold, color: COLORS.text },

  waterCard: { backgroundColor: COLORS.card3, alignItems: 'center' },
  waterBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  waterBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  waterBtnAdd: { backgroundColor: COLORS.primary },
  waterBtnText: { fontSize: 18, ...FONTS.bold, color: COLORS.textSecondary },

  sectionTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  quickAction: { alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    ...SHADOW.sm,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionLabel: { fontSize: 11, color: COLORS.textSecondary, ...FONTS.medium },

  statsStrip: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: SPACING.md,
    justifyContent: 'space-around', ...SHADOW.sm,
  },
  statItem: { alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 17, ...FONTS.bold, color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
});
