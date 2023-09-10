const ratingCollection = require('../../model/ratingModel')
const productCollection = require('../../model/productModel')
const categoryCollection = require('../../model/categoryModel')


const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const mongoSanitizer = require('mongo-sanitize')




const validateRating = async (req, res) => {
    try {
        const details = await ratingCollection.find({
            $and: [
              { productId: req.query.product },
              { userId: req.session.userId }
            ]
        })
        if(details.length == 0) {
            const resData = {
                message: 'ok'
            }
            res.json(resData)
        } else {
            const resData = {
                message: 'exists'
            }
            res.json(resData)
        }
    }
    catch (err) {
        console.log(err);
    }
}

const loadRating = async (req, res) => {
    try{
        const productId = mongoSanitizer(req.query.product)
        const product = await productCollection.find({_id: new ObjectId(productId)})
        const categoryList = await categoryCollection.find({})
        res.render('productReview', {categories: categoryList, product, user: req.session.user})
    }
    catch (err) {
        console.log(err); 
    }
}

const addRating = async (req, res) => {
    // console.log(req.body);
    const newRating = {
        productId: req.body.id,
        userId: req.session.userId,
        rating: req.body.rating,
        review: req.body.review
    }
    await ratingCollection.insertMany([newRating]) 
    res.redirect('/orderhistory')
}


module.exports = {
    validateRating,
    addRating,
    loadRating
} 