const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { BCRYPT_ROUNDS } = require('../../env-connect')
const tokenMaker = require('./token-maker')
const {
    validatePayload,
    checkUsernameAvailable,
    checkPhoneAvailable,
    validateLoginPayload,
    checkUsernameExists
} = require('../users/users-middleware')

const Users = require('../users/users-model')

router.post(
    '/register',
    validatePayload,
    checkUsernameAvailable,
    checkPhoneAvailable,
    async (req, res, next) => {
        try{
            const {username, password} = req.body;
            const {phone_number} = req;
            const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS)
            const newUser = await Users.insert({username, phone_number, password: hash});
            res.status(201).json(newUser);
        }catch (err){
            next(err);
        }
    }
)

router.post(
    '/login', 
    validateLoginPayload, 
    checkUsernameExists, 
    (req, res, next) => {
        const {password} = req.body
        if (bcrypt.compareSync(password, req.user.password)){
            const token = tokenMaker(req.user)
            const user = {
                username: req.user.username,
                user_id: req.user.user_id,
                phone_number: req.user.phone_number
            }
            res.status(200).json({ message: `Welcome back ${user.username}`, token, user })
        }else{
            next({status: 401, message: 'username or password invalid'})
        }
    }
)

module.exports = router
