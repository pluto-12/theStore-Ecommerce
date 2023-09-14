const adminCollection = require('../model/adminModel')
const userCollection = require('../model/userModel')
const productCollection = require('../model/productModel')
const bannerCollection = require('../model/bannerModel')
const categoryCollection = require('../model/categoryModel')
const orderCollection = require('../model/orderModel')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const fs = require('fs')
const pdfDoc = require('pdfkit')




// const addNewUser = async (req, res) => {
//     try {
//         const list = await userCollection.find({ $or: [{ userEmail: req.body.email }, { userContact: req.body.number }] })
//         // console.log(list.length);
//         if (list.length) {
//             res.redirect('/register?msg=Username%20or%20Email%20already%20taken')
//         } else {
//             const newUser = {
//                 userEmail: req.body.email,
//                 userName: req.body.username,
//                 userContact: req.body.number,
//                 userPassword: req.body.password
//             }
//             const result = await userCollection.insertMany([newUser])
//             // console.log(result);
//             // console.log(newUser);
//             res.status(200).send('success')
//         }

//     }
//     catch (err) {
//         console.log(err);
//     }
// }

const loadAdmin = async (req, res) => {
    try{
        const orderCount = await orderCollection.aggregate([
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
        ]);
        const productCount = await productCollection.aggregate([
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
        ]);
        const userCount = await userCollection.aggregate([
            { 
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
        ]);
        const totalRevenue = await orderCollection.aggregate([
            {
              $group: {
                _id: null,
                totalAmountSum: { $sum: "$totalAmount" }
              }
            }
        ]);
        if(req.query.selectedFilter) {
            if(req.query.selectedFilter == "yearly") {
                const targetYear = parseInt(req.query.selectedFilterOption)
                // console.log(targetYear);
                var allOrder = await orderCollection.aggregate([
                    {
                        $match: {
                            orderStatus: { $in: ["Delivered", "Returned", "Cancelled"] },
                            dateOfPurchase: {
                                $gte: new Date(targetYear, 0, 1), // Start of the year
                                $lt: new Date(targetYear + 1, 0, 1) // Start of the next year
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$orderStatus",
                            count: { $sum: 1 }
                        }
                    }
                ])
                var paymentType = await orderCollection.aggregate([
                    {
                        $match: {
                            paymentMethod: {$in: ['CoD', 'OnlinePayment']},
                            dateOfPurchase: {
                                $gte: new Date(targetYear, 0, 1), // Start of the year
                                $lt: new Date(targetYear + 1, 0, 1) // Start of the next year
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$paymentMethod",
                            count: { $sum: 1}
                        }
                    }
                ])
                var orders = await orderCollection.aggregate([
                    {
                        $match: {
                            dateOfPurchase: {
                                $gte: new Date(targetYear, 0, 1), // Start of the year
                                $lt: new Date(targetYear + 1, 0, 1) // Start of the next year
                            } 
                        }
                    }
                ])
                // console.log(allOrder);
            } else if(req.query.selectedFilter == "day") {
                const targetDateStr = req.query.selectedFilterOption; // Get the specific date in "yy-mm-dd" format
                const targetDate = new Date(targetDateStr); // Convert the date string to a Date object
                var allOrder = await orderCollection.aggregate([
                    {
                        $match: {
                          orderStatus: { $in: ["Delivered", "Returned", "Cancelled"] },
                          dateOfPurchase: {
                            $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()), // Start of the target date
                            $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1) // Start of the next day
                          }
                        }
                    },
                    {
                        $group: {
                            _id: "$orderStatus",
                            count: { $sum: 1 }
                        }
                    }
                ])
                var orders = await orderCollection.aggregate([
                    {
                        $match: {
                            dateOfPurchase: {
                                $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()), // Start of the target date
                                $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1) // Start of the next day
                            }
                        }
                    }
                ])
                var paymentType = await orderCollection.aggregate([
                    {
                        $match: {
                            paymentMethod: {$in: ['CoD', 'OnlinePayment']},
                            dateOfPurchase: {
                                $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()), // Start of the target date
                                $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1) // Start of the next day
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$paymentMethod",
                            count: { $sum: 1}
                        }
                    }
                ])
                // console.log(allOrder);
            } else if (req.query.selectedFilter == "monthly") {
                const targetDateStr = req.query.selectedFilterOption; // Get the specific date in "yy-mm-dd" format
                const targetDate = new Date(targetDateStr); // Convert the date string to a Date object
                const targetYear = targetDate.getFullYear();
                const targetMonth = targetDate.getMonth();
                var allOrder = await orderCollection.aggregate([
                    {
                        $match: {
                          orderStatus: { $in: ["Delivered", "Returned", "Cancelled"] },
                          dateOfPurchase: {
                            $gte: new Date(targetYear, targetMonth, 1), // Start of the target month
                            $lt: new Date(targetYear, targetMonth + 1, 1) // Start of the next month
                          }
                        }
                    },
                    {
                        $group: {
                            _id: "$orderStatus",
                            count: { $sum: 1 }
                        }
                    }
                ])
                var orders = await orderCollection.aggregate([
                    {
                        $match: {
                            dateOfPurchase: {
                                $gte: new Date(targetYear, targetMonth, 1), // Start of the target month
                                $lt: new Date(targetYear, targetMonth + 1, 1) // Start of the next month
                            }
                        }
                    }
                ])
                var paymentType = await orderCollection.aggregate([
                    {
                        $match: {
                            paymentMethod: {$in: ['CoD', 'OnlinePayment']},
                            dateOfPurchase: {
                                $gte: new Date(targetYear, targetMonth, 1), // Start of the target month
                                $lt: new Date(targetYear, targetMonth + 1, 1) // Start of the next month
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$paymentMethod",
                            count: { $sum: 1}
                        }
                    }
                ])
            }
        } else {
            var allOrder = await orderCollection.aggregate([
                {
                  $match: {
                    orderStatus: { $in: ["Delivered", "Returned", "Cancelled"] }
                  }
                },
                {
                  $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                  }
                }
            ]); 
            // console.log(allOrder);
            var paymentType = await orderCollection.aggregate([
                {
                    $match: {
                        paymentMethod: {$in: ['CoD', 'OnlinePayment']}
                    }
                },
                {
                    $group: {
                        _id: "$paymentMethod",
                        count: {$sum: 1}
                    }
                }
            ])
            var orders = await orderCollection.aggregate([
                {
                    $match: {}
                }
            ])
            // console.log(paymentType);
        }
        
        // console.log(orders);
        res.render('adminDashboard', {orderCount, productCount, userCount, totalRevenue, allOrder, paymentType, orders}) 
    }
    catch (err) {
        console.log(err);
    }
}
 


