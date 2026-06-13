import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Animated, ActivityIndicator, StatusBar, Platform, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PaperScreen from '../screens/PaperScreen';
import QuestionsScreen from '../screens/QuestionsScreen';
import AnswerScreen from '../screens/AnswerScreen';
import QuizScreen from '../screens/QuizScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import PYQScreen from '../screens/PYQScreen';

import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';
import OnboardingModal from '../components/OnboardingModal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab:   'book-open-variant',
  Search:    'magnify',
  Bookmarks: 'bookmark-multiple',
  PYQ:       'file-document-multiple',
  Profile:   'account-circle',
};

// ─── Animated tab icon ────────────────────────────────────────────────────────
function AnimatedTabIcon({ name, focused, color, size }) {
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const translateY   = useRef(new Animated.Value(0)).current;
  const rotateX      = useRef(new Animated.Value(0)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scaleAnim,  { toValue: 1.35, friction: 3, tension: 120, useNativeDriver: true }),
          Animated.spring(scaleAnim,  { toValue: 1.1,  friction: 5, tension: 80,  useNativeDriver: true }),
        ]),
        Animated.timing(translateY,  { toValue: -5, duration: 200, useNativeDriver: true }),
        Animated.timing(rotateX,     { toValue: 1,  duration: 180, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1,  duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim,  { toValue: 1, friction: 5, tension: 70,  useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(rotateX,     { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [focused]);

  const tiltX = rotateX.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-12deg'] });

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View style={[styles.tabGlow, { backgroundColor: color, opacity: glowOpacity }]} />
      <Animated.View style={{
        transform: [{ perspective: 200 }, { rotateX: tiltX }, { scale: scaleAnim }, { translateY }],
      }}>
        <Animated.View style={[styles.iconShadowDot, { backgroundColor: color, opacity: glowOpacity }]} />
        <MaterialCommunityIcons name={name} size={size} color={color} />
      </Animated.View>
    </View>
  );
}

// ─── AI chat bubble (uses assets/ai-bubble.png) ───────────────────────────────
const AI_BUBBLE = require('../../assets/ai-bubble.webp');

function PulseBubble({ onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.bubbleWrap}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Image source={AI_BUBBLE} style={styles.bubbleImage} resizeMode="contain" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Home stack ───────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Stack.Screen name="Home"      component={HomeScreen}      options={{ title: 'Mastering History' }} />
      <Stack.Screen name="Paper"     component={PaperScreen}     options={({ route }) => ({ title: route.params?.paperCode || 'Paper' })} />
      <Stack.Screen name="Questions" component={QuestionsScreen} options={({ route }) => ({ title: route.params?.unitTitle || 'Questions' })} />
      <Stack.Screen name="Answer"    component={AnswerScreen}    options={{ title: 'Answer' }} />
      <Stack.Screen name="Quiz"      component={QuizScreen}      options={{ title: 'Quiz Mode', headerStyle: { backgroundColor: colors.quiz } }} />
    </Stack.Navigator>
  );
}

// ─── Main tabs + floating chat bubble ─────────────────────────────────────────
function MainTabs() {
  const [chatOpen, setChatOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then(val => {
      if (!val) setShowOnboarding(true);
    });
  }, []);

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    AsyncStorage.setItem('onboarding_done', 'true');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: { borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabIcon
              name={TAB_ICONS[route.name] || 'circle'}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        })}
      >
        <Tab.Screen name="HomeTab"   component={HomeStack}       options={{ title: 'Papers' }} />
        <Tab.Screen name="Search"    component={SearchScreen}    options={{
          title: 'Search', headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' },
        }} />
        <Tab.Screen name="Bookmarks" component={BookmarksScreen} options={{
          title: 'Bookmarks', headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' },
        }} />
        <Tab.Screen name="PYQ"       component={PYQScreen}       options={{
          title: 'PYQ', headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' },
          headerTitle: 'Previous Year Papers',
        }} />
        <Tab.Screen name="Profile"   component={ProfileScreen}   options={{
          title: 'Profile', headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' },
        }} />
      </Tab.Navigator>

      {/* Floating AI bubble — bottom-left, above nav bar */}
      <PulseBubble onPress={() => setChatOpen(true)} />

      {/* First-time onboarding */}
      <OnboardingModal visible={showOnboarding} onDone={handleOnboardingDone} />

      {/* Full-screen chat modal */}
      <Modal
        visible={chatOpen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setChatOpen(false)}
      >
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        <View style={styles.chatModal}>
          {/* Modal header */}
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <MaterialCommunityIcons name="robot" size={22} color="#fff" />
              <Text style={styles.chatHeaderTitle}>AI Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setChatOpen(false)} style={styles.chatCloseBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="chevron-down" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Chat content */}
          <ChatScreen />
        </View>
      </Modal>
    </View>
  );
}

// ─── Root navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {(user || isGuest) ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const BUBBLE_SIZE = 56;
const NAV_HEIGHT  = 62;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background,
  },

  // Tab icon
  tabIconWrapper: { alignItems: 'center', justifyContent: 'center', width: 44, height: 36 },
  tabGlow:        { position: 'absolute', bottom: -2, width: 32, height: 3, borderRadius: 2 },
  iconShadowDot:  { position: 'absolute', alignSelf: 'center', bottom: -4, width: 6, height: 6, borderRadius: 3 },

  // ── Floating bubble ──────────────────────────────────────────────────────────
  bubbleWrap: {
    position: 'absolute',
    bottom: NAV_HEIGHT + 10,
    right: 14,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#00ACC1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  bubbleImage: {
    width: 72,
    height: 72,
  },

  // Chat modal
  chatModal: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  chatHeaderLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  chatCloseBtn:    { padding: 4 },
});
