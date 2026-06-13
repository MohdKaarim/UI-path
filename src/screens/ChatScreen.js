import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { searchLocal, buildLocalResponse } from '../services/LocalChatService';
import { askGemini } from '../services/GeminiService';
import { colors } from '../utils/colors';

const WELCOME = {
  id: 'welcome',
  isUser: false,
  text: "Hi! I'm your MA History AI assistant powered by Gemini.\n\nAsk me anything from your syllabus — topics, comparisons, essay explanations!",
  sources: [],
};

export default function ChatScreen() {
  const { geminiApiKey, canUseGemini, isGuest } = useAuth();
  const [messages, setMessages] = useState([
    canUseGemini
      ? WELCOME
      : { ...WELCOME, text: "Hi! I'm your local assistant.\n\nAsk me anything from your syllabus. Add a Gemini API key in your Profile to enable AI-powered answers." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: `u_${Date.now()}`, isUser: true, text, sources: [] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const localResults = searchLocal(text);
      let replyText, sources;

      if (canUseGemini) {
        // Use personal API key if set, otherwise fall back to OAuth token
        replyText = await askGemini(text, localResults, geminiApiKey);
        sources = localResults
          .slice(0, 2)
          .map(r => `${r.paperCode} · ${r.unitTitle}`);
      } else {
        const local = buildLocalResponse(localResults);
        replyText = local.text;
        sources = local.sources;
      }

      setMessages(prev => [
        ...prev,
        { id: `b_${Date.now()}`, isUser: false, text: replyText, sources },
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
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [input, loading, geminiApiKey, canUseGemini]);

  const renderMessage = ({ item }) => (
    <View style={[styles.row, item.isUser && styles.rowUser]}>
      {!item.isUser && (
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="robot" size={15} color="#fff" />
        </View>
      )}
      <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, item.isUser && styles.bubbleTextUser]}>
          {item.text}
        </Text>
        {item.sources?.length > 0 && (
          <View style={styles.sources}>
            {item.sources.map((s, i) => (
              <Text key={i} style={styles.sourceTag}>{s}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
      />

      {loading && (
        <View style={styles.typingRow}>
          <MaterialCommunityIcons name="robot" size={15} color={colors.primary} />
          <Text style={styles.typingText}>  {canUseGemini ? 'Gemini is thinking…' : 'Searching papers…'}</Text>
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
  },

  bubble: {
    maxWidth: '78%',
    borderRadius: 18, padding: 12,
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
    shadowOpacity: 0.07, shadowRadius: 2,
  },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },

  sources: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7, gap: 4 },
  sourceTag: {
    fontSize: 10, color: colors.primary,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 4, fontWeight: '600',
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
