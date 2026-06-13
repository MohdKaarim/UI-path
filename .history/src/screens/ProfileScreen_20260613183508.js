import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  TextInput, Modal, Alert, ScrollView, Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';

export default function ProfileScreen() {
  const { user, isGuest, signOut, updateUsername, geminiApiKey, saveGeminiApiKey, canUseGemini } = useAuth();

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [draftApiKey, setDraftApiKey] = useState('');
  const [apiKeySecure, setApiKeySecure] = useState(true);

  // Auto-prompt name if not set
  useEffect(() => {
    if (user && !isGuest && (!user.name || !user.name.trim())) {
      setNameModalVisible(true);
    }
  }, [user, isGuest]);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }
    await updateUsername(newName.trim());
    setNameModalVisible(false);
  };

  const openApiKeyModal = () => {
    setDraftApiKey(geminiApiKey || '');
    setApiKeySecure(true);
    setApiKeyModalVisible(true);
  };

  const handleSaveApiKey = async () => {
    await saveGeminiApiKey(draftApiKey);
    setApiKeyModalVisible(false);
    if (draftApiKey.trim()) {
      Alert.alert('Gemini Enabled', 'Your API key has been saved. AI answers are now active.');
    } else {
      Alert.alert('API Key Removed', 'Gemini AI has been disabled. Local search is still available.');
    }
  };

  const handleRemoveApiKey = () => {
    Alert.alert(
      'Remove API Key',
      'This will disable Gemini AI. You can re-add it any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await saveGeminiApiKey('');
            setApiKeyModalVisible(false);
          },
        },
      ]
    );
  };

  const getLoginTypeLabel = () => {
    if (isGuest) return 'Guest Mode (Local Only)';
    if (user?.email && !user?.picture) return 'Signed in via Email';
    return 'Signed in with Google';
  };

  const maskedKey = geminiApiKey
    ? geminiApiKey.slice(0, 6) + '••••••••' + geminiApiKey.slice(-4)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* User card */}
      <View style={styles.card}>
        {user?.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <MaterialCommunityIcons name="account" size={40} color="#fff" />
          </View>
        )}

        <View style={styles.nameRow}>
          <Text style={[styles.name, !user?.name && styles.namePlaceholder]}>
            {user?.name || 'Set Username'}
          </Text>
          <TouchableOpacity
            onPress={() => { setNewName(user?.name || ''); setNameModalVisible(true); }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.email}>{user?.email || (isGuest ? 'Guest Access' : '')}</Text>

        <View style={[styles.badge, isGuest && styles.guestBadge]}>
          <MaterialCommunityIcons
            name={isGuest ? 'account-off' : 'robot'}
            size={14}
            color={isGuest ? colors.textSecondary : colors.primary}
          />
          <Text style={[styles.badgeText, isGuest && styles.guestBadgeText]}>
            {'  ' + getLoginTypeLabel()}
          </Text>
        </View>
      </View>

      {/* Incomplete profile prompt */}
      {(!user?.name || !user.name.trim()) && !isGuest && (
        <TouchableOpacity
          style={styles.promptContainer}
          onPress={() => { setNewName(user?.name || ''); setNameModalVisible(true); }}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="alert-circle" size={24} color={colors.accent} style={styles.promptIcon} />
          <View style={styles.promptTextContainer}>
            <Text style={styles.promptTitle}>Profile Incomplete</Text>
            <Text style={styles.promptDesc}>Add your name to personalize your study workspace.</Text>
          </View>
          <View style={styles.promptBtn}>
            <Text style={styles.promptBtnText}>Add</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Gemini API Key card */}
      <View style={styles.apiKeyCard}>
        <View style={styles.apiKeyHeader}>
          <MaterialCommunityIcons
            name="robot"
            size={22}
            color={canUseGemini ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.apiKeyTitle}>Gemini AI</Text>
          <View style={[styles.aiBadge, canUseGemini && styles.aiBadgeActive]}>
            <Text style={[styles.aiBadgeText, canUseGemini && styles.aiBadgeTextActive]}>
              {canUseGemini ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {geminiApiKey ? (
          <View style={styles.keyRow}>
            <MaterialCommunityIcons name="key" size={16} color={colors.primary} />
            <Text style={styles.keyText}>{maskedKey}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.apiKeyHint}>
              Add your Google AI Studio API key to enable Gemini-powered answers in the Chat tab.
            </Text>
            <TouchableOpacity
              style={styles.getKeyLink}
              onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="open-in-new" size={13} color={colors.primary} />
              <Text style={styles.getKeyLinkText}>Get free API key → aistudio.google.com</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.apiKeyBtn} onPress={openApiKeyModal} activeOpacity={0.85}>
          <MaterialCommunityIcons
            name={geminiApiKey ? 'pencil' : 'plus-circle-outline'}
            size={16}
            color="#fff"
          />
          <Text style={styles.apiKeyBtnText}>
            {geminiApiKey ? 'Update API Key' : 'Add Gemini API Key'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={canUseGemini ? colors.primary : colors.textSecondary}
        />
        <Text style={styles.infoText}>
          {isGuest && !geminiApiKey
            ? "You're using the app as a guest. Add a Gemini API key above to enable AI answers."
            : canUseGemini
            ? "AI assistant uses Gemini 1.5 Flash to answer questions from your MA History syllabus in real time."
            : "Add your Gemini API key above to enable AI-powered answers. Local search is always available."}
        </Text>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>What's available</Text>
        {[
          ['book-multiple', '5 Papers (SPHS101–105)'],
          ['format-list-numbered', '25 Units of content'],
          ['help-circle', '500+ Q&A pairs indexed'],
          ['robot', 'Gemini 2.0 Flash AI model'],
        ].map(([icon, label]) => (
          <View key={icon} style={styles.statRow}>
            <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
            <Text style={styles.statText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Name Modal */}
      <Modal animationType="fade" transparent visible={nameModalVisible} onRequestClose={() => setNameModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Your Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setNameModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleUpdateName}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* API Key Modal */}
      <Modal animationType="fade" transparent visible={apiKeyModalVisible} onRequestClose={() => setApiKeyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gemini API Key</Text>
            <Text style={styles.modalHint}>Get your free key from Google AI Studio:</Text>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="open-in-new" size={14} color={colors.primary} />
              <Text style={styles.linkBtnText}>aistudio.google.com/app/apikey</Text>
            </TouchableOpacity>

            <View style={styles.apiKeyInputRow}>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                value={draftApiKey}
                onChangeText={setDraftApiKey}
                placeholder="Paste your API key here"
                secureTextEntry={apiKeySecure}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setApiKeySecure(!apiKeySecure)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={apiKeySecure ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.apiKeyStorageNote}>
              Stored securely on this device only. Never shared.
            </Text>

            <View style={styles.modalButtons}>
              {geminiApiKey ? (
                <TouchableOpacity style={[styles.modalBtn, styles.removeBtn]} onPress={handleRemoveApiKey}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setApiKeyModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveApiKey}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 24, alignItems: 'center', marginBottom: 14,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    width: 80, height: 80, borderRadius: 40, marginBottom: 12,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  namePlaceholder: { color: colors.textLight, fontStyle: 'italic' },
  email: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  badgeText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  guestBadge: { backgroundColor: '#ECEFF1' },
  guestBadgeText: { color: colors.textSecondary },

  promptContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8E1', borderWidth: 1.5, borderColor: colors.accent,
    borderRadius: 12, padding: 12, marginBottom: 14, elevation: 1,
  },
  promptIcon: { marginRight: 10 },
  promptTextContainer: { flex: 1 },
  promptTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  promptDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  promptBtn: {
    backgroundColor: colors.accent, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 8, marginLeft: 8,
  },
  promptBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  apiKeyCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 18, marginBottom: 14, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  apiKeyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  apiKeyTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    marginLeft: 8, flex: 1,
  },
  aiBadge: {
    backgroundColor: '#ECEFF1', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 12,
  },
  aiBadgeActive: { backgroundColor: '#E8F5E9' },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  aiBadgeTextActive: { color: '#2E7D32' },
  keyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  keyText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6, fontFamily: 'monospace' },
  apiKeyHint: {
    fontSize: 13, color: colors.textSecondary,
    lineHeight: 19, marginBottom: 12,
  },
  getKeyLink: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginBottom: 12,
  },
  getKeyLinkText: {
    fontSize: 12, color: colors.primary,
    textDecorationLine: 'underline', fontWeight: '600',
  },
  apiKeyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 11,
    borderRadius: 10, gap: 6,
  },
  apiKeyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  infoCard: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 12, padding: 16, marginBottom: 14, elevation: 1,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, marginLeft: 10, lineHeight: 20 },

  statsCard: {
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 16, marginBottom: 20, elevation: 1,
  },
  statsTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statText: { fontSize: 14, color: colors.text, marginLeft: 10 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1.5, borderColor: colors.error, elevation: 1,
  },
  signOutText: { fontSize: 16, color: colors.error, fontWeight: '600', marginLeft: 8 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface, width: '100%',
    borderRadius: 16, padding: 24, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: colors.text,
    marginBottom: 8, textAlign: 'center',
  },
  modalHint: {
    fontSize: 12, color: colors.textSecondary,
    textAlign: 'center', marginBottom: 14, lineHeight: 18,
  },
  apiKeyInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12,
    marginBottom: 6, height: 48,
  },
  eyeBtn: { paddingLeft: 8 },
  modalInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 16, height: 48,
    fontSize: 15, color: colors.text, marginBottom: 20,
  },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E3F2FD', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14,
    alignSelf: 'stretch',
  },
  linkBtnText: {
    fontSize: 12, color: colors.primary,
    fontWeight: '600', flex: 1,
    textDecorationLine: 'underline',
  },
  apiKeyStorageNote: {
    fontSize: 11, color: colors.textLight,
    textAlign: 'center', marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: {
    flex: 0.47, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#ECEFF1' },
  cancelBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.primary },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  removeBtn: { backgroundColor: '#FFEBEE' },
  removeBtnText: { color: colors.error, fontSize: 14, fontWeight: '600' },
});
