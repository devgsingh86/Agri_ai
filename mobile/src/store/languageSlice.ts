/**
 * languageSlice — persists the user's selected language to AsyncStorage.
 * Side effects (i18n change, AsyncStorage) are kept OUT of reducers to
 * comply with Redux's pure-reducer rule (no store.getState() in reducers).
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeAppLanguage } from '../i18n';

const STORAGE_KEY = '@agri_ai_language';

interface LanguageState {
  selected: string;
}

const initialState: LanguageState = {
  selected: 'en',
};

/**
 * Loads persisted language on app startup, applies it to i18n,
 * and returns the code so the reducer can update state.
 */
export const loadPersistedLanguage = createAsyncThunk('language/load', async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const code = stored ?? 'en';
  changeAppLanguage(code); // side effect OUTSIDE the reducer
  return code;
});

/**
 * Persists and applies a new language selection.
 * Calling changeAppLanguage here (in the thunk payloadCreator) keeps
 * the reducer pure.
 */
export const persistLanguage = createAsyncThunk('language/persist', async (code: string) => {
  changeAppLanguage(code); // side effect OUTSIDE the reducer
  await AsyncStorage.setItem(STORAGE_KEY, code);
  return code;
});

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    /** Synchronously update state — no side effects here */
    setLanguage(state, action: PayloadAction<string>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPersistedLanguage.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(persistLanguage.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

