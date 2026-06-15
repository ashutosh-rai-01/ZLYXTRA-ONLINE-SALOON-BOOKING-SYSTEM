const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const { mockUsers } = require('../db/mockStore');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// Helper to send registration notifications (Email & simulated SMS)
const dispatchWelcomeNotifications = async (user, email) => {
    // 1. Log SMS notification in console
    console.log('\n============================================================');
    console.log('📱  SMS NOTIFICATION SENT');
    console.log(`To:      ${user.phone}`);
    console.log(`Message: Welcome to ZLYXTRA, ${user.name}! Your account has been successfully registered. Enjoy premier salon bookings.`);
    console.log('============================================================\n');

    // 2. Send email notification if email is provided
    if (email) {
        try {
            const htmlTemplate = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <!-- Header -->
                <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; text-align: center; color: white; font-size: 24px; font-weight: bold; margin-bottom: 12px;">✂️</div>
                    <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Welcome to ZLYXTRA!</h2>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Your Premium Salon Booking Companion</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 24px 0;">
                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Thank you for registering at ZLYXTRA! Your account has been successfully created. We are excited to help you match and book with the absolute best premium salons in your area.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0;">
                        <h4 style="color: #0f172a; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Account Details</h4>
                        <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Full Name:</td>
                                <td style="padding: 4px 0;">${user.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Phone Number:</td>
                                <td style="padding: 4px 0;">${user.phone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Account Role:</td>
                                <td style="padding: 4px 0; text-transform: capitalize;">${user.role}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Here is what you can do next:</p>
                    <ul style="color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                        <li><strong>Find Salons:</strong> Explore local unisex makeup studios and salons.</li>
                        <li><strong>Smart Match:</strong> Match with stylists that fit your budget, location, and style preferences.</li>
                        <li><strong>Manage Bookings:</strong> Book appointments with instant slot confirmations and receive active notifications.</li>
                    </ul>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                    <p style="margin: 0;">This email confirms your registration for the ZLYXTRA Salon Booking System.</p>
                    <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} ZLYXTRA Inc. All rights reserved.</p>
                </div>
            </div>
            `;
            await sendEmail({
                email,
                subject: 'Welcome to ZLYXTRA! ✂️ Your Salon Booking Companion',
                message: `Hello ${user.name},\n\nWelcome to ZLYXTRA! Your account has been successfully created under the phone number ${user.phone}.\n\nThank you for choosing ZLYXTRA!`,
                html: htmlTemplate
            });
        } catch (emailError) {
            console.error('⚠️ Failed to dispatch welcome email:', emailError.message);
        }
    }
};

// Helper to send login alerts
const dispatchLoginNotifications = async (user, email) => {
    if (email) {
        try {
            const htmlTemplate = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <!-- Header -->
                <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; text-align: center; color: white; font-size: 24px; font-weight: bold; margin-bottom: 12px;">🔑</div>
                    <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">ZLYXTRA Login Alert</h2>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">New successful login detected</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 24px 0;">
                    <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your ZLYXTRA account has been successfully accessed.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0;">
                        <h4 style="color: #0f172a; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Session Information</h4>
                        <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Account:</td>
                                <td style="padding: 4px 0;">${user.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Time:</td>
                                <td style="padding: 4px 0;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 600;">Status:</td>
                                <td style="padding: 4px 0; color: #10b981; font-weight: 600;">Logged In Successfully</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #334155; font-size: 14px; line-height: 1.6; font-style: italic; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px;">
                        <strong>Note:</strong> If this was you, you can safely ignore this email. If you did not authorize this login, please change your password immediately in your profile dashboard.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                    <p style="margin: 0;">This email is a security notification regarding your ZLYXTRA account.</p>
                    <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} ZLYXTRA Inc. All rights reserved.</p>
                </div>
            </div>
            `;
            await sendEmail({
                email,
                subject: 'ZLYXTRA Login Notification',
                message: `Hello ${user.name},\n\nWe detected a new sign-in to your ZLYXTRA account associated with the phone number ${user.phone}.\n\nIf this was not you, please secure your account immediately.`,
                html: htmlTemplate
            });
        } catch (emailError) {
            console.error('⚠️ Failed to dispatch login alert email:', emailError.message);
        }
    }
};


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, phone, email, password, role } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, phone and password' });
        }

        // --- IN-MEMORY FALLBACK ---
        if (mongoose.connection.readyState !== 1) {
            const existing = mockUsers.find(u => u.phone === phone);
            if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

            const salt = await bcrypt.genSalt(8);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: Math.random().toString(36).substr(2, 9),
                name,
                phone,
                email,
                password: hashedPassword,
                role: role || 'user',
                isBlocked: false,
                isVerified: true,
                createdAt: new Date().toISOString()
            };
            mockUsers.push(newUser);
            const token = generateToken(newUser._id);
            
            // Dispatch notifications
            dispatchWelcomeNotifications(newUser, email);

            return res.status(201).json({
                success: true,
                token,
                user: { id: newUser._id, name, phone, email: newUser.email, role: newUser.role }
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
            email,
            password,
            role: role || 'user'
        });

        const token = generateToken(user._id);

        // Dispatch notifications
        dispatchWelcomeNotifications(user, email);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role }
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
            return res.status(400).json({ success: false, message: 'Please provide phone or email and password' });
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

            const user = mockUsers.find(u => u.phone === phone || (u.email && u.email.toLowerCase() === phone.toLowerCase()));
            if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

            if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account has been blocked by admin' });

            // Dispatch login email alert if configured
            dispatchLoginNotifications(user, user.email);

            return res.status(200).json({
                success: true,
                token: generateToken(user._id),
                user: { id: user._id, name: user.name, phone: user.phone, email: user.email || '', role: user.role }
            });
        }
        // --------------------------

        // Check for user by phone or email
        const user = await User.findOne({
            $or: [
                { phone: phone },
                { email: phone.toLowerCase() }
            ]
        }).select('+password');
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

        // Dispatch login email alert if configured
        dispatchLoginNotifications(user, user.email);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, phone: user.phone, email: user.email || '', role: user.role }
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
