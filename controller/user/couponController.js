const couponCollection = require('../../model/couponModel')
const categoryCollection = require('../../model/categoryModel')


const loadCoupon = async (req, res) => {
    const categoryList = await categoryCollection.find({})
    const couponList = await couponCollection.find({isActive: true})
    if(req.session.user) {
        res.render('coupons',{categories: categoryList, user: req.session.user, couponList})
    } else {
        res.render('coupons',{categories: categoryList, couponList})
    }
    
}


module.exports = {
    loadCoupon
}