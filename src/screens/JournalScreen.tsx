import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Pressable, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { AppData, JournalEntry } from '../types';
import { todayString, formatDate } from '../utils/storage';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

type Mood = 'great' | 'good' | 'okay' | 'bad';
const MOODS: { key: Mood; emoji: string; label: string; color: string }[] = [
  { key: 'great', emoji: '😊', label: 'Great', color: '#6BAE85' },
  { key: 'good', emoji: '🙂', label: 'Good', color: '#A8C5A0' },
  { key: 'okay', emoji: '😐', label: 'Okay', color: '#F0C080' },
  { key: 'bad', emoji: '😔', label: 'Bad', color: '#E07070' },
];

const CONCERNS = ['Dryness', 'Oiliness', 'Breakout', 'Redness', 'Sensitivity', 'Dullness', 'Dark Spots', 'Fine Lines', 'Puffiness', 'Uneven Tone'];

export default function JournalScreen({ data, onUpdate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState<{ mood: Mood; notes: string; concerns: string[] }>({
    mood: 'good', notes: '', concerns: []
  });

  const sortedEntries = [...data.journalEntries].sort((a, b) => b.date.localeCompare(a.date));

  const openAdd = () => {
    setEditingEntry(null);
    setForm({ mood: 'good', notes: '', concerns: [] });
    setShowModal(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setForm({ mood: entry.mood, notes: entry.notes, concerns: entry.concerns });
    setShowModal(true);
  };

  const toggleConcern = (concern: string) => {
    setForm(f => ({
      ...f,
      concerns: f.concerns.includes(concern)
        ? f.concerns.filter(c => c !== concern)
        : [...f.concerns, concern]
    }));
  };

  const save = () => {
    if (!form.notes.trim() && form.concerns.length === 0) return;
    if (editingEntry) {
      const updated = data.journalEntries.map(e => e.id === editingEntry.id ? { ...e, ...form } : e);
      onUpdate({ ...data, journalEntries: updated });
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: todayString(),
        ...form,
      };
      onUpdate({ ...data, journalEntries: [...data.journalEntries, newEntry] });
    }
    setShowModal(false);
  };

  const deleteEntry = (id: string) => {
    Alert.alert('Delete Entry', 'Delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate({ ...data, journalEntries: data.journalEntries.filter(e => e.id !== id) }) }
    ]);
  };

  const getMoodInfo = (mood: Mood) => MOODS.find(m => m.key === mood) ?? MOODS[1];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Skin Journal</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Entry</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {sortedEntries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📓</Text>
            <Text style={styles.emptyText}>No journal entries yet</Text>
            <Text style={styles.emptySubtext}>Track how your skin feels day to day</Text>
          </View>
        ) : (
          sortedEntries.map(entry => {
            const mood = getMoodInfo(entry.mood);
            return (
              <TouchableOpacity key={entry.id} style={styles.card} onPress={() => openEdit(entry)} onLongPress={() => deleteEntry(entry.id)}>
                <View style={styles.cardTop}>
                  <View style={[styles.moodBadge, { backgroundColor: mood.color + '30' }]}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                  </View>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                {entry.notes ? <Text style={styles.entryNotes} numberOfLines={2}>{entry.notes}</Text> : null}
                {entry.concerns.length > 0 && (
                  <View style={styles.tagRow}>
                    {entry.concerns.map(c => (
                      <View key={c} style={styles.concernTag}>
                        <Text style={styles.concernTagText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingEntry ? 'Edit Entry' : 'New Entry'}</Text>

              <Text style={styles.label}>How is your skin today?</Text>
              <View style={styles.moodRow}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodOption, form.mood === m.key && { backgroundColor: m.color + '30', borderColor: m.color }]}
                    onPress={() => setForm(f => ({ ...f, mood: m.key }))}
                  >
                    <Text style={styles.moodOptionEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodOptionLabel, form.mood === m.key && { color: m.color }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Concerns</Text>
              <View style={styles.concernGrid}>
                {CONCERNS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.concernOption, form.concerns.includes(c) && styles.concernOptionActive]}
                    onPress={() => toggleConcern(c)}
                  >
                    <Text style={[styles.concernOptionText, form.concerns.includes(c) && styles.concernOptionTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 96, textAlignVertical: 'top' }]}
                placeholder="How does your skin feel? Any reactions?"
                placeholderTextColor={COLORS.textLight}
                value={form.notes}
                onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowModal(false)}>
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={save}>
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  title: { fontSize: 22, ...FONTS.bold, color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  addBtnText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 14 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: 17, ...FONTS.semiBold, color: COLORS.text },
  emptySubtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  moodBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, gap: 4 },
  moodEmoji: { fontSize: 16 },
  moodLabel: { fontSize: 13, ...FONTS.semiBold },
  entryDate: { fontSize: 12, color: COLORS.textSecondary },
  entryNotes: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  concernTag: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  concernTagText: { fontSize: 11, color: COLORS.primaryDark, ...FONTS.medium },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: 40, maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  label: { fontSize: 12, ...FONTS.semiBold, color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  moodRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  moodOption: {
    flex: 1, alignItems: 'center', padding: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border,
  },
  moodOptionEmoji: { fontSize: 22 },
  moodOptionLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, ...FONTS.medium },
  concernGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  concernOption: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: COLORS.border,
  },
  concernOptionActive: { backgroundColor: COLORS.primaryLight },
  concernOptionText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
  concernOptionTextActive: { color: COLORS.primaryDark },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  btnPrimary: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  btnPrimaryText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 15 },
  btnSecondary: { flex: 1, backgroundColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  btnSecondaryText: { color: COLORS.textSecondary, ...FONTS.semiBold, fontSize: 15 },
});
