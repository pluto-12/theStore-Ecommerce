const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bannerCollection = require('../../model/bannerModel')

const loadBanner = async (req, res) => {
    try {
        const bannerList = await bannerCollection.find({})
        // console.log(bannerList);
        res.render('bannerPage', {bannerList})
    }
    catch (err) {
        console.log(err);
    }
}

const loadAddNewBanner = async (req, res) => {
    try {
        res.render('newBanner')
    }
    catch (err) {
        console.log(err);
    }
}

const saveNewBanner = async (req, res) => {
    try {
        const newBanner = {
            bannerName: req.body.bannerName,
            bannerLocation: req.file.filename,
            isActive: true
        }
        await bannerCollection.insertMany([newBanner])
        res.redirect('/admin/bannermanagement')
    }
    catch (err) {
        console.log(err);
    }   
}

const updateStatus = async (req, res) => {
    try {
        const id = req.query.id
        bannerDetails = await bannerCollection.find({_id: new ObjectId(id)})
        // console.log(bannerDetails);
        if(bannerDetails[0].isActive) {
            await bannerCollection.updateOne({_id: new ObjectId(id)}, {$set: {isActive: false}})
        } else {
            await bannerCollection.updateOne({_id: new ObjectId(id)}, {$set: {isActive: true}})
        }
        res.redirect('/admin/bannermanagement')
    } 
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadBanner,
    loadAddNewBanner,
    saveNewBanner,
    updateStatus
}