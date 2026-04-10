const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const db = await mongoose.connect(
      `mongodb+srv://saranshprasad08:LZ36unwnOiYttSRY@alumini.hyktp.mongodb.net/?appName=Alumini`,
    );
    console.log("Database connected!");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;