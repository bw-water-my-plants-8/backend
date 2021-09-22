const Plants = require('./plants-model')

async function validateUser (req, res, next) {
    try{
        const plant = await Plants.getById(req.params.plant_id)
        if (plant.user_id === req.decodedJWT.subject){
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
    req.body.last_watered = new Date(now).toDateString()
    req.body.next_water = new Date(next_water).toDateString()
    next()
}

function checkFrequency (req, res, next) {
    if (req.body.h2oFrequency){
        req.body.frequency = req.body.h2oFrequency.frequency
        req.body.timeframe = req.body.h2oFrequency.timeframe
        next()
    }else{
        next()
    }
}

module.exports = {
    validateUser,
    waterPlant,
    checkFrequency
}
