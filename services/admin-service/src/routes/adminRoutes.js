const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/isAdmin');

// Protect all admin routes
router.use(protect, isAdmin);

// Internal service URIs (Usually these come from .env in production)
const SERVICES = {
    salon: process.env.SALON_SERVICE_URI || 'http://localhost:5002',
    booking: process.env.BOOKING_SERVICE_URI || 'http://localhost:5003',
    auth: process.env.AUTH_SERVICE_URI || 'http://localhost:5001',
};

// Helper function to pass JWT to other microservices securely
const getAuthHeaders = (req) => ({
    headers: { Authorization: req.headers.authorization }
});

// @desc    Get all salons for admin
router.get('/salons', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.salon}/`, getAuthHeaders(req));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch salons from salon-service' });
    }
});

// @desc    Approve a salon
router.put('/salon/:id/approve', async (req, res) => {
    try {
        // Normally you'd add this route into salon-service and call it here.
        // For now, assume salon-service has a /:id/approve endpoint (you may need to create it).
        const response = await axios.put(`${SERVICES.salon}/${req.params.id}/approve`, {}, getAuthHeaders(req));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve salon in salon-service' });
    }
});

// @desc    Reject/Delete a salon
router.delete('/salon/:id', async (req, res) => {
    try {
        const response = await axios.delete(`${SERVICES.salon}/${req.params.id}`, getAuthHeaders(req));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete salon' });
    }
});

// @desc    Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.booking}/admin/all`, getAuthHeaders(req));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch bookings from booking-service' });
    }
});

// @desc    Get all users
router.get('/users', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICES.auth}/admin/users`, getAuthHeaders(req));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users from auth-service' });
    }
});

// @desc    Block User
router.put('/user/:id/block', async (req, res) => {
    try {
        const response = await axios.put(`${SERVICES.auth}/admin/user/${req.params.id}/block`, {}, getAuthHeaders(req));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to block user' });
    }
});

module.exports = router;
