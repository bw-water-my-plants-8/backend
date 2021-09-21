const db = require('../../data/db-config')

async function getByUser (user_id) {
    const rows = await db('plants as p')
        .where('user_id', user_id)
        .leftJoin('species as s', 's.species_id', 'p.species_id')
    const plants = rows.map(plant => {return {
        plant_id: plant.plant_id,
        nickname: plant.plant_id,
        species: plant.species,
        h2oFrequency: {
            frequency: plant.frequency,
            timeframe: plant.timeframe
        },
        last_watered: plant.last_watered,
        next_water: plant.next_water
    }})
    return plants
}

async function getById (plant_id) {
    const row = await db('plants as p')
        .where('plant_id', plant_id)
        .leftJoin('species as s', 's.species_id', 'p.species_id')
        .first()
    return {
        plant_id: row.plant_id,
        nickname: row.plant_id,
        species: row.species_name,
        h2oFrequency: {
            frequency: row.frequency,
            timeframe: row.timeframe
        },
        last_watered: row.last_watered,
        next_water: row.next_water
    }
}

async function getFrequencyBySpecies (species) {
    const rows = await db('plants as p')
        .leftJoin('species as s', 's.species_id', 'p.species_id')
        .where('species_name', species)
        .select('s.species_name', 'p.frequency', 'p.timeframe')
    const h2oFrequency = rows.map(plant => {return {
        frequency: plant.frequency,
        timeframe: plant.timeframe
    }})
    return {
        species: rows[0].species_name,
        h2oFrequency: h2oFrequency
    }
}

async function add (user_id, plant) {
    try {
        const [id] = await db.transaction(async trx => {
            const [plant_species] = trx('species').where('species_name', plant.species)
            let species_id
            if (plant_species){
                species_id = plant_species.species_id
            } else {
                species_id = await trx('species')
                    .insert({species_name: plant.species}, ['species_id'])
            }
            return trx('plants')
                .insert({
                    species_id: species_id,
                    user_id: user_id,
                    nickname: plant.nickname || null,
                    frequency: plant.frequency,
                    timeframe: plant.timeframe
                }, ['plant_id'])
        })
        return getById(id)
    }catch (err){
        console.error(err)
        throw err
    }
}

async function update (plant_id, plant) {
    try {
        const [id] = await db.transaction(async trx => {
            const [plant_species] = trx('species').where('species_name', plant.species)
            let species_id
            if (plant_species){
                species_id = plant_species.species_id
            } else {
                species_id = await trx('species')
                    .insert({species_name: plant.species}, ['species_id'])
            }
            return trx('plants')
                .where('plant_id', plant_id)
                .update({
                    species_id: species_id,
                    nickname: plant.nickname || null,
                    frequency: plant.frequency,
                    timeframe: plant.timeframe,
                    last_watered: plant.last_watered || null,
                    next_water: plant.next_water || null
                }, ['plant_id'])
        })
        return getById(id)
    }catch (err){
        console.error(err)
        throw err
    }
}

async function remove (plant_id) {
    const plant = await getById(plant_id)
    await db('plants').where('plant_id', plant_id).module
    return plant
}

module.exports = {
    getByUser,
    getById,
    getFrequencyBySpecies,
    add,
    update,
    remove
}
