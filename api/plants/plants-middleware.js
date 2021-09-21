const Plants = require('./plants-model')

async function validateUser (req, res, next) {
    try{
        const {user_id} = await Plants.getById(req.params.plant_id)
        if (user_id === req.decodedJWT.subject){
            next()
        }else{
            next({ status: 403, message: 'user does not have access to this plant' })
        }
    }catch (err){
        next(err)
    }
}

function waterPlant (req, res, next) {
    const now = Date.now()
    let days
    if (req.body.timeframe === 'week'){
        days = req.body.frequency * 7
    }else{
        days = req.body.frequency
    }
    const next_water = now + (days * 24 * 60* 60 * 1000)
    req.body.last_watered = now.toDateString()
    req.body.next_water = next_water.toDateString()
    next()
}

module.exports = {
    validateUser,
    waterPlant
}
