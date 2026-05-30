const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, phone, password, role } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, phone and password' });
        }

        // Check if user exists using Sequelize
        const userExists = await User.findOne({ where: { phone } });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            phone,
            password,
            role: role || 'user'
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide phone and password' });
        }

        // Hardcoded admin fallback (since we don't have a seed script yet)
        if (phone === 'admin' && password === 'admin123') {
            return res.status(200).json({
                success: true,
                token: generateToken('admin_mock_id', 'admin'),
                user: { id: 'admin_mock_id', name: 'Super Admin', phone: 'admin', role: 'admin' }
            });
        }

        // Try to fetch from MySQL
        const user = await User.findOne({ where: { phone } });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if blocked
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Account has been blocked by admin' });
        }

        const token = generateToken(user.id, user.role);
        res.status(200).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
