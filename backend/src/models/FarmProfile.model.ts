import { Model, ModelObject, RelationMappings } from 'objection';
import { User } from './User.model';
import { FarmCrop } from './FarmCrop.model';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced' | 'expert';
export type FarmSizeUnit = 'hectares' | 'acres';
export type LocationType = 'gps' | 'manual';

/**
 * Objection.js model for the `farm_profiles` table.
 */
export class FarmProfile extends Model {
  static tableName = 'farm_profiles';

  id!: string;
  user_id!: string;
  first_name!: string;
  last_name!: string;
  phone_number?: string | null;
  farm_size!: number;
  farm_size_unit!: FarmSizeUnit;
  farm_size_hectares!: number;
  location_type!: LocationType;
  latitude?: number | null;
  longitude?: number | null;
  country!: string;
  state!: string;
  district?: string | null;
  village?: string | null;
  address?: string | null;
  experience_level!: ExperienceLevel;
  years_of_experience?: number | null;
  completeness!: number;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  // Eager-loaded relations
  crops?: FarmCrop[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'user_id',
        'first_name',
        'last_name',
        'farm_size',
        'farm_size_unit',
        'location_type',
        'country',
        'state',
        'experience_level',
      ],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        first_name: { type: 'string', maxLength: 100 },
        last_name: { type: 'string', maxLength: 100 },
        phone_number: { type: ['string', 'null'], maxLength: 20 },
        farm_size: { type: 'number', minimum: 0 },
        farm_size_unit: { type: 'string', enum: ['hectares', 'acres'] },
        farm_size_hectares: { type: 'number', minimum: 0 },
        location_type: { type: 'string', enum: ['gps', 'manual'] },
        latitude: { type: ['number', 'null'] },
        longitude: { type: ['number', 'null'] },
        country: { type: 'string', maxLength: 100 },
        state: { type: 'string', maxLength: 100 },
        district: { type: ['string', 'null'], maxLength: 100 },
        village: { type: ['string', 'null'], maxLength: 100 },
        address: { type: ['string', 'null'], maxLength: 500 },
        experience_level: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'experienced', 'expert'],
        },
        years_of_experience: { type: ['number', 'null'], minimum: 0 },
        completeness: { type: 'integer', minimum: 0, maximum: 100 },
      },
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: { from: 'farm_profiles.user_id', to: 'users.id' },
      },
      crops: {
        relation: Model.HasManyRelation,
        modelClass: FarmCrop,
        join: { from: 'farm_profiles.id', to: 'farm_crops.farm_profile_id' },
      },
    };
  }

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}

export type FarmProfileModel = ModelObject<FarmProfile>;
