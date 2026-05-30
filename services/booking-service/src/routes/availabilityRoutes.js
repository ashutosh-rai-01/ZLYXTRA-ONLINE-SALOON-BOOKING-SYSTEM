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

module.exports = router;
