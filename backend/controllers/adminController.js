const Product = require('../models/categoriesModel');
const consumerProduct = require('../models/productModel') 
const Designer = require('../models/designModel');
const Consumer = require('../models/consumerModel')
const Services = require('../models/serviceModel');
const subService = require('../models/subService');
const Order = require('../models/orderModel');
const Admin = require('../models/adminModel');

const transporter = require("../Config/mailconfig");
const OTP = require('../models/otpModel');
const genotp = require('../services/OtpServices');

const bcrypt = require('bcrypt');
const secretkey = process.env.SECRETKEY;



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


const signUp = async (req,res) =>{
    
    const{name, email, password,  otp} = req.body;
    const images = req.file.filename;
    try{
        const validOTP = await OTP.findOne({ otp });
        if (!validOTP || validOTP.email !== email) {
            return res.status(401).json({ message: "Invalid OTP" });
        };
        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin){
            return res.status(409).json({message:"email already registered"})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
            name,
            email,
            password:hashedPassword,
            images
       })
        await admin.save();

        await OTP.deleteOne({ otp });

        return res.status(201).json({status:"success", message:"successful registered"});

    }catch(error){
        return res.send(error);
    }
};



const login = async(req,res)=>{

    const{email, password}= req.body;
    try{
        const admin = await Admin.find({email});
        if(!admin){
            return res.status(401).send("your email is not registered");
        };
        const passMatch = await bcrypt.compare(password,admin.password)
        if((admin.email === email) && passMatch){
            const token = jwt.sign({adminId : admin._id}, secretkey, {expiresIn:"10m"});
            return res.status(200).json({status:"success",message:"you are successfull logged In",token:token});
        };
    }catch(error){
        return res.status(401).send(error.message);
    }
}


//for dashboard count totalDesigner 
const getAllDesigner = async (req,res) =>{
    try {
        const allDesigner = await Designer.find({});
        const total = allDesigner.length;
        res.status(200).send({"status":"success", "message":"total designer registers", "totalDesigner":total})
    } catch (error) {
        res.status(401).send(error.message)
    }
};

