const request = require('supertest')
const server = require('./server')
const db = require('../data/db-config')
const tokenMaker = require('./auth/token-maker')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db.seed.run()
})
afterAll(async () => {
  await db.destroy()
})

it('sanity check', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  it('is the correct testing environment', async () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })
})

describe('[POST] /auth/register', () => {
  const input = {
    username: 'abc',
    password: 'word',
    phone: '+1(717)801-0115'
    //phone: '(717)801-0115'
  }
  it('[1]responds with a 400 and proper message on missing username', async () => {
    const {password, phone} = input
    const res = await request(server)
      .post('/auth/register')
      .send({ password, phone })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username, password and telephone number are required')
  })
  it('[2]responds with a 400 and proper message on missing password', async () => {
    const {username, phone} = input
    const res = await request(server)
      .post('/auth/register')
      .send({ username, phone })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username, password and telephone number are required')
  })
  it('[3]responds with a 400 and proper message on missing phone', async () => {
    const {username, password} = input
    const res = await request(server)
      .post('/auth/register')
      .send({ username, password })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username, password and telephone number are required')
  })
  it('[4]responds with a 400 and proper message on short username', async () => {
    const {phone, password} = input
    const res = await request(server)
      .post('/auth/register')
      .send({ username: 'ab', phone, password })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username must be at least 3 characters')
  })
  it('[5]responds with a 400 and error message on invalid number', async () => {
    const {username, password} = input
    const res = await request(server)
      .post('/auth/register')
      .send({ username, password, phone:'123' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBeDefined
  })
  it('[6]responds with 409 and proper message on taken username', async () => {
    const {username, password} = input
    await db('users').insert({username, password, phone_number: '17178010115'});
    const res = await request(server)
      .post('/auth/register')
      .send(input)
    expect(res.body.message).toBe('username taken')
    expect(res.status).toBe(409)
    
  })
  it('[7] responds with 409 and proper message on taken phone number', async () => {
    await request(server)
      .post('/auth/register')
      .send(input)
    const res = await request(server)
      .post('/auth/register')
      .send({...input, username: 'def'})
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('phone number taken')
  })
  it('[8] adds user to the database', async () => {
    await request(server)
      .post('/auth/register')
      .send(input)
    const user = await db('users').where({username: input.username})
    expect(user).toBeDefined
  })
  it('[9] responds with a 201 and new user', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send(input)
    expect(res.status).toBe(201)
    expect(res.body.user.username).toBe(input.username)
  })
  it('[10] does not save the password as plain text', async() => {
      const res = await request(server)
        .post('/auth/register')
        .send(input)
      expect(res.password).not.toBe(input.password)
  })
})

describe('[POST] /auth/login', () => {
  const input = {
    username: 'abc',
    password: 'word'
  }
  beforeEach(async () => {
    await request(server)
    .post('/auth/register')
    .send({ ...input, phone: '+1(717)801-0115' })
  })
  it('[11] responds with 400 on missing password or username', async() => {
    let res = await request(server)
      .post('/auth/login')
      .send({ username: input.username })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username and password are required')
    res = await request(server)
      .post('/auth/login')
      .send({ password: input.password })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username and password are required')
  })
  it('[12] responds with 401 on wrong username or password', async () => {
    let res = await request(server)
      .post('/auth/login')
      .send({ username: input.username, password: 'boo' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('username or password invalid')
    res = await request(server)
      .post('/auth/login')
      .send({ username: 'def', password: input.password })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('username or password invalid')
  })
  it('[13] responds with 200 and token on success', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send(input)
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined
  })
})

describe('[GET] /plants', () => {
  const token = tokenMaker({
    user_id: 1,
    username: 'bob',
    phone_number: '+17175553333'
  })
  it('responds with an array of plants', async () => {
    const res = await request(server)
      .get('/plants')
      .set('Authorization', token)
    const expected = {
      species: 'houseplant',
      nickname: 'Spunky',
      h2oFrequency: {
        frequency: 1,
        timeframe: 'day'
      }
    }
    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject(expected)
  })
})

describe('[GET] /plants/:plant_id', () => {
  const token = tokenMaker({
    user_id: 1,
    username: 'bob',
    phone_number: '+17175553333'
  })
  it('responds with a plant object', async () => {
    const res = await request(server)
      .get('/plants/1')
      .set('Authorization', token)
    const expected = {
      species: 'houseplant',
      nickname: 'Spunky',
      h2oFrequency: {
        frequency: 1,
        timeframe: 'day'
      }
    }
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject(expected)
  })
})

describe('[POST] /plants', () => {
  const token = tokenMaker({
    user_id: 1,
    username: 'bob',
    phone_number: '+17175553333'
  })
  const input1 = {
    species: 'houseplant',
    frequency: 1,
    timeframe: 'day',
    nickname: 'Poogy'
  }
  const input2 = {
    species: 'fycus',
    frequency: 1,
    timeframe: 'day',
    nickname: 'Mochi'
  }
  it('returns a 201', async () => {
    const res = await request(server)
      .post('/plants')
      .set('Authorization', token)
      .send(input1)
    expect(res.status).toBe(201)
  })
  it('adds a new plant to the database', async () => {
    await request(server)
      .post('/plants')
      .set('Authorization', token)
      .send(input1)
    const plants = await db('plants')
    expect(plants).toHaveLength(2)
  })
  it('responds with the new plant', async () => {
    const res = await request(server)
      .post('/plants')
      .set('Authorization', token)
      .send(input1)
    const expected = {species: input1.species, nickname: input1.nickname}
    expect(res.body).toMatchObject(expected)
  })
  it('creates a new species when a new string is used', async () => {
    await request(server)
      .post('/plants')
      .set('Authorization', token)
      .send(input2)
    const species = await db('species')
    expect(species).toHaveLength(2)
  })
})

describe('[PUT] /plants/:plant_id', () => {
  const token = tokenMaker({
    user_id: 1,
    username: 'bob',
    phone_number: '+17175553333'
  })
  const input1 = {
    "plant_id": 1,
    "nickname": "Monty",
    "species": "houseplant",
    "frequency": 1,
    "timeframe": "day",
    "last_watered": null,
    "next_water": null
  }
  const input2 = {
    "plant_id": 1,
    "nickname": "Monty",
    "species": "fycus",
    "frequency": 1,
    "timeframe": "day",
    "last_watered": null,
    "next_water": null
  }
  it('updates the record', async () => {
    await request(server)
      .put('/plants/1')
      .set('Authorization', token)
      .send(input1)
    const plant = await db('plants').where('plant_id', 1).first()
    expect(plant).toMatchObject({nickname: input1.nickname})
  })
  it('returns 200 okay', async () => {
    const res = await request(server)
      .put('/plants/1')
      .set('Authorization', token)
      .send(input1)
    expect(res.status).toBe(200)
  })
  it('returns the updated object', async () => {
    const res = await request(server)
      .put('/plants/1')
      .set('Authorization', token)
      .send(input1)
    expect(res.body).toMatchObject({nickname: input1.nickname})
  })
  it('creates a new species on new string', async () => {
    await request(server)
      .put('/plants/1')
      .set('Authorization', token)
      .send(input2)
    const species = await db('species')
    expect(species).toHaveLength(2)
  })
})

describe('[PUT] /plants/:plant_id/water', () => {
  const token = tokenMaker({
    user_id: 1,
    username: 'bob',
    phone_number: '+17175553333'
  })
  const input1 = {
    "plant_id": 1,
    "nickname": "Spunky",
    "species": "houseplant",
    "frequency": 1,
    "timeframe": "day",
    "last_watered": null,
    "next_water": null
  }
  it('responds with 200 okay', async () => {
    const res = await request(server)
      .put('/plants/1/water')
      .set('Authorization', token)
      .send(input1)
    expect(res.status).toBe(200)
  })
  it('sets last watered to current date', async () => {
    const res = await request(server)
      .put('/plants/1/water')
      .set('Authorization', token)
      .send(input1)
    const expected = Date.now()
    expect(res.body.last_watered).toBe(new Date(expected).toDateString())
  })
  it('sets next water to future date', async () => {
    const res = await request(server)
      .put('/plants/1/water')
      .set('Authorization', token)
      .send(input1)
    const expected = Date.now() + (24 * 60 * 60 * 1000)
    expect(res.body.next_water).toBe(new Date(expected).toDateString())
  })
})

describe('[DELETE] /plants/:plant_id', () => {
  const token = tokenMaker({
    user_id: 1,
    username: 'bob',
    phone_number: '+17175553333'
  })
  it('deletes a record', async () => {
    await request(server)
      .delete('/plants/1')
      .set('Authorization', token)
    const plants = await db('plants')
    expect(plants).toHaveLength(0)
  })
  it('returns the deleted object', async () => {
    const res = await request(server)
      .delete('/plants/1')
      .set('Authorization', token)
    expect(res.body).toMatchObject({plant_id: 1, nickname: 'Spunky'})
  })
})
