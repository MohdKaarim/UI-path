import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

export default function PaperCard({ paper, onPress }) {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: paper.color }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconBox, { backgroundColor: paper.color }]}>
        <MaterialCommunityIcons name={paper.icon} size={28} color="#fff" />
      </View>
      <View style={styles.info}>
        <Text style={styles.code}>{paper.code}</Text>
        <Text style={styles.title}>{paper.shortTitle}</Text>
        <Text style={styles.subtitle}>{paper.subtitle}</Text>
        <Text style={styles.units}>{paper.units.length} Units</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  code: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  units: {
    fontSize: 11,
    color: colors.textLight,
  },
});
