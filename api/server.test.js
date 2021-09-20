const request = require('supertest')
const server = require('./server')
const db = require('../data/db-config')

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
    expect(res.body.username).toBe(input.username)
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
