import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AdBanner from '../components/AdBanner';
import { getBookmarks, removeBookmark } from '../utils/storage';
import { colors } from '../utils/colors';

export default function BookmarksScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, [])
  );

  const handleRemove = useCallback((id) => {
    Alert.alert('Remove Bookmark', 'Remove this bookmark?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await removeBookmark(id);
          setBookmarks(updated);
        },
      },
    ]);
  }, []);

  const openAnswer = useCallback((item) => {
    const parts = item.id.split('_');
    const unitId = parseInt(parts[1], 10);
    setTimeout(() => {
      navigation.navigate('HomeTab', {
        screen: 'Answer',
        params: { questionId: item.id, paperCode: item.paperCode, unitId, markType: item.markType },
      });
    }, 50);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bookmark-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
            <Text style={styles.emptyText}>Bookmark questions from the answer screen to review them here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardMain} onPress={() => openAnswer(item)} activeOpacity={0.85}>
              <View style={[styles.badge, { backgroundColor: item.markType === '2' ? colors.twoMark : item.markType === '8' ? colors.eightMark : colors.fifteenMark }]}>
                <Text style={styles.badgeText}>{item.markType}M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.meta}>{item.paperCode} · {item.unitTitle}</Text>
                <Text style={styles.question} numberOfLines={2}>{item.question}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
              <MaterialCommunityIcons name="bookmark-remove" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingTop: 10, paddingBottom: 20 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textSecondary, marginTop: 16 },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  badge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, marginRight: 12, marginTop: 2, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 11, color: colors.textLight, marginBottom: 3 },
  question: { fontSize: 13, color: colors.text, lineHeight: 19 },
  removeBtn: { padding: 16, borderLeftWidth: 1, borderLeftColor: colors.border },
});
