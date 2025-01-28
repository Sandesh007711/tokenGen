const express = require('express');
const {
    getAllVehicles, createVehicle, updateVehicleStatus, deleteVehicle, addVehicleRate, updateVehicleRate, deleteVehicleRate
} = require('./../controllers/vehicleController');
const authController = require('./../controllers/authController')

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Protect all routes after this middleware for admin user
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(getAllVehicles)
    .post(createVehicle)

router.route('/:id')
    .patch(updateVehicleStatus)
    .delete(deleteVehicle)

// vehicle rate routes
router.route('/:id/rate')
    .post(addVehicleRate)
    .patch(updateVehicleRate)
    .delete(deleteVehicleRate)

module.exports = router;