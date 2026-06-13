import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Fuse from 'fuse.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllQuestions } from '../data';
import { colors } from '../utils/colors';

const ALL_QUESTIONS = getAllQuestions();

const fuse = new Fuse(ALL_QUESTIONS, {
  keys: ['question', 'answer', 'paperTitle', 'unitTitle'],
  threshold: 0.4,
  includeMatches: false,
  minMatchCharLength: 2,
});

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return fuse.search(query.trim()).slice(0, 50).map(r => r.item);
  }, [query]);

  const openAnswer = useCallback((item) => {
    const parts = item.id.split('_');
    const unitId = parseInt(parts[1], 10);
    navigation.navigate('HomeTab', {
      screen: 'Home',
      params: undefined,
      initial: false,
    });
    // Navigate after switching tabs
    setTimeout(() => {
      navigation.navigate('HomeTab', {
        screen: 'Answer',
        params: { questionId: item.id, paperCode: item.paperCode, unitId, markType: item.markType },
      });
    }, 100);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Search questions and answers…"
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {query.length < 2 && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="text-search" size={56} color={colors.border} />
          <Text style={styles.emptyText}>Type at least 2 characters to search across all questions and answers.</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultCard} onPress={() => openAnswer(item)} activeOpacity={0.85}>
            <View style={[styles.markBadge, { backgroundColor: item.markType === '2' ? colors.twoMark : colors.fifteenMark }]}>
              <Text style={styles.markText}>{item.markType}M</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paperLabel}>{item.paperCode} · {item.unitTitle}</Text>
              <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length >= 2 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  markBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, marginRight: 12, marginTop: 2, alignSelf: 'flex-start' },
  markText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  paperLabel: { fontSize: 11, color: colors.textLight, marginBottom: 3 },
  questionText: { fontSize: 13, color: colors.text, lineHeight: 19 },
});
