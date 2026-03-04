import Joi from 'joi';

/**
 * Joi schema for creating a farm profile.
 * Validates the full request body including optional GPS coordinates.
 */
export const createProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).required(),
  last_name: Joi.string().trim().min(1).max(100).required(),
  phone_number: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s\-()]{7,20}$/)
    .optional()
    .allow(null, ''),
  farm_size: Joi.number().positive().required(),
  farm_size_unit: Joi.string().valid('hectares', 'acres').required(),
  location_type: Joi.string().valid('gps', 'manual').required(),
  latitude: Joi.when('location_type', {
    is: 'gps',
    then: Joi.number().min(-90).max(90).required(),
    otherwise: Joi.number().min(-90).max(90).optional().allow(null),
  }),
  longitude: Joi.when('location_type', {
    is: 'gps',
    then: Joi.number().min(-180).max(180).required(),
    otherwise: Joi.number().min(-180).max(180).optional().allow(null),
  }),
  country: Joi.string().trim().min(1).max(100).required(),
  state: Joi.string().trim().min(1).max(100).required(),
  district: Joi.string().trim().max(100).optional().allow(null, ''),
  village: Joi.string().trim().max(100).optional().allow(null, ''),
  address: Joi.string().trim().max(500).optional().allow(null, ''),
  experience_level: Joi.string()
    .valid('beginner', 'intermediate', 'experienced', 'expert')
    .required(),
  years_of_experience: Joi.number().integer().min(0).max(100).optional().allow(null),
  crops: Joi.array()
    .items(
      Joi.object({
        crop_id: Joi.string().uuid().optional().allow(null),
        crop_name: Joi.string().trim().min(1).max(100).required(),
        is_custom: Joi.boolean().required(),
      })
    )
    .min(1)
    .max(5)
    .required(),
});

/**
 * Joi schema for fully updating a farm profile (PUT).
 * Same fields as create but the profile already exists.
 */
export const updateProfileSchema = createProfileSchema;

/**
 * Joi schema for partial profile update (PATCH).
 * All fields optional, at least one required.
 */
export const patchProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).optional(),
  last_name: Joi.string().trim().min(1).max(100).optional(),
  phone_number: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s\-()]{7,20}$/)
    .optional()
    .allow(null, ''),
  farm_size: Joi.number().positive().optional(),
  farm_size_unit: Joi.string().valid('hectares', 'acres').optional(),
  location_type: Joi.string().valid('gps', 'manual').optional(),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
  country: Joi.string().trim().min(1).max(100).optional(),
  state: Joi.string().trim().min(1).max(100).optional(),
  district: Joi.string().trim().max(100).optional().allow(null, ''),
  village: Joi.string().trim().max(100).optional().allow(null, ''),
  address: Joi.string().trim().max(500).optional().allow(null, ''),
  experience_level: Joi.string()
    .valid('beginner', 'intermediate', 'experienced', 'expert')
    .optional(),
  years_of_experience: Joi.number().integer().min(0).max(100).optional().allow(null),
  crops: Joi.array()
    .items(
      Joi.object({
        crop_id: Joi.string().uuid().optional().allow(null),
        crop_name: Joi.string().trim().min(1).max(100).required(),
        is_custom: Joi.boolean().required(),
      })
    )
    .min(1)
    .max(5)
    .optional(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided for update' });

/**
 * Joi schema for the crops list query parameters.
 */
export const cropsQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).optional().allow(''),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

/**
 * Joi schema for saving onboarding progress.
 */
export const onboardingProgressSchema = Joi.object({
  current_step: Joi.number().integer().min(1).max(5).required(),
  saved_data: Joi.object().optional().allow(null),
});

/**
 * Joi schema for user registration.
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
});

/**
 * Joi schema for user login.
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});
