const jwt = require('jsonwebtoken');
const Designer = require('../models/designModel');
const Consumer = require('../models/consumerModel');

const secretkey = process.env.SECRETKEY;                //create a .env file and store the secreate key value in there


const checkDesignerAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            //get token from header
            token = authorization.split(' ')[1]

            //verify token
            const { designerId } = jwt.verify(token, secretkey)

            //get user from token
            req.designer = await Designer.findById(designerId).select('-password');
            next()

        } catch (err) {
            res.status(401).send({ "status": "failed", "message": "unauthorized user" });
        }
    }
    if (!token) {
        res.status(401).send({ "status": "failed", "message": "unauthorised user, No token!" });
    }
};

const checkConsumerAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer')) {
            return res.status(401).send({ status: "failed", message: "Unauthorized, No token!" });
        }

        const token = authorization.split(' ')[1];
        const { consumerId } = jwt.verify(token, secretkey);
        req.consumer = await Consumer.findById(consumerId).select('-password');
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send({ status: "failed", message: "Unauthorized access" });
        }
        res.status(500).send({ status: "failed", message: "Internal server error" });
    }
};

const checkAdminAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer')) {
            return res.status(401).send({ status: "failed", message: "Unauthorized, No token!" });
        }
        const token = authorization.split(' ')[1];
        const { adminId } = jwt.verify(token, secretkey);
        req.admin = await Consumer.findById(adminId).select('-password');
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send({ status: "failed", message: "Unauthorized access" });
        }
        res.status(500).send({ status: "failed", message: "Internal server error" });
    }
};


module.exports = { checkDesignerAuth, checkConsumerAuth, checkAdminAuth };