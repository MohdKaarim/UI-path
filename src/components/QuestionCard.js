import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

export default function QuestionCard({ question, markType, onPress, bookmarked }) {
  const accent = markType === '2' ? colors.twoMark : markType === '8' ? colors.eightMark : colors.fifteenMark;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{markType}M</Text>
      </View>
      <Text style={styles.question} numberOfLines={3}>{question.question}</Text>
      {bookmarked && (
        <MaterialCommunityIcons name="bookmark" size={18} color={colors.accent} style={styles.bookmark} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 12,
    marginTop: 1,
    minWidth: 32,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  question: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bookmark: {
    marginLeft: 8,
    marginTop: 1,
  },
});
