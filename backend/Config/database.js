require('dotenv').config()
const mongoose = require('mongoose');

const db_url = process.env.DB_URL;

const connectdb = async () =>{
    try{
        await mongoose.connect(`${db_url}`);
        console.log("Database connection establishment....");
    }catch(error){
        console.error(error.message);
    }
}

module.exports = connectdb;