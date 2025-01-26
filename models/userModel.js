const mongoose = require('mongoose');
const validator = require('validator');
// const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, 'A user must have a name']
    },
    // email: {
    //     type: String,
    //     required: [true, 'Email is a manatory field'],
    //     trim: true,
    //     lowercase: true,
    //     unique: [true, 'This email address is already registered with us'],
    //     // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    //     validate: [validator.isEmail, 'Please provide a valid email address']
    // },
    username: {
        type: String, 
        required: [true, 'Please provide operator username'],
        unique: [true, 'Operator with this username alraedy exists.']
    },
    route: {
        type: String, 
        required: [true, 'Please provide route'],
    },
    phone: {
        type: Number,
        required: [true, 'Please provide phone number'],
        unique: [true, 'Phone number alraedy exists.']
    },
    role: {
        type: String,
        enum: ['user', 'operator', 'admin'],
        default: 'user'
    },
    tokenData: {
        dailyTokens: {
            date: { type: Date, default: null },
            count: { type: Number, default: 0 },
        },
        totalTokens: { type: Number, default: 0 },
    },
    password: {
        type:String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    passwordUpdatedAt: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.new) { // if we DO NOT MODIFY the password OR if the document is new
        return next();
    }

    this.passwordUpdatedAt = Date.now() - 1000;
    next();
})

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if(this.passwordUpdatedAt) {
        const chnagedTimestamp = parseInt(this.passwordUpdatedAt.getTime() / 1000, 10)

        return JWTTimestamp < chnagedTimestamp
    }

    // FALSE means NOT changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;