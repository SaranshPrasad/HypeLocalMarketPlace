const mongoose = require("mongoose");
const sessionSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Admin"
    },
    token:{
        type:String,
        required:true
    },
    device:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:true}
    

}, {timestamps:true});

const AdminSession = mongoose.model("AdminSession", sessionSchema);
module.exports = AdminSession;
