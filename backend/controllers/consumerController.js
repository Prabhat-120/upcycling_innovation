const Consumer = require('../models/consumerModel');
const consProduct = require('../models/productModel');
const productCategory = require('../models/productCategoryModel')
const  { ObjectId }  = require('mongoose').Types;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const genotp = require('../services/OtpServices');
const transporter = require("../Config/mailconfig");
const OTP = require('../models/otpModel');
const Designer = require('../models/designModel');
const Order = require('../models/orderModel');
const { default: mongoose } = require('mongoose');
const Services = require('../models/serviceModel');

const secretkey = process.env.SECRETKEY

//send otp
const sendotp = async (req, res) => {
    const { email } = req.body;
    try {
      if (!email) {
        return res.status(400).send({ status: "failed", message: "Email is required." });
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
  
      return res.send({ status: "success", message: "OTP sent to your email." });
    } catch (error) {
        return res.status(500).send({ status: "error", message:error.message });
    }
};
  
//register consumer
const signup = async (req, res) => {
    const {firstName, lastName, email, mob, images, DOB, Gender, password, conf_password, term_cond, otp} = req.body;

    try {
        if (!firstName || !lastName || !email || !mob  || !images || !DOB || !Gender || !password || !conf_password || !term_cond || !otp){
            return res.status(401).send("all fields are required");
        };
        console.log(req.body)
        const variotp = await OTP.findOne({ otp });
        if (!variotp) {
            return res.status(404).send("Your OTP is incorrect");
        }
        if (variotp.email === email) {
            const isExist = await Consumer.findOne({ email });
            if (isExist) {
                return res.status(401).send({ "status": "failed", "message": "This email already exists" });
            } else {
                if (password === conf_password) {
                    const hashpassword = await bcrypt.hash(password, 10);
                    
                    fullname = firstName+ " " +lastName;

                    const consumer = new Consumer({
                        name:fullname,
                        email,
                        mob,
                        images,
                        DOB,
                        Gender,
                        password: hashpassword,
                        term_cond,
                        lastLogin: new Date() 
                    });

                    await consumer.save();
                    
                    // Delete the OTP document from the OTP schema
                    await OTP.deleteOne({ otp });
                    return res.status(200).send({ "status": "success", "message": "Register Successfull" });
                } else {
                    return res.status(401).send({ "status": "failed", "message": "Confirm password does not match with the password" });
                }
            }
        } else {
            res.status(401).json({ "status": "failed", "message": "You entered an incorrect OTP and email. Check your email and OTP" });
        }
    } catch (error) {
        res.send(error.message);
    }
};

//consumer signin
const signin = async (req,res)=>{
    const {email, password } = req.body;  
    try {
        const consumer = await Consumer.findOne({email, isDeleted:false});
        if(!consumer){
            return res.send("Your email is not registered or your account deleted. contact to the admin by contactus");
        }

        const passwordMatch = await bcrypt.compare(password, consumer.password)
        if(!passwordMatch){
           return res.send("You entered the wrong password.")
        }

        const token =jwt.sign({consumerId:consumer._id}, secretkey, {expiresIn:"20m"});

        consumer.lastLogin = new Date();
        await consumer.save();

        return res.status(201).send({"status":"success","message":"Login successful!", "token":token});
    } catch (error) {
        res.status(500).send(error.message);
    }
};

//send link for reset password
const sendLinkResetPassword = async(req,res)=>{
    const {email} = req.body;
    try{
        const consumer = await Consumer.findOne({email});
        if(consumer){
    
            const link = `http://localhost:3000/designer/resetpassword/${consumer._id}`
            console.log(link);
    
            const info = await transporter.sendMail({
                from:"prabhatpanigrahi120@gmail.com",   
                to:consumer.email,
                subject:"login-password reset",
                html:`<a href=${link}>Click here</a>to Reset your password` 
            });
    
            res.status(200).send({"status":"success", "message":"reset password link share with your gmail account"})
        }else{
            res.status(406).send({"status":"failed", "message":"enter your registered gmail account"})
        }
    }catch(error){
        res.send(error.message);
    }
};

//reset the password
const resetPassword = async (req,res) =>{
    const {password, conf_password} = req.body;
    const {id} = req.params;
    try{
        if(password === conf_password){
            const consumer = await Consumer.findById(id);
            const previousPassword = consumer.password;
            const checkPreviousPass = await bcrypt.compare(password,previousPassword);
            if(checkPreviousPass){
                return res.status(406).send("enter a new password. your password are same with previous password");
            }else{
                const hashPassword = await bcrypt.hash(password, 10);
                await Consumer.findByIdAndUpdate(consumer.id,{$set:{password:hashPassword}});
                return res.status(200).send({"status":"success", "message":"your password successfull reset"})
            }
        }else{
            return res.status(401).send("password and conf_password are not matched")
        }
    }catch(error){
        return res.status(500).send(error.message);
    }
};

//change password
const changePassword = async(req,res)=>{
    const { newPassword, confPassword } = req.body;
    try {
        if(newPassword !== confPassword){
            return res.status(406).send("newPassword and confPassword are not same.")
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        await Consumer.findByIdAndUpdate(req.consumer._id, {$set:{password:hashPassword}});
        return res.status(200).send("successfully change password");

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};


//get all products from productCategory which admin are push
const getAllProducts = async (req,res)=>{
    try{
        const result= await productCategory.find({});
        res.send(result);
    }catch(error){
        res.status(500).send(error.message)
    }
};


//get all services at home page
const getAllServices = async(req,res)=>{
    try{
        const result = await Services.find({},{_id:0});
        res.send(result);
    }catch(error){
        res.status(500).send(error.message);
    }
}


//get all related services when click on product
const getService = async (req, res) => {
    const {productId} = req.body;
    try {
        const result = await consProduct.find({ product: productId }, { services: 1, _id: 0 }).populate('services');
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


/* important:  db.designers.find({ "services": { $elemMatch: { $eq: ObjectId("65d2e2fa4d7d745fb3c83f26") } } });        
await Designer.find({services:{$elemMatch:{$eq:"65d2e2fa4d7d745fb3c83f26"}}});
*/


//find nearest tailor/designer
/*const getDesigner = async (req, res) => {
    const { longitude, latitude, serviceId } = req.body;
    try {
        const tailor_data = await Designer.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    key: "location",
                    maxDistance: parseFloat(1000) * 1609,
                    query: { "services": { $elemMatch: { $eq:serviceId} } },
                    distanceField: "dist.calculated",
                    spherical: true
                }
            }
        ]);
        return res.status(200).json({ success: true, msg: "Tailor details", data: tailor_data });

    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error occurred", error: error.message });
    }
};

*/

const getDesigner = async (req, res) => {
    const { longitude, latitude } = req.body;
    try {
        const tailor_data = await Designer.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    key: "location",
                    maxDistance: parseFloat(1000) * 1609,
                    //query: { "services": { $elemMatch: { $eq:serviceId} } },
                    distanceField: "dist.calculated",
                    spherical: true
                }
            },
            {
                $project: {
                    password: 0, // Exclude the password field
                    _id: 0, // Exclude the _id field
                    term_cond:0,
                    createdAt:0,
                    updatedAt:0,
                    __v:0
                }
            }
        ]);
        return res.status(200).json({ success: true, msg: "Tailor details", data: tailor_data });

    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error occurred", error: error.message });
    }
};

//add photo
//add video

//give order to designer
const giveOrder = async(req,res)=>{
    const { orderDesc, photo, video,  tailorId, productId, serviceId  } = req.body;
    try{
        const newOrder = new Order({
            orderDesc,
            photo,
            video,
            productId,
            serviceId,
            consumerId:req.consumer._id,
            tailorId,
            status:"pending",
            orderDate:Date.now(),
            orderCompleteDate:null
        });

        await newOrder.save();

        res.status(201).send("order placed successfull.waiting for designer confirmation.");

    }catch(error){
        res.status(400).send(error.message)
    }
};


//checkorder status
//1.for continued order
const processingOrder = async (req,res)=>{
    try{
        const orders = await Order.find(
            {$and:[
                { consumerId: req.consumer._id },
                {status: { $in: ["pending", "processing", "confirm"] } }
            ]}
        );
        if(orders.length > 0){
            return res.status(201).send(orders)
        }else{
            return res.status(404).send("No pending or processing orders found.");
        }
    }catch(error){
        res.status(401).send(error.message)
    }
};

//check previous order
const previousOrder = async (req,res)=>{
    try{
        const orders = await Order.find(
            {$and:[
                { consumerId: req.consumer._id },
                {status: { $in: ["completed", "canceled"] } }
            ]}
        );
        if(orders.length > 0){
            return res.status(200).send(orders)
        }else{
            return res.status(404).send("No complete or canceled orders found.");
        }
    }catch(error){
        res.status(401).send(error.message)
    }
};


//contatus api send contact details to admin
const contactUs = async(req,res)=>{
    try {
        const {name,email,number} = req.body;
        
        if (name,email,number){
            const info = await transporter.sendMail({
                from:"prabhatpanigrahi120@gmail.com",
                to:"prabhatpanigrahi120@gmail.com",
                subject:"contact to this person",
                html:`<h1>consumer data <br> name: ${name} <br> email: ${email} <br> number: ${number}</h1>` 
            })
        return res.send({"status":"success","message":"for contact the person "+name});
        }else{
            return res.send("all field is required");
        }
    } catch (error) {
        res.status(401).send(error.message);
    }
};



module.exports = { sendotp, signup, signin,sendLinkResetPassword, resetPassword, changePassword, getAllServices, getAllProducts, getService, getDesigner,
     giveOrder, processingOrder, previousOrder, contactUs };



//order collection me productID or serviceId add karna hai(mid-sem internal)

