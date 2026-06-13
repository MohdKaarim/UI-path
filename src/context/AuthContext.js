import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [geminiApiKey, setGeminiApiKey] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('gauth_user');
      const storedToken = await SecureStore.getItemAsync('gauth_token');
      const guestStatus = await SecureStore.getItemAsync('guest_status');
      const guestName = await SecureStore.getItemAsync('guest_name');
      const storedApiKey = await SecureStore.getItemAsync('gemini_api_key');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);

        // Migration: if the stored token is an old Google OAuth token (not our
        // email-token prefix), clear it — Google Sign-In has been removed and
        // the OAuth token will be expired / will cause auth errors.
        const isEmailToken =
          typeof storedToken === 'string' && storedToken.startsWith('email-token-');
        if (!isEmailToken) {
          // Replace with a plain email token so session is preserved but
          // we don't accidentally use the old OAuth token for Gemini.
          const safeToken = 'email-token-migrated';
          setAccessToken(safeToken);
          await SecureStore.setItemAsync('gauth_token', safeToken);
        }
      } else if (guestStatus === 'true') {
        setIsGuest(true);
        if (guestName) {
          setUser({ name: guestName, isGuestAccount: true });
        }
      }

      if (storedApiKey && storedApiKey.trim()) {
        setGeminiApiKey(storedApiKey.trim());
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  // signIn kept for compatibility (used if Google OAuth ever returns)
  const signIn = async (userInfo, token) => {
    setUser(userInfo);
    setAccessToken(token);
    setIsGuest(false);
    await SecureStore.setItemAsync('gauth_user', JSON.stringify(userInfo));
    await SecureStore.setItemAsync('gauth_token', token);
    await SecureStore.deleteItemAsync('guest_status');
    await SecureStore.deleteItemAsync('guest_name');
  };

  const loginOrRegisterWithEmail = async (email, password) => {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const usersJson = await AsyncStorage.getItem('registered_users');
      const users = usersJson ? JSON.parse(usersJson) : {};

      if (users[formattedEmail]) {
        if (users[formattedEmail].password === password) {
          const loggedInUser = {
            email: formattedEmail,
            name: users[formattedEmail].name || '',
            picture: null,
            isGuestAccount: false,
          };
          const token = 'email-token-' + Date.now();
          setUser(loggedInUser);
          setAccessToken(token);
          setIsGuest(false);
          await SecureStore.setItemAsync('gauth_user', JSON.stringify(loggedInUser));
          await SecureStore.setItemAsync('gauth_token', token);
          await SecureStore.deleteItemAsync('guest_status');
          await SecureStore.deleteItemAsync('guest_name');
          return { success: true, user: loggedInUser };
        } else {
          throw new Error('Incorrect password');
        }
      } else {
        const newUser = { email: formattedEmail, password, name: '' };
        users[formattedEmail] = newUser;
        await AsyncStorage.setItem('registered_users', JSON.stringify(users));

        const loggedInUser = {
          email: formattedEmail,
          name: '',
          picture: null,
          isGuestAccount: false,
        };
        const token = 'email-token-' + Date.now();
        setUser(loggedInUser);
        setAccessToken(token);
        setIsGuest(false);
        await SecureStore.setItemAsync('gauth_user', JSON.stringify(loggedInUser));
        await SecureStore.setItemAsync('gauth_token', token);
        await SecureStore.deleteItemAsync('guest_status');
        await SecureStore.deleteItemAsync('guest_name');
        return { success: true, isNew: true, user: loggedInUser };
      }
    } catch (err) {
      console.error('Email authentication error:', err);
      throw err;
    }
  };

  // Save or clear the user's personal Gemini API key (stored only on-device).
  const saveGeminiApiKey = async (key) => {
    const trimmed = (key || '').trim();
    setGeminiApiKey(trimmed || null);
    if (trimmed) {
      await SecureStore.setItemAsync('gemini_api_key', trimmed);
    } else {
      await SecureStore.deleteItemAsync('gemini_api_key');
    }
  };

  const updateUsername = async (newName) => {
    if (user && !user.isGuestAccount) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      await SecureStore.setItemAsync('gauth_user', JSON.stringify(updatedUser));

      if (user.email) {
        try {
          const usersJson = await AsyncStorage.getItem('registered_users');
          if (usersJson) {
            const users = JSON.parse(usersJson);
            const formattedEmail = user.email.toLowerCase();
            if (users[formattedEmail]) {
              users[formattedEmail].name = newName;
              await AsyncStorage.setItem('registered_users', JSON.stringify(users));
            }
          }
        } catch (e) {
          console.error('Failed to update name in local storage:', e);
        }
      }
    } else {
      await SecureStore.setItemAsync('guest_name', newName);
      setUser({ name: newName, isGuestAccount: true });
      setIsGuest(true);
    }
  };

  const continueAsGuest = async (guestName = 'Guest Student') => {
    setIsGuest(true);
    setUser({ name: guestName, isGuestAccount: true });
    setAccessToken(null);
    await SecureStore.setItemAsync('guest_status', 'true');
    await SecureStore.setItemAsync('guest_name', guestName);
    await SecureStore.deleteItemAsync('gauth_user');
    await SecureStore.deleteItemAsync('gauth_token');
  };

  const signOut = async () => {
    setUser(null);
    setAccessToken(null);
    setIsGuest(false);
    // Keep geminiApiKey so the user doesn't have to re-enter it after sign-out
    await SecureStore.deleteItemAsync('gauth_user');
    await SecureStore.deleteItemAsync('gauth_token');
    await SecureStore.deleteItemAsync('guest_status');
    await SecureStore.deleteItemAsync('guest_name');
  };

  // Gemini is available ONLY when a personal API key has been entered.
  // We no longer use Google OAuth tokens for Gemini (button removed).
  const canUseGemini = Boolean(geminiApiKey);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        geminiApiKey,
        canUseGemini,
        isGuest,
        loading,
        signIn,
        loginOrRegisterWithEmail,
        saveGeminiApiKey,
        signOut,
        continueAsGuest,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
