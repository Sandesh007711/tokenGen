const express = require('express');
const {
    getAllTokens, createToken, getUpdatedTokens, getToken, updateToken, deleteToken
} = require('../controllers/userTokenController');
const authController = require('../controllers/authController')

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
    .get(authController.restrictTo('admin', 'operator'), getAllTokens)
    .post(authController.restrictTo('admin', 'operator'), createToken)

router.route('/updated')
    .get(authController.restrictTo('admin', 'operator'), getUpdatedTokens)

router.route('/:id')
    .get(authController.restrictTo('admin', 'operator'), getToken)
    .patch(authController.restrictTo('admin'), updateToken)
    .delete(authController.restrictTo('admin'), deleteToken)

module.exports = router;