const mongoose = require('mongoose');
const Designer = require('./designModel');
const Consumer = require('./consumerModel');
const Category = require('./categoriesModel');
const Service = require('./serviceModel');

const orderSchema = new mongoose.Schema({
    orderDesc:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    productCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Category,
        default:null
    },
    service:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Service,
        default:null
    },
    consumerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Consumer,
        required:true
    },
    tailorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Designer,
        required:true
    },
    status:{
        type:String,
        default:"pending",
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now(),
        required:true
    },
    orderCompleteDate:{
        type:String,
        default:null,
        
    }
},{timestamps:true});

const Order = mongoose.model('order',orderSchema);
module.exports=Order;