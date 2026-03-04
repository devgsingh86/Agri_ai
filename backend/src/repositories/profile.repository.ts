import { Knex } from 'knex';
import { getDb } from '../config/database';
import { FarmProfile, FarmProfileModel, ExperienceLevel, FarmSizeUnit, LocationType } from '../models/FarmProfile.model';
import { FarmCrop, FarmCropModel } from '../models/FarmCrop.model';
import { logger } from '../utils/logger';

export interface CreateProfileData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  farm_size: number;
  farm_size_unit: FarmSizeUnit;
  farm_size_hectares: number;
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
  completeness: number;
}

export interface CreateCropData {
  id: string;
  farm_profile_id: string;
  crop_id?: string | null;
  crop_name: string;
  is_custom: boolean;
}

export type ProfileWithCrops = Omit<FarmProfileModel, 'crops'> & {
  crops: FarmCropModel[];
};

/**
 * Repository for farm profile database operations.
 * All queries filter out soft-deleted records by default.
 */
export class ProfileRepository {
  private get db(): Knex {
    return getDb();
  }

  /**
   * Finds a farm profile by user ID (excludes soft-deleted).
   */
  async findByUserId(userId: string): Promise<ProfileWithCrops | null> {
    const profile = await FarmProfile.query()
      .whereNull('deleted_at')
      .where('user_id', userId)
      .withGraphFetched('crops')
      .first();

    return (profile as ProfileWithCrops | undefined) ?? null;
  }

  /**
   * Finds a farm profile by its primary key (excludes soft-deleted).
   */
  async findById(id: string): Promise<ProfileWithCrops | null> {
    const profile = await FarmProfile.query()
      .whereNull('deleted_at')
      .where('id', id)
      .withGraphFetched('crops')
      .first();

    return (profile as ProfileWithCrops | undefined) ?? null;
  }

  /**
   * Inserts a new profile and its crops atomically within the given transaction.
   */
  async createInTransaction(
    trx: Knex.Transaction,
    profileData: CreateProfileData,
    cropsData: CreateCropData[]
  ): Promise<ProfileWithCrops> {
    await FarmProfile.query(trx).insert(profileData);

    if (cropsData.length > 0) {
      await FarmCrop.query(trx).insert(cropsData);
    }

    const profile = await FarmProfile.query(trx)
      .where('id', profileData.id)
      .withGraphFetched('crops')
      .first();

    return profile as ProfileWithCrops;
  }

  /**
   * Updates a profile's fields within an optional transaction.
   */
  async update(
    userId: string,
    data: Partial<CreateProfileData>,
    trx?: Knex.Transaction
  ): Promise<ProfileWithCrops | null> {
    const query = trx ? FarmProfile.query(trx) : FarmProfile.query();

    await query
      .whereNull('deleted_at')
      .where('user_id', userId)
      .patch({ ...data, updated_at: new Date() });

    return this.findByUserId(userId);
  }

  /**
   * Replaces all crops for a profile within a transaction.
   */
  async replaceCrops(
    trx: Knex.Transaction,
    farmProfileId: string,
    cropsData: CreateCropData[]
  ): Promise<void> {
    await FarmCrop.query(trx).where('farm_profile_id', farmProfileId).delete();

    if (cropsData.length > 0) {
      await FarmCrop.query(trx).insert(cropsData);
    }
  }

  /**
   * Soft-deletes a farm profile by setting deleted_at.
   */
  async softDelete(userId: string): Promise<boolean> {
    const count = await FarmProfile.query()
      .whereNull('deleted_at')
      .where('user_id', userId)
      .patch({ deleted_at: new Date() });

    return count > 0;
  }

  /**
   * Deletes onboarding progress for a user within a transaction.
   */
  async deleteOnboardingProgress(trx: Knex.Transaction, userId: string): Promise<void> {
    await this.db('onboarding_progress').transacting(trx).where('user_id', userId).delete();
  }

  /**
   * Starts a new database transaction.
   */
  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }
}
