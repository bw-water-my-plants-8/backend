const router = require('express').Router()

const Plants = require('./plants-model')
const { validateUser, waterPlant, checkFrequency } = require('./plants-middleware')

router.get('/', async (req, res, next) => {
    try{
        const user = req.decodedJWT
        const plants = await Plants.getByUser(user.subject)
        res.status(200).json(plants)
    }catch (err){
        next(err)
    }
})

router.post('/', checkFrequency, async (req, res, next) => {
    try {
        const plant = await Plants.add(req.decodedJWT.subject, req.body)
        res.status(201).json(plant)
    } catch (err) {
        next(err)
    }
})

router.put('/:plant_id', validateUser, checkFrequency, async (req, res, next) => {
    try {
        const plant = await Plants.update(req.params.plant_id, req.body)
        res.status(200).json(plant)
    }catch (err){
        next(err)
    }
})

router.put('/:plant_id/water', validateUser, checkFrequency, waterPlant, async (req, res, next) => {
    try {
        const plant = await Plants.update(req.params.plant_id, req.body)
        res.status(200).json(plant)
    }catch (err){
        next(err)
    }
})

router.delete('/:plant_id', validateUser, async (req, res, next) => {
    try {
        const plant = await Plants.remove(req.params.plant_id)
        res.status(200).json(plant)
    } catch (err) {
        next(err)
    }
})

module.exports = router
