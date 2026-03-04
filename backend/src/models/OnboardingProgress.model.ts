import { Model, ModelObject } from 'objection';

/**
 * Objection.js model for the `onboarding_progress` table.
 */
export class OnboardingProgress extends Model {
  static tableName = 'onboarding_progress';

  id!: string;
  user_id!: string;
  current_step!: number;
  total_steps!: number;
  saved_data?: Record<string, unknown> | null;
  created_at!: Date;
  updated_at!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'current_step'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        current_step: { type: 'integer', minimum: 1, maximum: 5 },
        total_steps: { type: 'integer', default: 5 },
        saved_data: { type: ['object', 'null'] },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
      },
    };
  }

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
    if (!this.total_steps) this.total_steps = 5;
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}

export type OnboardingProgressModel = ModelObject<OnboardingProgress>;
