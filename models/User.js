const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 20
    },
    designation: {
        type: String,
        trim: true,
        maxlength: 15
    },
    phone: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 15
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        unique: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        }
    },
    location: {
        type: String,
        trim: true
    },
    password: {
        type: String,
    },
    picture: {
        type: Buffer,
    },
    skills: {
        type: [String]
    }
}, {
    timestamps: true
})

// find user in db, provided the email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Invalid credentials !')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Invalid credentials !')
    }
    
    return user
}

// generate token for that user after registering or logging in
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'spiderman') 

    return token
}

// check if user's password is modified, if so then hash it before saving to db
userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)
    }
    next()
})

module.exports = User = mongoose.model('user', userSchema);