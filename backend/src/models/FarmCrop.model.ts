import { Model, ModelObject, RelationMappings } from 'objection';
import { FarmProfile } from './FarmProfile.model';
import { Crop } from './Crop.model';

/**
 * Objection.js model for the `farm_crops` join table.
 */
export class FarmCrop extends Model {
  static tableName = 'farm_crops';

  id!: string;
  farm_profile_id!: string;
  crop_id?: string | null;
  crop_name!: string;
  is_custom!: boolean;
  created_at!: Date;

  // Eager-loaded
  crop?: Crop;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_profile_id', 'crop_name', 'is_custom'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        farm_profile_id: { type: 'string', format: 'uuid' },
        crop_id: { type: ['string', 'null'], format: 'uuid' },
        crop_name: { type: 'string', maxLength: 100 },
        is_custom: { type: 'boolean' },
        created_at: { type: 'string' },
      },
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      profile: {
        relation: Model.BelongsToOneRelation,
        modelClass: FarmProfile,
        join: { from: 'farm_crops.farm_profile_id', to: 'farm_profiles.id' },
      },
      crop: {
        relation: Model.BelongsToOneRelation,
        modelClass: Crop,
        join: { from: 'farm_crops.crop_id', to: 'crops.id' },
      },
    };
  }

  $beforeInsert() {
    this.created_at = new Date();
  }
}

export type FarmCropModel = ModelObject<FarmCrop>;
