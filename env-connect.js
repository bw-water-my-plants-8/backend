const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || 8
const JWT_SECRET = process.env.JWT_SECRET || 'shh'

module.exports = {
    BCRYPT_ROUNDS,
    JWT_SECRET
}
