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
  ProfitabilityResult,
  ProfitabilityResponse,
  ProfitabilityQueryArgs,
  MandiPrice,
  PriceHistoryPoint,
  MandiAlert,
  MandiPricesResponse,
  MandiHistoryResponse,
  MandiComparisonResponse,
  MandiAlertsResponse,
  CreateAlertRequest,
} from '../types';

// TODO: Use react-native-config for per-environment URL (HTTP only for local dev)
const BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1' // adb reverse tcp:3000 tcp:3000 maps to host
  : 'https://api.agri-ai.app/api/v1'; // replace with actual prod URL

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
  tagTypes: ['Profile', 'Progress', 'Weather', 'Profitability', 'Mandi', 'MandiAlerts'],
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

    // ─── Profitability ────────────────────────────────────────────────────────
    getProfitability: builder.query<ProfitabilityResult, ProfitabilityQueryArgs>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args.season && args.season !== 'all') params.set('season', args.season);
        if (args.water  && args.water  !== 'all') params.set('water',  args.water);
        if (args.soil   && args.soil   !== 'all') params.set('soil',   args.soil);
        const qs = params.toString();
        return `/profitability${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: ProfitabilityResponse) => response.data,
      providesTags: ['Profitability'],
    }),

    // ─── Mandi Price Analytics ─────────────────────────────────────────────────
    getMandiPrices: builder.query<MandiPricesResponse['data'], { crops?: string }>({
      query: ({ crops } = {}) => crops ? `/mandi/prices?crops=${crops}` : '/mandi/prices',
      transformResponse: (response: MandiPricesResponse) => response.data,
      providesTags: ['Mandi'],
    }),

    getMandiHistory: builder.query<MandiHistoryResponse['data'], string>({
      query: (cropKey) => `/mandi/history/${cropKey}`,
      transformResponse: (response: MandiHistoryResponse) => response.data,
      providesTags: ['Mandi'],
    }),

    getMandiComparison: builder.query<MandiComparisonResponse['data'], string>({
      query: (cropKey) => `/mandi/comparison/${cropKey}`,
      transformResponse: (response: MandiComparisonResponse) => response.data,
      providesTags: ['Mandi'],
    }),

    getMandiAlerts: builder.query<MandiAlert[], void>({
      query: () => '/mandi/alerts',
      transformResponse: (response: MandiAlertsResponse) => response.data,
      providesTags: ['MandiAlerts'],
    }),

    createMandiAlert: builder.mutation<MandiAlert, CreateAlertRequest>({
      query: (body) => ({ url: '/mandi/alerts', method: 'POST', body }),
      invalidatesTags: ['MandiAlerts'],
    }),

    deleteMandiAlert: builder.mutation<void, string>({
      query: (id) => ({ url: `/mandi/alerts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MandiAlerts'],
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
  useGetProfitabilityQuery,
  useGetMandiPricesQuery,
  useGetMandiHistoryQuery,
  useGetMandiComparisonQuery,
  useGetMandiAlertsQuery,
  useCreateMandiAlertMutation,
  useDeleteMandiAlertMutation,
} = agriApi;
