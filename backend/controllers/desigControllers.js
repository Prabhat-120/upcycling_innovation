const Designer = require("../models/designModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const genotp = require("../services/OtpServices");
const transporter = require("../Config/mailconfig");
const OTP = require("../models/otpModel");
const Order = require("../models/orderModel");
const { isValidPassword, isValidEmail } = require("../Validator/validator");
const Product = require("../models/productCategoryModel");
const Services = require("../models/serviceModel");
const subService = require("../models/subService");

const secretkey = process.env.SECRETKEY;

//for send otp to gmail verify and register the designer account
const sendotp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res
        .status(400)
        .send({ status: "failed", message: "Email is required." });
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

//For Designer register
const signup = async (req, res) => {
  try {
    const {
      name,
      mob,
      email,
      address,
      location,
      categories,
      services,
      subservices,
      Bio,
      password,
      conf_password,
      term_cond,
      otp,
    } = req.body;

    const profile_pic = req.file ? req.file.filename : null;

    if (
      !name ||
      !mob ||
      !email ||
      !profile_pic ||
      !address ||
      !location ||
      !categories ||
      !services ||
      !subservices ||
      !Bio ||
      !password ||
      !conf_password ||
      !term_cond ||
      !otp
    ) {
      return res.send("all field are required 123");
    }

    //validat email format ex: @gamil.com
    let checkEmail = isValidEmail(email);
    if (!checkEmail) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate password strength (e.g., minimum length, presence of special characters)
    let reso = isValidPassword(password);
    if (!reso) {
      return res
        .status(400)
        .json({
          message:
            "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
        });
    }

    if (password !== conf_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await Designer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const latestOtp = await OTP.find({ email })
      .sort({ expiresAt: -1 })
      .limit(1);

    if (
      !latestOtp.length ||
      latestOtp[0].otp !== parseInt(otp) ||
      latestOtp[0].expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const coordinates = location.coordinates
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    const designer = new Designer({
      name,
      mob,
      email,
      profile_pic,
      address,
      location: { type: "Point", coordinates },
      categories,
      services,
      subservices,
      Bio,
      password: hashpassword,
      term_cond,
    });

    await designer.save();
    await OTP.deleteOne({ otp });

    return res.status(200).json({ message: "Successfully registered" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//for login
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    //validat email format ex: @gamil.com
    let checkEmail = isValidEmail(email);
    if (!checkEmail) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const designer = await Designer.findOne({ email });
    if (designer) {
      //validate password rajx
      let reso = isValidPassword(password);
      if (!reso) {
        return res
          .status(400)
          .json({
            message:
              "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
          });
      }
      const passwordMatch = await bcrypt.compare(password, designer.password);

      if (designer.email === email && passwordMatch) {
        const token = jwt.sign({ designerId: designer._id }, secretkey, {
          expiresIn: "60m",
        });

        return res.status(200).send({
          status: "success",
          message: "login successful",
          token: token,
        });
      } else {
        return res
          .status(402)
          .send({ status: "failed", message: "your password is incorrect" });
      }
    } else {
      return res
        .status(401)
        .send({ status: "failed", message: "This email is not registered" });
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//link send to gmail for reset password
const sendlinkresetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const designer = await Designer.findOne({ email });
    if (designer) {
      const link = `http://localhost:3000/designer/resetpassword/${designer._id}`;
      console.log(link);
      const info = await transporter.sendMail({
        from: "prabhatpanigrahi120@gmail.com",
        to: designer.email,
        subject: "login-password reset",
        html: `<a href=${link}>Click here</a> to Reset your password`,
      });
      return res
        .status(200)
        .send({
          status: "success",
          message: "reset password link share with your gmail account",
        });
    } else {
      return res
        .status(406)
        .send({
          status: "failed",
          message: "enter your registered gmail account",
        });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

//reset the password
const resetpassword = async (req, res) => {
  const { password, conf_password } = req.body;
  const { id } = req.params;

  try {
    if (password === conf_password) {
      const designer = await Designer.findById(id);
      const previousPassword = designer.password;
      const checkPreviousPass = await bcrypt.compare(
        password,
        previousPassword
      );
      if (checkPreviousPass) {
        return res
          .status(406)
          .send(
            "enter a new password. your password are same with previous password"
          );
      } else {
        const hashPassword = await bcrypt.hash(password, 10);
        await Designer.findByIdAndUpdate(designer.id, {
          $set: { password: hashPassword },
        });
        return res.status(200).send({
          status: "success",
          message: "your password successfull reset",
        });
      }
    } else {
      return res.status(401).send("password and conf_password are not matched");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//for change password
const changePassword = async (req, res) => {
  const { newPassword, confPassword } = req.body;

  //validate password rajx
  let reso = isValidPassword(newPassword);
  if (!reso) {
    return res.status(400).json({
      message:"Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
      });
  }

  if (newPassword !== confPassword) {
    return res.status(406).send("newPassword and confPassword are not same.");
  }

  try {
    const designer = await Designer.findById(req.designer._id);
    const prevPassword = designer.password;
    const checkPreviousPass = await bcrypt.compare(newPassword,prevPassword);

    if (checkPreviousPass) {
      return res.status(400).send("enter a new password. your password are same with previous password");
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await Designer.findByIdAndUpdate(req.designer._id, {$set: { password: hashPassword },});

    return res.status(200).send("successfully change password");

  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
};

//manage service at my profile
const addServices = async (req, res) => {
  const { serviceId } = req.body;
  try {
    const ser = await Services.findById(serviceId);
    if(!ser){
      return res.status(400).json({ message: "Service Not Found..!!" });
    }

    const designer = await Designer.findById(req.designer._id);

    //check if service is alredy exits in the designer data
    const repo = designer.services.includes(serviceId);
    if(repo){
      return res.status(400).json({ message: "Service is alredy exist..!!" });
    }

    designer.services.push(serviceId);                                        //single data is added
    await designer.save();
    return res.status(201).json({ message: "Service added successfully" });
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
    if(!repo){
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
    if(!prod){
      return res.status(400).json({ message: "Prdouct Not Found..!!" });
    }
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("Designer not found");
    }

    //check if category is alredy exits in the designer data
    const repo = designer.categories.includes(productId);
    if(repo){
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
    if(!repo){
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
    const subSer = await subService.findById(subServicesId);
    if(!subSer){
      return res.status(400).json({ message: "Sub Service Not Found..!!" });
    }
    const designer = await Designer.findById(req.designer._id);
    if (!designer) {
      return res.send("Designer not found");
    }
    //check if category is alredy exits in the designer data
    const repo = designer.subservices.includes(subServicesId);
    if(repo){
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
    if(!repo){
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

//find order order list
const latestOrder = async (req, res) => {
  try {
    const result = await Order.find({
      tailorId: req.designer._id,
      status: "pending",
    });

    if (result.length === 0) {
      return res.send("tailor does not have latest order");
    }

    return res
      .status(201)
      .json({ status: "success", message: "all latest order", data: result });
  } catch (error) {
    return res.status(401).send(error.message);
  }
};

//designer can update the order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, completeDate } = req.body;
    const result = await Order.updateOne(
      { tailorId: req.designer._id },
      { $set: { status: status, orderCompleteDate: completeDate } }
    );
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
        { status: { $in: ["completed", "processing", "canceled"] } },
      ],
    });
    if (orders.length === 0) {
      return res.status(202).send("does not have any previous order");
    }

    return res.status(201).send(orders);
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

module.exports = {signup,sendotp,signin,sendlinkresetPassword,resetpassword,changePassword,addServices,deleteService,getAllServices,
  addProduct,delProduct,getAllProduct,addSubService,delSubService,getAllSubService,updateBio,latestOrder,updateOrderStatus,previousOrder,sendNotification,
};
