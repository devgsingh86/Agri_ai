import { v4 as uuidv4 } from 'uuid';
import { ProfileRepository, CreateProfileData, CreateCropData, ProfileWithCrops } from '../repositories/profile.repository';
import { AppError } from '../middleware/error.middleware';
import { normaliseToHectares } from '../utils/conversion';
import { FarmSizeUnit, ExperienceLevel, LocationType } from '../models/FarmProfile.model';
import { logger } from '../utils/logger';

export interface CropInput {
  crop_id?: string | null;
  crop_name: string;
  is_custom: boolean;
}

export interface CreateProfileInput {
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
  crops: CropInput[];
}

export type UpdateProfileInput = Partial<CreateProfileInput>;

/**
 * Calculates profile completeness percentage based on optional field completion.
 * Base fields = 50 pts, optional fields = 10 pts each (5 optional fields = 50 pts total).
 */
export function calculateCompleteness(data: Partial<CreateProfileInput>): number {
  // Base completeness — required fields always present = 50
  let score = 50;
  const optionalFields: Array<keyof CreateProfileInput> = [
    'phone_number',
    'village',
    'address',
    'years_of_experience',
    'latitude', // proxy for GPS coords
  ];

  for (const field of optionalFields) {
    const value = data[field];
    if (value !== null && value !== undefined && value !== '') {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

/**
 * Service layer for farm profile business logic.
 */
export class ProfileService {
  constructor(private readonly repo: ProfileRepository = new ProfileRepository()) {}

  /**
   * Creates a new farm profile for the given user.
   * Throws 409 if a profile already exists.
   * Runs profile insert + crop inserts + onboarding progress delete in a single transaction.
   */
  async createProfile(userId: string, input: CreateProfileInput): Promise<ProfileWithCrops> {
    // Check for existing profile
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new AppError('Farm profile already exists for this user', 409);
    }

    const farmSizeHectares = normaliseToHectares(input.farm_size, input.farm_size_unit);
    const completeness = calculateCompleteness(input);
    const profileId = uuidv4();

    const profileData: CreateProfileData = {
      id: profileId,
      user_id: userId,
      first_name: input.first_name,
      last_name: input.last_name,
      phone_number: input.phone_number ?? null,
      farm_size: input.farm_size,
      farm_size_unit: input.farm_size_unit,
      farm_size_hectares: farmSizeHectares,
      location_type: input.location_type,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      country: input.country,
      state: input.state,
      district: input.district ?? null,
      village: input.village ?? null,
      address: input.address ?? null,
      experience_level: input.experience_level,
      years_of_experience: input.years_of_experience ?? null,
      completeness,
    };

    const cropsData: CreateCropData[] = input.crops.map((crop) => ({
      id: uuidv4(),
      farm_profile_id: profileId,
      crop_id: crop.crop_id ?? null,
      crop_name: crop.crop_name,
      is_custom: crop.is_custom,
    }));

    const profile = await this.repo.transaction(async (trx) => {
      const created = await this.repo.createInTransaction(trx, profileData, cropsData);
      await this.repo.deleteOnboardingProgress(trx, userId);
      return created;
    });

    logger.info('Farm profile created', { userId, profileId, completeness });
    return profile;
  }

  /**
   * Retrieves the farm profile for the given user.
   * Throws 404 if no profile exists.
   */
  async getProfile(userId: string): Promise<ProfileWithCrops> {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new AppError('Farm profile not found', 404);
    }
    return profile;
  }

  /**
   * Fully replaces the farm profile for the given user (PUT semantics).
   * Throws 404 if no profile exists.
   */
  async updateProfile(userId: string, input: CreateProfileInput): Promise<ProfileWithCrops> {
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new AppError('Farm profile not found', 404);
    }

    const farmSizeHectares = normaliseToHectares(input.farm_size, input.farm_size_unit);
    const completeness = calculateCompleteness(input);

    const updatedData: Partial<CreateProfileData> = {
      first_name: input.first_name,
      last_name: input.last_name,
      phone_number: input.phone_number ?? null,
      farm_size: input.farm_size,
      farm_size_unit: input.farm_size_unit,
      farm_size_hectares: farmSizeHectares,
      location_type: input.location_type,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      country: input.country,
      state: input.state,
      district: input.district ?? null,
      village: input.village ?? null,
      address: input.address ?? null,
      experience_level: input.experience_level,
      years_of_experience: input.years_of_experience ?? null,
      completeness,
    };

    const cropsData: CreateCropData[] = input.crops.map((crop) => ({
      id: uuidv4(),
      farm_profile_id: existing.id,
      crop_id: crop.crop_id ?? null,
      crop_name: crop.crop_name,
      is_custom: crop.is_custom,
    }));

    await this.repo.transaction(async (trx) => {
      await this.repo.update(userId, updatedData, trx);
      await this.repo.replaceCrops(trx, existing.id, cropsData);
    });

    const updated = await this.repo.findByUserId(userId);
    if (!updated) throw new AppError('Farm profile not found after update', 500);

    logger.info('Farm profile updated (PUT)', { userId, completeness });
    return updated;
  }

  /**
   * Partially updates the farm profile for the given user (PATCH semantics).
   * Only provided fields are changed.
   * Throws 404 if no profile exists.
   */
  async patchProfile(userId: string, input: UpdateProfileInput): Promise<ProfileWithCrops> {
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new AppError('Farm profile not found', 404);
    }

    // Merge incoming with existing to recalculate completeness
    const merged: CreateProfileInput = {
      first_name: input.first_name ?? existing.first_name,
      last_name: input.last_name ?? existing.last_name,
      phone_number: input.phone_number !== undefined ? input.phone_number : existing.phone_number,
      farm_size: input.farm_size ?? existing.farm_size,
      farm_size_unit: (input.farm_size_unit ?? existing.farm_size_unit) as FarmSizeUnit,
      location_type: (input.location_type ?? existing.location_type) as LocationType,
      latitude: input.latitude !== undefined ? input.latitude : existing.latitude,
      longitude: input.longitude !== undefined ? input.longitude : existing.longitude,
      country: input.country ?? existing.country,
      state: input.state ?? existing.state,
      district: input.district !== undefined ? input.district : existing.district,
      village: input.village !== undefined ? input.village : existing.village,
      address: input.address !== undefined ? input.address : existing.address,
      experience_level: (input.experience_level ?? existing.experience_level) as ExperienceLevel,
      years_of_experience:
        input.years_of_experience !== undefined
          ? input.years_of_experience
          : existing.years_of_experience,
      crops: input.crops ?? (existing.crops?.map((c) => ({
        crop_id: c.crop_id ?? null,
        crop_name: c.crop_name,
        is_custom: c.is_custom,
      })) ?? []),
    };

    const farmSizeHectares = normaliseToHectares(merged.farm_size, merged.farm_size_unit);
    const completeness = calculateCompleteness(merged);

    const updatedData: Partial<CreateProfileData> = {
      first_name: merged.first_name,
      last_name: merged.last_name,
      phone_number: merged.phone_number ?? null,
      farm_size: merged.farm_size,
      farm_size_unit: merged.farm_size_unit,
      farm_size_hectares: farmSizeHectares,
      location_type: merged.location_type,
      latitude: merged.latitude ?? null,
      longitude: merged.longitude ?? null,
      country: merged.country,
      state: merged.state,
      district: merged.district ?? null,
      village: merged.village ?? null,
      address: merged.address ?? null,
      experience_level: merged.experience_level,
      years_of_experience: merged.years_of_experience ?? null,
      completeness,
    };

    if (input.crops) {
      const cropsData: CreateCropData[] = input.crops.map((crop) => ({
        id: uuidv4(),
        farm_profile_id: existing.id,
        crop_id: crop.crop_id ?? null,
        crop_name: crop.crop_name,
        is_custom: crop.is_custom,
      }));

      await this.repo.transaction(async (trx) => {
        await this.repo.update(userId, updatedData, trx);
        await this.repo.replaceCrops(trx, existing.id, cropsData);
      });
    } else {
      await this.repo.update(userId, updatedData);
    }

    const updated = await this.repo.findByUserId(userId);
    if (!updated) throw new AppError('Farm profile not found after patch', 500);

    logger.info('Farm profile patched', { userId, completeness });
    return updated;
  }

  /**
   * Soft-deletes the farm profile for the given user.
   * Throws 404 if no profile exists.
   */
  async deleteProfile(userId: string): Promise<void> {
    const deleted = await this.repo.softDelete(userId);
    if (!deleted) {
      throw new AppError('Farm profile not found', 404);
    }
    logger.info('Farm profile soft-deleted', { userId });
  }
}
