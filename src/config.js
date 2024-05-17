const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/DispensaryBookingSystemDB");

connect.then(() => {
    console.log("Database connected Successfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    mobilenumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
        
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    image:{
        type: String
    } 
});

const collection = new mongoose.model("users", UserSchema);

module.exports = collection