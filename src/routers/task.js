const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks',auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body, 
        owner : req.user._id
    })
    
     try {
        const model = await task.save()
        res.send(model)
     } catch (e) {
         res.status(400).send(e)
     }
})

//GET /tasks?completed=false
router.get('/tasks', auth, async (req, res) => {
    const match = {}

    if( req.query.completed){
        match.completed = req.query.completed === 'true' 
    }
    try {
        const user = req.user
        await user.populate({
            path: 'tasks',
            match
        }).execPopulate()
        console.log(user.tasks)
        res.send(user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth,  async (req,res) => {
    try {
        //const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id : req.params.id, owner: req.user._id})
        if(task)
            res.send(task)
        else
            res.status(404).send()
    } catch (e) {
        console.log(e)
    }
})

router.patch('/tasks/:id',auth,  async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const requestedUpdates = Object.keys(req.body)
    const isAllowed = requestedUpdates.every( update => allowedUpdates.includes(update))

    if(isAllowed){
        try {
            //const task = await Task.findByIdAndUpdate(req.params.id, req.body,{new : true, runValidators:true})
            //const task = await Task.findById(req.params.id)
            const task = await Task.findOne({ _id:req.params.id, owner: req.user._id})
            
            if(task){
                requestedUpdates.forEach( update => task[update] = req.body[update])
                await task.save()
                res.send(task)
            }
            else
                res.status(404).send()

        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }
    else
        res.status(400).send({
            error:'Invalid updates'
        })
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id : req.params.id, owner:req.user._id})
        if( task )
            res.send(task)
        else
            res.status(404).send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router