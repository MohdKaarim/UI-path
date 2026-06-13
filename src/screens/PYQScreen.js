import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pyqData } from '../data/pyqData';
import { colors } from '../utils/colors';

const PaperTab = ({ paper, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, isSelected && { backgroundColor: paper.color, borderColor: paper.color }]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isSelected && styles.tabTextSelected]} numberOfLines={2}>
      {paper.paperCode}
    </Text>
  </TouchableOpacity>
);

const PatternRow = ({ part }) => (
  <View style={styles.patternRow}>
    <View style={styles.patternLeft}>
      <Text style={styles.partName}>{part.name}</Text>
      <Text style={styles.partNote}>{part.note}</Text>
    </View>
    <View style={styles.patternRight}>
      <Text style={styles.partMarks}>{part.marks} × {part.count}</Text>
      <View style={styles.totalBadge}>
        <Text style={styles.totalText}>{part.total} M</Text>
      </View>
    </View>
  </View>
);

const TopicChip = ({ label, color }) => (
  <View style={[styles.chip, { borderColor: color }]}>
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </View>
);

const EmptyPapers = () => (
  <View style={styles.emptyBox}>
    <MaterialCommunityIcons name="clock-outline" size={48} color="#90A4AE" />
    <Text style={styles.emptyTitle}>Coming Soon</Text>
    <Text style={styles.emptyBody}>
      Previous year question papers will be available in a future update.
    </Text>
  </View>
);

export default function PYQScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const paper = pyqData[selectedIndex];

  return (
    <View style={styles.container}>
      {/* Paper selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {pyqData.map((p, i) => (
          <PaperTab
            key={p.paperCode}
            paper={p}
            isSelected={i === selectedIndex}
            onPress={() => setSelectedIndex(i)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Paper title */}
        <View style={[styles.header, { backgroundColor: paper.color }]}>
          <Text style={styles.headerCode}>{paper.paperCode}</Text>
          <Text style={styles.headerTitle}>{paper.paperTitle}</Text>
          <Text style={styles.headerSub}>
            {paper.examPattern.duration} | {paper.examPattern.totalMarks} Marks
          </Text>
        </View>

        {/* Exam Pattern */}
        <Text style={styles.sectionTitle}>Exam Pattern</Text>
        <View style={styles.card}>
          {paper.examPattern.parts.map((part) => (
            <React.Fragment key={part.name}>
              <PatternRow part={part} />
              {part !== paper.examPattern.parts[paper.examPattern.parts.length - 1] && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
          <View style={[styles.divider, { backgroundColor: '#CFD8DC' }]} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalMarks}>{paper.examPattern.totalMarks} Marks</Text>
          </View>
        </View>

        {/* Important Topics */}
        <Text style={styles.sectionTitle}>Important Topics</Text>
        <View style={styles.chipsContainer}>
          {paper.importantTopics.map((topic) => (
            <TopicChip key={topic} label={topic} color={paper.color} />
          ))}
        </View>

        {/* Previous Year Papers */}
        <Text style={styles.sectionTitle}>Previous Year Papers</Text>
        {paper.papers.length === 0 ? (
          <EmptyPapers />
        ) : (
          paper.papers.map((yearPaper) => (
            <View key={yearPaper.year} style={styles.card}>
              <View style={[styles.yearHeader, { backgroundColor: paper.color }]}>
                <MaterialCommunityIcons name="calendar" size={16} color="#fff" />
                <Text style={styles.yearText}>{yearPaper.year} Question Paper</Text>
              </View>
              {yearPaper.questions.map((q, qi) => (
                <View key={qi} style={styles.questionItem}>
                  <View style={[styles.partBadge, { backgroundColor: paper.color + '20', borderColor: paper.color }]}>
                    <Text style={[styles.partBadgeText, { color: paper.color }]}>{q.part}</Text>
                  </View>
                  <Text style={styles.questionText}>{q.question}</Text>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  // Tab bar
  tabBar: { backgroundColor: '#fff', maxHeight: 56, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tabBarContent: { paddingHorizontal: 8, paddingVertical: 8, gap: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#B0BEC5', alignItems: 'center', justifyContent: 'center',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: '#546E7A' },
  tabTextSelected: { color: '#fff' },

  // Header
  content: { padding: 16 },
  header: {
    borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center',
  },
  headerCode: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', letterSpacing: 1 },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '700', marginTop: 4, textAlign: 'center' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 },

  // Section
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#37474F', marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 0, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  divider: { height: 1, backgroundColor: '#ECEFF1', marginHorizontal: 16 },

  // Pattern
  patternRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  patternLeft: { flex: 1 },
  partName: { fontSize: 14, fontWeight: '700', color: '#263238' },
  partNote: { fontSize: 11, color: '#78909C', marginTop: 2 },
  patternRight: { alignItems: 'flex-end', gap: 4 },
  partMarks: { fontSize: 13, color: '#546E7A', fontWeight: '500' },
  totalBadge: { backgroundColor: '#E3F2FD', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  totalText: { fontSize: 12, fontWeight: '700', color: '#1565C0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#263238' },
  totalMarks: { fontSize: 14, fontWeight: '700', color: '#1565C0' },

  // Chips
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { fontSize: 12, fontWeight: '500' },

  // Empty
  emptyBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center',
    marginBottom: 16, elevation: 2,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#546E7A', marginTop: 12 },
  emptyBody: { fontSize: 13, color: '#90A4AE', textAlign: 'center', marginTop: 8, lineHeight: 22 },

  // Year paper
  yearHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  yearText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  questionItem: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  partBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  partBadgeText: { fontSize: 11, fontWeight: '700' },
  questionText: { flex: 1, fontSize: 13, color: '#37474F', lineHeight: 20 },

  bottomPad: { height: 30 },
});
