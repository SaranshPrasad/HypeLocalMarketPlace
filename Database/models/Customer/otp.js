const mongoose = require("mongoose");
const otpSchema = mongoose.Schema({
    otp:{
        type:String,
        required:true,
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
}
}, {timestamp:true});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;