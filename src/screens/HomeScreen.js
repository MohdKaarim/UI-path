import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import PaperCard from '../components/PaperCard';
import AdBanner from '../components/AdBanner';
import { allPapers } from '../data';
import { colors } from '../utils/colors';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={allPapers}
        keyExtractor={item => item.code}
        ListHeaderComponent={
          <Text style={styles.header}>Select a Paper</Text>
        }
        ListFooterComponent={<View style={{ height: 16 }} />}
        renderItem={({ item }) => (
          <PaperCard
            paper={item}
            onPress={() => navigation.navigate('Paper', { paperCode: item.code })}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingTop: 8, paddingBottom: 8 },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
