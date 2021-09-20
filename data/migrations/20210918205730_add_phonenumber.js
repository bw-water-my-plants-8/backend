
exports.up = async function(knex) {
    await knex.schema.table('users', table => {
        table.string('phone_number')
            .unique()
            .notNullable()
    })
};

exports.down = async function(knex) {
    await knex.schema.table('users', table => {
        table.dropColumn('phone_number');
    })
};
