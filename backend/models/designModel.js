const mongoose = require('mongoose');


const designerSchema = new mongoose.Schema({
    name:{
        type:String,
        default:null
    },
    mob:{
        type:Number,
        default:null
        
    },
    email:{
        type:String,
        default:null
    },
    profile_pic:{
        type:String,
        default:null
    },
    address:{
        type:String,
        default:null
    },
    location:{
        type:{type:String,default:null},
        coordinates:[]
    },
    categories:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    services:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Services'
    }],
    subservices:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subService'
    }],
    Bio:{
        type:String,
        default:null
    },
    password:{
        type:String,
        default:null
    }

},
{timestamps:true});


designerSchema.index({location:"2dsphere"});
const Designer = mongoose.model("Designers",designerSchema);

module.exports = Designer;