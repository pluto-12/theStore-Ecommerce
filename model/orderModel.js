const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema ({ 
    orderId : {
        type: String,
        required: true
    },
    purchaseEmail: {
        type: String,
        required: true
    },
    purchaseItems: [
        {
            itemId: {
                type: String,
                required: true
            }, 
            itemName: {
                type: String,
            },
            itemImage: {
                type : String,
                required: true
            },
            itemPrice: {
                type: Number,
                required: true
            }, 
            itemQuantity: {
                type: String,
                required: true
            }
        }
    ],
    dateOfPurchase: {
        type: Date,
        default: Date.now,
        required: true
    }, 
    totalAmount: {
        type: Number,
        required: true
    },
    dateOfDelivery: {
        type: Date,
        default: function() {
            const deliveryDate = new Date(this.dateOfPurchase)
            deliveryDate.setDate(deliveryDate.getDate() + 10)
            return deliveryDate
        },
        required: true
    },
    paymentMethod :{
        type: String
    },
    shippedTo: [
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
    orderStatus: {
        type: String,
        required: true
    }
}, {versionKey: false})


const orderCollection = new mongoose.model('orderDetails', orderSchema)

module.exports = orderCollection