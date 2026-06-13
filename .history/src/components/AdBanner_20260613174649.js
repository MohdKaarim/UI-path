import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-9489708234526393/3378946140',
      ios:     'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    });

// Temporary: using test banner to verify ad loading
const BANNER_ID = TestIds.BANNER;

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.container, !loaded && styles.hidden]}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          networkExtras: { collapsible: 'bottom' },
        }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
