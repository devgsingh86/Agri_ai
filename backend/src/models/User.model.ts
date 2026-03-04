import { Model, ModelObject } from 'objection';

/**
 * Objection.js model for the `users` table.
 */
export class User extends Model {
  static tableName = 'users';

  id!: string;
  email!: string;
  password_hash!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password_hash'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password_hash: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
        deleted_at: { type: ['string', 'null'] },
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

export type UserModel = ModelObject<User>;
