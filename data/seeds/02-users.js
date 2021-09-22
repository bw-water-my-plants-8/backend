const bcrypt = require('bcryptjs')
const hash = bcrypt.hashSync('123', 8)

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return await knex('users').insert({
    username: 'bob',
    password: hash,
    phone_number: '+17175553333'
  })
};
