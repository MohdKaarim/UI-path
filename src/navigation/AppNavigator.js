import React from 'react';
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
import { colors } from '../utils/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MA History — Sem 1' }} />
      <Stack.Screen name="Paper" component={PaperScreen} options={({ route }) => ({ title: route.params?.paperCode || 'Paper' })} />
      <Stack.Screen name="Questions" component={QuestionsScreen} options={({ route }) => ({ title: route.params?.unitTitle || 'Questions' })} />
      <Stack.Screen name="Answer" component={AnswerScreen} options={{ title: 'Answer' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz Mode', headerStyle: { backgroundColor: colors.quiz } }} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  HomeTab: 'book-open-variant',
  Search: 'magnify',
  Bookmarks: 'bookmark-multiple',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: { borderTopColor: colors.border },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name={TAB_ICONS[route.name] || 'circle'} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Papers' }} />
        <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Search', headerShown: true, headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }} />
        <Tab.Screen name="Bookmarks" component={BookmarksScreen} options={{ title: 'Bookmarks', headerShown: true, headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
