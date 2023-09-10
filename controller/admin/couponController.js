const couponCollection = require('../../model/couponModel')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const loadCoupons = async (req, res) => {
    try{
        const coupons = await couponCollection.find({})
        res.render('couponPage', {coupons})
    }
    catch (err) {
        console.log(err);
    }
}

const loadNewCoupon = async (req, res) => {
    try{
        res.render('newCoupon')
    }
    catch (err) {

    }
}

const saveNewCoupon = async (req, res) => {
    try {
        const newCoupon = {
            couponName: req.body.couponName,
            couponDescription: req.body.couponDescription,
            couponMinAmount: req.body.couponMinAmount,
            couponDiscount: req.body.couponDiscount,
            isActive: true
        }
        await  couponCollection.insertMany([newCoupon])
        res.redirect('/admin/couponmanagement')
    }
    catch (err) {
        console.log(err);
    }
}

const changeCouponStatus = async (req, res) => {
    try{
        const id = req.query.id
        const coupon = await couponCollection.find({_id: new ObjectId(id)})
        if(coupon[0].isActive) {
            await couponCollection.updateOne({_id: new ObjectId(id)}, {$set: {isActive: false}})
        } else {
            await couponCollection.updateOne({_id: new ObjectId(id)}, {$set: {isActive: true}})
        }
        res.redirect('/admin/couponmanagement')
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadCoupons,
    loadNewCoupon,
    saveNewCoupon,
    changeCouponStatus
}

