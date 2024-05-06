const Product = require('../models/categoriesModel');
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
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { isValidPassword, isValidEmail, isValidMob } = require('../Validator/validator')

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
        return res.status(500).send({ status: "error", message: error.message });
    }
};


const signUp = async (req, res) => {

    const { name, email, password, otp } = req.body;
    const image = req.file.filename;
    try {
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({ status: "false", message: "Email already exists" });
        }

        const latestOtp = await OTP.find({ email: email }).sort({ expiresAt: -1 }).limit(1);
        console.log(req.body);
        console.log(latestOtp)



        if (!latestOtp.length || latestOtp[0].otp !== parseInt(otp) || latestOtp[0].expiresAt < new Date()) {
            return res.status(401).json({ status: "false", message: "Invalid credentials or expired OTP" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            images: image
        })
        await admin.save();

        await OTP.deleteOne({ otp });

        return res.status(201).json({ status: "success", message: "successful registered" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {

        const designer = await Admin.findOne({ email });
        if (!designer) {
            return res.status(401).send({ status: "false", message: "This email is not registered" });
        }

        const passwordMatch = await bcrypt.compare(password, designer.password);

        if (designer.email === email && passwordMatch) {
            const token = jwt.sign({ designerId: designer._id }, secretkey, {
                expiresIn: "60m",
            });

            return res.status(200).send({
                status: "true",
                message: "login successful",
                token: token,
            });
        } else {
            return res
                .status(402)
                .send({ status: "false", message: "your password is incorrect" });
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
};

const filterDesignerData = async (req, res) => {
    try {
        const conditions = {};
        if (req.query.sDate && req.query.eDate) {
            conditions.createdAt = { $gt: new Date(req.query.sDate), $lte: new Date(req.query.eDate) }
        }
        if (req.query.name) {
            conditions.name = { $regex: req.query.name, $options: "i" }
        }
        //console.log(conditions);
        const projection = {
            name: 1,
            mob: 1,
            email: 1,
            profile_pic: 1
        }
        const data = await Designer.find(conditions, projection);

        return res.status(200).send({
            "Total Designer": data.length,
            data
        });
    } catch (error) {
        return res.status(401).send(error.message);
    }
};

const filterConsumerData = async (req, res) => {
    try {
        const condition = {};
        if (req.query.sDate && req.query.eDate) {
            condition.createdAt = { $gt: new Date(req.query.sDate), $lt: new Date(req.query.eDate) }
        }

        const projection = {
            name: 1,
            email: 1,
            mob: 1,
            DOB: 1,
            Gender: 1,
            lastLogin: 1
        }

        const result = await Consumer.find(condition, projection);
        return res.status(200).send({ "count": result.length, data: result });
    } catch (error) {
        return res.status(401).send(error.message);
    }
};


const addDesigner = async (req, res) => {
    try {
        const { name, mob, email, address, location, categories, services, subservices, Bio, password, otp } = req.body;
        const profile_pic = req.file.filename;

        const cate = JSON.parse(categories);
        const serv = JSON.parse(services);
        const subserv = JSON.parse(subservices);

        const existDesigner = await Designer.findOne({ email });

        if (existDesigner) {
            return res.status(409).json({ status: "false", message: "Email already exists" });
        }

        const latestOtp = await OTP.find({ email }).sort({ expiresAt: -1 }).limit(1);

        if (!latestOtp.length || latestOtp[0].otp !== parseInt(otp) || latestOtp[0].expiresAt < new Date()) {
            return res.status(401).json({ status: "false", message: "Invalid or expired OTP" });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        let coordinat = null;
        if (location) {
            coordinat = location.split(",").map(coord => parseFloat(coord.trim()));
        }

        // Mapping categories, services, and subservices to get array of ObjectIds
        const categoriesArray = cate.map(item => new mongoose.Types.ObjectId(item.value));
        const servicesArray = serv.map(item => new mongoose.Types.ObjectId(item.value));
        const subservicesArray = subserv.map(item => new mongoose.Types.ObjectId(item.value));

        const designer = new Designer({
            name,
            mob: parseInt(mob),
            email,
            profile_pic,
            address,
            location: location ? { type: "Point", coordinates: coordinat } : null,
            categories: categoriesArray,
            services: servicesArray,
            subservices: subservicesArray,
            Bio,
            password: hashpassword
        });

        await designer.save();
        await OTP.deleteOne({ otp });

        return res.status(200).json({ status: "true", message: "Successfully registered" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const totalorder = async (req, res) => {
    try {
        const conditions = {};
        if (req.query.sDate && req.query.eDate) {
            conditions.orderDate = { $gt: new Date(req.query.sDate), $lte: new Date(req.query.eDate) }
        }
        const projection = {
            _id: 0,
            createdAt: 0,
            updatedAt: 0,
            orderCompleteDate: 0,
            __v: 0
        }
        const orders = await Order.find(conditions, projection);
        const total = orders.length;

        return res.status(201).json({ status: "success", total_order: total, data: orders })
    } catch (error) {
        return res.status(401).send(error.message)
    }
};


const addProduct = async (req, res) => {
    const { productName } = req.body;
    const profile_pic = req.file.filename;
    try {
        if (!productName || !profile_pic) {
            return res.status(401).json({ "status": "false", "message": "all field is required" });
        }
        //to find product with case insensitive form
        const existing_product = await Product.find({ productName: productName }).collation({ locale: 'en', strength: 1 })
        if (Array.isArray(existing_product) && existing_product.length > 0) {
            return res.status(400).json({ "status": "false", "message": "Product already exist in the database..!" });
        }
        const newProduct = new Product({
            productName,
            productPic: profile_pic
        });
        await newProduct.save();
        return res.status(201).json({ status: "success", message: "product add successfully" });

    } catch (error) {
        console.error(error)
        return res.status(500).send("internal server error");
    }
};


const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { productName } = req.body;

        // Remove _id from updateProduct object
        const updateProduct = { productName };

        if (req.file) {
            const profile_pic = req.file.filename;
            updateProduct.productPic = profile_pic;
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, updateProduct, { new: true });

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }
        return res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};


const delProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await Product.findByIdAndDelete({ _id: id })
        return res.status(200).send({ "status": "success", "message": "successfully delete the product" })
    } catch (error) {
        console.error(error)
        return res.status(500).send("internal server error");
    }
};


const checkConsumerStatus = async (req, res) => {
    try {
        // Query the database to count active consumers
        const activeConsumersCount = await Consumer.countDocuments({
            lastLogin: { $gte: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }   // Consumers who have logged in within the last 45days
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

const checkDesignerStatus = async (req, res) => {
    try {
        const activeDesignerCount = await Designer.countDocuments({
            lastLogin: { $gte: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }   // Designer who have logged in within the last 45days
        });

        // Query the database to count inactive consumers
        const inactiveDesignerCount = await Designer.countDocuments({
            lastLogin: { $lt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }   // Designer who haven't logged in within the last 45days
        });

        // Return the counts
        return res.status(200).json({
            activeDesigners: activeDesignerCount,
            inactiveDesigners: inactiveDesignerCount
        });
    } catch (error) {
        return res.status(500).send("Internal server error" + error.message)
    }
}


const checkDeletedConsumer = async (req, res) => {
    try {
        const consumer = await Consumer.find({ isDeleted: true });
        const totalconsumer = consumer.length;
        return res.status(201).json({
            status: "success", message: "softdeleted consumer list",
            total_softdeleted_consumer: totalconsumer, data: consumer
        });
    } catch (error) {
        return res.send(error.message);
    }
};

const checkDeletedDesigner = async (req,res) => {
    try {
        const projection ={
            name:1,
            isDeleted:1,
            _id:0
        }
        const designer = await Designer.find({ isDeleted: true }).select(projection);
        const totalconsumer = designer.length;
        return res.status(201).json({
            status: "success", message: "softdeleted consumer list",
            total_softdeleted_consumer: totalconsumer, data: designer
        });
    } catch (error) {
        return res.send(error.message);
    }

}

const addServices = async (req, res) => {
    try {
        const { serviceName } = req.body;
        const profile_pic = req.file.filename;

        if (!serviceName || !profile_pic) {
            return res.status(401).send("all fields are required");
        }
        const newService = new Services({
            serviceName,
            picture: profile_pic
        });

        await newService.save();

        return res.status(201).send("successful service added");
    } catch (error) {
        return res.status(500).send("internal server error: " + error.message);
    }
};


const editService = async (req, res) => {
    try {
        const id = req.params.id;
        const { serviceName } = req.body;
        const profile_pic = req.file.filename;

        if (!serviceName || !profile_pic) {
            return res.status(401).send("all field is required");
        }

        // Remove _id from updateProduct object
        const updateProduct = {
            productName,
            picture: profile_pic
        };
        const updatedProduct = await Product.findByIdAndUpdate(id, updateProduct, { new: true });

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        };

        return res.status(200).json({ status: "true", message: "succesfully updated" });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error : " + error.message);
    }
};


const addSubService = async (req, res) => {
    const { subServiceName } = req.body;
    try {
        const newSubService = new subService({
            subServiceName
        });
        await newSubService.save();
        return res.status(200).send("subservice add successfully")
    } catch (error) {
        return res.status(500).send("Internal Server Error: " + error.message);
    }
};

const changePassword = async (req,res)=>{
    try{
        const {password, confirmPassword} = req.body;

        let validPassword = isValidPassword(password);
        if(!validPassword){
            return res.status(401).send({status:"false",message:"Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character & it should not have blank space"})
        }

        if(password !== confirmPassword){
            return res.status(401).send({status:"false", message:"confrimPassword are not matched with password"})
        }

        const admin = await Admin.findById(req.admin._id);
        const previousPassword = admin.password;

        const comparePassword = bcrypt.compare(password, previousPassword);
        if(comparePassword){
            return res.status(401).send({status:"false", message:"Enter a new password. password are matched with previous password"})
        }
        await Admin.findByIdAndUpdate(req.admin._id, { $set: { password: hashPassword } });
        const hashPassword = bcrypt.hash(password,10);


        
       

    }catch(error){
        return res.status(500).send({message:"Internal server error" , error:error.message})
    }
}



module.exports = {
    sendotp, signUp, signin,
    filterDesignerData, filterConsumerData, addDesigner, addProduct,
    editProduct, delProduct, checkConsumerStatus, checkDesignerStatus, 
    checkDeletedConsumer,checkDeletedDesigner,
    addServices, editService, addSubService, totalorder, changePassword
};


/* filterConsumerWithDate, filterConsumerWithName,getDesignerWithDate,
    getDesignerWithName,*/