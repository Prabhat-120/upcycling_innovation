const otpGen = require("otp-generator");
const genotp = ()=>{
     return otpGen.generate(4, { digits:true, lowerCaseAlphabets:false, upperCaseAlphabets:false, specialChars:false });
}

module.exports = genotp;
