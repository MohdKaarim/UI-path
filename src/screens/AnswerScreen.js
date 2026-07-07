import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdBanner from '../components/AdBanner';
import { getPaperByCode } from '../data';
import { addBookmark, removeBookmark, isBookmarked } from '../utils/storage';
import { colors } from '../utils/colors';

export default function AnswerScreen({ route, navigation }) {
  const { questionId, paperCode, unitId, markType } = route.params;
  const paper = getPaperByCode(paperCode);
  const unit = paper?.units.find(u => u.id === unitId);
  const question =
    markType === '2'
      ? unit?.twoMark.find(q => q.id === questionId)
      : markType === '8'
      ? unit?.eightMark?.find(q => q.id === questionId)
      : unit?.fifteenMark.find(q => q.id === questionId);

  const [bookmarked, setBookmarked] = useState(false);
  const accent =
    markType === '2' ? colors.twoMark : markType === '8' ? colors.eightMark : colors.fifteenMark;

  useEffect(() => {
    isBookmarked(questionId).then(setBookmarked);
  }, [questionId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleShare} style={{ marginRight: 4 }}>
          <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [question]);

  const handleShare = useCallback(async () => {
    if (!question) return;
    await Share.share({ message: `Q: ${question.question}\n\nA: ${question.answer}` });
  }, [question]);

  const toggleBookmark = useCallback(async () => {
    if (!question) return;
    if (bookmarked) {
      await removeBookmark(questionId);
      setBookmarked(false);
    } else {
      await addBookmark({ id: question.id, question: question.question, answer: question.answer, paperCode, unitTitle: unit?.title, markType });
      setBookmarked(true);
    }
  }, [bookmarked, question, questionId, paperCode, unit, markType]);

  if (!question) return null;

  const answerParagraphs = question.answer.split('\n\n');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.qBox, { borderLeftColor: accent }]}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{markType}-Mark Question</Text>
          </View>
          <Text style={styles.question}>{question.question}</Text>
        </View>

        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>Answer</Text>
          {answerParagraphs.map((para, idx) => (
            <Text key={idx} style={[styles.paragraph, para === para.toUpperCase() && para.trim().length > 0 ? styles.heading : null]}>
              {para}
            </Text>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.bookmarkBtn, bookmarked && styles.bookmarkActive]} onPress={toggleBookmark}>
          <MaterialCommunityIcons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.bookmarkText, bookmarked && { color: colors.accent }]}>
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Text>
        </TouchableOpacity>

        {question.page != null && (
          <TouchableOpacity
            style={styles.textbookBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PDFViewer', {
              paperCode,
              page: question.page,
              title: `${paperCode} – p.${question.page}`,
            })}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={20} color={accent} />
            <Text style={[styles.textbookText, { color: accent }]}>
              p.{question.page}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  qBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  question: { fontSize: 16, color: colors.text, fontWeight: '700', lineHeight: 24 },
  answerBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  answerLabel: { fontSize: 11, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  paragraph: { fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 },
  heading: { fontWeight: '700', color: colors.primary, fontSize: 13, marginTop: 6 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  bookmarkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkActive: { borderColor: colors.accent, backgroundColor: '#FFF8E1' },
  bookmarkText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  textbookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  textbookText: { fontSize: 13, fontWeight: '700' },
});
