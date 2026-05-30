const express = require('express');
const router = express.Router();
const Salon = require('../models/Salon');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/isAdmin');
const mongoose = require('mongoose');
const { mockSalons, mockBookings, mockUsers } = require('../db/mockStore');

// Protect all admin routes
router.use(protect, isAdmin);

// @desc    Get all salons for admin (both live and pending)
// @route   GET /api/admin/salons
router.get('/salons', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const populated = mockSalons.map(s => {
                let ownerObj = null;
                if (typeof s.ownerId === 'string') {
                    // Try to find in mockUsers
                    const user = mockUsers.find(u => u._id === s.ownerId);
                    if (user) {
                        ownerObj = { name: user.name, phone: user.phone };
                    } else {
                        // Check if it's one of the default mock owners
                        const defaultMockOwners = {
                            'owner_1': { name: 'Vikram Singh', phone: '+91 98765 43210' },
                            'owner_2': { name: 'Amit Sharma', phone: '+91 87654 32109' },
                            'owner_3': { name: 'Pooja Patel', phone: '+91 76543 21098' },
                            'owner_4': { name: 'Neha Gupta', phone: '+91 65432 10987' },
                        };
                        if (defaultMockOwners[s.ownerId]) {
                            ownerObj = defaultMockOwners[s.ownerId];
                        }
                    }
                }
                return {
                    ...s,
                    ownerId: ownerObj ? { _id: s.ownerId, ...ownerObj } : s.ownerId
                };
            });
            return res.status(200).json({ success: true, data: populated });
        }
        const salons = await Salon.find({}).populate('ownerId', 'name phone');
        res.status(200).json({ success: true, data: salons.length ? salons : mockSalons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Approve a salon
// @route   PUT /api/admin/salon/:id/approve
router.put('/salon/:id/approve', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const salon = mockSalons.find(s => s._id === req.params.id);
            if (salon) salon.isApproved = true;
            return res.status(200).json({ success: true, data: salon });
        }
        const salon = await Salon.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.status(200).json({ success: true, data: salon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Reject/Delete a salon
// @route   DELETE /api/admin/salon/:id
router.delete('/salon/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const index = mockSalons.findIndex(s => s._id === req.params.id);
            if (index !== -1) mockSalons.splice(index, 1);
            return res.status(200).json({ success: true, message: 'Salon deleted' });
        }
        await Salon.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Salon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const populated = mockBookings.map(b => {
                const salon = mockSalons.find(s => s._id === b.salonId);
                return {
                    ...b,
                    salonId: salon ? { _id: salon._id, name: salon.name } : { name: 'Unknown Salon' }
                };
            });
            return res.status(200).json({ success: true, data: populated });
        }
        const bookings = await Booking.find().populate('salonId', 'name').populate('userId', 'name phone');
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ success: true, data: mockUsers });
        }
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Block User
// @route   PUT /api/admin/user/:id/block
router.put('/user/:id/block', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const user = mockUsers.find(u => u._id === req.params.id);
            if (user) user.isBlocked = true;
            return res.status(200).json({ success: true, data: user });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
