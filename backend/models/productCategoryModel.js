const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },productPic:{
        type:String,
        required:true
    }
},{timestamps:true});

const Product = mongoose.model("products",productSchema);

module.exports = Product;