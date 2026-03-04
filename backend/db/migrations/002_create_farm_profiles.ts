import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('farm_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Personal info
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone_number', 20).nullable();

    // Farm size
    table.decimal('farm_size', 12, 4).notNullable();
    table.enu('farm_size_unit', ['hectares', 'acres']).notNullable();
    table.decimal('farm_size_hectares', 12, 4).notNullable();

    // Location
    table.enu('location_type', ['gps', 'manual']).notNullable();
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 11, 7).nullable();
    table.string('country', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('district', 100).nullable();
    table.string('village', 100).nullable();
    table.text('address').nullable();

    // Experience
    table
      .enu('experience_level', ['beginner', 'intermediate', 'experienced', 'expert'])
      .notNullable();
    table.integer('years_of_experience').nullable();

    // Metadata
    table.integer('completeness').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });

  await knex.schema.raw(`
    CREATE INDEX idx_farm_profiles_user_id ON farm_profiles (user_id) WHERE deleted_at IS NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('farm_profiles');
}
