const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        maxLength:10,
        required:true
    },
    password:{
        type:String,
        required:true
    }
}, {timestamp:true});


const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;