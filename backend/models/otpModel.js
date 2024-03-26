const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    otp:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        default: () => new Date(+new Date() + 2 * 60 * 1000)
    }
    
});


OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("regotp", OtpSchema);
module.exports = OTP;