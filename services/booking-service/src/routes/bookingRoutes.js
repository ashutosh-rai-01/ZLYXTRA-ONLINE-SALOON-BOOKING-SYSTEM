const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
router.post('/', protect, async (req, res) => {
    try {
        const { salonId, service, date, startTime, price } = req.body;
        const booking = await Booking.create({
            userId: req.user.id,
            salonId,
            serviceName: service.name,
            servicePrice: service.price || price,
            serviceDuration: service.duration || 30, // Fallback duration if missing
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
        // Fetch from MySQL
        const bookings = await Booking.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        // We cannot natively populate 'salonId' from MongoDB here. 
        // We will send the raw booking and let the Gateway/Frontend map it.
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
        // We need the salonId to fetch bookings for it. But salon-service owns that data.
        // For strict microservices, the frontend should pass ?salonId=xyz to this route
        // If not, we have to make an HTTP call to salon-service.
        // Assuming the frontend starts sending ?salonId=... for owner routes:
        const { salonId } = req.query;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'salonId query parameter is required for microservice' });
        }

        const bookings = await Booking.findAll({ 
            where: { salonId },
            order: [['createdAt', 'DESC']]
        });
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
        
        let booking = await Booking.findByPk(req.params.id);
        
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = status;
        await booking.save();
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
