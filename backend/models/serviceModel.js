const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceName:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        required:true
    }
},{timestamps:true});

const Services = mongoose.model("Services",serviceSchema);

module.exports = Services;