const addBanner = async (req, res) => {
    try {
        const newBanner = {
            bannerName: req.body.bannerName,
            bannerLocation: req.file.filename,
            isActive: false
        }
        await bannerCollection.insertMany([newBanner])
    }
    catch (err) {
        console.log(err);
    }
}

const getallUsers = async (req, res) => {
    try {
        const userData = await userCollection.find({})
        res.render('usersPage', { data: userData })
    }
    catch (err) {
        console.log(err);
    }
}

const changeBlockStatus = async (req, res) => {
    try {
        user = req.query.name
        const userData = await userCollection.find({ userName: user })
        // console.log(userData);
        if (userData[0].isBlocked) {
            await userCollection.updateOne({ userName: user }, { $set: { isBlocked: false } })
        } else {
            await userCollection.updateOne({ userName: user }, { $set: { isBlocked: true } })
        }

        res.redirect('/admin/usermanagement')

    }
    catch (err) {
        console.log(err);
    }
}

const getallCategories = async (req, res) => {
    try {
        const categoryData = await categoryCollection.find({})
        res.render('categoryPage', { data: categoryData })
    }
    catch (err) {
        console.log(err);
    }
}

const loadnewCategory = async (req, res) => {
    try {
        if(req.query.message) {
            res.render('addCategory', {message: "Categort Exists"})
        } else {
           res.render('addCategory') 
        }
        
    }
    catch (err) {
        console.log(err);
    }
}

const addNewCategory = async (req, res) => { 
    try {
        const list = await categoryCollection.find({ categoryName: req.body.categoryName })
        if (list.length) {
            res.redirect('/admin/newcategory?message=category%20exists')
        } else {
            // console.log(req.body);
            const newcat = {
                categoryName: req.body.categoryName,
                categoryDescription: req.body.categoryDescription,
                categoryImage: req.file.filename
            }
            await categoryCollection.insertMany([newcat])
            res.redirect('/admin/categorymanagement')
        }
    }
    catch (err) {
        console.log(err);
    }
}

