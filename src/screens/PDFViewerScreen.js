import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Asset } from 'expo-asset';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

// Static map — require() must be resolved at bundle time
const PDF_SOURCES = {
  SPHS101: require('../data/Reference/SPHS101.pdf'),
  SPHS102: require('../data/Reference/SPHS102.pdf'),
  SPHS103: require('../data/Reference/SPHS103.pdf'),
  SPHS104: require('../data/Reference/SPHS104.pdf'),
  SPHS105: require('../data/Reference/SPHS105.pdf'),
};

const PAPER_COLORS = {
  SPHS101: '#1565C0',
  SPHS102: '#00838F',
  SPHS103: '#00695C',
  SPHS104: '#6A1B9A',
  SPHS105: '#BF360C',
};

export default function PDFViewerScreen({ route, navigation }) {
  const { paperCode, page: initialPage = 1, title } = route.params;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localUri, setLocalUri] = useState(null);
  const pdfRef = useRef(null);

  const accentColor = PAPER_COLORS[paperCode] || colors.primary;
  const source = PDF_SOURCES[paperCode];

  // react-native-pdf needs a real file:// path on Android — resolve the
  // require()'d module (a Metro asset id) to one via expo-asset.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setLocalUri(null);
    setError(null);
    setLoading(true);

    Asset.fromModule(source)
      .downloadAsync()
      .then((asset) => {
        if (!cancelled) setLocalUri(asset.localUri || asset.uri);
      })
      .catch((err) => {
        console.error('PDF asset resolve error:', err);
        if (!cancelled) {
          setError('Could not load the textbook. Please rebuild the app.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [source]);

  const handleLoadComplete = useCallback((pages) => {
    setTotalPages(pages);
    setLoading(false);
  }, []);

  const handlePageChanged = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleError = useCallback((err) => {
    console.error('PDF error:', err);
    setError('Could not load the textbook. Please rebuild the app.');
    setLoading(false);
  }, []);

  const goToPrev = useCallback(() => {
    if (pdfRef.current && currentPage > 1) {
      pdfRef.current.setPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToNext = useCallback(() => {
    if (pdfRef.current && currentPage < totalPages) {
      pdfRef.current.setPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  if (!source) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="file-alert-outline" size={48} color={colors.textLight} />
        <Text style={styles.errorText}>Textbook not found for {paperCode}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Page counter bar */}
      <View style={[styles.pageBar, { backgroundColor: accentColor }]}>
        <TouchableOpacity
          onPress={goToPrev}
          disabled={currentPage <= 1}
          style={[styles.navBtn, currentPage <= 1 && styles.navBtnDisabled]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.pageCounter}>
          Page {currentPage}{totalPages > 0 ? ` / ${totalPages}` : ''}
        </Text>

        <TouchableOpacity
          onPress={goToNext}
          disabled={currentPage >= totalPages}
          style={[styles.navBtn, currentPage >= totalPages && styles.navBtnDisabled]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* PDF content */}
      {error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Run: npx expo run:android</Text>
        </View>
      ) : localUri ? (
        <Pdf
          ref={pdfRef}
          source={{ uri: localUri }}
          page={initialPage}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={handleError}
          enablePaging
          horizontal={false}
          fitPolicy={0}
          style={styles.pdf}
          activityIndicator={
            <ActivityIndicator size="large" color={accentColor} />
          }
        />
      ) : null}

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Loading textbook…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },

  pageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    elevation: 4,
  },
  navBtn: { padding: 6, borderRadius: 6 },
  navBtnDisabled: { opacity: 0.35 },
  pageCounter: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

  pdf: { flex: 1, width: '100%' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  errorText: { fontSize: 15, color: colors.text, textAlign: 'center', fontWeight: '600' },
  errorHint: { fontSize: 13, color: colors.textLight, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier' },
});
