import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { AppData, RoutineStep, TimeOfDay } from '../types';
import { todayString, calculateStreak } from '../utils/storage';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function RoutineScreen({ data, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<TimeOfDay>('AM');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const today = todayString();

  const todayLog = data.dailyLogs.find(l => l.date === today);
  const completedToday = todayLog?.completedSteps ?? [];

  const steps = data.routineSteps
    .filter(s => s.timeOfDay === activeTab)
    .sort((a, b) => a.order - b.order);

  const allDoneForTab = steps.length > 0 && steps.every(s => completedToday.includes(s.id));
  const allSteps = data.routineSteps;
  const allDone = allSteps.length > 0 && allSteps.every(s => completedToday.includes(s.id));

  const toggleStep = useCallback((stepId: string) => {
    const logs = [...data.dailyLogs];
    const idx = logs.findIndex(l => l.date === today);
    let newCompleted: string[];

    if (idx >= 0) {
      const cur = logs[idx].completedSteps;
      newCompleted = cur.includes(stepId)
        ? cur.filter(id => id !== stepId)
        : [...cur, stepId];
      logs[idx] = { ...logs[idx], completedSteps: newCompleted };
    } else {
      newCompleted = [stepId];
      logs.push({ date: today, completedSteps: newCompleted });
    }

    const allNowDone = data.routineSteps.every(s => newCompleted.includes(s.id));
    let streak = data.streak;
    let lastCompleted = data.lastCompletedDate;

    if (allNowDone && lastCompleted !== today) {
      lastCompleted = today;
      streak = calculateStreak(logs, today);
    }

    onUpdate({ ...data, dailyLogs: logs, streak, lastCompletedDate: lastCompleted });
  }, [data, today, onUpdate]);

  const addStep = () => {
    if (!newStepName.trim()) return;
    const maxOrder = Math.max(0, ...data.routineSteps.filter(s => s.timeOfDay === activeTab).map(s => s.order));
    const newStep: RoutineStep = {
      id: Date.now().toString(),
      name: newStepName.trim(),
      timeOfDay: activeTab,
      order: maxOrder + 1,
    };
    onUpdate({ ...data, routineSteps: [...data.routineSteps, newStep] });
    setNewStepName('');
    setShowAddModal(false);
  };

  const deleteStep = (stepId: string) => {
    Alert.alert('Remove Step', 'Remove this step from your routine?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => onUpdate({ ...data, routineSteps: data.routineSteps.filter(s => s.id !== stepId) })
      }
    ]);
  };

  const amDone = data.routineSteps.filter(s => s.timeOfDay === 'AM').every(s => completedToday.includes(s.id));
  const pmDone = data.routineSteps.filter(s => s.timeOfDay === 'PM').every(s => completedToday.includes(s.id));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {activeTab === 'AM' ? 'Morning' : 'Evening'} ✨</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{data.streak}</Text>
          <Text style={styles.streakLabel}>streak</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'AM' && styles.tabActiveAM]}
          onPress={() => setActiveTab('AM')}
        >
          <Text style={[styles.tabText, activeTab === 'AM' && styles.tabTextActiveAM]}>
            ☀️ Morning {amDone ? '✓' : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'PM' && styles.tabActivePM]}
          onPress={() => setActiveTab('PM')}
        >
          <Text style={[styles.tabText, activeTab === 'PM' && styles.tabTextActivePM]}>
            🌙 Evening {pmDone ? '✓' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {steps.map((step, i) => {
          const done = completedToday.includes(step.id);
          return (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, done && styles.stepCardDone]}
              onPress={() => toggleStep(step.id)}
              onLongPress={() => deleteStep(step.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.stepNumber, done && styles.stepNumberDone]}>
                {done
                  ? <Text style={styles.checkmark}>✓</Text>
                  : <Text style={styles.stepNumText}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepName, done && styles.stepNameDone]}>{step.name}</Text>
              <View style={[styles.timeTag, { backgroundColor: activeTab === 'AM' ? COLORS.primaryLight : COLORS.accentLight }]}>
                <Text style={[styles.timeTagText, { color: activeTab === 'AM' ? COLORS.primaryDark : COLORS.accent }]}>
                  {activeTab}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add Step</Text>
        </TouchableOpacity>

        {allDoneForTab && (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>
              {activeTab === 'AM' ? 'Morning routine complete!' : 'Evening routine complete!'}
            </Text>
            {allDone && <Text style={styles.celebrationSub}>Full day done! Streak: {data.streak} 🔥</Text>}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add {activeTab} Step</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Eye Cream, Retinol..."
              placeholderTextColor={COLORS.textLight}
              value={newStepName}
              onChangeText={setNewStepName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addStep}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowAddModal(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={addStep}>
                <Text style={styles.btnPrimaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  greeting: { fontSize: 22, ...FONTS.bold, color: COLORS.text },
  date: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  streakBadge: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  streakEmoji: { fontSize: 18 },
  streakCount: { fontSize: 20, ...FONTS.bold, color: COLORS.primaryDark },
  streakLabel: { fontSize: 11, color: COLORS.primaryDark, ...FONTS.medium },
  tabContainer: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.border, borderRadius: RADIUS.lg, padding: 4,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  tabActiveAM: { backgroundColor: COLORS.AM },
  tabActivePM: { backgroundColor: COLORS.PM },
  tabText: { fontSize: 14, ...FONTS.medium, color: COLORS.textSecondary },
  tabTextActiveAM: { color: COLORS.white, ...FONTS.semiBold },
  tabTextActivePM: { color: COLORS.white, ...FONTS.semiBold },
  list: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  stepCardDone: { backgroundColor: COLORS.primaryLight, opacity: 0.9 },
  stepNumber: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepNumberDone: { backgroundColor: COLORS.primary },
  stepNumText: { fontSize: 13, ...FONTS.semiBold, color: COLORS.textSecondary },
  checkmark: { fontSize: 15, color: COLORS.white, ...FONTS.bold },
  stepName: { flex: 1, fontSize: 15, ...FONTS.medium, color: COLORS.text },
  stepNameDone: { color: COLORS.primaryDark, textDecorationLine: 'line-through' },
  timeTag: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
  timeTagText: { fontSize: 11, ...FONTS.semiBold },
  addButton: {
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addButtonText: { color: COLORS.primary, ...FONTS.semiBold, fontSize: 14 },
  celebrationCard: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg,
    padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md,
  },
  celebrationEmoji: { fontSize: 32, marginBottom: SPACING.xs },
  celebrationText: { fontSize: 16, ...FONTS.semiBold, color: COLORS.primaryDark },
  celebrationSub: { fontSize: 13, color: COLORS.primaryDark, marginTop: 4 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  btnPrimary: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center',
  },
  btnPrimaryText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 15 },
  btnSecondary: {
    flex: 1, backgroundColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center',
  },
  btnSecondaryText: { color: COLORS.textSecondary, ...FONTS.semiBold, fontSize: 15 },
});
