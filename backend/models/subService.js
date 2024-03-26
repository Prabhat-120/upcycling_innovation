const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema({
    subServiceName:{
        type:String,
        required:true
    }
},{timestamps:true});

const subService = mongoose.model("subService",subServiceSchema);
module.exports = subService;

