require('dotenv').config()
const express = require ('express')
const app = express()
const path = require('path')
const helmet = require('helmet')


const mongoose = require('mongoose')
// mongoose.connect('mongodb://127.0.0.1:27017/storeApp')
    mongoose.connect(process.env.dbConnectionString)
    .then(() => {
        console.log("database connected");
    })
    .catch( (err) => {
        console.log("database connection error", err);
    })

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/assets', express.static(path.join(__dirname, 'public/assets')))
app.use('/static',  express.static(path.join(__dirname, 'public')))

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"],
//     }
// }))


const userRoute = require('./router/userRoutes') 
app.use('/', userRoute)

const adminRoute = require('./router/adminRoutes')
app.use('/admin', adminRoute)

app.listen(process.env.port, () =>  {
    console.log(`server running at http://localhost:${process.env.port}/`);    
}) 
