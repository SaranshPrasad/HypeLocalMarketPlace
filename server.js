const express = require("express");
const cors = require("cors")
const app = express();
const customerRouter = require("./src/routes/customerRouter");
const adminRouter = require("./src/routes/adminRouter");
const sellerRouter = require("./src/routes/sellerRouter");
const productRouter = require("./src/routes/productRouter");
const cartRouter = require("./src/routes/cartRouter");
const omsRouter = require("./src/routes/omsRouter");
const connectDB = require("./Database/connection");
app.use(cors());
app.use(express.json());
app.use("/customer", customerRouter);
app.use("/admin", adminRouter);
app.use("/seller", sellerRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/order", omsRouter);
app.listen(4000, (req, res) => {
  if (connectDB()) {
    console.log("Server is live at port 4000");
  } else {
    console.log("Server is not available due to connection of db faliure.");
  }
});