const editcategory = async (req, res) => {
    try {
        const list = await categoryCollection.findOne({ _id: new ObjectId(req.query.id) })
        // console.log(list);
        res.render('editCategory', { data: list })
    }
    catch (err) {
        console.log(err);
    }
}

const deleteImage = async (req, res) => {
    try {
        const productId  = req.query.id
        const image = req.query.image
        await productCollection.findOneAndUpdate({_id: productId}, {$pull: {productImages: image}}, {new: true})
        res.redirect('/editproduct')
    }
    catch (err) {

    }
}

const updatecategory = async (req, res) => {
    try {
        if(req.body.file) {
            await categoryCollection.updateOne({_id: new ObjectId(req.body.categoryId)}, {$set: {categoryName: req.body.categoryName, categoryDescription: req.body.categoryDescription,categoryImage: req.file.filename}})
        } else {
            await categoryCollection.updateOne({_id: new ObjectId(req.body.categoryId)}, {$set: {categoryName: req.body.categoryName, categoryDescription: req.body.categoryDescription}})
        }
        res.redirect('/admin/categorymanagement')
        
    }
    catch (err) {
        console.log(err);
    }
}

const deletecategory = async (req, res) => {
    try {
        await categoryCollection.deleteOne({_id: new ObjectId(req.query.id)})
        res.redirect('/admin/categorymanagement')
    }
    catch (err) {
        console.log(err);
    }
}

const getallProducts = async( req, res) => {
    try {
        const list = await productCollection.find()
        res.render('productPage', {data: list})
    }
    catch (err) {
        console.log(err);
    }
}

const loadnewproduct = async (req, res) => {
    try {
        const list = await categoryCollection.find({}, {categoryName: 1})
        // console.log(list);
        res.render('addProduct', {categoryList: list})
    }
    catch (err) {
        console.log(err);
    }
}

const deleteproduct = async (req, res) => {
    try {
        await productCollection.deleteOne({_id: new ObjectId(req.query.id)})
        res.redirect('/admin/productmanagement')
    }
    catch (err) {
        console.log(err);
    }
}

const addNewProduct = async (req, res) => {
    try {
        const list = await productCollection.find({ productName: req.body.productName })
        if (list.length) {
            res.redirect('/admin/newproduct')
        } else {
            const filenames = req.files.map(file => file.filename)
            const newProduct = {
                productName: req.body.productName,
                productPrice: req.body.productPrice, 
                productStock: req.body.productStock,
                productDescription: req.body.productDescription,
                productImages: filenames,
                productCategory: req.body.productCategory
            }
            // console.log(newProduct);
            await productCollection.insertMany([newProduct])
            res.redirect('/admin/productmanagement')
        }
    }
    catch (err) {
        console.log(err);
    }
}


const editProduct = async (req, res) => {
    try {
        const list = await productCollection.findOne({ _id: new ObjectId(req.query.id) })
        // console.log(list);
        const catList = await categoryCollection.find({},{categoryName: 1})
        res.render('editProduct', { data: list, categoryList: catList })
    }
    catch (err) {
        console.log(err);
    }
}
 
const updateproduct = async (req, res) => { 
    try {
        // console.log(req.files);

        if(req.files) {
            const filenames = req.files.map(file => file.filename)
            console.log("here");
            console.log(filenames);
            await productCollection.updateOne({_id:  new ObjectId(req.body.productId)}, {$set: {productName: req.body.productName, productPrice: req.body.productPrice, productStock: req.body.productStock, productCategory: req.body.productCategory, productDescription: req.body.productDescription}, $push: {productImages: filenames}})
        } else {
            console.log("no");
            await productCollection.updateOne({_id:  new ObjectId(req.body.productId)}, {$set: {productName: req.body.productName, productPrice: req.body.productPrice, productStock: req.body.productStock, productCategory: req.body.productCategory, productDescription: req.body.productDescription}})
        }
        res.redirect('/admin/productmanagement')
    }
    catch {
        console.log(err);
    }
}

