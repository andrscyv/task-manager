const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Taks = require('./task')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate(val){
            if( val < 0)
                throw new Error('Age must be positive')
        }
        
    },
    email:{ 
        type: String,
        required:true,
        unique: true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('Invalid email')
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(val){
            if( val.toLowerCase().includes('password'))
                throw new Error('Contains "password", invalid')
        }

    },
    tokens:[{
        token: {
           type: String,
        required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref:'Task',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}
userSchema.statics.findByCredentials = async ( email, password) => {
    const user = await User.findOne({ email })
    //console.log(user)
    if(!user)
        throw new Error('Unable to login (mail)')
    //console.log(user.age)
    const matched = await bcrypt.compare(password, user.password)
    if( !matched )
        throw new Error('Unable to login')

    return user
}
//Hash the password
userSchema.pre('save', async function( next ){
    const user = this

    if( user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)

    next()
})

//Deleete user takss when user is removed
userSchema.pre('remove', async function(next){
    const user = this
    await Taks.deleteMany({owner:user._id})
    next()
})
const User = mongoose.model('User', userSchema )

module.exports = User