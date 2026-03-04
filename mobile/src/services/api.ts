/**
 * RTK Query API service — all backend endpoints wired up.
 * Base URL: http://10.0.2.2:3000/api/v1 (Android emulator → host machine)
 * Auth: Bearer token read from Redux state.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  FarmProfileRequest,
  FarmProfilePatchRequest,
  FarmProfile,
  ProfileResponse,
  ProfileMessageResponse,
  CropsQuery,
  CropsResponse,
  OnboardingProgressRequest,
  OnboardingProgressResponse,
  WeatherForecast,
  WeatherResponse,
} from '../types';

const BASE_URL = 'http://10.0.2.2:3000/api/v1';

export const agriApi = createApi({
  reducerPath: 'agriApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Progress', 'Weather'],
  endpoints: (builder) => ({
    // ─── Auth ──────────────────────────────────────────────────────────────
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    // ─── Farm Profile ───────────────────────────────────────────────────────
    createProfile: builder.mutation<ProfileMessageResponse, FarmProfileRequest>({
      query: (body) => ({
        url: '/profile',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    getProfile: builder.query<FarmProfile, void>({
      query: () => '/profile',
      transformResponse: (response: ProfileResponse) => response.data,
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<ProfileMessageResponse, FarmProfileRequest>({
      query: (body) => ({
        url: '/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    patchProfile: builder.mutation<ProfileMessageResponse, FarmProfilePatchRequest>({
      query: (body) => ({
        url: '/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    deleteProfile: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/profile',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),

    // ─── Crops ──────────────────────────────────────────────────────────────
    getCrops: builder.query<CropsResponse, CropsQuery | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set('search', params.search);
        if (params?.limit !== undefined) queryParams.set('limit', String(params.limit));
        if (params?.offset !== undefined) queryParams.set('offset', String(params.offset));
        const qs = queryParams.toString();
        return `/crops${qs ? `?${qs}` : ''}`;
      },
    }),

    // ─── Onboarding Progress ────────────────────────────────────────────────
    getProgress: builder.query<OnboardingProgressResponse['data'], void>({
      query: () => '/profile/progress',
      transformResponse: (response: OnboardingProgressResponse) => response.data,
      providesTags: ['Progress'],
    }),

    saveProgress: builder.mutation<OnboardingProgressResponse, OnboardingProgressRequest>({
      query: (body) => ({
        url: '/profile/progress',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Progress'],
    }),

    // ─── Weather ─────────────────────────────────────────────────────────────
    getWeather: builder.query<WeatherForecast, void>({
      query: () => '/weather',
      transformResponse: (response: WeatherResponse) => response.data,
      providesTags: ['Weather'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useCreateProfileMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  usePatchProfileMutation,
  useDeleteProfileMutation,
  useGetCropsQuery,
  useGetProgressQuery,
  useSaveProgressMutation,
  useGetWeatherQuery,
} = agriApi;
