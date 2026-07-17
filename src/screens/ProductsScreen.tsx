import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Pressable, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { AppData, Product } from '../types';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Eye Cream', 'Exfoliant', 'Mask', 'Oil', 'Other'];

export default function ProductsScreen({ data, onUpdate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', brand: '', category: 'Cleanser', notes: '' });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredProducts = data.products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', brand: '', category: 'Cleanser', notes: '' });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ name: product.name, brand: product.brand, category: product.category, notes: product.notes });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editingProduct) {
      const updated = data.products.map(p =>
        p.id === editingProduct.id ? { ...p, ...form } : p
      );
      onUpdate({ ...data, products: updated });
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...form,
        addedAt: new Date().toISOString().split('T')[0],
      };
      onUpdate({ ...data, products: [...data.products, newProduct] });
    }
    setShowModal(false);
  };

  const deleteProduct = (id: string) => {
    Alert.alert('Delete Product', 'Remove this product from your catalog?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate({ ...data, products: data.products.filter(p => p.id !== id) }) }
    ]);
  };

  const categoryColors: Record<string, string> = {
    Cleanser: '#A8D8B9', Toner: '#B8D4E8', Serum: '#D4B8E8',
    Moisturizer: '#F0D4B0', Sunscreen: '#F0E0B0', 'Eye Cream': '#F0B8C8',
    Exfoliant: '#C8E0C0', Mask: '#E0C0D8', Oil: '#E8D4A0', Other: '#D0D0D0',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
          onPress={() => setFilterCategory(null)}
        >
          <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
            onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
          >
            <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredProducts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧴</Text>
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add" to log your skincare products</Text>
          </View>
        ) : (
          filteredProducts.map(product => (
            <TouchableOpacity key={product.id} style={styles.card} onPress={() => openEdit(product)} onLongPress={() => deleteProduct(product.id)}>
              <View style={[styles.catDot, { backgroundColor: categoryColors[product.category] ?? '#D0D0D0' }]} />
              <View style={styles.cardBody}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand || 'No brand'}</Text>
                {product.notes ? <Text style={styles.productNotes}>{product.notes}</Text> : null}
              </View>
              <View style={[styles.catTag, { backgroundColor: categoryColors[product.category] ?? '#D0D0D0' }]}>
                <Text style={styles.catTagText}>{product.category}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editingProduct ? 'Edit Product' : 'Add Product'}</Text>

            <Text style={styles.label}>Product Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Vitamin C Serum" placeholderTextColor={COLORS.textLight} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />

            <Text style={styles.label}>Brand</Text>
            <TextInput style={styles.input} placeholder="e.g. The Ordinary" placeholderTextColor={COLORS.textLight} value={form.brand} onChangeText={v => setForm(f => ({ ...f, brand: v }))} />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, form.category === cat && styles.catChipActive]}
                  onPress={() => setForm(f => ({ ...f, category: cat }))}
                >
                  <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
              placeholder="Skin type, usage tips..."
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
  searchRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 14, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
  filterChipTextActive: { color: COLORS.white },
  list: { flex: 1, marginTop: SPACING.sm },
  listContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: 17, ...FONTS.semiBold, color: COLORS.text },
  emptySubtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  catDot: { width: 10, height: 10, borderRadius: RADIUS.full, marginRight: SPACING.md },
  cardBody: { flex: 1 },
  productName: { fontSize: 15, ...FONTS.semiBold, color: COLORS.text },
  productBrand: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  productNotes: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  catTag: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
  catTagText: { fontSize: 11, ...FONTS.medium, color: COLORS.text },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, ...FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  label: { fontSize: 12, ...FONTS.semiBold, color: COLORS.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md,
  },
  catChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  catChipActive: { backgroundColor: COLORS.primary },
  catChipText: { fontSize: 12, color: COLORS.textSecondary, ...FONTS.medium },
  catChipTextActive: { color: COLORS.white },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  btnPrimary: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  btnPrimaryText: { color: COLORS.white, ...FONTS.semiBold, fontSize: 15 },
  btnSecondary: { flex: 1, backgroundColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  btnSecondaryText: { color: COLORS.textSecondary, ...FONTS.semiBold, fontSize: 15 },
});
