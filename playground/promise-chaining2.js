require('../src/db/mongoose')
const Task= require('../src/models/task')

/* Task.findByIdAndDelete('5d141aae6810ac059ac7a193')
.then( task => {
    return Task.find({ completed : false})
})
.then( tasks => {
    tasks.forEach( task => console.log(task))
})
.catch( err => console.log(err)) */

const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed:false})
    return count
}

deleteTaskAndCount('5d142076aacc3505fa039981')
.then( count => {
    console.log(count)
})
.catch( err => console.log(err))