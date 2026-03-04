/**
 * Redux store — combines all slices and RTK Query API.
 */
import { configureStore } from '@reduxjs/toolkit';
import { agriApi } from '../services/api';
import onboardingReducer from './onboardingSlice';
import authReducer from './authSlice';
import languageReducer from './languageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    language: languageReducer,
    [agriApi.reducerPath]: agriApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(agriApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
