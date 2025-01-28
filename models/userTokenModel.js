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
    route: {
        type: String, 
        required: [true, 'Please provide route'],
        unique: [true, 'Route should be unique'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity.']
    },
    place: {
        type: String,
        // required: [true, 'Please provide place.']
    },
    challanPin: {
        type: String,
        // required: [true, 'Please provide challan pin.']
    },
    tokenNo: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    },
    updatedBy: {
        type: String,
    }
});

/* UserTokenSchema.add({
    updatedAt: {
        type: Date,
        default: null
    }
}) */

UserTokenSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();

        if (this.$locals && this.$locals.req) {
            const req = this.$locals.req;
            this.updatedBy = req.user?.username
        }
    }
   /*  const update = this.getUpdate();

    if (this.options.context && this.options.context.req) {
        const req = this.options.context.req;
        update.updatedBy = req.user?.username
    }

    update.updatedAt = new Date(); */

    next()
})

UserTokenSchema.pre(/^find/, function (next) {
    this.find().populate('vehicleId', {_id: 0, 'vehicleType': 1}).populate('userId', {_id: 0, 'username': 1})
    next();
})

UserTokenSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

// Create a model based on the schema
const UserToken = mongoose.model('UserToken', UserTokenSchema);

module.exports = UserToken;