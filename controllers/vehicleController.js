const mongoose = require('mongoose');

const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Vehicle = require('./../models/vehicleModel')
const factory = require('./handlerFactory');
const Rate = require('../models/rateModel');

// create vehicle
exports.createVehicle = catchAsync(async (req, res, next) => {
    const vehicle = await Vehicle.findOne({vehicleType: req.body.vehicleType})
    if(vehicle) {
        return next(new AppError('This vehicle detail is already present!', 400))
    }

    await Vehicle.create({
        vehicleType: req.body.vehicleType
    })

    res.status(200).json({
        status: 'success',
        message: 'Vehicle has been created successfully.'
    })
});

// get all vehicles
exports.getAllVehicles = catchAsync(async (req, res) => {
    const vehicles = await Vehicle.find()

    res.status(200).json({
        status: 'success',
        message: 'Vehicles fetched successfully.',
        data: {
            vehicles
        }
    })
});

// update vehicle status
exports.updateVehicleStatus = catchAsync(async (req, res, next) => {
    const { isActive } = req.body;

    const vehicle = await User.findOne({_id: req.params.id})
    if(!vehicle) {
        return next(new AppError('Vehicle not identified!', 400))
    }

    let message;
    if(vehicle.active === req.body.isActive) {
        message = `Vehicle is already ${isActive}!`
    } else {
        vehicle.active = req.body.isActive
        vehicle.save();
        message = 'Vehicle has been updated successfully.';
    }

    res.status(200).json({
        status: 'success',
        message: message
    });
});

// update vehicle
exports.updateVehicle = factory.updateOne(Vehicle);

// delete vehicle
exports.deleteVehicle = catchAsync(async (req, res, next) => {
    const session = await mongoose.startSession();
    const { id } = req.params;

    try {
        session.startTransaction();

        // Find and delete the vehicle
        const vehicle = await Vehicle.findById(id).session(session);
        if (!vehicle) return next(new AppError('Vehicle not found!', 400))

        await Rate.deleteOne({ vehicleId: vehicle._id }).session(session);
        await Vehicle.findByIdAndDelete(id, { session });

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            message: 'Vehicle and associated rate deleted successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        return next(new AppError(error.message, 500))
    } finally {
        session.endSession();
    }
});

// =============== Vehicle Rate section ================= //
exports.addVehicleRate = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if(!vehicle) {
        return next(new AppError('Vehicle not found!', 400))
    }

    const rate = await Rate.findOne({ vehicleId: id });
    if(rate) {
        return next(new AppError('Rate for this vehicle already exists!', 400))
    }

    await Rate.create({
        vehicleId: id,
        vehicleRate: req.body.vehicleRate
    })

    res.status(200).json({
        status: 'success',
        message: `Rate for ${vehicle.vehicleType} has been added successfully.`
    })
});

exports.updateVehicleRate = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if(!vehicle) {
        return next(new AppError('Vehicle not found!', 400))
    }

    const rate = await Rate.findOne({ vehicleId: id });
    if(!rate) {
        return next(new AppError('Rate for the vehicle not found!', 400))
    }

    rate.vehicleRate = req.body.vehicleRate;
    rate.save();

    res.status(200).json({
        status: 'success',
        message: `Rate for ${vehicle.vehicleType} has been updated succesfuly.`
    });
});

exports.deleteVehicleRate = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Find and delete the vehicle
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return next(new AppError('Vehicle not found!', 400))

    await Rate.deleteOne({ vehicleId: vehicle._id });

    res.status(200).json({
        status: 'success',
        message: `Rate for ${vehicle.vehicleType} has been deleted successfully`
    });
});