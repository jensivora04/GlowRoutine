import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Pressable, TextInput, Alert, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { AppData, ProgressPhoto } from '../types';
import { todayString, formatDate } from '../utils/storage';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function ProgressScreen({ data, onUpdate }: Props) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);

  const sortedPhotos = [...data.progressPhotos].sort((a, b) => b.date.localeCompare(a.date));

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
      setNoteInput('');
      setShowNoteModal(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
      setNoteInput('');
      setShowNoteModal(true);
    }
  };

  const savePhoto = () => {
    if (!pendingUri) return;
    const newPhoto: ProgressPhoto = {
      id: Date.now().toString(),
      uri: pendingUri,
      date: todayString(),
      note: noteInput.trim(),
    };
    onUpdate({ ...data, progressPhotos: [...data.progressPhotos, newPhoto] });
    setShowNoteModal(false);
    setPendingUri(null);
  };

  const deletePhoto = (id: string) => {
    Alert.alert('Delete Photo', 'Remove this progress photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          onUpdate({ ...data, progressPhotos: data.progressPhotos.filter(p => p.id !== id) });
          setSelectedPhoto(null);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Photos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={takePhoto}>
            <Text style={styles.iconBtnText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={pickPhoto}>
            <Text style={styles.addBtnText}>+ Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sortedPhotos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤳</Text>
          <Text style={styles.emptyText}>No progress photos yet</Text>
          <Text style={styles.emptySubtext}>Document your skin journey over time</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={takePhoto}>
            <Text style={styles.emptyBtnText}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.emptyBtn, styles.emptyBtnSecondary]} onPress={pickPhoto}>
            <Text style={[styles.emptyBtnText, { color: COLORS.primary }]}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedPhotos}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.photoCard} onPress={() => setSelectedPhoto(item)}>
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              <View style={styles.photoInfo}>
                <Text style={styles.photoDate}>{formatDate(item.date)}</Text>
                {item.note ? <Text style={styles.photoNote} numberOfLines={1}>{item.note}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={showNoteModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowNoteModal(false)}>
          <Pressable style={styles.noteModalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a Note</Text>
            {pendingUri && (
              <Image source={{ uri: pendingUri }} style={styles.previewImage} />
            )}
            <TextInput
              style={styles.input}
              placeholder="Any notes about your skin today? (optional)"
              placeholderTextColor={COLORS.textLight}
              value={noteInput}
              onChangeText={setNoteInput}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowNoteModal(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={savePhoto}>
                <Text style={styles.btnPrimaryText}>Save Photo</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <Pressable style={styles.lightboxOverlay} onPress={() => setSelectedPhoto(null)}>
          {selectedPhoto && (
            <Pressable style={styles.lightboxContent} onPress={() => {}}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.lightboxImage} resizeMode="contain" />
              <View style={styles.lightboxInfo}>
                <Text style={styles.lightboxDate}>{formatDate(selectedPhoto.date)}</Text>
                {selectedPhoto.note ? <Text style={styles.lightboxNote}>{selectedPhoto.note}</Text> : null}
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePhoto(selectedPhoto.id)}>
                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
              </TouchableOpacity>
            </Pressable>
          )}
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconBtn: { padding: SPACING.sm },
  iconBtnText: { fontSize: 22 },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  addBtnText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyText: { fontSize: 17, ...FONTS.semiBold, color: COLORS.text },
  emptySubtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center', marginBottom: SPACING.xl },
  emptyBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    marginBottom: SPACING.sm, width: '80%', alignItems: 'center',
  },
  emptyBtnSecondary: { backgroundColor: COLORS.primaryLight },
  emptyBtnText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 15 },
  grid: { padding: SPACING.sm },
  photoCard: {
    flex: 1, margin: SPACING.sm / 2, borderRadius: RADIUS.lg, overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  thumbnail: { width: '100%', aspectRatio: 1 },
  photoInfo: { padding: SPACING.sm },
  photoDate: { fontSize: 11, color: COLORS.textSecondary, ...FONTS.medium },
  photoNote: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  noteModalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  previewImage: {
    width: '100%', height: 200, borderRadius: RADIUS.lg,
    marginBottom: SPACING.md, backgroundColor: COLORS.border,
  },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, minHeight: 80, textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  btnPrimary: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  btnPrimaryText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 15 },
  btnSecondary: { flex: 1, backgroundColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  btnSecondaryText: { color: COLORS.textSecondary, ...FONTS.semiBold, fontSize: 15 },
  lightboxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  lightboxContent: { width: '90%', alignItems: 'center' },
  lightboxImage: { width: '100%', height: 380, borderRadius: RADIUS.lg },
  lightboxInfo: { alignItems: 'center', marginTop: SPACING.md },
  lightboxDate: { fontSize: 15, color: COLORS.white, ...FONTS.medium },
  lightboxNote: { fontSize: 13, color: '#ccc', marginTop: 4, textAlign: 'center' },
  deleteBtn: {
    marginTop: SPACING.lg, backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  deleteBtnText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 15 },
});
