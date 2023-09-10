const categoryCollection = require('../../model/categoryModel')


const loadErrorPage = async (req, res) => {
    const categoryList = await categoryCollection.find({})
    res.render('errorPage', {categories: categoryList, user: req.session.user})
}


module.exports = {
    loadErrorPage
}