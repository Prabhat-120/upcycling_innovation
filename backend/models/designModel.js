const mongoose = require('mongoose');
const Product = require('./productCategoryModel');
const Services = require('./serviceModel');
const subService = require('./subService');

const designerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mob:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    profile_pic:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    location:{
        type:{type:String,require:true},
        coordinates:[]
    },
    categories:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:Product,
        required:true
    }],
    services:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:Services,
        required:true
    }],
    subservices:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:subService,
        required:true
    }],
    Bio:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    term_cond:{
        type:Boolean,
        required:true
    },

},
{timestamps:true});


designerSchema.index({location:"2dsphere"});
const Designer = mongoose.model("Designers",designerSchema);

module.exports = Designer;