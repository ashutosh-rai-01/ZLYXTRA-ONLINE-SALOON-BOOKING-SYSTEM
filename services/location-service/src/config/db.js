const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        console.log("⚠️ WARNING: Server is running without a database! Using Mock Mode.");
        // process.exit(1);
    }
};

module.exports = connectDB;
