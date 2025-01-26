const mongoose = require('mongoose');

const UserTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Token should belong to an operator!']
    },
    driverName: {
        type: String,
        required: [true, 'Please provide driver name.']
    },
    driverMobileNo: {
        type: Number,
        required: [true, 'Please provide driver mobile number.']
    },
    vehicleNo: {
        type: String,
        required: [true, 'Please provide vehicle number.']
    },
    vehicleId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle',
        required: [true, 'A token must have a vehicle type.']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity.']
    },
    place: {
        type: String,
        required: [true, 'Please provide place.']
    },
    challanPin: {
        type: String,
        required: [true, 'Please provide challan pin.']
    },
    tokenNo: {
        type: String,
        // required: [true, 'Please provide roken number.']
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    updatedBy: {
        type: String,
    }
}, { timestamps: true })

UserTokenSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

// Create a model based on the schema
const UserToken = mongoose.model('UserToken', UserTokenSchema);

module.exports = UserToken;