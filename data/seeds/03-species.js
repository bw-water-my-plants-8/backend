
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return await knex('species').insert({species_name: 'houseplant'})
};
