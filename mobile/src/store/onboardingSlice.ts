/**
 * Redux slice for onboarding wizard state.
 * Manages per-step data and the current step index.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  OnboardingState,
  PersonalInfo,
  FarmDetails,
  LocationInfo,
  ExperienceInfo,
  CropItem,
  FarmSizeUnit,
  LocationType,
  ExperienceLevel,
} from '../types';

const initialState: OnboardingState = {
  currentStep: 1,
  personalInfo: {
    firstName: '',
    lastName: '',
    phoneNumber: '',
  },
  farmDetails: {
    farmSize: '',
    farmSizeUnit: 'hectares',
    crops: [],
  },
  location: {
    locationType: 'manual',
    latitude: undefined,
    longitude: undefined,
    country: '',
    state: '',
    district: '',
    village: '',
    address: '',
  },
  experience: {
    level: '',
    yearsOfExperience: '',
  },
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },

    nextStep(state) {
      if (state.currentStep < 5) {
        state.currentStep += 1;
      }
    },

    prevStep(state) {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },

    setPersonalInfo(state, action: PayloadAction<Partial<PersonalInfo>>) {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },

    setFarmSize(
      state,
      action: PayloadAction<{ farmSize?: string; farmSizeUnit?: FarmSizeUnit }>
    ) {
      if (action.payload.farmSize !== undefined) {
        state.farmDetails.farmSize = action.payload.farmSize;
      }
      if (action.payload.farmSizeUnit !== undefined) {
        state.farmDetails.farmSizeUnit = action.payload.farmSizeUnit;
      }
    },

    setCrops(state, action: PayloadAction<CropItem[]>) {
      state.farmDetails.crops = action.payload;
    },

    addCrop(state, action: PayloadAction<CropItem>) {
      if (state.farmDetails.crops.length < 5) {
        const exists = state.farmDetails.crops.some(
          (c) => c.crop_name.toLowerCase() === action.payload.crop_name.toLowerCase()
        );
        if (!exists) {
          state.farmDetails.crops.push(action.payload);
        }
      }
    },

    removeCrop(state, action: PayloadAction<string>) {
      state.farmDetails.crops = state.farmDetails.crops.filter(
        (c) => c.crop_name !== action.payload
      );
    },

    setLocation(state, action: PayloadAction<Partial<LocationInfo>>) {
      state.location = { ...state.location, ...action.payload };
    },

    setLocationType(state, action: PayloadAction<LocationType>) {
      state.location.locationType = action.payload;
    },

    setGpsCoords(state, action: PayloadAction<{ latitude: number; longitude: number }>) {
      state.location.latitude = action.payload.latitude;
      state.location.longitude = action.payload.longitude;
      state.location.locationType = 'gps';
    },

    setExperience(
      state,
      action: PayloadAction<{ level?: ExperienceLevel | ''; yearsOfExperience?: string }>
    ) {
      if (action.payload.level !== undefined) {
        state.experience.level = action.payload.level;
      }
      if (action.payload.yearsOfExperience !== undefined) {
        state.experience.yearsOfExperience = action.payload.yearsOfExperience;
      }
    },

    /**
     * Hydrate state from saved server progress so users can resume.
     */
    hydrateFromProgress(state, action: PayloadAction<Partial<OnboardingState>>) {
      const p = action.payload;
      if (p.currentStep !== undefined) state.currentStep = p.currentStep;
      if (p.personalInfo) state.personalInfo = { ...state.personalInfo, ...p.personalInfo };
      if (p.farmDetails) state.farmDetails = { ...state.farmDetails, ...p.farmDetails };
      if (p.location) state.location = { ...state.location, ...p.location };
      if (p.experience) state.experience = { ...state.experience, ...p.experience };
    },

    resetOnboarding() {
      return initialState;
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  prevStep,
  setPersonalInfo,
  setFarmSize,
  setCrops,
  addCrop,
  removeCrop,
  setLocation,
  setLocationType,
  setGpsCoords,
  setExperience,
  hydrateFromProgress,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
