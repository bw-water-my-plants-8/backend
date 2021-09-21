
exports.up = async function(knex) {
    await knex.schema.createTable('species', table => {
        table.increments('species_id')
        table.string('species_name').notNullable().unique()
    })
    await knex.schema.createTable('plants', table => {
        table.increments('plants_id')
        table.integer('species_id')
            .unsigned()
            .notNullable()
            .references('species_id')
            .inTable('species')
            .onDelete('RESTRICT')
            .onUpdate('RESTRICT')
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('user_id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')
        table.string('nickname')
        table.integer('frequency').notNullable
        table.string('timeframe').notNullable
        table.string('last_watered')
        table.string('next_water')
    })
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('plants')
    await knex.schema.dropTableIfExists('species')
};
