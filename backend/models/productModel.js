const mongoose = require('mongoose');
const Product = require('./productCategoryModel');
const Services = require('./serviceModel');

const consProductSchema = new mongoose.Schema({

    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Product,
        required:true
    },
    services:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:Services,
        required:true
    }]
});

const consProduct = mongoose.model("consProduct",consProductSchema);
module.exports = consProduct;