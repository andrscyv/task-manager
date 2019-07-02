const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/users', async (req,res) => {
    console.log(req.body)
    const user = new User(req.body)
    user.save().then( async model => {
        const token = await user.generateAuthToken()
        res.send({user, token})
    })
    .catch( e => {
        console.log(e)
        res.status(400).send(e)
    })
} )

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials( req.body.email, req.body.password )
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res ) => {
    try {
        req.user.tokens = req.user.tokens.filter( token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        req.status(500).send()
    }
})
router.post('/users/logoutAll', auth, async (req, res ) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
        
    }
})
router.get('/users/me',auth, (req, res) => {
    res.send(req.user)
})


router.patch('/users/me',auth , async ( req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password','age']
    const isValidOperation = updates.every( update => allowedUpdates.includes(update) )
    if(!isValidOperation)
        return res.status(400).send({
            error : 'Invalid updates'
        })
    try {
        const user = req.user

        updates.forEach( update => user[update] = req.body[update] )
        await  user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators:true})
        /* if(!user)
            return res.status(404).send() */

        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async ( req, res ) =>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

module.exports = router