const loginPage = (req, res) => {
    try {
        if(req.query.msg) {
            res.render('adminLogin', {errorMessage: req.query.msg})
        } else {
            res.render('adminLogin')
        }
        
    }
    catch (err) {
        console.log(err);
    }
}

 const verifylogin = async (req, res) => {
    try {
        // console.log(req.body);
        const list = await adminCollection.find({adminName: req.body.adminUsername})
        // console.log(list);
        if(list.length) {
            if(list[0].adminPassword ==  req.body.adminPassword) {
                req.session.admin = req.body.adminUsername
                res.redirect('/admin/')
            } else {
                res.redirect('/admin/login?msg=invalid%20password')
            }
        } else {
            res.redirect('/admin/login?msg=user%20doesnt%20exist')
        }
    }
    catch (err) {
        console.log(err); 
    }
} 

const adminLogout = async (req, res) => {
    try {
        req.session.destroy(function (err) {
        if (err) {
            res.send("Error");
        } else {
            res.redirect("/admin/login")
            // console.log(req.session)
        }
        });
    }
    catch (err) {
        console.log(err);
    }
}


const getAllOrders = async (req, res) => {
    try {
        const orders = await orderCollection.find({})
        res.render('orderPage', {orders})
    }
    catch (err) {
        console.log(err);
    }
}

const loadOrderDetails = async (req, res) => {
    try {
        const order = await orderCollection.find({_id: new ObjectId(req.query.id)})
        // console.log(order[0].shippedTo);
        res.render('orderDetails', {order})
    }
    catch (err) {
        console.log(err);
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        // console.log(req.body);
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        let time  =`${day}-${month }-${year} ${hours}:${minutes}`;
        if(req.body.status == "Delivered") {
            await orderCollection.updateOne({_id: new ObjectId(req.body.orderId)}, {$set: {orderStatus: req.body.status, dateOfDelivery: Date.now()} })
        } else {
            await orderCollection.updateOne({_id: new ObjectId(req.body.orderId)}, {$set: {orderStatus: req.body.status} })
        }
        
        // res.redirect('/admin/orderdetails?id='+req.body.orderId)
        res.redirect('/admin/ordermanagement')
    }
    catch (err) {
        console.log(err);
    }
}

const generatePDF = async(req, res) => {
    try {
        let orders = req.body   
        const doc = new pdfDoc({margin: 50})
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename=Report.pdf')
        doc.pipe(res)
        doc.pipe(fs.createWriteStream('Report.pdf'))
        doc.fontSize(12).text('Report ', { align: 'center' });
        doc.text('--------------------------');
        if(req.query.key == 'delivery') {
            orders.forEach((order) => {
                doc.text(`Order Id: ${order.orderId}`)
                doc.text(`Purchase Email: ${order.purchaseEmail}`)
                doc.text(`Total Amount: ${order.totalAmount}`)
                doc.text(`Date of Delivery: ${order.dateofDelivery}`)
                doc.text(`Order Status: ${order.orderStatus}`)
                doc.text('--------------------------');
                doc.text( ' ')
                doc.text( ' ')
            })
        } else {
            orders.forEach((order) => {
                doc.text(`Order Id: ${order.orderId}`)
                doc.text(`Purchase Email: ${order.purchaseEmail}`)
                doc.text(`Total Amount: ${order.totalAmount}`)
                doc.text(`Payment Method: ${order.paymentMethod}`)
                doc.text(`Order Status: ${order.orderStatus}`)
                doc.text('--------------------------');
                doc.text( ' ')
                doc.text( ' ')
            })
        }       
        doc.end();
        console.log('PDF report generated successfully.');
    }
    catch (err) {
        console.log(err);
    }
}






module.exports = {
    loadAdmin,
    // addNewUser,
    addBanner,
    getallUsers,
    changeBlockStatus,
    getallCategories,
    loadnewCategory,
    addNewCategory,
    editcategory,
    deleteImage,
    updatecategory,
    deletecategory,
    getallProducts,
    loadnewproduct, 
    deleteproduct,
    addNewProduct,
    editProduct,
    updateproduct,
    loginPage,
    verifylogin,
    adminLogout,
    getAllOrders,
    loadOrderDetails,
    updateOrderStatus,
    generatePDF
} 