const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true
    },
    couponDescription: {
        type: String,
        required: true
    },
    couponMinAmount: {
        type: Number,
        required: true
    },
    couponDiscount: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
})

couponCollection = new mongoose.model('coupondetails', couponSchema)

module.exports = couponCollection

