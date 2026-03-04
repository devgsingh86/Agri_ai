// ============================================================
// All TypeScript types shared across the AgriAI mobile app
// Mirror the backend models exactly to ensure API compatibility
// ============================================================

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Crops ───────────────────────────────────────────────────────────────────

export interface Crop {
  id: string;
  name: string;
  scientific_name?: string | null;
  category?: string | null;
  common_regions?: string[] | null;
  is_active: boolean;
}

export interface CropsResponse {
  data: Crop[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CropsQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

// A crop item as stored on the farm profile (may be custom)
export interface CropItem {
  crop_id?: string | null;
  crop_name: string;
  is_custom: boolean;
}

// ─── Farm Profile ─────────────────────────────────────────────────────────────

export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced' | 'expert';
export type FarmSizeUnit = 'hectares' | 'acres';
export type LocationType = 'gps' | 'manual';

export interface FarmProfileRequest {
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  farm_size: number;
  farm_size_unit: FarmSizeUnit;
  location_type: LocationType;
  latitude?: number | null;
  longitude?: number | null;
  country: string;
  state: string;
  district?: string | null;
  village?: string | null;
  address?: string | null;
  experience_level: ExperienceLevel;
  years_of_experience?: number | null;
  crops: CropItem[];
}

export interface FarmProfilePatchRequest extends Partial<FarmProfileRequest> {}

export interface FarmProfile extends FarmProfileRequest {
  id: string;
  user_id: string;
  farm_size_hectares: number;
  completeness: number;
  created_at: string;
  updated_at: string;
  crops: CropItem[];
}

export interface ProfileResponse {
  data: FarmProfile;
}

export interface ProfileMessageResponse {
  message: string;
  data: FarmProfile;
}

// ─── Onboarding Progress ─────────────────────────────────────────────────────

export interface OnboardingProgressData {
  current_step: number;
  total_steps: number;
  saved_data: Record<string, unknown> | null;
}

export interface OnboardingProgressRequest {
  current_step: number;
  saved_data?: Record<string, unknown> | null;
}

export interface OnboardingProgressResponse {
  data: OnboardingProgressData;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ApiErrorDetail[];
}

// ─── Redux Onboarding State ──────────────────────────────────────────────────

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface FarmDetails {
  farmSize: string;
  farmSizeUnit: FarmSizeUnit;
  crops: CropItem[];
}

export interface LocationInfo {
  locationType: LocationType;
  latitude?: number;
  longitude?: number;
  country: string;
  state: string;
  district: string;
  village: string;
  address: string;
}

export interface ExperienceInfo {
  level: ExperienceLevel | '';
  yearsOfExperience: string;
}

export interface OnboardingState {
  currentStep: number;
  personalInfo: PersonalInfo;
  farmDetails: FarmDetails;
  location: LocationInfo;
  experience: ExperienceInfo;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  PersonalInfo: undefined;
  FarmSize: undefined;
  CropSelection: undefined;
  Location: undefined;
  Experience: undefined;
  Review: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

// ── Weather ─────────────────────────────────────────────────────────────────

export interface WeatherDay {
  date: string;
  weatherCode: number;
  condition: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipProbability: number;
  windSpeed: number;
}

export type AdvisoryType = 'warning' | 'info' | 'tip';

export interface CropAdvisory {
  type: AdvisoryType;
  message: string;
}

export interface WeatherForecast {
  timezone: string;
  days: WeatherDay[];
  advisories: CropAdvisory[];
  generatedAt: string;
}

export interface WeatherResponse {
  data: WeatherForecast;
}
