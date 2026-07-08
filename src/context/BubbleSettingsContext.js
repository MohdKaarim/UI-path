import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BubbleSettingsContext = createContext(null);

const ENABLED_KEY = 'ai_bubble_enabled';
const POSITION_KEY = 'ai_bubble_position';

export function BubbleSettingsProvider({ children }) {
  const [bubbleEnabled, setBubbleEnabledState] = useState(true);
  const [bubblePosition, setBubblePositionState] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedEnabled, storedPosition] = await Promise.all([
          AsyncStorage.getItem(ENABLED_KEY),
          AsyncStorage.getItem(POSITION_KEY),
        ]);
        if (storedEnabled != null) setBubbleEnabledState(storedEnabled === 'true');
        if (storedPosition) setBubblePositionState(JSON.parse(storedPosition));
      } catch (_) {
        // fall back to defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setBubbleEnabled = (value) => {
    setBubbleEnabledState(value);
    AsyncStorage.setItem(ENABLED_KEY, value ? 'true' : 'false');
  };

  const setBubblePosition = (position) => {
    setBubblePositionState(position);
    AsyncStorage.setItem(POSITION_KEY, JSON.stringify(position));
  };

  const resetBubblePosition = () => {
    setBubblePositionState(null);
    AsyncStorage.removeItem(POSITION_KEY);
  };

  return (
    <BubbleSettingsContext.Provider
      value={{ bubbleEnabled, setBubbleEnabled, bubblePosition, setBubblePosition, resetBubblePosition, loaded }}
    >
      {children}
    </BubbleSettingsContext.Provider>
  );
}

export function useBubbleSettings() {
  return useContext(BubbleSettingsContext);
}
