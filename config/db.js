const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Replace the string below with your REAL string from Atlas or Local
    const uri = process.env.MONGO_URI;

    const conn = await mongoose.connect(`${uri}`, {
      serverSelectionTimeoutMS: 5000, // Fails fast if no connection
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Failed: ${error.message}`);
    // Check if you forgot to turn on the MongoDB service!
    process.exit(1);
  }
};

module.exports = connectDB;
