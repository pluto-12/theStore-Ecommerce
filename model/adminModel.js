const mongoose = require('mongoose')

const adminSchema  = new mongoose.Schema({
    adminEmail : {
        type : String,
        required : true
    },
    adminName : {
        type : String,
        required : true
    },
    adminPassword : {
        type : String,
        required :true
    }
}, {versionKey: false})

const  adminCollection = new mongoose.model("adminDetails", adminSchema)

module.exports = adminCollection