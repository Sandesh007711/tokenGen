const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const User = require('./../models/userModel')
const factory = require('./handlerFactory')
const APIfeatures = require('./../utils/apiFeatures')
const bcrypt = require('bcryptjs');

// get all users
exports.getAllUsers = catchAsync(async (req, res) => {
    const features = new APIfeatures(User.find({role: 'operator'}), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();

    const users = await features.query

    res.status(200).json({
        status: 'success',
        message: 'Users fetched succesfully',
        data: {
            users
        }
    })
});

// create user
exports.createUser = catchAsync(async (req, res, next) => {
    const user = await User.findOne({username: req.body.username})
    if(user) {
        return next(new AppError('This username is already registered with us!', 404))
    }

    const newUser = await User.create({
        username: req.body.username.trim(),
        password: req.body.password.trim(),
        rawPassword: req.body.password.trim(),
        phone: req.body.phone,
        route: req.body.route.trim(),
        role: 'operator',
    })

    res.status(200).json({
        status: 'success',
        message: 'Operator has been created succesfully'
    })
});

// get user detail
exports.getUser = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const user = await User.findOne({_id: id}, { passwordUpdatedAt: 0, __v: 0 })

    if(!user) return next(new AppError('We could not identify the user', 400))

    res.status(200).json({
        status: 'success',
        message: 'User fetched succesfully',
        data: {
            user
        }
    })
});

// update user data [DO NOT update password with this method]
exports.updateUser = factory.updateOne(User);

// delete user
exports.deleteUser = factory.deleteOne(User);