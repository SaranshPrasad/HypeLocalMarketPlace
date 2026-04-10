const mongoose = require("mongoose");
const orderStatusScheme = mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        enum: ["placed", "accepted", "packed", "assigned", "out_for_delivery", "delivered", "cancelled", "retured"],
        required:true
    },
    changed_by_role:{
        type:String,
        enum: ["admin", "seller", "delivery"]
    },
    changed_by_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
}, {timestamps:true});
const OrderStatus = mongoose.model("OrderStatus", orderStatusScheme);
module.exports = OrderStatus;
