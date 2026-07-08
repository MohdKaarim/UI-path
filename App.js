import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { BubbleSettingsProvider } from './src/context/BubbleSettingsContext';
import { colors } from './src/utils/colors';

export default function App() {
  const [adsReady, setAdsReady] = useState(false);

  useEffect(() => {
    mobileAds()
      .setRequestConfiguration({
        // Tag all requests as suitable for families
        maxAdContentRating: MaxAdContentRating.PG,
        // Allow personalized ads (remove if GDPR consent not implemented)
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      })
      .then(() => mobileAds().initialize())
      .then(() => setAdsReady(true))
      .catch(() => setAdsReady(true)); // still render app even if ads fail
  }, []);

  return (
    <AuthProvider>
      <BubbleSettingsProvider>
        <PaperProvider>
          <StatusBar style="light" backgroundColor={colors.primary} />
          <AppNavigator adsReady={adsReady} />
        </PaperProvider>
      </BubbleSettingsProvider>
    </AuthProvider>
  );
}
