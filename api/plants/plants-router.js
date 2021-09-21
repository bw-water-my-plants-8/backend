const router = require('express').Router()

const Plants = require('./plants-model')
const { validateUser, waterPlant } = require('./plants-middleware')

router.get('/', async (req, res, next) => {
    try{
        const plants = Plants.getByUser(req.decodedJWT.subject)
        res.status(200).json(plants)
    }catch (err){
        next(err)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const plant = Plants.add(req.decodedJWT.subject, req.body)
        res.status(201).json(plant)
    } catch (err) {
        next(err)
    }
})

router.put('/:plant_id', validateUser, async (req, res, next) => {
    try {
        const plant = Plants.update(req.params.plant_id, req.body)
        res.status(200).json(plant)
    }catch (err){
        next(err)
    }
})

router.put('/:plant_id/water', validateUser, waterPlant, (req, res, next) => {
    try {
        const plant = Plants.update(req.params.plant_id, req.body)
        res.status(200).json(plant)
    }catch (err){
        next(err)
    }
})

router.delete('/:plant_id', validateUser, async (req, res, next) => {
    try {
        const plant = Plants.remove(req.params.plant_id)
        res.status(200).json(plant)
    } catch (err) {
        next(err)
    }
})

module.exports = router
