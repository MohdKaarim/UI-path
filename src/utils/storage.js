import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@ma_history_bookmarks';
const QUIZ_SCORES_KEY = '@ma_history_quiz_scores';
const PROGRESS_KEY = '@ma_history_progress';

export async function getBookmarks() {
  try {
    const json = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function addBookmark(question) {
  try {
    const existing = await getBookmarks();
    const already = existing.find(q => q.id === question.id);
    if (already) return existing;
    const updated = [question, ...existing];
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function removeBookmark(questionId) {
  try {
    const existing = await getBookmarks();
    const updated = existing.filter(q => q.id !== questionId);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function isBookmarked(questionId) {
  try {
    const existing = await getBookmarks();
    return existing.some(q => q.id === questionId);
  } catch {
    return false;
  }
}

export async function saveQuizScore(paperId, score, total) {
  try {
    const json = await AsyncStorage.getItem(QUIZ_SCORES_KEY);
    const scores = json ? JSON.parse(json) : {};
    if (!scores[paperId]) scores[paperId] = [];
    scores[paperId].unshift({ score, total, date: new Date().toISOString() });
    scores[paperId] = scores[paperId].slice(0, 10);
    await AsyncStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(scores));
  } catch {}
}

export async function getQuizScores(paperId) {
  try {
    const json = await AsyncStorage.getItem(QUIZ_SCORES_KEY);
    const scores = json ? JSON.parse(json) : {};
    return scores[paperId] || [];
  } catch {
    return [];
  }
}
