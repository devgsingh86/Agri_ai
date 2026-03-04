/**
 * languageSlice — persists the user's selected language to AsyncStorage.
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

/** Loads persisted language on app startup */
export const loadPersistedLanguage = createAsyncThunk('language/load', async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ?? 'en';
});

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    /** Immediately sets the language and persists it */
    setLanguage(state, action: PayloadAction<string>) {
      state.selected = action.payload;
      changeAppLanguage(action.payload);
      void AsyncStorage.setItem(STORAGE_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadPersistedLanguage.fulfilled, (state, action) => {
      state.selected = action.payload;
      changeAppLanguage(action.payload);
    });
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
