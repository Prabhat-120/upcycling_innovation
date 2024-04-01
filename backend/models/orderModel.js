const mongoose = require('mongoose');
const Designer = require('./designModel');
const Consumer = require('./consumerModel');

const orderSchema = new mongoose.Schema({
    orderDesc:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    video:{
        type:String,
        required:true
    },
    productCategory:{
        type:String
    },
    service:{
        type:String
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