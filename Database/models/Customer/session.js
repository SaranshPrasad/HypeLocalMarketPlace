const mongoose = require("mongoose");
const sessionSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Customer"
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

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
