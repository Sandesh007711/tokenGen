const mongoose = require('mongoose');

const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const UserToken = require('../models/userTokenModel')
const factory = require('./handlerFactory')
const User = require('../models/userModel')
const Token = require('../models/tokenModel');
const Vehicle = require('../models/vehicleModel');
const APIfeatures = require('./../utils/apiFeatures')

// create printToken
exports.createToken = catchAsync(async (req, res, next) => {
    const { username } = req.user;
    const { vehicleId } = req.body;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findOne({ username }).session(session);
        const userId = user._id.toString().trim();
        if (!user) return next(new AppError(`User with username ${username} not found.`, 400));

        const vehicle = await Vehicle.findById(vehicleId).session(session);
        if (!vehicle) return next(new AppError('Vehicle not found!', 400));

        // Get today's date in 'YYYY-MM-DD' format
        const today = new Date().toISOString().split("T")[0];
        const lastTokenDate = user.tokenData.dailyTokens.date ? user.tokenData.dailyTokens.date.toISOString().split("T")[0] : null;

        let dailyTokensDate = user.tokenData.dailyTokens.date ? user.tokenData.dailyTokens.date : '';
        let dailyTokensCount = user.tokenData.dailyTokens.count ? user.tokenData.dailyTokens.count : 0;

        // Reset dailyTokens if the date has changed
        if (lastTokenDate !== today) {
            dailyTokensDate = new Date(); // Update to today's date
            dailyTokensCount = 0; // Reset the daily count
        }

        // Increment the daily token count and total token count
        dailyTokensCount += 1;

        // Generate the token number
        const uniqueToken = `${user.username.toUpperCase()}${dailyTokensCount.toString().padStart(2, "0")}`;
    
        // Create the token
        await UserToken.create([
            {
                userId: userId,
                driverName: req.body.driverName,
                driverMobileNo: req.body.driverMobileNo,
                vehicleNo: req.body.vehicleNo,
                vehicleId: vehicleId,
                route: req.body.route,
                quantity: req.body.quantity,
                place: req.body.place,
                challanPin: req.body.challanPin,
                tokenNo: uniqueToken,
                createdAt: new Date()
            }
        ], { session });
        
        // Update the user's token data in user main table
        await User.findByIdAndUpdate(userId,
            {
                $set: {
                    'tokenData.dailyTokens.date': dailyTokensDate,
                    'tokenData.dailyTokens.count': dailyTokensCount,
                },
                $inc: { 
                    'tokenData.totalTokens': 1
                },
            },
            { session }
        );
    
        await session.commitTransaction();
        session.endSession();
    
        res.status(200).json({
            status: 'success',
            message: 'Print Token has been created successfully.'
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError(error.message, 500))
    }
});

// get all printtokens
exports.getAllTokens = catchAsync(async (req, res) => {
    const features = new APIfeatures(UserToken.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();

    const printTokens = await features.query

    res.status(200).json({
        status: 'success',
        message: 'Tokens fetched succesfully',
        printTokens
    })
});

// get printtoken by id
exports.getToken = factory.getOne(UserToken);

// update printToken
exports.updateToken = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const token = await UserToken.findById({ _id: id })
    if(!token) {
        return next(new AppError('Print Token not found', 400))
    }

    token.driverName = req.body.driverName ? req.body.driverName : token.driverName
    token.driverMobileNo = req.body.driverMobileNo ? req.body.driverMobileNo : token.driverMobileNo
    token.vehicleNo = req.body.vehicleNo ? req.body.vehicleNo : token.vehicleNo
    token.vehicleId = req.body.vehicleId ? req.body.vehicleId : token.vehicleId
    token.quantity = req.body.quantity ? req.body.quantity : token.quantity
    token.place = req.body.place ? req.body.place : token.place
    token.challanPin = req.body.challanPin ? req.body.challanPin : token.challanPin
    token.route = req.body.route ? req.body.route : token.route
    token.updatedBy = req.user.username

    token.save()

    res.status(200).json({
        status: 'success',
        message: 'Tokens updated succesfully'
    })
});

exports.deleteToken = catchAsync(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const tokenId = req.params.id
        // Find the token
        const token = await UserToken.findById(tokenId).session(session);
        if (!token) return next(new AppError('Token not found!', 400))
    
        const userId = token.userId;
        const user = await User.findById(userId).session(session);
        const currentDate = new Date().toISOString().split('T')[0];

        const today = new Date().toISOString().split('T')[0];
        const tokenCreationDate = token.createdAt.toISOString().split('T')[0];
    
        // Decrement daily and total token counts
        const dailyTokens = user.tokenData.dailyTokens.date === currentDate ? user.tokenData.dailyTokens.count - 1 : 0;
        const totalTokens = user.tokenData.totalTokens - 1;
  
        // Update the user's token data
        await User.findByIdAndUpdate(userId,
            (tokenCreationDate === today && user.tokenData.dailyTokens.count > 0)
            ? {
                $set: {
                    'tokenData.dailyTokens.count': Math.max(dailyTokens, 0),
                    'tokenData.totalTokens': totalTokens
                },
            } 
            : {
                $set: {
                    'tokenData.totalTokens': totalTokens
                },
            },
            { session }
        );

        // Delete the token
        await UserToken.findByIdAndDelete(tokenId, { session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }  

    res.status(200).json({
        status: 'success',
        message: 'Print Token has been deleted successfully.'
    })
});

exports.getUpdatedTokens = catchAsync(async (req, res) => {
    const data = await UserToken.find({ updatedAt: { $ne: null } })

    res.status(200).json({
        status: 'success',
        message: 'Updated Tokens fetched succesfully',
        data
    })
});