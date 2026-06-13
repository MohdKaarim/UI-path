import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';

export default function LoginScreen() {
  const { loginOrRegisterWithEmail, continueAsGuest } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [errors, setErrors] = useState({});

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  const validate = () => {
    const errs = {};
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      errs.email = 'Email is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        errs.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoadingEmail(true);
    try {
      const res = await loginOrRegisterWithEmail(email.trim(), password, mode);
      if (res.success && res.isNew) {
        Alert.alert(
          'Account Created',
          'Welcome to Mastering History! You can add your Gemini API key in the Profile tab to enable AI features.'
        );
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: 'Incorrect password. Please try again.' }));
      } else if (msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      } else if (msg.toLowerCase().includes('already registered')) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered. Switch to Sign In.' }));
      } else {
        Alert.alert('Error', msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="book-open-variant" size={48} color="#fff" />
        </View>

        <Text style={styles.title}>Mastering History</Text>
        <Text style={styles.subtitle}>AI Study Assistant</Text>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'signin' && styles.modeBtnActive]}
            onPress={() => switchMode('signin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, mode === 'signin' && styles.modeBtnTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'signup' && styles.modeBtnActive]}
            onPress={() => switchMode('signup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, mode === 'signup' && styles.modeBtnTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form card */}
        <View style={styles.card}>

          {/* Email */}
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={errors.email ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Password */}
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={errors.password ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 chars)"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: null })); }}
              secureTextEntry={secureText}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <MaterialCommunityIcons
                name={secureText ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirm Password — only on signup */}
          {mode === 'signup' && (
            <>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={20}
                  color={errors.confirmPassword ? colors.error : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.textLight}
                  value={confirmPassword}
                  onChangeText={v => { setConfirmPassword(v); setErrors(p => ({ ...p, confirmPassword: null })); }}
                  secureTextEntry={secureConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                  <MaterialCommunityIcons
                    name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword
                ? <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                : null}
            </>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleSubmit}
            disabled={loadingEmail}
            activeOpacity={0.85}
          >
            {loadingEmail ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest Option */}
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => continueAsGuest()}
          disabled={loadingEmail}
          activeOpacity={0.7}
        >
          <Text style={styles.guestBtnText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Explore full papers, practice quizzes, and query Gemini AI
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 20,
  },

  // Mode toggle
  modeRow: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeBtnTextActive: {
    color: '#fff',
  },

  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    height: 50,
  },
  inputError: {
    borderColor: colors.error || '#D32F2F',
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#D32F2F',
    marginBottom: 10,
    marginLeft: 4,
  },
  actionBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    paddingHorizontal: 12,
  },
  guestBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
});
