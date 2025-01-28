const crypto = require('crypto')
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    // const dyx = new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 *60 * 1000);
    const cookieOptions = {
        // expires: new Date(
        //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        // ),
        // secure: true, // allow to create ookie over HTTPS only [for Production]
        httpOnly: true // *setting this true makes browser to RECEIVE the cookie, STORE it and then SEND IT WITH EVERY REQUEST TO SERVER  
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        redirect: '/me',
        token,
        data: {
            user
        }
    })
}

exports.login = catchAsync(async (req, res, next) => {
    const {phone, password } = req.body

    if(!phone || !password) return next(new AppError('Pleas provide phone and password', 400))

    const user = await User.findOne({phone}).select('+password')

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Your credentials do not match', 401))
    }
    createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'token', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success',
        redirect: '/login'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1. Getting token and check if its true
    let token = '';
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } 
    else if(req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if(!token) {
        return next(new AppError('You are not logged in. Please login', 401))
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3. Check if the user still exists
    const existUser = await User.findById(decoded.id)
    if(!existUser) {
        return next(new AppError('User belonging to the token dos not exists', 401))
    }

    // 4. check if user chanegs password after the token was issues
    // if(existUser.changePasswordAfter(decoded.iat)) {
    //     return next(new AppError('User recently chnaged password! Please login again', 401))
    // }

    // GRANT ACCESS to protected routes
    req.user = existUser // to send to next middlewares
    res.locals.user = existUser // each pug template will have access to a variable called "user"
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403))
        }

        next();
    }
}

exports.forgetPassword = catchAsync(async (req, res, next) => {
    // 1. get user based on shared email
    const user = await User.findOne({email: req.body.email})
    if(!user) {
        return next(new AppError('We are not able to identify this email', 404))
    }

    // 2. Generate token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false // this will DEACTIVATE all the VALIDATORS specified in the schema
    });

    try {
        // 3. Send token in email
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
        // const message = `Forget Your Password? You can create a new password by clicking here ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your Password Reset Token (Valid for 10 mins)',
        //     message
        // })
        await new Email(user, resetURL).sendPasswordReset()
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        console.log(err.message);

        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        await user.save({
            validateBeforeSave: false
        })

        return next(new AppError('There was an error sending the email. Please try again later!', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1. Get user based on the token
    const hashedToken = crypto.createHash('sha256')
            .update(req.params.token)
            .digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    })
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }

    // 2. Set new password (if token not expired and user exists)
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()

    // 3. Update password changed at property
    // Done using events in model file

    // 4. Log the user in 
    const token = signToken(user._id)

    res.status(201).json({
        status: 'success',
        token
    })
})