import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdBanner from '../components/AdBanner';
import { getPaperByCode } from '../data';
import { colors } from '../utils/colors';

export default function PaperScreen({ route, navigation }) {
  const { paperCode } = route.params;
  const paper = getPaperByCode(paperCode);

  if (!paper) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.paperHeader, { backgroundColor: paper.color }]}>
        <Text style={styles.paperCode}>{paper.code}</Text>
        <Text style={styles.paperTitle}>{paper.shortTitle}</Text>
        <Text style={styles.paperSubtitle}>{paper.subtitle}</Text>
      </View>
      <FlatList
        data={paper.units}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListFooterComponent={<View style={{ height: 16 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.unitCard}
            onPress={() => navigation.navigate('Questions', { paperCode, unitId: item.id, unitTitle: `Unit ${item.id}: ${item.title}` })}
            activeOpacity={0.85}
          >
            <View style={[styles.unitNum, { backgroundColor: paper.color }]}>
              <Text style={styles.unitNumText}>{item.id}</Text>
            </View>
            <View style={styles.unitInfo}>
              <Text style={styles.unitTitle}>{item.title}</Text>
              <Text style={styles.unitTopics} numberOfLines={2}>{item.topics}</Text>
              <View style={styles.unitCounts}>
                <View style={[styles.countBadge, { backgroundColor: colors.twoMark }]}>
                  <Text style={styles.countText}>{item.twoMark.length} × 2M</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: colors.fifteenMark }]}>
                  <Text style={styles.countText}>{item.fifteenMark.length} × 15M</Text>
                </View>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textLight} />
          </TouchableOpacity>
        )}
      />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  paperHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  paperCode: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1 },
  paperTitle: { fontSize: 18, color: '#fff', fontWeight: '800', marginTop: 4 },
  paperSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  list: { paddingTop: 12 },
  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  unitNum: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  unitNumText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  unitInfo: { flex: 1 },
  unitTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  unitTopics: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  unitCounts: { flexDirection: 'row', gap: 6 },
  countBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
