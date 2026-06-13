import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const { width: SW } = Dimensions.get('window');

const STEPS = [
  {
    icon: 'book-open-variant',
    color: colors.primary,
    title: 'Welcome to Mastering History',
    body: 'Your complete MA History study companion for Madras University.\n\nBrowse 5 papers, 25 units, and hundreds of 2-mark, 8-mark & 15-mark Q&A pairs — all offline.',
  },
  {
    icon: 'book-multiple',
    color: '#1565C0',
    title: 'Browse Your Papers',
    body: 'Tap any paper on the Papers tab to see its units.\n\nEach unit lists questions by mark type:\n🟢  2-Mark  —  short answers\n🟠  8-Mark  —  paragraph answers\n🟣  15-Mark —  essay answers',
  },
  {
    icon: 'robot',
    color: colors.primary,
    title: 'AI Assistant Bubble',
    body: 'See the glowing robot bubble at the bottom-left? Tap it anytime to open the AI Assistant.\n\nWith a free Gemini API key it gives AI-powered answers. Without one, it searches your syllabus locally.',
  },
  {
    icon: 'key-variant',
    color: '#BF360C',
    title: 'Enable Gemini AI (Optional)',
    body: 'Go to Profile → "Add Gemini API Key" and paste your free key from:\n\naistudio.google.com/app/apikey\n\nOnce added, the assistant switches to Gemini 1.5 Flash for smarter answers.',
  },
  {
    icon: 'brain',
    color: '#E65100',
    title: 'Quiz Yourself',
    body: 'Open any unit and tap Quiz Mode to test your knowledge.\n\nQuestions are shuffled from all mark types. Your score is saved per paper.',
  },
  {
    icon: 'magnify',
    color: '#00838F',
    title: 'Search & Bookmarks',
    body: 'Use the Search tab to find any question or answer across all 5 papers instantly.\n\nTap the bookmark icon on any answer to save it for quick revision.',
  },
  {
    icon: 'file-document-multiple',
    color: '#6A1B9A',
    title: 'Previous Year Papers',
    body: 'The PYQ tab shows previous-year question patterns organised by paper, so you know exactly what to expect in the exam.',
  },
  {
    icon: 'party-popper',
    color: '#2E7D32',
    title: "You're All Set!",
    body: "Everything is stored offline — no internet needed to study.\n\nGood luck with your exams! 🎓",
  },
];

export default function OnboardingModal({ visible, onDone }) {
  const [step, setStep] = useState(0);
  const listRef = useRef(null);
  const dotAnim = useRef(STEPS.map(() => new Animated.Value(0))).current;

  const goTo = (index) => {
    if (index < 0 || index >= STEPS.length) return;
    setStep(index);
    listRef.current?.scrollToIndex({ index, animated: true });
    // Animate the active dot
    STEPS.forEach((_, i) => {
      Animated.timing(dotAnim[i], {
        toValue: i === index ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    });
  };

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDone}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Skip button */}
          <TouchableOpacity style={styles.skipBtn} onPress={onDone} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Slides */}
          <FlatList
            ref={listRef}
            data={STEPS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, index) => ({ length: SW - 48, offset: (SW - 48) * index, index })}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon} size={52} color={item.color} />
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepBody}>{item.body}</Text>
              </View>
            )}
          />

          {/* Dot indicators */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => {
              const width = dotAnim[i].interpolate({
                inputRange: [0, 1],
                outputRange: [6, 20],
              });
              const bg = dotAnim[i].interpolate({
                inputRange: [0, 1],
                outputRange: [colors.border, current.color],
              });
              return (
                <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.7}>
                  <Animated.View style={[styles.dot, { width, backgroundColor: bg }]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Navigation buttons */}
          <View style={styles.btnRow}>
            {step > 0 ? (
              <TouchableOpacity style={styles.backBtn} onPress={() => goTo(step - 1)} activeOpacity={0.8}>
                <MaterialCommunityIcons name="arrow-left" size={18} color={colors.textSecondary} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: current.color }]}
              onPress={isLast ? onDone : () => goTo(step + 1)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
              {!isLast && <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />}
              {isLast && <MaterialCommunityIcons name="rocket-launch" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>

          {/* Step counter */}
          <Text style={styles.counter}>{step + 1} of {STEPS.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

const CARD_WIDTH = SW - 48;

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: CARD_WIDTH,
    paddingTop: 16,
    paddingBottom: 20,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginBottom: 6,
  },
  skipText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },

  slide: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18, fontWeight: '800', color: colors.text,
    textAlign: 'center', marginBottom: 12,
  },
  stepBody: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },

  dots: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6, marginTop: 20, marginBottom: 16,
  },
  dot: { height: 6, borderRadius: 3 },

  btnRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 4, paddingVertical: 11,
  },
  backBtnText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 12,
    marginLeft: 12,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  counter: {
    fontSize: 11, color: colors.textLight,
    textAlign: 'center', marginTop: 10,
  },
});
