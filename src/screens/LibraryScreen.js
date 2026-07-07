import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { allPapers } from '../data';
import { colors } from '../utils/colors';

const PAPER_SIZES = {
  SPHS101: '1.6 MB · 194 pages',
  SPHS102: '12.7 MB · ~220 pages',
  SPHS103: '26.7 MB · ~280 pages',
  SPHS104: '10.4 MB · ~200 pages',
  SPHS105: '1.1 MB · 220 pages',
};

export default function LibraryScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('PDFViewer', {
        paperCode: item.code,
        page: 1,
        title: item.shortTitle,
      })}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <MaterialCommunityIcons
          name={item.icon || 'book-open-page-variant'}
          size={28}
          color="#fff"
        />
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={[styles.codeBadge, { backgroundColor: item.color }]}>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
          <Text style={styles.sizeText}>{PAPER_SIZES[item.code] || ''}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.shortTitle}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.unitCount}>{item.units.length} units</Text>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allPapers}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <MaterialCommunityIcons name="bookshelf" size={32} color={colors.primary} />
            <Text style={styles.headerTitle}>Textbook Library</Text>
            <Text style={styles.headerSub}>Tap any paper to read the full PDF textbook</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },

  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  sizeText: { fontSize: 11, color: colors.textLight },
  title: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  subtitle: { fontSize: 12, color: colors.textSecondary },
  unitCount: { fontSize: 11, color: colors.textLight, marginTop: 2 },
});
