import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { AppData, MaskWeek } from '../types';
import { todayString, formatDate } from '../utils/storage';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const SCHEDULE: MaskWeek[] = [
  { week: 1,  wednesday: 'Mediheal Madecassoside',  sunday: 'Biodance' },
  { week: 2,  wednesday: 'Goodal Vita C',            sunday: 'Abib Gummy Madecassoside' },
  { week: 3,  wednesday: 'Mediheal Collagen',        sunday: 'Medicube' },
  { week: 4,  wednesday: 'PRMR Mega Shot',           sunday: 'Mediheal Vita C' },
  { week: 5,  wednesday: 'Biodance',                 sunday: 'Abib Gummy Heartleaf' },
  { week: 6,  wednesday: 'Mediheal Madecassoside',   sunday: 'Goodal Vita C' },
  { week: 7,  wednesday: 'Medicube',                 sunday: 'Mediheal Collagen' },
  { week: 8,  wednesday: 'Biodance',                 sunday: 'PRMR Mega Shot' },
  { week: 9,  wednesday: 'Abib Gummy Madecassoside', sunday: 'Mediheal Vita C' },
  { week: 10, wednesday: 'Mediheal Madecassoside',   sunday: 'Biodance' },
  { week: 11, wednesday: 'Goodal Vita C',            sunday: 'Medicube' },
  { week: 12, wednesday: 'Mediheal Collagen',        sunday: 'Abib Gummy Heartleaf' },
];

// Pastel color per brand family
const MASK_COLORS: Record<string, string> = {
  'Mediheal Madecassoside':  '#D4E8C4',
  'Mediheal Vita C':         '#FFF0C0',
  'Mediheal Collagen':       '#D4EEF5',
  'Biodance':                '#F5D4E8',
  'Medicube':                '#E8D4F5',
  'PRMR Mega Shot':          '#FFE0B0',
  'Goodal Vita C':           '#FFF5C0',
  'Abib Gummy Madecassoside':'#D4F5E8',
  'Abib Gummy Heartleaf':    '#C8F0D8',
};

function getCurrentWeekInfo() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 3=Wed
  // Figure out which schedule week we're on based on weeks elapsed since a reference Wednesday
  // Reference: use week 1 as a relative counter from app start; we'll use mask logs to track
  return { day, todayStr: today.toISOString().split('T')[0] };
}

function getActiveWeek(maskLogs: AppData['maskLogs']): number {
  // Count unique Wed/Sun pairs used → derive current week
  const usedDates = new Set(maskLogs.map(l => l.date));
  // Each week has 2 sessions; number of distinct session-days used
  const sessionsUsed = usedDates.size;
  const weeksCompleted = Math.floor(sessionsUsed / 2);
  return Math.min(weeksCompleted + 1, 12);
}

