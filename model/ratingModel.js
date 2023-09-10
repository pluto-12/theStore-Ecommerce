const mongoose = require ('mongoose')

const ratingScheme = new mongoose.Schema ({
    productId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }, 
    review: {
        type: String,
        required: true
    }
})

const ratingCollection = new mongoose.model('ratingdetails', ratingScheme) 

module.exports = ratingCollection