const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../env-connect')

function restricted (req, res, next) {
    const token = req.headers.authorization
    if(token){
        jwt.verify(token, JWT_SECRET, (err, decode) => {
            if (err) {
              next({ status: 401, message: "Token invalid" })
            }else{
              req.decodedJWT = decode;
              next();
            }
        })
    }else{
        next({status: 401, message: "token required"})
    }
}

module.exports = { restricted }
