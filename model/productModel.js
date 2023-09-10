const mongoose = require ('mongoose')

const productSchema = new mongoose.Schema ({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    }, 
    productStock: {
        type: Number,
        required: true
    }, 
    productDescription: {
        type: String,
        required: true
    },
    productImages: {
        type: Array,
        required: true
    }, 
    productCategory: {
        type: String,
        required: true
    }
}, {versionKey: false})

const productCollection = new  mongoose.model("productdetails", productSchema)

module.exports = productCollection