import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('farm_crops', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('farm_profile_id')
      .notNullable()
      .references('id')
      .inTable('farm_profiles')
      .onDelete('CASCADE');
    table.uuid('crop_id').nullable().references('id').inTable('crops').onDelete('SET NULL');
    table.string('crop_name', 100).notNullable();
    table.boolean('is_custom').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(`
    CREATE INDEX idx_farm_crops_profile ON farm_crops (farm_profile_id);
    CREATE INDEX idx_farm_crops_crop ON farm_crops (crop_id) WHERE crop_id IS NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('farm_crops');
}
