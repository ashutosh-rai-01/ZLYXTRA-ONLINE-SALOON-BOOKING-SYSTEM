const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const { mockUsers } = require('../db/mockStore');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
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

        // --- IN-MEMORY FALLBACK ---
        if (mongoose.connection.readyState !== 1) {
            const existing = mockUsers.find(u => u.phone === phone);
            if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: Math.random().toString(36).substr(2, 9),
                name,
                phone,
                password: hashedPassword,
                role: role || 'user',
                isBlocked: false,
                isVerified: true,
                createdAt: new Date().toISOString()
            };
            mockUsers.push(newUser);
            const token = generateToken(newUser._id);
            return res.status(201).json({
                success: true,
                token,
                user: { id: newUser._id, name, phone, role: newUser.role }
            });
        }
        // --------------------------

        // Check if user exists
        const userExists = await User.findOne({ phone });
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

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, phone: user.phone, role: user.role }
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

        // --- IN-MEMORY FALLBACK ---
        if (mongoose.connection.readyState !== 1) {
            // For testing Admin layout before DB is up
            if (phone === 'admin' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    token: generateToken('admin_mock_id'),
                    user: { id: 'admin_mock_id', name: 'Super Admin', phone: 'admin', role: 'admin' }
                });
            }

            const user = mockUsers.find(u => u.phone === phone);
            if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

            if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account has been blocked by admin' });

            return res.status(200).json({
                success: true,
                token: generateToken(user._id),
                user: { id: user._id, name: user.name, phone: user.phone, role: user.role }
            });
        }
        // --------------------------

        // Check for user
        const user = await User.findOne({ phone }).select('+password');
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

        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, phone: user.phone, role: user.role }
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
        if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(req.user.id)) {
            const user = mockUsers.find(u => u._id === req.user.id);
            if (user) {
                return res.status(200).json({ 
                    success: true, 
                    data: { 
                        id: user._id, 
                        _id: user._id, 
                        name: user.name, 
                        phone: user.phone, 
                        role: user.role,
                        email: user.email || '',
                        gender: user.gender || '',
                        birthDate: user.birthDate || ''
                    } 
                });
            }
            return res.status(200).json({
                success: true,
                data: { id: req.user.id, name: "Guest User", phone: "N/A", role: 'user', email: '', gender: '', birthDate: '' }
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            const mockUser = mockUsers.find(u => u._id === req.user.id);
            if (mockUser) {
                return res.status(200).json({
                    success: true,
                    data: {
                        id: mockUser._id,
                        _id: mockUser._id,
                        name: mockUser.name,
                        phone: mockUser.phone,
                        role: mockUser.role,
                        email: mockUser.email || '',
                        gender: mockUser.gender || '',
                        birthDate: mockUser.birthDate || ''
                    }
                });
            }
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email, gender, birthDate, phone } = req.body;

        if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(req.user.id)) {
            let userIdx = mockUsers.findIndex(u => u._id === req.user.id);
            if (userIdx === -1) {
                // Restore or create user dynamically in mock memory
                const restoredUser = {
                    _id: req.user.id,
                    name: 'Guest User',
                    phone: req.user.id === 'admin_mock_id' ? 'admin' : '9999999999',
                    role: req.user.id === 'admin_mock_id' ? 'admin' : 'user',
                    isBlocked: false,
                    isVerified: true,
                    createdAt: new Date().toISOString()
                };
                mockUsers.push(restoredUser);
                userIdx = mockUsers.length - 1;
            }

            // If phone is changing, check if unique
            if (phone !== undefined && phone !== mockUsers[userIdx].phone) {
                const phoneExists = mockUsers.some(u => u.phone === phone && u._id !== req.user.id);
                if (phoneExists) {
                    return res.status(400).json({ success: false, message: 'Phone number is already in use' });
                }
            }
            mockUsers[userIdx] = {
                ...mockUsers[userIdx],
                name: name !== undefined ? name : mockUsers[userIdx].name,
                email: email !== undefined ? email : mockUsers[userIdx].email,
                gender: gender !== undefined ? gender : mockUsers[userIdx].gender,
                birthDate: birthDate !== undefined ? birthDate : mockUsers[userIdx].birthDate,
                phone: phone !== undefined ? phone : mockUsers[userIdx].phone,
            };
            return res.status(200).json({ 
                success: true, 
                data: {
                    id: mockUsers[userIdx]._id,
                    _id: mockUsers[userIdx]._id,
                    name: mockUsers[userIdx].name,
                    phone: mockUsers[userIdx].phone,
                    role: mockUsers[userIdx].role,
                    email: mockUsers[userIdx].email || '',
                    gender: mockUsers[userIdx].gender || '',
                    birthDate: mockUsers[userIdx].birthDate || ''
                }
            });
        }

        let user = await User.findById(req.user.id);
        if (!user) {
            // Check if they exist in mock memory
            let userIdx = mockUsers.findIndex(u => u._id === req.user.id);
            if (userIdx !== -1) {
                // If phone is changing, check if unique
                if (phone !== undefined && phone !== mockUsers[userIdx].phone) {
                    const phoneExists = mockUsers.some(u => u.phone === phone && u._id !== req.user.id);
                    if (phoneExists) {
                        return res.status(400).json({ success: false, message: 'Phone number is already in use' });
                    }
                }
                mockUsers[userIdx] = {
                    ...mockUsers[userIdx],
                    name: name !== undefined ? name : mockUsers[userIdx].name,
                    email: email !== undefined ? email : mockUsers[userIdx].email,
                    gender: gender !== undefined ? gender : mockUsers[userIdx].gender,
                    birthDate: birthDate !== undefined ? birthDate : mockUsers[userIdx].birthDate,
                    phone: phone !== undefined ? phone : mockUsers[userIdx].phone,
                };
                return res.status(200).json({ 
                    success: true, 
                    data: {
                        id: mockUsers[userIdx]._id,
                        _id: mockUsers[userIdx]._id,
                        name: mockUsers[userIdx].name,
                        phone: mockUsers[userIdx].phone,
                        role: mockUsers[userIdx].role,
                        email: mockUsers[userIdx].email || '',
                        gender: mockUsers[userIdx].gender || '',
                        birthDate: mockUsers[userIdx].birthDate || ''
                    }
                });
            }
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (phone !== undefined && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return res.status(400).json({ success: false, message: 'Phone number is already in use' });
            }
            user.phone = phone;
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (gender !== undefined) user.gender = gender;
        if (birthDate !== undefined) user.birthDate = birthDate;

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
