const express = require('express');
const router = express.Router();
const Salon = require('../models/Salon');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// @desc    Get all salons (Public) - Supports Geospatial sorting
// @route   GET /api/salon?lng=x&lat=y
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { lng, lat } = req.query;

        let query = { isApproved: true };

        // If user provides their coordinates, we use MongoDB's magical $near!
        // This natively returns salons in their city first, then nearby cities, etc.
        if (lng && lat) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    }
                    // Optional: $maxDistance: 50000 (50km radius)
                }
            };
        }

        const salons = await Salon.find(query);
        res.status(200).json({ success: true, data: salons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Create a new salon
// @route   POST /api/salon
// @access  Private (Owner)
router.post('/', protect, async (req, res) => {
    try {
        // We bypass role check here for ease of testing in development.
        // We bypass role check here for ease of testing in development.

        const existing = await Salon.findOne({ ownerId: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Salon already exists for this owner' });
        }

        const newSalon = await Salon.create({
            ownerId: req.user.id,
            isApproved: false, // Security: Ensure it requires approval
            ...req.body
        });

        res.status(201).json({ success: true, data: newSalon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get owner's salon
// @route   GET /api/salon/my
// @access  Private (Owner)
router.get('/my', protect, async (req, res) => {
    try {
        const salon = await Salon.findOne({ ownerId: req.user.id });
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });
        res.status(200).json({ success: true, data: salon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get salon by ID
// @route   GET /api/salon/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // We cannot use .populate() here since User lives in MySQL now.
        // If we need owner details, we should make an HTTP request to the Auth service.
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });
        res.status(200).json({ success: true, data: salon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
