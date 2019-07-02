const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id:userOneId,
    name: 'Mike', 
    email: 'mike@example.com',
    password:'123456789',
    tokens:[{
        token:jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}
beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a new user', async() => {
    const res = await request(app).post('/users').send({
        name:'Andrew',
        email:'andrew@example.com',
        password:'MyPass777'
    }).expect(200)
    


})

test('Should login existing user', async ()=> {
    const res = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOne._id)
    const hasNewToken = user.tokens.some( token => token.token === res.body.token)
    expect(hasNewToken).toBe(true)
}) 

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        mail:'wrong@mail.com',
        password:'wrongPassword'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}` )
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticaded user', async() => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async() => {
    const res = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})