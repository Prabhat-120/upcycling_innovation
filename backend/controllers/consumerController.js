const Consumer = require('../models/consumerModel');
//const consProduct = require('../models/productModel');
const Categories = require('../models/categoriesModel');
const { ObjectId } = require('mongoose').Types;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// const genotp = require('../services/OtpServices');
// const transporter = require("../Config/mailconfig");

const OTP = require('../models/otpModel');
const sendotp = require('../services/sendOTPByEmail');
const Designer = require('../models/designModel');
const Order = require('../models/orderModel');
const { mongoose } = require('mongoose');
const Services = require('../models/serviceModel');

const { isValidPassword, isValidEmail, isValidMob } = require('../Validator/validator')

const secretkey = process.env.SECRETKEY


const sendOTPToConsumer = async (req, res) => {
    const { email } = req.body;
    try {
        const validEmail = isValidEmail(email);
        if (!validEmail) {
            return res.status(400).json({
                status: "false",
                message: "please enter correct email patteren & it should not have blank space",
            });
        }
        const result = await sendotp(email);
        return res.send(result);
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
};

const signup = async (req, res) => {
    const { firstName, lastName, email, mob, DOB, Gender, password, term_cond, otp } = req.body;
    profile_pic = req.file.filename;
    try {
        if (!firstName || !lastName || !email || !mob || !profile_pic || !DOB || !Gender || !password || !otp) {
            return res.status(401).send("all fields are required");
        };

        let validEmail = isValidEmail(email);
        if (!validEmail) {
            return res.status(400).json({
                status: "false",
                message: "please enter correct email patteren & it should not have blank space",
            });
        }

        const isExist = await Consumer.findOne({ email });
        if (isExist) {
            return res.status(401).send({ "status": "failed", "message": "This email already exists" });
        }

        let ValidMob = isValidMob(mob);
        if (!ValidMob) {
            return res.status(400).json({
                status: "false",
                message: "please enter Valid mobile Number & it should not have blank space",
            });
        }

        let validPassword = isValidPassword(password);
        if (!validPassword) {
            return res.status(400).json({
                status: "false",
                message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character & it should not have blank space",
            });
        }

        const latestOtp = await OTP.find({ email }).sort({ expiresAt: -1 }).limit(1);
        console.log(latestOtp)
        if (!latestOtp.length || latestOtp[0].otp !== parseInt(otp) || latestOtp[0].expiresAt < new Date()) {
            return res.status(401).json({ status: "false", message: "Invalid or expired OTP" });
        }

        let fullname = firstName + " " + lastName;
        const hashpassword = await bcrypt.hash(password, 10);

        const consumer = new Consumer({
            name: fullname,
            email,
            mob,
            images: profile_pic,
            DOB,
            Gender,
            password: hashpassword,
            term_cond,
            lastLogin: new Date()
        });

        await consumer.save();
        await OTP.deleteOne({ otp });

        return res.status(200).send({ "status": "success", "message": "Register Successfull" });

    } catch (error) {
        return res.send(error.message);
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        let validEmail = isValidEmail(email);
        let validPassword = isValidPassword(password);

        if (!validEmail) {
            return res.status(400).json({
                status: "false",
                message: "please enter correct email patteren",
            });
        }

        if (!validPassword) {
            return res.status(400).json({
                status: "false",
                message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
            });
        }

        const consumer = await Consumer.findOne({ email, isDeleted: false });
        if (!consumer) {
            return res.send("Your email is not registered or your account deleted. contact to the admin by contactus");
        }

        const passwordMatch = await bcrypt.compare(password, consumer.password)
        if (!passwordMatch) {
            return res.send({ status: "false", massage: "You entered the wrong password." })
        }

        const token = jwt.sign({ consumerId: consumer._id }, secretkey, { expiresIn: "20m" });

        consumer.lastLogin = new Date();
        await consumer.save();

        return res.status(201).send({ "status": "success", "message": "Login successful!", "token": token });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const sendLinkResetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const consumer = await Consumer.findOne({ email });
        if (consumer) {

            const link = `http://localhost:3000/designer/resetpassword/${consumer._id}`
            console.log(link);

            const info = await transporter.sendMail({
                from: "prabhatpanigrahi120@gmail.com",
                to: consumer.email,
                subject: "login-password reset",
                html: `<a href=${link}>Click here</a>to Reset your password`
            });
            res.status(200).send({ "status": "success", "message": "reset password link share with your gmail account" })
        } else {
            res.status(406).send({ "status": "failed", "message": "enter your registered gmail account" })
        }
    } catch (error) {
        res.send(error.message);
    }
};

const resetPassword = async (req, res) => {
    const { password, conf_password } = req.body;
    const { id } = req.params;
    try {
        let validPassword = isValidPassword(password);
        if (!validPassword) {
            return res.status(400).json({
                status: "false",
                message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
            });
        }

        if (password === conf_password) {
            const consumer = await Consumer.findById(id);
            const previousPassword = consumer.password;
            const checkPreviousPass = await bcrypt.compare(password, previousPassword);
            if (checkPreviousPass) {
                return res.status(406).send("enter a new password. your password are same with previous password");
            } else {
                const hashPassword = await bcrypt.hash(password, 10);
                await Consumer.findByIdAndUpdate(consumer.id, { $set: { password: hashPassword } });
                return res.status(200).send({ "status": "success", "message": "your password successfull reset" })
            }
        } else {
            return res.status(401).send({ status: "failed", message: "conf_Password not matched with password" })
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
};


const changePassword = async (req, res) => {
    const { password, confPassword } = req.body;
    try {
        let validPassword = isValidPassword(password);
        if (!validPassword) {
            return res.status(400).json({
                status: "false",
                message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
            });
        }

        if (password !== confPassword) {
            return res.status(406).send({ status: 406, message: "confPassword are not matched with password" })
        }

        const consumer = await Consumer.findById(req.consumer._id);
        const prevPassword = consumer.password;
        const checkPreviousPass = await bcrypt.compare(password, prevPassword);

        if (checkPreviousPass) {
            return res.status(400).send({ status: "false", message: "enter a new password. your password are same with previous password" });
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);

        await Consumer.findByIdAndUpdate(req.consumer._id, { $set: { password: hashPassword } });
        return res.status(200).send("successfully change password");
    } catch (error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
};


//get all products from Categories which admin are push
const getAllProducts = async (req, res) => {
    try {
        const projection = { updatedAt: 0 }
        const result = await Categories.find({}).select(projection);
        return res.send(result);
    } catch (error) {
        return res.status(500).send(error.message)
    }
};


//get all services at home page
const getAllServices = async (req, res) => {
    try {
        const projection = {
            _id: 1,
            serviceName: 1,
            picture: 1
        }
        const result = await Services.find({}, projection);
        return res.send(result);
    } catch (error) {
        return res.status(500).send(error.message);
    }
}


//search for product and services
const searching = async (req, res) => {
    const query = req.query.q;
    try {
        if (typeof query !== 'string') {
            return res.status(400).json({ error: 'Query must be a string' });
        }
        // const categoryResults = await Categories.find({ productName: { $regex: `^${query}`, $options: 'i' } }, { productName: 1, _id: 0 });
        // const serviceResults = await Services.find({ serviceName: { $regex: `^${query}`, $options: 'i' } }, { serviceName: 1, _id: 0 });

        const categoryResults = await Categories.find({ productName: { $regex: `.*${query}.*`, $options: 'i' } });
        const serviceResults = await Services.find({ serviceName: { $regex: `.*${query}.*`, $options: 'i' } });

        const results = {
            category: categoryResults,
            service: serviceResults
        }
        return res.status(200).json(results);
    } catch (error) {
        console.error("error searching:", error);
        return res.status(500).send(error.message);
    }
}



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

//find nearest designer
const getDesigner = async (req, res) => {
    const { serviceId, categoryId } = req.body;
    try {
        long = parseFloat(req.body.longitude);
        lati = parseFloat(req.body.latitude);

        if (!serviceId && !categoryId) {
            return res.status(401).send({ status: "false", message: "you provide either serviceId or categoryId" })
        };

        let matchQuery;
        if (serviceId) {
            matchQuery = { services: { $in: [new mongoose.Types.ObjectId(serviceId)] } }
        } else if (categoryId) {
            matchQuery = { categories: { $in: [new mongoose.Types.ObjectId(categoryId)] } }
        }

        const projection = { name: 1, mob: 1, profile_pic: 1, dist: 1, services: 1, categories: 1 };

        let pipeline = [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [long, lati] },
                    key: "location",
                    distanceField: "dist.calculated",
                    maxDistance: parseFloat(100000) * 1609,
                    query: matchQuery,
                    spherical: true
                }
            },
            {
                $project: projection
            }
        ];


        if (serviceId) {
            pipeline.push({
                $lookup: {
                    from: "services",
                    localField: "services",
                    foreignField: "_id",
                    as: "populatedServices"
                }
            });
        } else if (categoryId) {
            // Assuming you have a field named 'category' in your Designer collection
            pipeline.push({
                $lookup: {
                    from: "categories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "populatedCategory"
                }
            });
        }

        // Execute the aggregation pipeline
        const tailor_data = await Designer.aggregate(pipeline);

        // const tailor_data = await Designer.aggregate([
        //     {
        //         $geoNear: {
        //             near: { type: "Point", coordinates: [longitude, latitude] },
        //             key: "location",
        //             distanceField: "dist.calculated",
        //             maxDistance: parseFloat(5000) * 1609,
        //             query: { services: { $in: [new mongoose.Types.ObjectId(serviceId)] } },
        //             spherical: true
        //         }
        //     },
        //     {
        //         $project: projection
        //     },
        //     {
        //         $lookup: {
        //             from: "services",
        //             localField: "services",
        //             foreignField: "_id",
        //             as: "populatedServices"
        //         }
        //     },
        //     {
        //         $project:projection
        //     }
        // ]);

        return res.status(200).json({ status: true, message: "Tailor details", count: tailor_data.length, data: tailor_data, });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error occurred", error: error.message });
    }
};


//give order to designer
const giveOrder = async (req, res) => {
    const { orderDesc, photo, tailorId, productId, serviceId } = req.body;
    try {
        const newOrder = new Order({
            orderDesc,
            photo,
            productId,
            serviceId,
            consumerId: req.consumer._id,
            tailorId,
            status: "pending",
            orderDate: Date.now(),
            orderCompleteDate: null
        });

        await newOrder.save();
        return res.status(201).send("order placed successfull.waiting for designer confirmation.");
    } catch (error) {
        return res.status(400).send(error.message)
    }
};


//1.for continued order
const processingOrder = async (req, res) => {
    try {
        const orders = await Order.find(
            {
                $and: [
                    { consumerId: req.consumer._id },
                    { status: { $in: ["pending", "processing", "confirm"] } }
                ]
            }
        );
        if (orders.length > 0) {
            return res.status(201).send(orders)
        } else {
            return res.status(404).send("No pending or processing orders found.");
        }
    } catch (error) {
        return res.status(401).send(error.message)
    }
};

//check previous order
const previousOrder = async (req, res) => {
    try {
        const orders = await Order.find(
            {
                $and: [
                    { consumerId: req.consumer._id },
                    { status: { $in: ["completed", "canceled"] } }
                ]
            }
        );
        if (orders.length > 0) {
            return res.status(200).send(orders)
        } else {
            return res.status(404).send("No complete or canceled orders found.");
        }
    } catch (error) {
        return res.status(401).send(error.message)
    }
};

//contatus api send contact details to admin
const contactUs = async (req, res) => {
    try {
        const { name, email, number } = req.body;
        if (name, email, number) {
            const info = await transporter.sendMail({
                from: "prabhatpanigrahi120@gmail.com",
                to: "prabhatpanigrahi120@gmail.com",
                subject: "contact to this person",
                html: `<h1>consumer data <br> name: ${name} <br> email: ${email} <br> number: ${number}</h1>`
            })
            return res.send({ "status": "success", "message": "for contact the person " + name });
        } else {
            return res.send("all field is required");
        }
    } catch (error) {
        return res.status(401).send(error.message);
    }
};

module.exports = {
    sendOTPToConsumer, signup, signin, sendLinkResetPassword, resetPassword, changePassword, getAllServices, getAllProducts, searching, getDesigner,
    giveOrder, processingOrder, previousOrder, contactUs
};




