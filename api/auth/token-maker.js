const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../env-connect')

function tokenMaker (user) {
    const payload = {
        subject: user.user_id,
        user_id: user.user_id,
        username: user.username,
        phone_number: user.phone_number
    }

    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, JWT_SECRET, options)
}

module.exports = tokenMaker
