import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import mobileAds from 'react-native-google-mobile-ads';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { colors } from './src/utils/colors';

export default function App() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <PaperProvider>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
