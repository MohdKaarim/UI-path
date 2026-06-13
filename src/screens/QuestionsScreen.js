import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import QuestionCard from '../components/QuestionCard';
import AdBanner from '../components/AdBanner';
import { getPaperByCode } from '../data';
import { getBookmarks } from '../utils/storage';
import { colors } from '../utils/colors';

export default function QuestionsScreen({ route, navigation }) {
  const { paperCode, unitId } = route.params;
  const paper = getPaperByCode(paperCode);
  const unit = paper?.units.find(u => u.id === unitId);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    getBookmarks().then(bms => setBookmarkedIds(new Set(bms.map(b => b.id))));
    const unsubscribe = navigation.addListener('focus', () => {
      getBookmarks().then(bms => setBookmarkedIds(new Set(bms.map(b => b.id))));
    });
    return unsubscribe;
  }, [navigation]);

  if (!unit) return null;

  const sections = [
    { title: '2-Mark Questions', data: unit.twoMark, markType: '2' },
    { title: '15-Mark Questions', data: unit.fifteenMark, markType: '15' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: paper.color }]}>
        <Text style={styles.unitLabel}>Unit {unit.id}</Text>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <View style={styles.quizBtn}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.navigate('Quiz', { paperCode, unitId })}
          >
            <Text style={styles.quizButtonText}>Quiz Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: section.markType === '2' ? colors.twoMark : colors.fifteenMark }]}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <QuestionCard
            question={item}
            markType={section.markType}
            bookmarked={bookmarkedIds.has(item.id)}
            onPress={() => navigation.navigate('Answer', { questionId: item.id, paperCode, unitId, markType: section.markType })}
          />
        )}
        ListFooterComponent={<View style={{ height: 20 }} />}
        contentContainerStyle={styles.list}
      />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  unitLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  unitTitle: { fontSize: 16, color: '#fff', fontWeight: '800', marginTop: 2, marginBottom: 10 },
  quizBtn: { alignItems: 'flex-start' },
  quizButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  quizButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { paddingTop: 8 },
  sectionHeader: { paddingHorizontal: 20, paddingVertical: 8, marginBottom: 2 },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
});
