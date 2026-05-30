const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    stylistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stylist'
    },
    service: {
        name: String,
        price: Number,
        duration: Number
    },
    date: {
        type: String, // e.g. "2023-10-25"
        required: true
    },
    startTime: {
        type: String, // e.g. "14:30"
        required: true
    },
    endTime: {
        type: String // e.g. "15:00"
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'booked', 'rejected'],
        default: 'pending' // Owner can confirm or it can be auto-confirmed
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    }
}, { timestamps: true });

// Booking Optimization Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ salonId: 1 });
bookingSchema.index({ startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