//filter designer with between tow dates
const getDesignerWithDate = async(req,res)=>{
    
    const {start, end} = req.body;

    if(!start || !end){
        return res.status(401).json({"status":"failed", "message":"all field are required"});
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    try{
        const designer = await Designer.find({createdAt:{$gt:startDate,$lte:endDate}});

        if (designer.length === 0){
            return res.status(201).json({"status":"success", "message":"no designer between this date"})
        }
        res.status(201).json({status:"success", total_designer:designer.length, data:designer });
    }catch(error){
        res.status(401).send(error.message)
    }
};


//filter designer With Name
const getDesignerWithName = async(req,res) =>{
    const {name} = req.body;

    if(!name){
        return res.status(401).json({"status":"failed", "message":"all field are required"});
    }
    try{
        const designer =await Designer.find({name:name});

        if (designer.length === 0){
            return res.status(201).json({"status":"success", "message":"name doesnot match with designer"})
        };

        res.status(201).json({status:"success", total_consumer:designer.length, Data:designer })
    }catch(error){
        res.status(401).send(error.message);
    }
}


//for dashboard count totalConsumer 
const getAllConsumer = async (req,res)=>{
    try {
        const allconsumer = await Consumer.find({});
        const total = allconsumer.length;
        res.status(200).send({"status":"success", "message":"total consumer register", "totalConsumer":total})
    } catch (error) {
        console.error(error)
        res.status(500).send("internal server error");
    }
};

//filter consumer between twodate
const filterConsumerWithDate = async(req,res) =>{

    const { startdate, enddate } =req.body;
    if(!startdate || !enddate){
        return res.status(401).json({ "status":"failed", "message":"all field is required" })
    };

    try{
        //convert like database type date
        const startDate = new Date(startdate);
        const endDate = new Date(enddate);

        const consumer = await Consumer.find(
            {createdAt:{$gt:startDate,$lte:endDate}}
        );

        if(consumer.length === 0){
            return res.status(201).json({"status":"success","message":"no consumer can registered between this Date"});
        };

        res.status(201).send(consumer)
    }catch(error){
        res.status(401).send(error.message);
    }
};


//filter consumer with name 
const filterConsumerWithName = async(req,res)=>{
    const { name } = req.body
    if(!name){
        return res.status(401).json({"status":"failed","message":"field is required"})
    };
    try{
        const consumer = await Consumer.find({name:name});
        if(consumer.length === 0){
            return res.status(201).json({"status":"success","message":"this name not match with an consumer"});
        }
        res.status(201).send(consumer);
    }catch(error){
        res.status(401).send(error.message);
    }
};


//admin add designer
const addDesigner = async (req,res) =>{
    const { name, mob, email, address, location, categories, services, subservices, Bio, password, conf_password, term_cond, otp} = req.body;
    const profile_pic = req.file.filename;

    if( !name || !mob || !email || !profile_pic || !address || !categories || !services || !subservices || !Bio || !password ||
         !conf_password || !term_cond || !otp || !location){
        return res.send("all field are required");
    }
    try{
        const designer = new Designer({
            name, 
            mob, 
            email, 
            profile_pic, 
            address,
            location: { type: 'Point', coordinates }, 
            categories, 
            services, 
            subservices, 
            Bio, 
            password:hashpassword, 
            term_cond 
        });

        const checkDesigner = await Designer.find({email});
        if(checkDesigner){
            return res.status(401).jason({status:"failed", message:"this email is already registered for designer account"});
        }
        await designer.save();
        return res.status(200).send("designer successfully added..");
    }catch(error){
        return res.status(401).send(error.message);
    }
}

//admin edit designer
//admin delete designer


//see the total_order with filter like between twodates
const totalorder = async(req,res)=>{
    const { startDate, endDate } = req.body;
    
    if(!startDate || !endDate){
        return res.status(401).json({"status":"failed","message":"all field is required"});
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    try{
        const orders = await Order.find({orderDate:{$gte:start,$lte:end}});
        const total = orders.length;

        return res.status(201).json({status:"success", total_order:total, data:orders})
        
    }catch(error){
        res.status(401).send(error.message)
    }
};

//add product at productCategory model
const addProduct = async(req,res)=>{
    const {productName } = req.body;
    const productPic = req.file.filename;
    
    try{
        const newProduct = new Product({
            productName,
            productPic
        });
        await newProduct.save();    
        return res.status(201).json({status:"success", message:"product add successfully"});

    }catch(error){
        console.error(error)
        res.status(500).send("internal server error");
    }
};

//update the product at productCateory model
const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { productName } = req.body;
        const productPic = req.file.filename;

        // Remove _id from updateProduct object
        const updateProduct = {
            productName,
            productPic
        };

        const updatedProduct = await Product.findByIdAndUpdate(id, updateProduct, { new: true });

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};


//delete the product from productCategory model
const delProduct = async(req,res)=>{
    const id = req.params.id;
    try{
        await Product.findByIdAndDelete({_id:id})
        res.status(200).send({"status":"success", "message":"successfully delete the product"})
    }catch(error){
        console.error(error)
        res.status(500).send("internal server error");
    }
};

// Admin can check total active Consumers
// Admin can check total In active Consumers
const checkConsumerStatus = async (req, res) => {
    try {
        // Query the database to count active consumers
        const activeConsumersCount = await Consumer.countDocuments({
            lastLogin: { $gte: new Date(Date.now() -  45 * 24 * 60 * 60 * 1000) }   // Consumers who have logged in within the last 45days
        });

        // Query the database to count inactive consumers
        const inactiveConsumersCount = await Consumer.countDocuments({
            lastLogin: { $lt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }   // Consumers who haven't logged in within the last 45days
        });

        // Return the counts
        return res.status(200).json({
            activeConsumers: activeConsumersCount,
            inactiveConsumers: inactiveConsumersCount
        });
    } catch (error) {
        return res.status(500).send(error.message);
    }
};


// Admin Can check the deleted Consumers.
const checkDeletedConsumer = async(req,res)=> {
    try{
        const consumer = await Consumer.find({isDeleted:true});
        const totalconsumer = consumer.length;
        return res.status(201).json({
            status:"success", message:"softdeleted consumer list", 
            total_softdeleted_consumer:totalconsumer, data:consumer
        });
    }catch(error){
        res.send(error.message);
    }
};


//add product and related service from (productCategory and service) model respectively in consumerProduct model.
const consProduct = async(req,res) =>{
    try{
        const { product, services } = req.body;
        if(!product || !services){
            return res.status(401).send("all field is required");
        }
        const newProduct = new consumerProduct({
            product,
            services
        });

        await newProduct.save();

        res.status(201).send("succesfull product add");
    }catch(error){
        res.status(401).send(error.message);
    }
};


//addservices in the serviceModel
const addServices = async(req,res) =>{
    try{
        const {serviceName , picture } = req.body;
        if(!serviceName || !picture){
            return res.status(401).send("all field is required");
        }
        const newService = new Services({
            serviceName,
            picture
        });

        await newService.save();

        res.status(201).send("successful service added");
    }catch(error){
        res.status(401).send(error.message);
    }
};

//add subservices in the subServiceModel
const addSubService = async(req,res)=>{
    const {subServiceName} =  req.body;
    if(!subServiceName){
        res.send("subServiceName is not found")
    }
    try{
        const newSubService = new subService({
            subServiceName
        });
        await newSubService.save();
        res.status(201).send("subservice add successfully")
    }catch(error){
        res.status(401).send(error.message);
    }
};



module.exports={ sendotp, signUp, login, getAllDesigner, getAllConsumer, filterConsumerWithDate, filterConsumerWithName, getDesignerWithDate, 
    getDesignerWithName, addDesigner, addProduct, editProduct, delProduct, checkConsumerStatus, checkDeletedConsumer, consProduct, addServices, 
    addSubService, totalorder };