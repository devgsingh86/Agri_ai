/**
 * AgriAI React Native App
 * Root component — sets up Redux Provider + Navigation + i18n
 */
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import { loadPersistedLanguage } from './src/store/languageSlice';
import './src/i18n';
import type { AppDispatch } from './src/store';

/** Loads the persisted language on startup */
function AppInit(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    void dispatch(loadPersistedLanguage());
  }, [dispatch]);
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RootNavigator />
    </>
  );
}

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppInit />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default App;
