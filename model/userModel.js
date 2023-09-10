const mongoose = require('mongoose')

const userSchema = new mongoose.Schema ({
    userEmail : {
        type : String, 
        required : true
    },
    userName : {
        type : String,
        required : true
    },  
    userContact : {
        type : String,
        required : true
    },
    userPassword : {
        type : String,
        required : true
    },
    userAddress: [
        {
            fullName: {
                type: String,
            },
            mobile: {
                type: String,
            },
            houseNumber: {
                type: String,
            },
            area: {
                type: String,
            }, 
            pinCode: {
                type: String,
            },
            city: {
                type: String,
            }, 
            state: {
                type: String,
            }
        }
    ],
    cart: [
        {
            productId: {
                type: String
            },
            quantity: {
                type: Number
            }
        }
    ],
    wishList: { 
        type: [String]
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isContactVerified : {
        type: Boolean,
        default: false
    }
}, {versionKey: false})

const userCollection = new mongoose.model('userDetails', userSchema) 

module.exports = userCollection