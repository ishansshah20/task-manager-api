const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("Password cannot contain string 'password'")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age can not be negative!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token }) // save it to the database to keep a track of it
    await user.save()

    return token
}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    //Wrong email
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bycrypt.compare(password, user.password)

    //Wrong passowrd
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Middleware logic to hash the password before saving to the database
userSchema.pre('save', async function (next) {
    const user = this //'this shows the user that we want to save'

    if (user.isModified('password')) {
        user.password = await bycrypt.hash(user.password, 8)
    }
    next() // next is used to tell the funcion is over in case a anysynchronus process is running
})

//Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

//Here .model acts like a constructor to the class User
const User = mongoose.model('User', userSchema)

module.exports = User

