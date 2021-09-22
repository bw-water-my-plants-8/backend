const phone = require('libphonenumber')
const schema = require('./userPayloadSchema')
const { findBy } = require('./users-model')

async function validatePayload (req, res, next) {
    try{
        //If doing 10-digit US numbers only:
        //req.body.phone = ['+1', req.body.phone].join('')
        await schema.validate(req.body);
        req.phone_number = await phone.e164(req.body.phone);
        next()
    } catch (err) {
        if (err.errors){
            next({ status: 400, message: err.errors[0] });
        }else{
            next({ status: 400, message: err.message });
        }
    }
}

function validateLoginPayload (req, res, next) {
    const { username, password } = req.body
    if(username && password){
        next()
    }else{
        next({status: 400, message: 'username and password are required'})
    }
}

async function checkUsernameAvailable (req, res, next) {
    const [user] = await findBy({username: req.body.username});
    if (user) {
        next({ status: 409, message: 'username taken' })
    }else{
        next()
    }
}

async function checkPhoneAvailable (req, res, next) {
    const [user] = await findBy({phone_number: req.phone_number});
    if (user) {
        next({ status: 409, message: 'phone number taken' });
    }else{
        next();
    }
}

async function checkUsernameExists (req, res, next) {
    const [user] = await findBy({username: req.body.username})
    if (user) {
        req.user = user
        next()
    }else {
        next({status: 401, message: 'username or password invalid'})
    }
}

module.exports = {
    validatePayload,
    checkUsernameAvailable,
    checkPhoneAvailable,
    validateLoginPayload,
    checkUsernameExists
}
