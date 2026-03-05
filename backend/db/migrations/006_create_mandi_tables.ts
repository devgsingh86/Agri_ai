import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Cached Mandi price data from AGMARKNET
  await knex.schema.createTable('mandi_prices', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('crop_key').notNullable();        // e.g. "crop_wheat"
    t.string('commodity').notNullable();       // original API commodity name
    t.string('state').notNullable();
    t.string('district').notNullable();
    t.string('market').notNullable();          // mandi name
    t.string('variety').defaultTo('Other');
    t.decimal('min_price', 10, 2).notNullable();
    t.decimal('max_price', 10, 2).notNullable();
    t.decimal('modal_price', 10, 2).notNullable(); // most common transaction price
    t.date('price_date').notNullable();
    t.timestamps(true, true);

    t.index(['crop_key', 'state', 'price_date']);
    t.index(['state', 'district', 'price_date']);
  });

  // User-defined price alerts
  await knex.schema.createTable('mandi_alerts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('crop_key').notNullable();
    t.decimal('target_price', 10, 2).notNullable();
    t.enum('direction', ['above', 'below']).notNullable().defaultTo('above');
    t.boolean('is_active').defaultTo(true);
    t.timestamp('triggered_at').nullable();
    t.timestamps(true, true);

    t.index(['user_id', 'is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mandi_alerts');
  await knex.schema.dropTableIfExists('mandi_prices');
}
