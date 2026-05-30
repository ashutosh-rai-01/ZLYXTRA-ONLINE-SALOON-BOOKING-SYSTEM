const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Auto-seed default Admin if not exists
        const adminExists = await User.findOne({ phone: 'admin' });
        if (!adminExists) {
            console.log("Seeding default admin user...");
            await User.create({
                name: 'Super Admin',
                phone: 'admin',
                password: 'admin123', // User model's pre-save hook will automatically encrypt this password
                role: 'admin',
                isVerified: true
            });
            console.log("✅ Default admin user successfully seeded!");
        }
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        console.log("⚠️ WARNING: Server is running without a database! Using Mock Mode.");
        // process.exit(1);
    }
};

module.exports = connectDB;
