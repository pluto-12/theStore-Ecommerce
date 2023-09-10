const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema ({
    categoryName: {
        type:  String,
        required: true
    }, 
    categoryDescription: {
        type: String
    }, 
    categoryImage: {
        type: String
    }
}, {versionKey: false})

const categoryCollection = new mongoose.model('categorydetails', categorySchema)

module.exports = categoryCollection  