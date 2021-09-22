
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return await knex('plants').insert([
    {
      species_id: 1,
      user_id: 1,
      nickname: 'Spunky',
      frequency: 1,
      timeframe: 'day',
    }
  ])
};
