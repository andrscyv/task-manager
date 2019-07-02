require('../src/db/mongoose')
const User = require('../src/models/User')
/* require('../src/db/mongoose')
const User = require('../src/models/user')

User.findByIdAndUpdate( '5d141e2ef967e805c7157e23', { age: 1} )
.then( user => {
    console.log(user)
    return User.countDocuments({age:1})
})
.then(res => {
    console.log(res)
})
.catch(e => console.log(e)) */

const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, { age })
    const count = await User.countDocuments({ age })
    return count
}

updateAgeAndCount('5d141e2ef967e805c7157e23',2).then( count => {
    console.log(count)
})
.catch( e => console.log(e))