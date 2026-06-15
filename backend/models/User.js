const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'New User'
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Exclude password from query results by default
    },
    email: {
        type: String,
        sparse: true // Optional for phone auth users
    },
    gender: {
        type: String,
        default: ""
    },
    birthDate: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    }
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
