import React, { useState, useRef, useCallback, memo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { searchLocal, buildLocalResponse, toSourceChips } from '../services/LocalChatService';
import { askGemini } from '../services/GeminiService';
import { colors } from '../utils/colors';

const WELCOME_GEMINI = {
  id: 'welcome',
  isUser: false,
  text: "Hey! 👋 I'm your MA History tutor.\n\nAsk me anything — I'll give you a quick, clear explanation. What do you want to know?",
  sources: [],
};

const WELCOME_LOCAL = {
  id: 'welcome',
  isUser: false,
  text: "Hey! 👋 I'm your local study assistant.\n\nI'll search your syllabus and give you short answers. Add a Gemini API key in Profile for smarter replies!",
  sources: [],
};

// Memoised so FlatList only re-renders the item that actually changed
const MessageBubble = memo(({ item, onSourcePress }) => {
  const paragraphs = item.text.split('\n').filter(p => p.trim().length > 0);
  const hasChips = !item.isUser && item.sources && item.sources.length > 0;

  return (
    <View style={[styles.row, item.isUser && styles.rowUser]}>
      {!item.isUser && (
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="robot" size={15} color="#fff" />
        </View>
      )}
      <View style={styles.bubbleCol}>
        <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {item.isUser ? (
            <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{item.text}</Text>
          ) : (
            paragraphs.map((para, i) => (
              <Text
                key={i}
                style={[
                  styles.bubbleText,
                  para.startsWith('•') && styles.bulletText,
                  i > 0 && styles.paraSpacer,
                ]}
              >
                {para}
              </Text>
            ))
          )}
        </View>

        {hasChips && (
          <View style={styles.chipsRow}>
            {item.sources.map((src, i) => (
              <TouchableOpacity
                key={i}
                style={styles.sourceChip}
                onPress={() => onSourcePress && onSourcePress(src.questionId, src.paperCode, src.unitId, src.markType)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={11} color={colors.primary} />
                <Text style={styles.sourceChipText} numberOfLines={1}>{src.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={13} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

export default function ChatScreen({ onSourcePress }) {
  const { geminiApiKey, canUseGemini } = useAuth();
  const [messages, setMessages] = useState([
    canUseGemini ? WELCOME_GEMINI : WELCOME_LOCAL,
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const localResults = searchLocal(text);

    if (!canUseGemini) {
      // Local is fully synchronous — reply instantly, no spinner
      const local = buildLocalResponse(localResults);
      setMessages(prev => [
        ...prev,
        { id: `u_${Date.now()}`, isUser: true, text, sources: [] },
        { id: `b_${Date.now()}`, isUser: false, text: local.text, sources: local.sources },
      ]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
      return;
    }

    // Gemini path — show spinner while waiting for network
    setMessages(prev => [...prev, { id: `u_${Date.now()}`, isUser: true, text, sources: [] }]);
    setLoading(true);

    try {
      let replyText = await askGemini(text, localResults, geminiApiKey);
      replyText = replyText.replace(/\n*📚[^\n]*/g, '').trim();
      setMessages(prev => [
        ...prev,
        { id: `b_${Date.now()}`, isUser: false, text: replyText, sources: toSourceChips(localResults) },
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          isUser: false,
          text: `⚠️ ${e.message || 'Something went wrong. Please try again.'}`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [input, loading, geminiApiKey, canUseGemini]);

  const renderItem = useCallback(
    ({ item }) => <MessageBubble item={item} onSourcePress={onSourcePress} />,
    [onSourcePress]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        removeClippedSubviews={false}
        windowSize={10}
        // No onContentSizeChange — it fires every render and causes flicker
      />

      {loading && (
        <View style={styles.typingRow}>
          <MaterialCommunityIcons name="robot" size={15} color={colors.primary} />
          <Text style={styles.typingText}>  Gemini is thinking…</Text>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything from your syllabus…"
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={500}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendOff]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  rowUser: { justifyContent: 'flex-end' },

  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  bubbleCol: {
    maxWidth: '78%',
  },

  bubble: {
    borderRadius: 18,
    padding: 12,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  paraSpacer: { marginTop: 6 },
  bulletText: { paddingLeft: 4 },

  chipsRow: {
    marginTop: 6,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  sourceChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 1,
    marginHorizontal: 4,
  },

  typingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  typingText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 10, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: colors.text,
    maxHeight: 120, marginRight: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendOff: { backgroundColor: colors.textLight },
});
