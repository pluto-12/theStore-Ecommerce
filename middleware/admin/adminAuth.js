
const isLogin = (req, res, next) => {
    if(req.session.admin) {
        res.redirect('/admin/')
    } else {
        // console.log("here");
        next();
    }
}

const isLogout = (req, res, next) => {
    if(req.session.admin) {
        next()
    } else {
        res.redirect('/admin/login')
    }
}

module.exports = {isLogin, isLogout} 