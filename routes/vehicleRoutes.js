const express = require('express');
const {
    getAllVehicles, createVehicle, updateVehicleStatus, deleteVehicle, 
    addVehicleRate, updateVehicleRate, deleteVehicleRate, getAllVehicleRates,
    getVehicle, updateVehicle, getVehicleRate, getRates
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

// Move these specific routes BEFORE the :id routes
router.get('/get-rates', getRates);
router.get('/rates', getAllVehicleRates);

// Then add the parameterized routes
router.route('/:id')
    .get(getVehicle)
    .patch(updateVehicle)
    .delete(deleteVehicle)

// vehicle rate routes
router.route('/:id/rate')
    .get(getVehicleRate)
    .post(addVehicleRate)
    .patch(updateVehicleRate)
    .delete(deleteVehicleRate)

module.exports = router;