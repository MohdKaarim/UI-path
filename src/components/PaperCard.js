import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

function Icon3D({ iconName, iconColor, pressAnim }) {
  const iconScale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] });
  const iconTranslateY = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
  const rotateY = pressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-18deg'] });

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        { transform: [{ perspective: 350 }, { rotateY }, { scale: iconScale }, { translateY: iconTranslateY }] },
      ]}
    >
      {/* Bottom-right depth layer — creates raised 3D block illusion */}
      <View style={[styles.iconDepth, { backgroundColor: 'rgba(0,0,0,0.32)' }]} />

      {/* Side face (right edge depth for cube feel) */}
      <View style={[styles.iconSide, { backgroundColor: iconColor, opacity: 0.55 }]} />

      {/* Main front face */}
      <View style={[styles.iconFace, { backgroundColor: iconColor }]}>
        {/* Specular highlight — simulates 3D sphere lighting */}
        <View style={styles.iconShineOuter} />
        <View style={styles.iconShineInner} />
        <MaterialCommunityIcons name={iconName} size={26} color="#fff" />
      </View>
    </Animated.View>
  );
}

export default function PaperCard({ paper, onPress }) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const cardScale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
      <Animated.View style={[styles.card, { borderLeftColor: paper.color, transform: [{ scale: cardScale }] }]}>
        <Icon3D iconName={paper.icon} iconColor={paper.color} pressAnim={pressAnim} />
        <View style={styles.info}>
          <Text style={styles.code}>{paper.code}</Text>
          <Text style={styles.title}>{paper.shortTitle}</Text>
          <Text style={styles.subtitle}>{paper.subtitle}</Text>
          <Text style={styles.units}>{paper.units.length} Units</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textLight} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    borderLeftWidth: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  // 3D icon layers
  iconContainer: {
    width: 60,
    height: 60,
    marginRight: 14,
  },
  iconDepth: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 14,
    bottom: 0,
    right: 0,
  },
  iconSide: {
    position: 'absolute',
    width: 6,
    height: 52,
    right: 2,
    top: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 14,
  },
  iconFace: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 14,
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconShineOuter: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  iconShineInner: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  info: { flex: 1 },
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
