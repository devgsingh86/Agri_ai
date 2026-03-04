import { Model, ModelObject } from 'objection';

/**
 * Objection.js model for the `crops` reference table.
 */
export class Crop extends Model {
  static tableName = 'crops';

  id!: string;
  name!: string;
  scientific_name?: string | null;
  category?: string | null;
  common_regions?: string[] | null;
  is_active!: boolean;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', maxLength: 100 },
        scientific_name: { type: ['string', 'null'], maxLength: 150 },
        category: { type: ['string', 'null'], maxLength: 100 },
        common_regions: {
          type: ['array', 'null'],
          items: { type: 'string' },
        },
        is_active: { type: 'boolean' },
      },
    };
  }
}

export type CropModel = ModelObject<Crop>;
