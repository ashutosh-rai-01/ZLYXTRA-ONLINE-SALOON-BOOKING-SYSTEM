const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const { mockBookings, mockSalons } = require('../db/mockStore');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
router.post('/', protect, async (req, res) => {
    try {
        const { salonId, service, date, startTime, price } = req.body;
        
        // Double-booking check
        if (mongoose.connection.readyState !== 1) {
            const isAlreadyBooked = mockBookings.some(b => 
                b.salonId === salonId && 
                b.date === date && 
                b.startTime === startTime && 
                b.status !== 'cancelled' && 
                b.status !== 'rejected'
            );
            if (isAlreadyBooked) {
                return res.status(400).json({ success: false, message: 'This slot has already been booked!' });
            }
        } else {
            const isAlreadyBooked = await Booking.findOne({
                salonId,
                date,
                startTime,
                status: { $nin: ['cancelled', 'rejected'] }
            });
            if (isAlreadyBooked) {
                return res.status(400).json({ success: false, message: 'This slot has already been booked!' });
            }
        }

        if (mongoose.connection.readyState !== 1) {
            const newBooking = {
                _id: Math.random().toString(36).substr(2, 9),
                userId: { _id: req.user.id, name: req.user.name },
                salonId,
                service: { name: service.name, price: service.price || price },
                date,
                startTime,
                status: 'pending',
                paymentStatus: 'pending',
                createdAt: new Date().toISOString()
            };
            mockBookings.push(newBooking);
            return res.status(201).json({ success: true, data: newBooking });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            salonId,
            service: { name: service.name, price: service.price || price },
            date,
            startTime,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get user's bookings
// @route   GET /api/bookings/me
// @access  Private (User)
router.get('/me', protect, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const userBookings = mockBookings.filter(b => b.userId._id === req.user.id || b.userId === req.user.id);
            // Populate salon details
            const populated = userBookings.map(b => {
                const salon = mockSalons.find(s => s._id === b.salonId);
                return { ...b, salon: salon || { name: 'Unknown Salon' } };
            });
            return res.status(200).json({ success: true, data: populated.reverse() });
        }

        const bookings = await Booking.find({ userId: req.user.id }).populate('salonId', 'name address images').sort('-createdAt');
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all bookings for owner's salon
// @route   GET /api/bookings/salon
// @access  Private (Owner)
router.get('/salon', protect, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // Find owner's salon (mock memory)
            const salon = mockSalons.find(s => s.ownerId === req.user.id);
            if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });
            
            const salonBookings = mockBookings.filter(b => b.salonId === salon._id);
            return res.status(200).json({ success: true, data: salonBookings.reverse() });
        }

        const salon = await Salon.findOne({ ownerId: req.user.id });
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        const bookings = await Booking.find({ salonId: salon._id }).populate('userId', 'name phone').sort('-createdAt');
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (mongoose.connection.readyState !== 1) {
            const bookingIndex = mockBookings.findIndex(b => b._id === req.params.id);
            if (bookingIndex === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
            
            mockBookings[bookingIndex].status = status;
            return res.status(200).json({ success: true, data: mockBookings[bookingIndex] });
        }

        let booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = status;
        await booking.save();
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
