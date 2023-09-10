const adminCollection = require('../model/adminModel')
const categoryCollection = require('../model/categoryModel')
const productCollection = require('../model/productModel')
const userCollection = require('../model/userModel')
const orderCollection = require('../model/orderModel')
const bannerCollection = require('../model/bannerModel')
const couponCollection = require('../model/couponModel')
const ratingCollection = require('../model/ratingModel')
const { v4: uuidv4 } = require('uuid');


const razorPay = require('razorpay')
const pdfDoc = require('pdfkit')
const fs = require('fs')



const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcrypt')

var optNumber = '12345'


const loadLogin = (req, res) => {
    try {
        if(req.query.errorMessage) {
            res.render('loginPage', {errorMessage: req.query.errorMessage})
        } else {
            res.render('loginPage') 
        }
        
    }
    catch (err) {
        console.log(err);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const list = await userCollection.find({userEmail: req.body.userEmail})
        if(list.length == 0) {
            res.redirect('/login?errorMessage=Email%20doesnt%20exist')
        } else {
            // console.log(list);
            // console.log(req.body);
            if(list[0].userPassword == req.body.userPassword) {
                req.session.user = list[0].userName
                req.session.userEmail = list[0].userEmail
                req.session.userId = list[0]._id
                // console.log(list[0]._id);
                // console.log(req.session.userId);
                res.redirect('/')
            } else {
                res.redirect('/login?errorMessage=Wrong%20Password')
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const loadSignup = (req, res) => {
    try {
        if(req.query.msg) {
            res.render('signupPage', {errorMessage: req.query.msg})
        } else {
            res.render('signupPage')
        }
        
    }
    catch (err) {
        console.log(err);
    }
}


const loadForgotPassword = async (req, res) => {
    res.render('forgotPassword')
}


const addNewUser = async (req, res) => {
    try{
        const list = await userCollection.find({$or: [{userEmail: req.body.userEmail},  {userContact: req.body.usercontact}]})
        // console.log(list.length);
        if(list.length) {
            console.log(list); 
            res.redirect('/signup?msg=Contact%20or%20Email%20already%20taken')
        } else {
            const newUser = {
                userEmail : req.body.userEmail,
                userName : req.body.userName,
                userContact : req.body.usercontact,
                userPassword : req.body.userPassword
            }
            const result = await userCollection.insertMany([newUser]) 
            req.session.user = req.body.userName
            req.session.contact = req.body.usercontact
            res.redirect('/verifynumber')
        } 
        
    }
    catch (err) {
        console.log(err);
    }
}

const loadOTP = (req, res) => {
    try {
        // sendotp(req.session.contact)
        if(req.query.forgot) {
            req.session.forgot = req.query.mobile
            res.render('otpPage', {number: req.query.mobile})
        } else {
            res.render('otpPage', {number: req.session.contact})
        }
    }
    catch (err) {
        console.log(err); 
    }
}

const verifyotp = async (req, res) => {
    console.log(optNumber); 
    console.log(req.body.userOtp);
    console.log(req.session.contact);
    if(optNumber == req.body.userOtp) {
        if(req.session.user) {
            await userCollection.updateOne({userContact: req.session.contact}, {$set: {isContactVerified: true}})
            res.redirect('/')
        } else {
            res.render('newPassword')
        }
    } else {
        res.render('otpPage', {errorMessage: "Invalid OTP"})
    }
}

const updatePassword = async (req, res) => {
    const contact = req.session.forgot
    try {
        await  userCollection.updateOne({userContact: contact}, {$set: {userPassword: req.body.userPassword}})
        res.redirect('/login')
    }
    catch (err) {
        console.log(err);
    }
}
  
const userLogout = (req, res) => {
    try {
        req.session.destroy(function (err) {
        if (err) {
            res.send("Error");
        } else {
            res.redirect("/")
            // console.log(req.session)
        }
        });
    }
    catch (err) {
        console.log(err);
    }
}

const landingPage = async (req, res) => {
    try {
        const categoryList = await categoryCollection.find({})
        const productList = await productCollection.aggregate([{$sample: {size: 4}}]) 
        const bannerList = await bannerCollection.find({isActive: true})
        if(req.session.user) {
            res.render('landingPage', {categories: categoryList, products: productList, user: req.session.user, banners: bannerList})
        } else {
            res.render('landingPage', {categories: categoryList, products: productList, banners: bannerList})
        }
    }
    catch (err) {
        console.log(err);
    }
}

function generateOTP() {
    for (var i = 0; i < 4; i++) {
        optNumber += Math.floor(Math.random() * 10);
    }
    // console.log(optNumber);
    return optNumber;
}


const accountsid = 'ACacde43bfe8c86097c0ce0b5196e73f83'
const authtoken = '558e121318920433b9c5e50d98f16ac8'

const twilio = require('twilio')(accountsid, authtoken)

function  sendotp(contact) {

    twilio.messages.create({
        from: '+19897155808',
        to: '+919496260485',
        body: generateOTP()
    })
    .then ((response) => {
        // console.log(res);
        // res.status(200).send('msg send')
    })
    .catch ((err) => {
        console.log(err);
    }) 
}

// function hashPassword (password) {
//     hashedPassword = 
// }

const showallproducts = async (req, res) => {
    try {
        const page = req.query.page || 1 
        const limit = 2
        const skip = (page-1)*limit
        if(req.query.category) {
            // console.log("here");
            const count = await productCollection.countDocuments({productCategory: req.query.category})
            // console.log(count);
            const productList = await productCollection.find({productCategory: req.query.category}).skip(skip).limit(limit)
            let countpages = Math.ceil(count / limit);
            const categoryList = await categoryCollection.find({})
            // console.log(productList);
            res.render('shopProducts', {products: productList, categories: categoryList, user: req.session.user, page, limit,countpages, active: req.query.category})
        } else {
            // console.log("yess"); 
            const count = await productCollection.countDocuments()
            // console.log(count);
            const productList = await productCollection.find({}).skip(skip).limit(limit)
            let countpages = Math.ceil(count / limit); 
            const categoryList = await categoryCollection.find({}) 
            res.render('shopProducts', {products: productList, categories: categoryList, user: req.session.user, page, limit,countpages})
        }
        
    }
    catch (err) {
        console.log(err);
    }
}

const showFilteredproducts = async (req, res) => {
    try {
        const category = req.query.category
        const sort = req.query.sort
        let productList
        console.log(category);
        console.log(sort);
        if(category == "all") {
            if(sort == "descending") {
                productList = await productCollection.find({}).sort({ productPrice: -1 });
            } else {
                productList = await productCollection.find({}).sort({ productPrice: 1 });
            }
        } else {
            if(sort == "descending") {
                // console.log("yess");
                productList = await productCollection.find({productCategory: category}).sort({ productPrice: -1 })
            } else {
                productList = await productCollection.find({productCategory: category}).sort({ productPrice: 1 })
            }
        }
        const categoryList = await categoryCollection.find({})
        res.render('filteredProducts', {products: productList, categories: categoryList, user: req.session.user})
    }
    catch (err) {
        console.log(err);
    }
}

const filter = async (req, res) => {
    try {

        const startIndex = parseInt(req.query.startIndex) || 0;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 2;

        let query = {};
        let searchKey = ''
        if (req.query.searchKey) {
            searchKey = req.query.searchKey
            query.productName = { $regex: req.query.searchKey, $options: 'i' };
        }
        if (req.query.category) {
            query.productCategory = req.query.category;
        }
        let sortDirection = 1; // Default ascending
        if (req.query.sort === '-1') {
            sortDirection = -1; // Descending
        }

        const totalProducts = await productCollection.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / itemsPerPage); 

        const product = await productCollection.find(query).sort({productPrice: sortDirection}).skip(startIndex).limit(itemsPerPage)
        const categoryList = await categoryCollection.find({})
        if(searchKey) {
            res.render('filteredProducts', {products: product, categories: categoryList, user: req.session.user, searchKey: searchKey, totalPages: totalPages})
        } else {
            res.render('filteredProducts', {products: product, categories: categoryList, user: req.session.user, totalPages: totalPages}) 
        }
        
        // console.log(product);
    }
    catch (err) {
        console.log(err);
    }
}


const singleProductDetails = async (req, res) => {
    try {
        const categoryList = await categoryCollection.find({})
        const details = await productCollection.find({_id: new ObjectId(req.query.id)})
        const rating = await ratingCollection.find({productId: req.query.id})
        // console.log(req.query.id);
        // console.log(rating);
        let avgRating = 0 
        if(rating.length) {
            let count = 0;
            let sum = 0
            rating.forEach((review) => {
                sum  = sum + review.rating
                count ++
            })
            avgRating = sum/count
        }
        // console.log(details);
        res.render('productDetails', {productdetails: details,user: req.session.user, categories: categoryList, rating, avgRating})
    }
    catch (err) {
        console.log(err);
    }
}

const productSearch = async (req, res) => {
    try {
        const list = await productCollection.find({productName : {$regex: '^' + req.body.searchKey}})
        // console.log(req.body.searchKey);
        // console.log(list);
        const categoryList = await categoryCollection.find({})
        res.render('filteredProducts', {products: list, categories: categoryList, user: req.session.user})
    }
    catch (err) {
        console.log(err);
    }
}

const loadProfile = async (req, res) => {
    try {
        const userDetails = await userCollection.find({userName: req.session.user})
        // console.log(userDetails);
        const categoryList = await categoryCollection.find({})
        res.render('userProfile', {user: req.session.user, categories: categoryList})
    }
    catch (err) {
        console.log(err);
    }
}

const manageAddress = async (req, res) => {
    try {
        // const list = await userCollection.find({_id: new ObjectId(req.session.id)}, {userAddress: 1})
        const list = await userCollection.find({_id: req.session.userId}, {userAddress: 1, _id: 0})
        // console.log(list[0].userAddress); 
        const categoryList = await categoryCollection.find({})
        if(list[0].userAddress.length) {
            res.render('manageAddress', {addressList: list[0].userAddress, user: req.session.user, categories: categoryList})
        } else {
            res.render('manageAddress', {user: req.session.user, categories: categoryList})    
        }  
        
    }
    catch (err) {
        console.log(err);
    }
}

const loadEditAddress = async (req, res) => {
    try {
        // console.log(req.query.id);
        // console.log(req.session.userId);
        // const list = await userCollection.find({_id: new ObjectId(req.session.userId), 'userAddress._id': new ObjectId(req.query.id)}, {'userAddress._id': 1})
        const list = await userCollection.aggregate([
            {
              $match: {
                _id: new ObjectId(req.session.userId)
              }
            },
            {
              $project: {
                userAddress: {
                  $filter: {
                    input: '$userAddress',
                    as: 'address',
                    cond: { $eq: ['$$address._id', new ObjectId(req.query.id)] }
                  }
                }
              }
            }
          ])
        // console.log(list[0].userAddress);
        const categoryList = await categoryCollection.find({})
        res.render('editAddress',{user: req.session.user, addressDetails: list[0].userAddress, categories: categoryList} )
    }
    catch (err) {
        console.log(err);
    }
}

const updateAddress = async (req, res) => {
    const updatedAddress = {
        fullName: req.body.fullName,
        mobile: req.body.mobile,
        houseNumber: req.body.houseNumber,
        area: req.body.area,
        pinCode: req.body.pinCode,
        city: req.body.city,
        state: req.body.state
    }
    await userCollection.updateOne(
        { 
          _id: req.session.userId, 
          'userAddress._id': req.body.addressId 
        },
        { $set: { 'userAddress.$': updatedAddress } })
    res.redirect('/manageaddress')
}

const loadNewAddress = async (req, res) => {
    try{
        const categoryList = await categoryCollection.find({})
        res.render('addNewAddress', {user: req.session.user, categories: categoryList})
    }
    catch (err) {
        console.log(err);
    }
}

const newAddress = async (req, res) => {
    try {
        const addressData = {
            fullName: req.body.fullName,
            mobile: req.body.mobile,
            houseNumber: req.body.houseNumber,
            area: req.body.area,
            pinCode: req.body.pinCode,
            city: req.body.city,
            state: req.body.state,
        }
        // console.log(req.session.userId);
        await userCollection.updateOne({_id: req.session.userId}, {$push: {userAddress:addressData }})
        // console.log(req.body);
        res.redirect('/manageaddress')
    }
    catch (err) {
        console.log(err);
    }
}

const deleteAddress = async (req, res) => {
    try {
        // console.log(req.query.id);
        await userCollection.updateOne({_id: req.session.userId}, {$pull: {userAddress: {_id: new ObjectId(req.query.id)}}})
        res.redirect('/manageaddress')
    }
    catch (err) {
        console.log(err);
    }
}


const addtoCart = async (req, res) => {
    try {
        const newItem = {
            productId: req.query.id,
            quantity: 1
        }
        await userCollection.updateOne({_id: req.session.userId}, {$push: {cart: newItem}})
        res.send('added')
    }
    catch (err) {
        console.log(err);
    }
}

async function getItems(user) {
    const cartData = [];
        for (const item of user.cart) {
            // const user = await userCollection.findOne({_id: req.session.userId})
            const product = await productCollection.findOne({ _id: item.productId });
            if (product) {
                cartData.push({ quantity: item.quantity, product: product });
            }
        }
    return cartData;
}


const loadCart = async (req, res) => {  
    try {
        const user = await userCollection.findOne({ _id: req.session.userId }, { cart: 1, _id: 0 });
        const categoryList = await categoryCollection.find({})
        // console.log(user);
        if (user.cart.length > 0) { 
            const cartData = await getItems(user);
        //   [{count,product}]
            const uniqueCartItems = cartData.filter((item, index, self) =>
                index === self.findIndex(t => t.product && t.product._id.equals(item.product._id))
            );
            // console.log(uniqueCartItems);
            let sum = 0
            uniqueCartItems.forEach((item) => {
                sum = sum + (item.quantity*item.product.productPrice) 
            })

            res.render('userCart', { user:req.session.user, cartItems: uniqueCartItems, totalSum: sum, categories: categoryList }); 
        } else {

            res.render('userCart', {user:req.session.user, empty: true, categories: categoryList})
        }
    } catch (e) {
        console.error("getCart", e.message);
        return res.status(500).send("Internal Server Error"); 
    }
}

const addQty = async (req, res) => {
    // console.log(req.session.userId);
    // console.log(req.query.id);
    const response = await userCollection.updateOne({_id: req.session.userId, "cart.productId": req.query.id},
        {$inc: {"cart.$.quantity": 1}})
    // console.log(response);
    res.redirect('/cart')
}

const decQty = async (req, res) => {
    const response = await userCollection.updateOne({_id: req.session.userId, "cart.productId": req.query.id},
        {$inc: {"cart.$.quantity": -1}})
    const list = await userCollection.find({_id: req.session.userId, "cart.productId": req.query.id}, {"cart.$": 1, _id: 0})
    // console.log(list[0].cart[0].quantity);
    if(list[0].cart[0].quantity == 0) {
        // console.log("here");
        const check = await userCollection.findOneAndUpdate({_id: req.session.userId}, {$pull: {cart: {productId: req.query.id}}}, {new: true})
        // console.log(check);
    }
    res.redirect('/cart')
}

const deleteFromCart = async (req, res) => {
    try {
        const updatedCart = await userCollection.findOneAndUpdate({_id: req.session.userId}, {$pull: {cart: {productId: req.query.id}}}, {new: true})
        res.redirect('/cart')
    }
    catch (err) {
        console.log(err);
    }
} 

const loadWishlist = async (req, res) => {
    try {
        const categoryList = await categoryCollection.find({})
        const wishList = await userCollection.find({_id: req.session.userId}, {wishList: 1}) 
        const list = wishList[0].wishList
        // console.log(list);
        const wishProducts = await productCollection.aggregate([{$match: {_id: {$in: list.map(id => new ObjectId(id))}}}])
        // console.log(wishProducts);
        res.render('wishlist', {user: req.session.user, categories: categoryList, wishItems: wishProducts})
        
    }
    catch (err) {
        console.log(err);
    }   
}

const addToWishlist = async (req, res) => {
    try {
        const id= req.query.id
        const response = await userCollection.updateOne({_id: req.session.userId}, {$push: {wishList: id}})
        res.send('Added to wishlist')
    }
    catch(err) {
        console.log(err);
    }
}

const deleteFromWishList = async (req, res) => {
    try {
        const id = req.query.id
        await userCollection.updateOne({_id: req.session.userId}, {$pull: {wishList: id}})
        res.redirect('/wishlist')
    }
    catch (err) {
        console.log(err);
    }
}


const loadCheckOut = async (req, res) => {
    try {
        const user = await userCollection.findOne({ _id: req.session.userId }, { cart: 1, _id: 0 });
        const categoryList = await categoryCollection.find({})
        const cartData = await getItems(user);
        const uniqueCartItems = cartData.filter((item, index, self) =>
            index === self.findIndex(t => t.product && t.product._id.equals(item.product._id))
        );
        let sum = 0
        uniqueCartItems.forEach((item) => {
            sum = sum + (item.quantity*item.product.productPrice)
        })
        const address = await userCollection.find({_id: req.session.userId}, {userAddress: 1})
        if(req.query.coupon) {
            console.log("here");
            sum = sum - (sum*(req.query.coupon/100))
            res.render('userCheckOut', { user:req.session.user, items: uniqueCartItems, totalSum: sum, categories: categoryList, userAddresses: address});
        } else {
            const couponList = await couponCollection.find({couponMinAmount: {$lte: sum}}) 
            res.render('userCheckOut', { user:req.session.user, items: uniqueCartItems, totalSum: sum, categories: categoryList, userAddresses: address, couponList });
        }
        
    }
    catch (err) {
        console.log(err);
    } 
}


const razorpayInstance = new razorPay ({
    key_id: process.env.razorpayId,
    key_secret: process.env.razorpaySecret
})

function genrateId () {
    const uuid = uuidv4().replace(/-/g, ''); // Remove dashes from the UUID
    return uuid.substring(0, 6); // Take the first 6 characters
}


const placeOrder = async (req, res) => {
    try {
        console.log(req.body);
        const shippingAddress = await userCollection.aggregate([
            {
              $match: {
                _id: new ObjectId(req.session.userId)
              }
            },
            {
              $project: {
                userAddress: {
                  $filter: {
                    input: '$userAddress',
                    as: 'address',
                    cond: { $eq: ['$$address._id', new ObjectId(req.body.addressRadio)] }
                  }
                }
              }
            }
        ])
        // console.log(shippingAddress[0].userAddress);
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        let orderTime  =`${day}-${month }-${year} ${hours}:${minutes}`; 
        let deliveryDate = `${day + 10}-${month}-${year} ${hours}:${minutes}`;
        const user = await userCollection.findOne({ _id: req.session.userId }, { cart: 1, _id: 0 });
        const categoryList = await categoryCollection.find({})
        const cartData = [];
        let sum = 0
        for (const item of user.cart) {
            await productCollection.updateOne({_id: item.productId}, {$inc: {productStock: -1}})
            const product = await productCollection.findOne({ _id: item.productId });
            if (product) {
                cartData.push({itemId: product._id, itemName: product.productName, itemImage: product.productImages[0], itemPrice: product.productPrice ,itemQuantity: item.quantity });
            }
            sum = sum + (product.productPrice*item.quantity)
        }
        const orderDetails = {
            orderId:  genrateId(), 
            purchaseEmail: req.session.userEmail,
            purchaseItems: cartData,
            totalAmount: sum,
            paymentMethod: req.body.paymentMethod,
            shippedTo: shippingAddress[0].userAddress,
            orderStatus: "Placed"
        }
        await orderCollection.insertMany([orderDetails])
        await userCollection.updateOne({_id: req.session.userId}, {$set: {cart: []}})
        if(req.body.paymentMethod == "CoD") {
            res.status(200).send({msg: 'CoD'}) 
        } else {
            let totalAmount = sum * 100
            const options = {
                amount:  totalAmount,
                currency: 'INR',
                receipt: 'admin@admin.com' 
            }
            razorpayInstance.orders.create (options, (err, order) => {
                if(!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'OnlinePayment',
                        amount: totalAmount,
                        key_id: process.env.razorpayId,
                        email: req.session.userEmail,
                        contact: "9496260485"
                    })
                } else {
                    console.log(err);
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            })
        }
        
    }
    catch (err) {
        console.log(err);
    }
}

const loadActiveOrders = async (req, res) => {
    try {
        const categoryList = await categoryCollection.find({})
        const orders = await orderCollection.find({purchaseEmail: req.session.userEmail, orderStatus: {$nin: ['Delivered', 'Returned', 'Cancelled']}})
        // console.log(orders[0].purchaseItems.length);   
        // console.log(orders);
        if(orders.length) {
            res.render('activeOrders', {user: req.session.user, categories: categoryList, activeOrders: orders})
        } else {
            res.render('activeOrders', {user: req.session.user, categories: categoryList})
        }
        
    }
    catch (err) {
        console.log(err);
    }
}

const deleteOrder = async (req, res) => {
    try {
        const item = await orderCollection.find({_id: new ObjectId(req.query.orderId)}, {purchaseItems: 1, _id: 0})
        console.log(item[0].purchaseItems);
        item[0].purchaseItems.forEach(async (product) => { 
            await productCollection.updateOne({_id: product.itemId}, {$inc: {productStock: product.itemQuantity}})
        })
        await orderCollection.updateOne({_id: new ObjectId(req.query.orderId)}, {$set: {orderStatus: "Cancelled"}}, {new: true})
        res.redirect('/activeorders')
    }
    catch (err) {
        console.log(err);
    }
}

const loadOrders = async (req, res) => {
    try {
        const categoryList = await categoryCollection.find({})
        const orders = await orderCollection.find({purchaseEmail: req.session.userEmail, orderStatus: { $in: ['Delivered', 'Returned', 'Cancelled']}})
        // console.log(orders[0].purchaseItems.length);   
        res.render('orderHistory', {user: req.session.user, categories: categoryList, activeOrders: orders, userId: req.session.userId})
    }
    catch (err) {
        console.log(err);
    }
}

const loadReturnOrder = async (req, res) => {
    try {
        const categoryList = await categoryCollection.find({})
        orderId = req.query.orderId
        // productId = req.query.itemId
        res.render('returnProduct', {user: req.session.user, categories: categoryList, orderId})
    }
    catch (err) {
        console.log(err);
    }
}

const returnOrder = async (req, res) => {
    try {
        if(req.body.reason != "faulty") {
            // console.log(req.body);
            const item = await orderCollection.find({_id: new ObjectId(req.body.orderId)}, {purchaseItems: 1, _id: 0})
            console.log(item[0].purchaseItems);
            item[0].purchaseItems.forEach(async (product) => { 
                await productCollection.updateOne({_id: product.itemId}, {$inc: {productStock: product.itemQuantity}})
            })
            // await productCollection.updateOne({_id: req.body.productId}, {$inc: {productStock: 1}})
        }
        await orderCollection.updateOne({_id: new ObjectId(req.body.orderId)}, {$set: {orderStatus: "Returned"}}, {new: true})
        const orders = await orderCollection.find({_id: new ObjectId(req.body.orderId)})
        // if(orders[0].purchaseItems.length == 0) {
        //     await orderCollection.deleteOne({_id: req.body.orderId})
        // }
        res.redirect('/orderhistory') 
    }
    catch (err) {
        console.log(err);
    }
}

const generateInvoice = async (req, res) => {
    try {
        const orderId = req.body.id
        const orderDetails = await orderCollection.find({_id: new ObjectId(orderId)})
        const customerDetails = await userCollection.find({_id: req.session.userId})
        const doc = new pdfDoc()
        doc.pipe(fs.createWriteStream('PurchaseInvoice.pdf'))
        doc.fontSize(15).text('The Store Invoice', {align: 'center'})
        doc.text(' ')
        doc.text('--------------------------')
        doc.fontSize(12).text('Seller, ', {align: 'left'})
        doc.text('The Store')
        doc.text('A website')
        doc.text('Derbyshire, 32-A')
        doc.text('Email: admin@thestore.xyz')
        doc.text('--------------------------');
        doc.text('--------------------------', { align: 'right' });
        doc.text('Shipped to: ', {align: 'right'})
        doc.text(customerDetails[0].userName, {align:'right'})
        doc.text(customerDetails[0].userEmail, {align:'right'})
        doc.text(customerDetails[0].usercontact, {align:'right'})
        doc.text('--------------------------', { align: 'right' });
        doc.fontSize(12).text(`Order Id: ${orderDetails[0].orderId}`, {align: 'left'})
        doc.text('--------------------------');
    
        doc.text('Product           Quantity            Unit Price          Total Price')
        doc.text('----------------------------------------------------------------------------------------------------')
        orderDetails[0].purchaseItems.forEach((item) => {
        doc.text(`${item.itemName}              ${item.itemQuantity}                        ${item.itemPrice}                   ${item.itemPrice*item.itemQuantity}`);
        })
        
        doc.text(' ')
        doc.text(' ')
        doc.text(' ')
        doc.text(' ')
        doc.text(' ')
        doc.text(' ')
        doc.text(' ')
        doc.text(`Total:  Rs. ${orderDetails[0].totalAmount}`)

        doc.end()
        const buffer = await new Promise((resolve) => {
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename=PurchaseInvoice.pdf')
        res.send(buffer)
    }
    catch (err) {
        console.log(err);
    }
}



module.exports = {
    loadLogin,
    verifyLogin,
    loadSignup,
    loadForgotPassword,
    updatePassword,
    addNewUser,
    loadOTP,
    verifyotp,
    landingPage,
    showallproducts,
    showFilteredproducts,
    filter,
    singleProductDetails,
    productSearch,
    userLogout,
    loadProfile,
    manageAddress,
    loadNewAddress,
    newAddress,
    deleteAddress,
    loadEditAddress,
    updateAddress,
    addtoCart,
    loadCart,
    addQty,
    decQty,
    deleteFromCart,
    loadWishlist,
    addToWishlist,
    deleteFromWishList,
    loadCheckOut,
    placeOrder,
    loadActiveOrders,
    deleteOrder,
    loadOrders,
    loadReturnOrder,
    returnOrder,
    generateInvoice
}