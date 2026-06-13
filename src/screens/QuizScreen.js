import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdBanner from '../components/AdBanner';
import { getPaperByCode } from '../data';
import { saveQuizScore } from '../utils/storage';
import { colors } from '../utils/colors';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function truncate(str, n = 120) {
  return str.length <= n ? str : str.slice(0, n) + '…';
}

export default function QuizScreen({ route, navigation }) {
  const { paperCode, unitId } = route.params;
  const paper = getPaperByCode(paperCode);
  const unit = paper?.units.find(u => u.id === unitId);

  const questions = useMemo(() => {
    if (!unit) return [];
    const all = [...unit.twoMark, ...(unit.eightMark || []), ...unit.fifteenMark];
    return shuffle(all).slice(0, 10).map(q => {
      const correctAnswer = truncate(q.answer);
      const wrongPool = shuffle(all.filter(x => x.id !== q.id)).slice(0, 3).map(x => truncate(x.answer));
      const options = shuffle([correctAnswer, ...wrongPool]);
      return { ...q, correctAnswer, options };
    });
  }, [unit]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  if (!unit || questions.length === 0) return null;

  const q = questions[current];

  const handleSelect = async (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    const correct = opt === q.correctAnswer;
    if (correct) setScore(s => s + 1);
    if (current === questions.length - 1) {
      const finalScore = score + (correct ? 1 : 0);
      await saveQuizScore(paperCode, finalScore, questions.length);
      setTimeout(() => setFinished(true), 1200);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setAnswered(false);
    setCurrent(c => c + 1);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <View style={styles.container}>
        <View style={styles.resultBox}>
          <MaterialCommunityIcons name={pct >= 60 ? 'trophy' : 'emoticon-sad-outline'} size={64} color={pct >= 60 ? colors.accent : colors.textLight} />
          <Text style={styles.resultTitle}>Quiz Complete!</Text>
          <Text style={styles.resultScore}>{score} / {questions.length}</Text>
          <Text style={styles.resultPct}>{pct}%</Text>
          <Text style={styles.resultMsg}>{pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : 'Keep studying!'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Back to Questions</Text>
          </TouchableOpacity>
        </View>
        <AdBanner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((current) / questions.length) * 100}%`, backgroundColor: paper.color }]} />
      </View>
      <Text style={styles.progressText}>{current + 1} / {questions.length}  ·  Score: {score}</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.qBox}>
          <Text style={styles.question}>{q.question}</Text>
        </View>
        {q.options.map((opt, idx) => {
          let bg = colors.surface;
          let border = colors.border;
          if (answered) {
            if (opt === q.correctAnswer) { bg = '#E8F5E9'; border = colors.success; }
            else if (opt === selected) { bg = '#FFEBEE'; border = colors.error; }
          } else if (opt === selected) {
            bg = '#E3F2FD'; border = colors.primary;
          }
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}.</Text>
              <Text style={styles.optionText}>{opt}</Text>
              {answered && opt === q.correctAnswer && (
                <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} style={{ marginLeft: 4 }} />
              )}
              {answered && opt === selected && opt !== q.correctAnswer && (
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.error} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          );
        })}

        {answered && current < questions.length - 1 && (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: paper.color }]} onPress={handleNext}>
            <Text style={styles.nextText}>Next Question</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progressBar: { height: 4, backgroundColor: colors.border },
  progressFill: { height: 4 },
  progressText: { fontSize: 12, color: colors.textSecondary, textAlign: 'right', marginRight: 16, marginTop: 6, marginBottom: 2 },
  scroll: { padding: 16 },
  qBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  question: { fontSize: 15, color: colors.text, fontWeight: '700', lineHeight: 22 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  optionLetter: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginRight: 10, marginTop: 1 },
  optionText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, padding: 14, marginTop: 8 },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 16 },
  resultScore: { fontSize: 48, fontWeight: '900', color: colors.primary, marginTop: 8 },
  resultPct: { fontSize: 20, color: colors.textSecondary, marginTop: 4 },
  resultMsg: { fontSize: 16, color: colors.textSecondary, marginTop: 12, marginBottom: 32 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 28, paddingVertical: 13 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
