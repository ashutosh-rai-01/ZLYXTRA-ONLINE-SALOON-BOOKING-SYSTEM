const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const Salon = require('../models/Salon');
const { protect } = require('../middleware/authMiddleware');

// @desc    Set or update block slots for a date
// @route   POST /api/availability/block-slot
// @access  Private (Owner)
router.post('/block-slot', protect, async (req, res) => {
    try {
        const { date, time, reason } = req.body;

        const salon = await Salon.findOne({ ownerId: req.user.id });
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

        let avail = await Availability.findOne({ salonId: salon._id, date });
        
        if (!avail) {
            avail = await Availability.create({
                salonId: salon._id,
                date,
                blockedSlots: [{ time, reason }]
            });
        } else {
            // Check if already blocked
            const exists = avail.blockedSlots.find(s => s.time === time);
            if (!exists) {
                avail.blockedSlots.push({ time, reason });
                await avail.save();
            }
        }

        res.status(200).json({ success: true, data: avail });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get slots availability for a salon and date
// @route   GET /api/availability/slots
// @access  Public
router.get('/slots', async (req, res) => {
    try {
        const { salonId, date } = req.query;
        if (!salonId || !date) {
            return res.status(400).json({ success: false, message: 'Please provide salonId and date' });
        }

        const standardSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];
        const mongoose = require('mongoose');

        let bookedSlots = [];
        let blockedSlots = [];

        if (mongoose.connection.readyState !== 1) {
            // Read from mockStore
            const { mockBookings } = require('../db/mockStore');
            bookedSlots = mockBookings
                .filter(b => b.salonId === salonId && b.date === date && b.status !== 'cancelled' && b.status !== 'rejected')
                .map(b => b.startTime);
        } else {
            // Read from MongoDB
            const Booking = require('../models/Booking');
            const bookings = await Booking.find({
                salonId,
                date,
                status: { $nin: ['cancelled', 'rejected'] }
            });
            bookedSlots = bookings.map(b => b.startTime);

            const avail = await Availability.findOne({ salonId, date });
            if (avail) {
                blockedSlots = avail.blockedSlots.map(s => s.time);
            }
        }

        const slots = standardSlots.map(time => {
            const isBooked = bookedSlots.includes(time);
            const isBlocked = blockedSlots.includes(time);
            return {
                time,
                available: !isBooked && !isBlocked,
                reason: isBooked ? 'Booked' : (isBlocked ? 'Blocked' : 'Available')
            };
        });

        res.status(200).json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