export default function MasksScreen({ data, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'stock'>('schedule');
  const today = todayString();
  const { day } = getCurrentWeekInfo();
  const isWednesday = day === 3;
  const isSunday = day === 0;

  const activeWeek = getActiveWeek(data.maskLogs);
  const currentWeekData = SCHEDULE.find(s => s.week === activeWeek) ?? SCHEDULE[0];
  const todayMask = isWednesday ? currentWeekData.wednesday : isSunday ? currentWeekData.sunday : null;
  const todayAlreadyLogged = data.maskLogs.some(l => l.date === today);

  const logMask = (maskName: string) => {
    if (todayAlreadyLogged) {
      Alert.alert('Already logged', 'You already logged a mask for today!');
      return;
    }
    const newLog = { date: today, maskName };
    const newLogs = [...data.maskLogs, newLog];

    // Update stock
    const newStock = data.maskStock.map(s =>
      s.name === maskName ? { ...s, used: s.used + 1 } : s
    );

    onUpdate({ ...data, maskLogs: newLogs, maskStock: newStock });
    Alert.alert('Mask logged! 🎭', `${maskName} added to your log.`);
  };

  const removeLog = (date: string) => {
    const log = data.maskLogs.find(l => l.date === date);
    if (!log) return;
    Alert.alert('Remove log', `Remove mask log for ${formatDate(date)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          const newLogs = data.maskLogs.filter(l => l.date !== date);
          const newStock = data.maskStock.map(s =>
            s.name === log.maskName ? { ...s, used: Math.max(0, s.used - 1) } : s
          );
          onUpdate({ ...data, maskLogs: newLogs, maskStock: newStock });
        }
      }
    ]);
  };

  const sortedLogs = [...data.maskLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Face Masks 🎭</Text>
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>Week {activeWeek}/12</Text>
        </View>
      </View>

      {/* Today's mask card */}
      {todayMask ? (
        <View style={[styles.todayCard, { backgroundColor: MASK_COLORS[todayMask] ?? COLORS.primaryLight }]}>
          <Text style={styles.todayLabel}>Today's Mask ({isWednesday ? 'Wednesday' : 'Sunday'})</Text>
          <Text style={styles.todayMaskName}>{todayMask}</Text>
          {!todayAlreadyLogged ? (
            <TouchableOpacity style={styles.logBtn} onPress={() => logMask(todayMask)}>
              <Text style={styles.logBtnText}>✓ Mark as Used</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.loggedBadge}>
              <Text style={styles.loggedBadgeText}>✓ Done today!</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noMaskCard}>
          <Text style={styles.noMaskEmoji}>😴</Text>
          <Text style={styles.noMaskText}>No mask today</Text>
          <Text style={styles.noMaskSub}>Mask days are Wednesday & Sunday</Text>
        </View>
      )}

      {/* Tab switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.tabActive]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.tabTextActive]}>📅 Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stock' && styles.tabActive]}
          onPress={() => setActiveTab('stock')}
        >
          <Text style={[styles.tabText, activeTab === 'stock' && styles.tabTextActive]}>📦 Stock</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'schedule' ? (
          <>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleCol}>Week</Text>
              <Text style={[styles.scheduleCol, { flex: 2 }]}>Wednesday</Text>
              <Text style={[styles.scheduleCol, { flex: 2 }]}>Sunday</Text>
            </View>
            {SCHEDULE.map(week => {
              const isActive = week.week === activeWeek;
              const isPast = week.week < activeWeek;
              return (
                <View key={week.week} style={[styles.scheduleRow, isActive && styles.scheduleRowActive, isPast && styles.scheduleRowPast]}>
                  <View style={[styles.weekNumCircle, isActive && styles.weekNumCircleActive, isPast && styles.weekNumCirclePast]}>
                    <Text style={[styles.weekNum, isActive && styles.weekNumActive, isPast && styles.weekNumPast]}>
                      {isPast ? '✓' : week.week}
                    </Text>
                  </View>
                  <View style={{ flex: 2, paddingRight: 4 }}>
                    <View style={[styles.maskChip, { backgroundColor: MASK_COLORS[week.wednesday] ?? COLORS.border }]}>
                      <Text style={styles.maskChipText} numberOfLines={2}>{week.wednesday}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 2 }}>
                    <View style={[styles.maskChip, { backgroundColor: MASK_COLORS[week.sunday] ?? COLORS.border }]}>
                      <Text style={styles.maskChipText} numberOfLines={2}>{week.sunday}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {sortedLogs.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recent Logs</Text>
                {sortedLogs.slice(0, 8).map(log => (
                  <TouchableOpacity key={log.date} style={styles.logRow} onLongPress={() => removeLog(log.date)}>
                    <View style={[styles.logDot, { backgroundColor: MASK_COLORS[log.maskName] ?? COLORS.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logMaskName}>{log.maskName}</Text>
                      <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                    </View>
                    <Text style={styles.logCheck}>✓</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.stockNote}>Tap a mask to manually mark one used</Text>
            {data.maskStock.map(item => {
              const remaining = item.start - item.used;
              const pct = remaining / item.start;
              const barColor = pct > 0.5 ? COLORS.success : pct > 0.25 ? '#F0C040' : COLORS.danger;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.stockCard}
                  onPress={() => {
                    Alert.alert(item.name, `Log one use of ${item.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Use One', onPress: () => {
                          if (remaining <= 0) { Alert.alert('Out of stock!', 'No more left.'); return; }
                          const newStock = data.maskStock.map(s =>
                            s.name === item.name ? { ...s, used: s.used + 1 } : s
                          );
                          const newLog = { date: today, maskName: item.name };
                          onUpdate({ ...data, maskStock: newStock, maskLogs: [...data.maskLogs, newLog] });
                        }
                      }
                    ]);
                  }}
                >
                  <View style={styles.stockTop}>
                    <View style={[styles.stockDot, { backgroundColor: MASK_COLORS[item.name] ?? COLORS.border }]} />
                    <Text style={styles.stockName}>{item.name}</Text>
                    <Text style={[styles.stockRemaining, { color: barColor }]}>{remaining} left</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.max(0, pct) * 100}%`, backgroundColor: barColor }]} />
                  </View>
                  <View style={styles.stockMeta}>
                    <Text style={styles.stockMetaText}>Started: {item.start}</Text>
                    <Text style={styles.stockMetaText}>Used: {item.used}</Text>
                    <Text style={styles.stockMetaText}>Remaining: {remaining}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  title: { fontSize: 22, ...FONTS.bold, color: COLORS.text },
  weekBadge: { backgroundColor: COLORS.accentLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  weekBadgeText: { fontSize: 13, ...FONTS.semiBold, color: COLORS.accent },
  todayCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
  },
  todayLabel: { fontSize: 12, ...FONTS.semiBold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  todayMaskName: { fontSize: 20, ...FONTS.bold, color: COLORS.text, marginVertical: SPACING.sm },
  logBtn: {
    backgroundColor: COLORS.text, borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start', marginTop: 4,
  },
  logBtnText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 14 },
  loggedBadge: {
    backgroundColor: COLORS.success + '30', borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start', marginTop: 4,
  },
  loggedBadgeText: { color: COLORS.success, ...FONTS.semiBold, fontSize: 14 },
  noMaskCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg,
    padding: SPACING.lg, backgroundColor: COLORS.surface,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  noMaskEmoji: { fontSize: 32, marginBottom: 4 },
  noMaskText: { fontSize: 16, ...FONTS.semiBold, color: COLORS.text },
  noMaskSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  tabContainer: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.border, borderRadius: RADIUS.lg, padding: 4,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, ...FONTS.medium, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white, ...FONTS.semiBold },
  list: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.lg },
  scheduleHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingBottom: SPACING.sm, marginBottom: 4,
  },
  scheduleCol: { flex: 1, fontSize: 11, ...FONTS.semiBold, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  scheduleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.sm, marginBottom: SPACING.sm,
  },
  scheduleRowActive: { borderWidth: 2, borderColor: COLORS.primary },
  scheduleRowPast: { opacity: 0.55 },
  weekNumCircle: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  weekNumCircleActive: { backgroundColor: COLORS.primary },
  weekNumCirclePast: { backgroundColor: COLORS.success },
  weekNum: { fontSize: 13, ...FONTS.bold, color: COLORS.textSecondary },
  weekNumActive: { color: COLORS.white },
  weekNumPast: { color: COLORS.white, fontSize: 11 },
  maskChip: { borderRadius: RADIUS.sm, padding: 6 },
  maskChipText: { fontSize: 11, ...FONTS.medium, color: COLORS.text, lineHeight: 15 },
  sectionTitle: { fontSize: 14, ...FONTS.bold, color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.sm },
  logRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  logDot: { width: 10, height: 10, borderRadius: RADIUS.full, marginRight: SPACING.md },
  logMaskName: { fontSize: 14, ...FONTS.semiBold, color: COLORS.text },
  logDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  logCheck: { fontSize: 16, color: COLORS.success },
  stockNote: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md, textAlign: 'center' },
  stockCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  stockTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  stockDot: { width: 12, height: 12, borderRadius: RADIUS.full, marginRight: SPACING.sm },
  stockName: { flex: 1, fontSize: 14, ...FONTS.semiBold, color: COLORS.text },
  stockRemaining: { fontSize: 14, ...FONTS.bold },
  barTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.sm },
  barFill: { height: '100%', borderRadius: RADIUS.full },
  stockMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  stockMetaText: { fontSize: 11, color: COLORS.textSecondary },
});
