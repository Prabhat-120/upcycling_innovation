const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mob: {
        type: String,
        required: true
    },
    images: {
        type: String,
        require: true
    },
    DOB: {
        type: String,
        required: true
    },
    Gender: {
        type: Boolean,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true });

const Consumer = mongoose.model("consumer", consumerSchema);
module.exports = Consumer;

