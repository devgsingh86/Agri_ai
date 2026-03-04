/**
 * Yup validation schemas for all forms in the AgriAI app.
 * Mirrors the backend Joi validators for consistent UX feedback.
 */
import * as yup from 'yup';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(1, 'Password is required')
    .required('Password is required'),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

// ─── Onboarding Step 1 — Personal Info ───────────────────────────────────────

export const personalInfoSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name must be at most 100 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be at most 100 characters')
    .required('Last name is required'),
  phoneNumber: yup
    .string()
    .trim()
    .matches(
      /^(\+?[\d\s\-()]{7,20})?$/,
      'Enter a valid phone number (e.g. +91 98765 43210)'
    )
    .optional(),
});

// ─── Onboarding Step 2 — Farm Size ───────────────────────────────────────────

export const farmSizeSchema = yup.object({
  farmSize: yup
    .number()
    .typeError('Farm size must be a number')
    .positive('Farm size must be positive')
    .min(0.01, 'Farm size must be at least 0.01')
    .max(100000, 'Farm size cannot exceed 100,000')
    .required('Farm size is required'),
  farmSizeUnit: yup
    .string()
    .oneOf(['hectares', 'acres'] as const, 'Select a unit')
    .required('Farm size unit is required'),
});

// ─── Onboarding Step 3 — Crop Selection ──────────────────────────────────────

export const cropSelectionSchema = yup.object({
  crops: yup
    .array()
    .of(
      yup.object({
        crop_name: yup.string().required(),
        is_custom: yup.boolean().required(),
        crop_id: yup.string().nullable().optional(),
      })
    )
    .min(1, 'Please select at least one crop')
    .max(5, 'You can select at most 5 crops')
    .required('Please select at least one crop'),
});

// ─── Onboarding Step 4 — Location (GPS branch) ───────────────────────────────

export const locationGpsSchema = yup.object({
  latitude: yup
    .number()
    .typeError('Latitude must be a number')
    .min(-90)
    .max(90)
    .required(),
  longitude: yup
    .number()
    .typeError('Longitude must be a number')
    .min(-180)
    .max(180)
    .required(),
});

// ─── Onboarding Step 4 — Location (Manual branch) ────────────────────────────

export const locationManualSchema = yup.object({
  country: yup
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(100)
    .required('Country is required'),
  state: yup
    .string()
    .trim()
    .min(1, 'State is required')
    .max(100)
    .required('State is required'),
  district: yup
    .string()
    .trim()
    .min(1, 'District is required')
    .max(100)
    .required('District is required'),
  village: yup.string().trim().max(100).optional(),
  address: yup.string().trim().max(500).optional(),
});

// ─── Onboarding Step 5 — Experience ──────────────────────────────────────────

export const experienceSchema = yup.object({
  level: yup
    .string()
    .oneOf(
      ['beginner', 'intermediate', 'experienced', 'expert'] as const,
      'Please select your experience level'
    )
    .required('Experience level is required'),
  yearsOfExperience: yup
    .number()
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(100, 'Must be 100 or less')
    .nullable()
    .optional()
    .transform((v) => (isNaN(v) ? undefined : v)),
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type PersonalInfoFormValues = yup.InferType<typeof personalInfoSchema>;
export type FarmSizeFormValues = yup.InferType<typeof farmSizeSchema>;
export type LocationManualFormValues = yup.InferType<typeof locationManualSchema>;
export type ExperienceFormValues = yup.InferType<typeof experienceSchema>;
