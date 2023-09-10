const userCollection = require("../../model/userModel")


const isLogin = (req, res, next) => {
    if(req.session.user) {
        res.redirect('/')
    } else {
        // console.log("here");
        next();
    }
}

const isLogout = (req, res, next) => {
    if(req.session.user) {
        next()
    } else {
        res.redirect('/login') 
    }
}

const isBlocked = async (req, res, next) => {
    const list = await userCollection.find({_id: req.session.userId})
    // console.log(list);

    if(list[0].isBlocked == false) {
        next();
    } else {
        res.redirect('/login')
    }
} 

module.exports = {isLogin, isLogout, isBlocked} 