const genotp = require('../services/OtpServices');
const OTP = require('../models/otpModel');
const transporter = require("../Config/mailconfig");


const sendotp = async (email) => {
    try {
        if (!email) {
            throw new Error("Email is required.");
        }
        const newotp = new OTP({
            otp: genotp(),
            email
        });
        await newotp.save();
        // Send OTP to email
        const info = await transporter.sendMail({
            from: "prabhatpanigrahi120@gmail.com",
            to: email,
            subject: "Verification Email",
            html: `<h1>Please confirm your OTP</h1>
        <p>Here is your OTP code: ${newotp.otp}</p>`,
        });
        return { status: "success", message: "OTP sent to your email." };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports=sendotp;
