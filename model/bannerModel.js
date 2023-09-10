const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    bannerName: {
        type: String,
        required: true
    },
    bannerLocation: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean
    }
},{versionKey: false})

const bannerCollection = new mongoose.model('bannerdetails', bannerSchema)

module.exports = bannerCollection;      