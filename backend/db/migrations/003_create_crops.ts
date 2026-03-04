import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('crops', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.string('scientific_name', 150).nullable();
    table.string('category', 100).nullable();
    table.specificType('common_regions', 'TEXT[]').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_crops_name ON crops (LOWER(name)) WHERE is_active = true;
    CREATE INDEX idx_crops_category ON crops (category) WHERE is_active = true;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('crops');
}
