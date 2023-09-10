const express = require('express')
const userRouter = express()
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const ratingController = require('../controller/user/ratingController')
const session = require('express-session')
const userMiddleware = require('../middleware/user/userAuth')
const couponController = require('../controller/user/couponController')
const errorController = require('../controller/user/errorController')
const { v4: uuid4} = require('uuid')

userRouter.set('view engine', 'ejs')
userRouter.set('views', './views/user')

userRouter.use(session({
    secret: uuid4(),
    resave: false,
    saveUninitialized: true
}))


userRouter.get('/', userController.landingPage)


// userRouter.get('/register', (req, res) => {
//     if(req.query.msg) {
//         res.render('signupPage', {msg : req.query.msg}) 
//     } else {
//         res.render('signupPage')
//     }
    
// })  

userRouter.get('/login', userController.loadLogin)
userRouter.post('/login', userController.verifyLogin)

userRouter.get('/forgotpassword', userController.loadForgotPassword)
userRouter.post('/updatepassword', userController.updatePassword)

userRouter.get('/signup', userController.loadSignup)
userRouter.post('/signup', userController.addNewUser)


userRouter.get('/verifynumber', userController.loadOTP)
userRouter.post('/verifynumber', userController.verifyotp)

userRouter.get('/logout', userController.userLogout)

userRouter.get('/products', userController.showallproducts)
userRouter.get('/productsfilter', userController.showFilteredproducts) 
userRouter.get('/filter', userController.filter)

userRouter.get('/productdetails', userController.singleProductDetails)

userRouter.post('/productsearch', userController.productSearch)

userRouter.get('/profile',userMiddleware.isLogout, userMiddleware.isBlocked,  userController.loadProfile)

userRouter.get('/manageaddress',userMiddleware.isLogout, userMiddleware.isBlocked,  userController.manageAddress) 
userRouter.get('/editaddress', userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadEditAddress) 
userRouter.post('/updateaddress', userMiddleware.isLogout, userMiddleware.isBlocked, userController.updateAddress)
userRouter.get('/addaddress', userMiddleware.isLogout, userMiddleware.isBlocked,  userController.loadNewAddress)
userRouter.post('/addaddress', userMiddleware.isLogout, userMiddleware.isBlocked, userController.newAddress)
userRouter.get('/deleteaddress', userMiddleware.isLogout, userController.deleteAddress)
 
userRouter.post('/addtocart', userMiddleware.isLogout, userMiddleware.isBlocked, userController.addtoCart)
userRouter.get('/cart', userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadCart)
userRouter.get('/reduceqty', userController.decQty)
userRouter.get('/addqty', userController.addQty)
userRouter.get('/deletefromcart', userController.deleteFromCart)

userRouter.get('/wishlist', userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadWishlist)
userRouter.get('/addtowishList', userController.addToWishlist)
userRouter.get('/deletefromwish', userController.deleteFromWishList)

userRouter.get('/checkout',userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadCheckOut)

userRouter.post('/placeorder', userMiddleware.isLogout, userMiddleware.isBlocked, userController.placeOrder)

userRouter.get('/activeorders', userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadActiveOrders )
userRouter.get('/cancelitem', userController.deleteOrder)
userRouter.get('/orderhistory', userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadOrders)
userRouter.get('/returnitem', userMiddleware.isLogout, userMiddleware.isBlocked, userController.loadReturnOrder)
userRouter.post('/returnitem', userMiddleware.isLogout, userMiddleware.isBlocked, userController.returnOrder) 


userRouter.get('/ratingcheck', userMiddleware.isLogout, userMiddleware.isBlocked, ratingController.validateRating)
userRouter.get('/rateproduct', userMiddleware.isLogout, userMiddleware.isBlocked, ratingController.loadRating)
userRouter.post('/addrating', userMiddleware.isLogout, userMiddleware.isBlocked, ratingController.addRating)

userRouter.post('/purchaseinvoice', userMiddleware.isLogout, userMiddleware.isBlocked, userController.generateInvoice)

userRouter.get('/coupons', couponController.loadCoupon)

// userRouter.get('*', errorController.loadErrorPage) 

module.exports = userRouter