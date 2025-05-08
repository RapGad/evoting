const mongoose = require('mongoose')


const CategorySchema = new mongoose.Schema({
    name: String,
    categoryType: String

})


module.exports = mongoose.model('Category', CategorySchema)