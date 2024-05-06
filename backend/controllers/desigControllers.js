const Designer = require("../models/designModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const genotp = require("../services/OtpServices");
const transporter = require("../Config/mailconfig");
const OTP = require("../models/otpModel");
const Product = require("../models/categoriesModel");
const Services = require("../models/serviceModel");
const SubService = require("../models/subService");
const secretkey = process.env.SECRETKEY;
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const { isValidPassword, isValidEmail } = require('../Validator/validator')

//for send otp to gmail verify and register the designer account
const sendotp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).send({ status: "failed", message: "Email is required." });
    }

    let validEmail = isValidEmail(email);
    if (!validEmail) {
      return res.status(400).json({
        status: "false",
        message: "please enter correct email patteren",
      });
    }

    const newotp = new OTP({
      otp: genotp(),
      email,
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


function parseToArray(input) {
  if (!input) {
    return [];
  }
  if (Array.isArray(input)) {
    console.log(input);
    return input.map(item => new mongoose.Types.ObjectId(item.trim(), console.log(item)));

  } else if (typeof input === 'string') {
    console.log(input);
    const items = input.split(',');
    return items.map(item => new mongoose.Types.ObjectId(item.trim()));
  } else {
    throw new Error("Invalid input type for categories, services, or subservices");
  }
}

//For Designer register
const signup = async (req, res) => {
  try {
    const { name, mob, email, address, location, Bio, password, otp, profile_pic } = req.body;
    //const profile_pic = req.file.filename;
    console.log(req.body)

    const categories = req.body.categories;
    const services = req.body.services;
    const subservices = req.body.subservices;

    const categoriesArray = parseToArray(categories);
    const servicesArray = parseToArray(services);
    const subservicesArray = parseToArray(subservices);

    let validEmail = isValidEmail(email);
    if (!validEmail) {
      return res.status(400).json({
        status: "false",
        message: "please enter correct email patteren",
      });
    }
    const existDesigner = await Designer.findOne({ email });
    if (existDesigner) {
      return res.status(409).json({ status: "false", message: "Email already exists" });
    }

    const latestOtp = await OTP.find({ email }).sort({ expiresAt: -1 }).limit(1);
    if (!latestOtp.length || latestOtp[0].otp !== parseInt(otp) || latestOtp[0].expiresAt < new Date()) {
      return res.status(401).json({ status: "false", message: "Invalid or expired OTP" });
    }

    let validPassword = isValidPassword(password);
    if (!validPassword) {
      return res.status(400).json({
        status: "false",
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);

    let coordinat = null;
    if (location) {
      coordinat = location.split(",").map(coord => parseFloat(coord.trim()));
    }

    // Mapping categories, services, and subservices to get array of ObjectIds
<<<<<<< HEAD
    
=======


>>>>>>> flutter_demo
    console.log(req.body);
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
    console.log(req.body)
    return res.status(500).json({ message: error.message });
  }
};


const getCategories = async (req, res) => {
  try {
    const result = await Product.find();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getService = async (req, res) => {
  try {
    const result = await Services.find();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const getSubService = async (req, res) => {
  try {
    const result = await SubService.find();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//for login
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {

    let validEmail = isValidEmail(email);
    if (!validEmail) {
      return res.status(400).json({
        status: "false",
        message: "please enter correct email patteren",
      });
    }

    let validPassword = isValidPassword(password);
    if (!validPassword) {
      return res.status(400).json({
        status: "false",
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    const designer = await Designer.findOne({ email });
    if (!designer) {
      return res.status(401).send({ status: "false", message: "This email is not registered" });
    };
    const passwordMatch = await bcrypt.compare(password, designer.password);
    if (designer.email === email && passwordMatch) {
      const token = jwt.sign({ designerId: designer._id }, secretkey, { expiresIn: "60m" });
      designer.lastLogin = new Date();
      await designer.save();

      return res.status(200).send({ status: "true", message: "login successful", token: token, });
    } else {
      return res.status(402).send({ status: "false", message: "your password is incorrect" });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//link send to gmail for reset password
const sendOtpForResetPass = async (req, res) => {
  const { email } = req.body;
  try {
    let validEmail = isValidEmail(email);
    if (!validEmail) {
      return res.status(400).json({
        status: "false",
        message: "please enter correct email patteren",
      });
    }
    const designer = await Designer.findOne({ email });

    if (designer) {
      // const link = `http://localhost:3000/designer/resetpassword/${designer._id}`;
      // console.log(link);
      const newotp = new OTP({
        otp: genotp(),
        email,
      });
      await newotp.save();
      const info = await transporter.sendMail({
        from: "prabhatpanigrahi120@gmail.com",
        to: designer.email,
        subject: "login-password reset",
        //  html: `<a href=${link}>Click here</a> to Reset your password`,
        html: `<h1>Please confirm your OTP</h1>
        <p>Here is your OTP code: ${newotp.otp}</p>`,
      });
      return res
        .status(200)
        .send({
          status: "true",
          message: "reset password otp share with your gmail account",
        });
    } else {
      return res
        .status(406)
        .send({
          status: "false",
          message: "enter your registered gmail account",
        });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//verify otp for resetpassword
const verifyOtpResetPass = async (req, res) => {
  const { otp, email } = req.body;
  try {
    let validEmail = isValidEmail(email);
    if (!validEmail) {
      return res.status(400).json({
        status: "false",
        message: "please enter correct email patteren",
      });
    }
    const otpDocument = await OTP.findOne({ email, otp });       // Find the OTP document by email and OTP value
    if (!otpDocument) {
      return res.status(404).send({ "status": "false", "message": "OTP not found or expired" });
    }

    // Check if the OTP has expired
    if (otpDocument.expiresAt < new Date()) {
      return res.status(401).send({ "status": "false", "message": "OTP expired" });
    }
    //await OTP.deleteOne({ email, otp });
    return res.status(200).send({ "status": "true", "message": "OTP verified successfully" });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//reset the password
const resetpassword = async (req, res) => {
  const { email, password, conf_password } = req.body;
  // const { id } = req.params;
  try {
    let validPassword = isValidPassword(password);
    if (!validPassword) {
      return res.status(400).json({
        status: "false",
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    if (password === conf_password) {
      // const designer = await Designer.findOne(id);
      const designer = await Designer.findOne({ email });
      const previousPassword = designer.password;
      const checkPreviousPass = await bcrypt.compare(
        password,
        previousPassword
      );

      if (checkPreviousPass) {
        return res
          .status(406)
          .send({ status: "false", message: "enter a new password. your password are same with previous password" });
      } else {
        const hashPassword = await bcrypt.hash(password, 10);
        await Designer.findByIdAndUpdate(designer._id, {
          $set: { password: hashPassword },
        });
        return res.status(200).send({
          status: "true",
          message: "your password successfull reset",
        });
      }
    } else {
      return res.status(401).send({ status: "false", message: "password and conf_password are not matched" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

//for change password
const changePassword = async (req, res) => {
  const { newPassword, confPassword } = req.body;
  try {
    let validPassword = isValidPassword(newPassword);
    if (!validPassword) {
      return res.status(400).json({
        status: "false",
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }
    if (newPassword !== confPassword) {
      return res.status(406).send({ status: "false", message: "confPassword not match with newPassword." });
    }
    const designer = await Designer.findById(req.designer._id);
    const prevPassword = designer.password;
    const checkPreviousPass = await bcrypt.compare(newPassword, prevPassword);

    if (checkPreviousPass) {
      return res.status(400).send({ status: "false", message: "enter a new password. your password are same with previous password" });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await Designer.findByIdAndUpdate(req.designer._id, { $set: { password: hashPassword }, });

    return res.status(200).send({ status: "false", message: "successfully change password" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
};

//manage service at my profile
const addServices = async (req, res) => {
  const { serviceId } = req.body;
  try {
    const ser = await Services.findById(serviceId);
    if (!ser) {
      return res.status(400).json({ status: "false", message: "Service Not Found..!!" });
    }

    const designer = await Designer.findById(req.designer._id);

    //check if service is alredy exits in the designer data
    const checkDuplicate = designer.services.includes(serviceId);
    if (checkDuplicate) {
      return res.status(400).json({ status: "false", message: "Service is alredy exist..!!" });
    }

    designer.services.push(serviceId);                                        //single data is added
    await designer.save();
    return res.status(201).json({ status: "false", message: "Service added successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteService = async (req, res) => {
  const { serviceId } = req.body;
  try {
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("Designer not found");
    }
    const repo = designer.services.includes(serviceId);
    if (!repo) {
      return res.status(404).json({ message: "Service Not Found in the designer data..!!" });
    }

    designer.services.pull(serviceId); //only for single service delete
    await designer.save();
    return res.status(201).json({ message: "Service delete successfully" });
  } catch (error) {
    return res.send(error.message);
  }
};

const getAllServices = async (req, res) => {
  try {
    const designer = await Designer.findById(req.designer._id).populate("services");
    if (!designer) {
      return res.send("Designer not found");
    }
    return res.send(designer.services);
  } catch (err) {
    return res.send(err.message);
  }
};

//manage product_categories at my profile
const addProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    const prod = await Product.findById(productId);
    if (!prod) {
      return res.status(400).json({ message: "Prdouct Not Found..!!" });
    }
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("Designer not found");
    }
    //check if category is alredy exits in the designer data
    const repo = designer.categories.includes(productId);
    if (repo) {
      return res.status(400).json({ message: "product_categorie is alredy exist..!!" });
    }
    designer.categories.push(productId);
    await designer.save();
    return res.status(201).json({ message: "product_categorie add successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const delProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("designer not found");
    }
    const repo = designer.categories.includes(productId);
    if (!repo) {
      return res.status(404).json({ message: "product_categorie Not Found in the designer data..!!" });
    }
    designer.categories.pull(productId);
    await designer.save();
    return res.send("product deleted successfully");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const designer = await Designer.findById(req.designer._id).populate(
      "categories"
    );

    if (!designer) {
      return res.send("designer not found");
    }
    return res.send(designer.categories);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const addSubService = async (req, res) => {
  const { subServicesId } = req.body;
  try {
    const subSer = await SubService.findById(subServicesId);
    if (!subSer) {
      return res.status(400).json({ message: "Sub Service Not Found..!!" });
    }
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("Designer not found");
    }
    //check if category is alredy exits in the designer data
    const repo = designer.subservices.includes(subServicesId);
    if (repo) {
      return res.status(400).json({ message: "subService is alredy exist..!!" });
    }
    designer.subservices.push(subServicesId);
    await designer.save();
    return res.status(201).json({ message: "subService add successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const delSubService = async (req, res) => {
  const { subServicesId } = req.body;
  try {
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("Designer not found");
    }
    const repo = designer.subservices.includes(subServicesId);
    if (!repo) {
      return res.status(404).json({ message: "Sub Service Not Found in the designer data..!!" });
    }
    designer.subservices.pull(subServicesId);
    await designer.save();
    return res.status(201).json({ message: "subService delete successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllSubService = async (req, res) => {
  try {
    const designer = await Designer.findById(req.designer._id).populate(
      "subservices"
    );

    if (!designer) {
      return res.send("designer not found");
    }
    return res.send(designer.subservices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//designer update the bio which is give at registraion time
const updateBio = async (req, res) => {
  try {
    const { updateBio } = req.body;
    await Designer.findByIdAndUpdate(req.designer._id, {
      $set: { Bio: updateBio },
    });
    return res.send("Your Bio was successfully updated.");
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const getDesigner = async (req, res) => {
  try {
    const projection = {
      name: 1,
      profile_pic: 1,
      _id: 0
    }
    const result = await Designer.findById(req.designer._id).select(projection);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).json({ status: "false", message: error.message });
  }
}


//find order order list
const latestOrder = async (req, res) => {
  try {
    const result = await Order.find({
      tailorId: req.designer._id,
      status: "pending",
    }).populate([{ path: 'consumerId', select: 'images name -_id' }]);

    if (result.length === 0) {
      return res.send({ message: "tailor does not have latest order", status: "empty" });
    }

    return res
      .status(201)
      .send({ data: result });
  } catch (error) {
    return res.status(401).send(error.message);
  }
};

//designer can update the order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const tailorId = req.designer._id;

    const result = await Order.updateOne(
      { _id: orderId, tailorId: tailorId },
      { $set: { status: status } }
    );
    if (result.nModified === 0) {
      return res.status(404).json({ message: "Order not found or unauthorized to update" });
    }
    return res.send({
      message: "Your status was successfully updated.",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

//desginer can see the previous order
const previousOrder = async (req, res) => {
  try {
    const orders = await Order.find({
      $and: [
        { tailorId: req.designer._id },
        { status: { $in: ["completed", "canceled"] } },
      ],
    }).populate([{ path: 'consumerId', select: 'images name -_id' }]);

    if (orders.length === 0) {
      return res.status(202).send({ message: "does not have any previous order", status: "empty" });
    }

    return res.status(201).send({"status":true, messaage:"successfull listed", data:orders});
  } catch (error) {
    return res.status(401).send(error.message);
  }
};

//notification throw gmail
const sendNotification = async (req, res) => {
  try {
    const result = await Order.findOne({
      $and: [
        { tailorId: req.designer._id },
        { status: { $in: ["confirm", "canceled"] } },
      ],
    }).populate("consumerId");

    if (!result) {
      return res.status(201).send("you does not have any order");
    }
    if (result.status === "confirm" || result.status === "canceled") {
      const info = await transporter.sendMail({
        from: "prabhatpanigrahi120@gmail.com",
        to: result.consumerId.email,
        subject: "for your order status",
        html: `<h1>your order ${result.status}</h1>`,
      });
      return res.send({
        status: "success",
        message: "your order is " + result.status,
      });
    }
  } catch (error) {
    return res.status(401).send(error.message);
  }
};

module.exports = {
  signup, sendotp, getCategories, getService, getSubService, signin, sendOtpForResetPass, verifyOtpResetPass, resetpassword, getDesigner, changePassword, addServices, deleteService, getAllServices,
  addProduct, delProduct, getAllProduct, addSubService, delSubService, getAllSubService, updateBio, latestOrder,
  updateOrderStatus, previousOrder, sendNotification, getCategories
};
