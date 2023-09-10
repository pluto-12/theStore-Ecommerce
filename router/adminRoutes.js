const express = require('express')
const adminRouter = express();
const multer = require('multer')
const session = require('express-session')
const { v4: uuid4} = require('uuid')
const adminMiddleware = require('../middleware/admin/adminAuth')

adminRouter.set('view engine', 'ejs')
adminRouter.set('views', './views/admin')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(req.body.productName) {
            cb(null, './public/assets/productImages')
        } else if (req.body.bannerName) {
            cb(null, './public/assets/bannerImages')
        } else if(req.body.categoryName) {
            cb(null, './public/assets/categoryImages')
        }
    },
    filename: (req, file, cb) => {
        if(req.body.productName) {
            cb(null, `${req.body.productName}-${file.originalname}`)
        } else if(req.body.bannerName) {
            cb(null, `${req.body.bannerName}-${file.originalname}`)
        } else if(req.body.categoryName) {
            cb(null, `${req.body.categoryName}-${file.originalname}`)
        }
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
})

const upload = multer({storage})

const adminController = require('../controller/adminController')
const bannerController = require('../controller/admin/bannerController')
const couponController = require('../controller/admin/couponController')
const errorController = require('../controller/admin/errorController')

adminRouter.use((req, res, next) => {
    if(!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    }
    next();
})

adminRouter.use(session({
    secret: uuid4(),
    resave: false,
    saveUninitialized: true
}))



adminRouter.get('/', adminMiddleware.isLogout, adminController.loadAdmin)



adminRouter.get('/addbanner', (req, res) => {
    res.send('ok')
})

adminRouter.post('/addbanner', upload.single('file'),  adminController.addBanner) 

adminRouter.get('/usermanagement', adminMiddleware.isLogout, adminController.getallUsers)
adminRouter.get('/block', adminMiddleware.isLogout, adminController.changeBlockStatus)

adminRouter.get('/categorymanagement', adminMiddleware.isLogout, adminController.getallCategories)
adminRouter.get('/newcategory', adminMiddleware.isLogout, adminController.loadnewCategory)
adminRouter.post('/newcategory',  upload.single('file'), adminController.addNewCategory)
adminRouter.get('/editcategory', adminMiddleware.isLogout, adminController.editcategory)
adminRouter.post('/updatecategory',upload.single('file'), adminController.updatecategory)  
adminRouter.get('/deletecategory', adminMiddleware.isLogout, adminController.deletecategory)

adminRouter.get('/productmanagement', adminMiddleware.isLogout, adminController.getallProducts)
adminRouter.get('/newproduct', adminMiddleware.isLogout, adminController.loadnewproduct)
adminRouter.post('/newproduct', adminMiddleware.isLogout, upload.array('file',4) , adminController.addNewProduct)
adminRouter.get('/deleteproduct', adminMiddleware.isLogout, adminController.deleteproduct)  
adminRouter.get('/editproduct', adminMiddleware.isLogout, adminController.editProduct)
adminRouter.post('/updateproduct',  upload.array('file', 4), adminController.updateproduct)
adminRouter.get('/deleteimage', adminController.deleteImage) 

adminRouter.get('/ordermanagement', adminMiddleware.isLogout, adminController.getAllOrders)
adminRouter.get('/orderdetails', adminMiddleware.isLogout, adminController.loadOrderDetails)
adminRouter.post('/updatestatus', adminController.updateOrderStatus)


adminRouter.get('/login', adminMiddleware.isLogin, adminController.loginPage)
adminRouter.post('/verifylogin',adminMiddleware.isLogin, adminController.verifylogin)
adminRouter.get('/logout', adminController.adminLogout)

adminRouter.post('/generatepdf', adminMiddleware.isLogout,  adminController.generatePDF) 

adminRouter.get('/bannermanagement', adminMiddleware.isLogout, bannerController.loadBanner)
adminRouter.get('/newbanner', adminMiddleware.isLogout, bannerController.loadAddNewBanner)
adminRouter.post('/newbannersave', upload.single('file'), bannerController.saveNewBanner)
adminRouter.get('/changestatus', bannerController.updateStatus)

adminRouter.get('/couponmanagement', adminMiddleware.isLogout, couponController.loadCoupons) 
adminRouter.get('/newcoupon', adminMiddleware.isLogout, couponController.loadNewCoupon)
adminRouter.post('/newcoupon', couponController.saveNewCoupon)
adminRouter.get('/couponstatus', couponController.changeCouponStatus)



module.exports = adminRouter